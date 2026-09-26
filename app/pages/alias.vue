<script setup lang="ts">
import { drawWord, forgetExhausted } from '~/alias/draw'
import {
  applyTurn,
  clearGame,
  explainedTable,
  explainerOf,
  leaders,
  loadGame,
  newGame,
  rematch,
  saveGame,
  turnDeltas,
  type AliasTurn,
} from '~/alias/game'
import { levels, teamEmojis, words } from '~/alias/levels'
import { loadPlayed, savePlayed } from '~/alias/played'
import { ALIAS_MAX_PLAYERS, TARGETS, TURN_SECONDS, useAliasSetup } from '~/composables/useAliasSetup'
import { useCountdown } from '~/composables/useCountdown'
import { useMessages } from '~/composables/useMessages'
import { useSettings } from '~/composables/useSettings'
import { useWakeLock } from '~/composables/useWakeLock'
import { playSignal, playTick, unlockSound, vibrateSignal } from '~/sound'
import type { AliasGame, AliasTeam } from '~/types'

const t = useMessages()
const settings = useSettings()
const {
  setup,
  players,
  blocker,
  canAddPlayer,
  addPlayer,
  removePlayer,
  movePlayer,
  shuffle,
  canAddTeam,
  addTeam,
  canRemoveTeam,
  removeTeam,
  renameTeam,
  canSetEmoji,
  setEmoji,
  toggleLevel,
} = useAliasSetup()

// --- Стейт-машина ---
// setup ⇄ rules; setup → handoff; resume → handoff | setup;
// handoff → turn → last → review → handoff | over; turn → handoff («Сбросить ход»);
// handoff → over («Закончить досрочно»); over → handoff («Реванш») | setup («Новая игра»)

type Stage = 'setup' | 'rules' | 'resume' | 'handoff' | 'turn' | 'last' | 'review' | 'over'

/** Партия пишется в `koster.alias-game` между ходами; незаконченную при входе предлагается продолжить. */
const saved = loadGame()
const game = ref<AliasGame | null>(saved && !saved.finished ? saved : null)
const stage = ref<Stage>(game.value ? 'resume' : 'setup')
/** Экран не гаснет на всех этапах, кроме экрана начала и правил. */
useWakeLock(computed(() => stage.value !== 'setup' && stage.value !== 'rules'))
/** Идёт партия: выход — только через подтверждение. На «Продолжить?» и финале уйти можно сразу. */
const inGame = computed(() => ['handoff', 'turn', 'last', 'review'].includes(stage.value))

/**
 * Сыгранные слова языка партии — чтобы не повторялись и между партиями на этом телефоне.
 * Читаются из `koster.alias-played` на старте и при «Продолжить», пишутся при каждом показе.
 */
let played = new Set<string>()

function begin(next: AliasGame) {
  game.value = next
  played = loadPlayed(next.lang)
  saveGame(next)
  stage.value = 'handoff'
}

function start() {
  if (blocker.value) return
  begin(newGame(setup, settings.lang))
}

/** «Продолжить»: ход той же команды с тем же объясняющим, прерванный ход начинается заново. */
function resume() {
  played = loadPlayed(game.value!.lang)
  stage.value = 'handoff'
}

/** «Новая игра» с «Продолжить?» и с финала: партия стирается, дальше — экран начала. */
function newGameFromScratch() {
  clearGame()
  game.value = null
  stage.value = 'setup'
}

function playRematch() {
  if (game.value) begin(rematch(game.value))
}

/** «Закончить досрочно» — с подтверждением; финал покажет текущего лидера или «Ничья». */
function finishEarly() {
  if (!game.value || !confirm(t.value.aliasFinishConfirm)) return
  game.value.finished = true
  saveGame(game.value)
  stage.value = 'over'
}

/** Выход из партии — только через подтверждение: одно случайное касание не должно рушить счёт. */
function exitGame() {
  if (!confirm(t.value.aliasExitConfirm)) return
  leaveGame()
}

function leaveGame() {
  countdown.stop()
  game.value = null
  stage.value = 'setup'
}

// «Назад» браузера или системы посреди партии спрашивает то же, что «Выйти».
onBeforeRouteLeave(() => {
  if (!inGame.value) return true
  if (!confirm(t.value.aliasExitConfirm)) return false
  countdown.stop()
  return true
})

const teamLabel = (team: AliasTeam) => `${team.emoji} ${team.name}`
/** Минус — типографский, как в «−1» правил. */
const formatScore = (n: number) => (n < 0 ? `−${-n}` : String(n))
const formatDelta = (n: number) => (n > 0 ? `+${n}` : formatScore(n))

const currentTeam = computed(() => (game.value ? game.value.teams[game.value.turn]! : null))
const explainer = computed(() => (game.value ? explainerOf(game.value) : ''))

// --- Ход ---

/** Отмеченные слова хода по порядку, без того, что сейчас на экране. */
const turnWords = ref<AliasTurn['words']>([])
/** Слово на экране; когда время вышло, оно становится последним. */
const word = ref('')
/** Кто угадал последнее слово; `null` — никто. */
const lastTeam = ref<number | null>(null)

function nextWord() {
  const { lang, rules } = game.value!
  const pool = words[lang]
  forgetExhausted(pool, rules.levels, played)
  const drawn = drawWord(pool, rules.levels, played)
  // Сыгранным слово становится в момент показа — и пропущенное, и последнее, и из сброшенного хода.
  played.add(drawn.word)
  savePlayed(lang, played)
  word.value = drawn.word
}

const countdown = useCountdown(() => game.value?.rules.turnSeconds ?? 60)
countdown.onEnd(timeUp)

/** «Я готов»: слова появляются только теперь. Этот же тап разблокирует звук на iOS. */
function ready() {
  if (!game.value) return
  if (game.value.rules.sound) unlockSound()
  turnWords.value = []
  lastTeam.value = null
  direction.value = 'up'
  nextWord()
  stage.value = 'turn'
  countdown.start()
}

function mark(guessed: boolean) {
  if (stage.value !== 'turn' || !countdown.running.value) return
  direction.value = guessed ? 'up' : 'down'
  turnWords.value.push({ word: word.value, guessed })
  nextWord()
}

/** Последние 5 секунд тикают — на каждой новой цифре, в конце вместо тика сигнал. */
const hurry = computed(() => countdown.secondsLeft.value <= 5)
watch(countdown.secondsLeft, (left) => {
  if (stage.value === 'turn' && countdown.running.value && left >= 1 && left <= 5 && game.value?.rules.sound) {
    playTick()
  }
})

/** Время вышло: сигнал (без звука — только вибрация), слово на экране становится последним. */
function timeUp() {
  if (stage.value !== 'turn' || !game.value) return
  if (game.value.rules.sound) playSignal()
  else vibrateSignal()
  stage.value = 'last'
}

/** «Сбросить ход» — с подтверждением; тот же объясняющий начинает заново, очки не начисляются. */
function resetTurn() {
  if (!confirm(t.value.aliasResetConfirm)) return
  countdown.stop()
  stage.value = 'handoff'
}

// --- Свайп: вверх — угадали, вниз — пропуск; касание без смещения — не жест ---

const SWIPE_THRESHOLD = 40

/** Куда уезжает слово: вверх при «угадали», вниз при пропуске. */
const direction = ref<'up' | 'down'>('up')
let swipe: { id: number; x: number; y: number } | null = null

function onPointerDown(event: PointerEvent) {
  if (!event.isPrimary) return
  swipe = { id: event.pointerId, x: event.clientX, y: event.clientY }
  // Захват — pointerup придёт сюда, даже если палец отпустили над кнопками.
  ;(event.currentTarget as Element).setPointerCapture(event.pointerId)
}

function onPointerUp(event: PointerEvent) {
  if (!swipe || event.pointerId !== swipe.id) return
  const dx = event.clientX - swipe.x
  const dy = event.clientY - swipe.y
  swipe = null
  if (Math.abs(dy) >= SWIPE_THRESHOLD && Math.abs(dy) > Math.abs(dx)) mark(dy < 0)
}

function onPointerCancel() {
  swipe = null
}

/**
 * Кегль по длине: верхняя граница делится на число букв в самой длинной части слова,
 * чтобы оно влезало в ширину без переноса посреди слова при любом масштабе шрифта.
 */
const wordStyle = computed(() => ({
  '--longest': Math.max(1, ...word.value.split(/[\s-]+/).map((part) => [...part].length)),
}))

// --- Последнее слово и разбор ---

function pickLast(team: number | null) {
  if (stage.value !== 'last') return
  lastTeam.value = team
  stage.value = 'review'
}

const turnRecord = computed<AliasTurn>(() => ({
  words: turnWords.value,
  last: { word: word.value, team: lastTeam.value },
}))

/** Итог хода: ходящая команда всегда, другая — если ей ушло последнее слово. */
const summary = computed(() => {
  if (!game.value) return []
  const deltas = turnDeltas(game.value, turnRecord.value)
  const turn = game.value.turn
  return game.value.teams
    .map((team, index) => ({ team, index, delta: deltas[index]! }))
    .filter((item) => item.index === turn || item.delta !== 0)
})

const lastLabel = computed(() => {
  const team = lastTeam.value === null ? null : game.value?.teams[lastTeam.value]
  return team ? teamLabel(team) : t.value.aliasNobody
})

function toggleWord(index: number) {
  const item = turnWords.value[index]
  if (item) item.guessed = !item.guessed
}

/** Тап по последнему слову: команды по порядку, потом «Никто», потом снова первая. */
function cycleLast() {
  const count = game.value?.teams.length ?? 0
  const current = lastTeam.value
  lastTeam.value = current === null ? 0 : current + 1 < count ? current + 1 : null
}

/** «Подтвердить»: очки в счёт, ход — следующей команде или финал, если круг закрыт с победителем. */
function confirmTurn() {
  if (!game.value || stage.value !== 'review') return
  applyTurn(game.value, turnRecord.value)
  saveGame(game.value)
  stage.value = game.value.finished ? 'over' : 'handoff'
}

// --- Финал ---

const winners = computed(() => (game.value ? leaders(game.value) : []))
const winnerTitle = computed(() => {
  const team = winners.value.length === 1 ? game.value?.teams[winners.value[0]!] : null
  return team ? t.value.aliasWinner.replace('{team}', teamLabel(team)) : t.value.aliasDraw
})
/** Итоговый счёт — по убыванию, при равенстве в порядке команд. */
const finalScores = computed(() =>
  game.value ? [...game.value.teams].sort((a, b) => b.score - a.score) : [],
)
const explainedRows = computed(() => (game.value ? explainedTable(game.value) : []))

// --- Состав ---

const newName = ref('')
const canAdd = computed(() => canAddPlayer(newName.value))
const full = computed(() => players.value.length >= ALIAS_MAX_PLAYERS)

function submitPlayer() {
  if (addPlayer(newName.value)) newName.value = ''
}

function moveLabel(teamIndex: number, name: string): string {
  const next = setup.teams[(teamIndex + 1) % setup.teams.length]!
  return t.value.aliasMoveTo.replace('{name}', name).replace('{team}', next.name)
}

/** Пустое название не принимается: поле возвращается к прежнему. */
function commitName(teamIndex: number, event: Event) {
  const input = event.target as HTMLInputElement
  renameTeam(teamIndex, input.value)
  input.value = setup.teams[teamIndex]?.name ?? ''
}

/** У какой команды открыт выбор значка; открыт не больше чем у одной. */
const emojiPickerFor = ref<number | null>(null)

function toggleEmojiPicker(teamIndex: number) {
  emojiPickerFor.value = emojiPickerFor.value === teamIndex ? null : teamIndex
}

function pickEmoji(teamIndex: number, emoji: string) {
  setEmoji(teamIndex, emoji)
  emojiPickerFor.value = null
}

/** Удалённая команда не должна оставить открытым выбор значка у несуществующего места. */
function removeLastTeam() {
  if (emojiPickerFor.value === setup.teams.length - 1) emojiPickerFor.value = null
  removeTeam()
}

const rulesItems = computed(() =>
  t.value.aliasRulesItems.map((item) => item.replace('{n}', String(setup.target))),
)
</script>

<template>
  <main class="screen">
    <!-- Экран начала -->
    <template v-if="stage === 'setup'">
      <header class="top">
        <NuxtLink to="/" class="back">← {{ t.decks }}</NuxtLink>
        <h1 class="title">{{ t.alias }}</h1>
      </header>

      <div class="body">
        <section class="group">
          <h2 class="group-title">{{ t.aliasTeams }}</h2>
          <ul class="teams">
            <li v-for="(team, teamIndex) in setup.teams" :key="teamIndex" class="team">
              <div class="team-head">
                <button
                  type="button"
                  class="team-emoji"
                  :aria-label="`${t.aliasTeamEmoji}: ${team.name}`"
                  :aria-expanded="emojiPickerFor === teamIndex"
                  @click="toggleEmojiPicker(teamIndex)"
                >
                  {{ team.emoji }}
                </button>
                <input
                  class="team-name"
                  type="text"
                  :value="team.name"
                  :aria-label="`${t.aliasTeamName}: ${team.emoji}`"
                  maxlength="20"
                  autocomplete="off"
                  enterkeyhint="done"
                  @change="commitName(teamIndex, $event)"
                  @keydown.enter="($event.target as HTMLInputElement).blur()"
                />
                <span class="team-count">{{ team.players.length }}</span>
                <button
                  v-if="teamIndex === setup.teams.length - 1 && canRemoveTeam()"
                  type="button"
                  class="remove"
                  :aria-label="`${t.aliasRemoveTeam}: ${team.name}`"
                  @click="removeLastTeam"
                >
                  ✕
                </button>
              </div>
              <div v-if="emojiPickerFor === teamIndex" class="emoji-grid" role="group" :aria-label="t.aliasTeamEmoji">
                <button
                  v-for="emoji in teamEmojis"
                  :key="emoji"
                  type="button"
                  class="emoji-option"
                  :class="{ current: emoji === team.emoji }"
                  :aria-pressed="emoji === team.emoji"
                  :disabled="!canSetEmoji(teamIndex, emoji)"
                  @click="pickEmoji(teamIndex, emoji)"
                >
                  {{ emoji }}
                </button>
              </div>
              <ul v-if="team.players.length > 0" class="chips">
                <li v-for="(name, playerIndex) in team.players" :key="name" class="chip">
                  <button
                    type="button"
                    class="chip-name"
                    :aria-label="moveLabel(teamIndex, name)"
                    @click="movePlayer(teamIndex, playerIndex)"
                  >
                    {{ name }}
                  </button>
                  <button
                    type="button"
                    class="chip-remove"
                    :aria-label="`${t.removePlayer}: ${name}`"
                    @click="removePlayer(teamIndex, playerIndex)"
                  >
                    ✕
                  </button>
                </li>
              </ul>
            </li>
          </ul>

          <form class="add" @submit.prevent="submitPlayer">
            <input
              v-model="newName"
              class="input"
              type="text"
              :placeholder="t.aliasPlayerName"
              :aria-label="t.aliasPlayerName"
              :disabled="full"
              maxlength="30"
              autocomplete="off"
              autocapitalize="words"
              enterkeyhint="done"
            />
            <button type="submit" class="add-button" :disabled="!canAdd">{{ t.addPlayer }}</button>
          </form>
          <p v-if="full" class="hint">{{ t.aliasPlayersFull.replace('{n}', String(ALIAS_MAX_PLAYERS)) }}</p>
          <p v-else-if="players.length > 1" class="hint">{{ t.aliasMoveHint }}</p>

          <div class="tools">
            <button type="button" class="tool" :disabled="!canAddTeam()" @click="addTeam">{{ t.aliasAddTeam }}</button>
            <button type="button" class="tool" :disabled="players.length < 2" @click="shuffle()">
              {{ t.aliasShuffle }}
            </button>
          </div>
        </section>

        <section class="group">
          <h2 class="group-title">{{ t.aliasTarget }}</h2>
          <div class="segments" role="radiogroup" :aria-label="t.aliasTarget">
            <button
              v-for="value in TARGETS"
              :key="value"
              type="button"
              class="segment"
              :class="{ selected: setup.target === value }"
              role="radio"
              :aria-checked="setup.target === value"
              @click="setup.target = value"
            >
              {{ value }}
            </button>
          </div>
        </section>

        <section class="group">
          <h2 class="group-title">{{ t.aliasTurnSeconds }}</h2>
          <div class="segments" role="radiogroup" :aria-label="t.aliasTurnSeconds">
            <button
              v-for="value in TURN_SECONDS"
              :key="value"
              type="button"
              class="segment"
              :class="{ selected: setup.turnSeconds === value }"
              role="radio"
              :aria-checked="setup.turnSeconds === value"
              @click="setup.turnSeconds = value"
            >
              {{ t.aliasSeconds.replace('{n}', String(value)) }}
            </button>
          </div>
        </section>

        <section class="group">
          <h2 class="group-title">{{ t.aliasLevels }}</h2>
          <ul class="rows">
            <li v-for="level in levels" :key="level.id">
              <label class="row level">
                <input
                  type="checkbox"
                  class="check"
                  :checked="setup.levels.includes(level.id)"
                  @change="toggleLevel(level.id)"
                />
                <span class="level-emoji" aria-hidden="true">{{ level.emoji }}</span>
                <span class="row-title">{{ level.title[settings.lang] }}</span>
              </label>
            </li>
          </ul>
        </section>

        <section class="group">
          <ul class="rows">
            <li class="row toggle">
              <span class="row-title">{{ t.aliasSkipPenalty }}</span>
              <button
                type="button"
                class="switch"
                role="switch"
                :aria-checked="setup.skipPenalty"
                :aria-label="t.aliasSkipPenalty"
                @click="setup.skipPenalty = !setup.skipPenalty"
              >
                <span class="knob" aria-hidden="true" />
              </button>
            </li>
            <li class="row toggle">
              <span class="row-title">{{ t.aliasSound }}</span>
              <button
                type="button"
                class="switch"
                role="switch"
                :aria-checked="setup.sound"
                :aria-label="t.aliasSound"
                @click="setup.sound = !setup.sound"
              >
                <span class="knob" aria-hidden="true" />
              </button>
            </li>
          </ul>
        </section>
      </div>

      <footer class="bottom">
        <p v-if="blocker" id="alias-blocker" class="warn">{{ t.aliasBlockers[blocker] }}</p>
        <div class="buttons">
          <button type="button" class="action secondary rules-button" @click="stage = 'rules'">
            {{ t.aliasRules }}
          </button>
          <button
            type="button"
            class="action primary"
            :disabled="blocker !== null"
            :aria-describedby="blocker ? 'alias-blocker' : undefined"
            @click="start"
          >
            {{ t.aliasStart }}
          </button>
        </div>
      </footer>
    </template>

    <!-- Правила: короткий лист, возврат — к экрану начала -->
    <template v-else-if="stage === 'rules'">
      <header class="top">
        <button type="button" class="back" @click="stage = 'setup'">← {{ t.back }}</button>
        <h1 class="title">{{ t.aliasRules }}</h1>
      </header>

      <div class="body">
        <ol class="rules" :lang="settings.lang">
          <li v-for="item in rulesItems" :key="item">{{ item }}</li>
        </ol>
      </div>
    </template>

    <!-- Прерванная партия: продолжить с тем же счётом или начать с нуля -->
    <template v-else-if="stage === 'resume' && game">
      <header class="top">
        <NuxtLink to="/" class="back">← {{ t.decks }}</NuxtLink>
        <h1 class="title">{{ t.alias }}</h1>
      </header>

      <div class="body handoff">
        <GameIcon name="alias" class="handoff-icon" />
        <p class="turn-of">{{ t.aliasResumeTitle }}</p>
        <p class="resume-score">
          <template v-for="(team, index) in game.teams" :key="team.emoji">
            <span v-if="index > 0" class="resume-sep" aria-hidden="true"> : </span>
            <span class="resume-team">{{ teamLabel(team) }} <strong>{{ formatScore(team.score) }}</strong></span>
          </template>
        </p>
      </div>

      <footer class="bottom">
        <div class="buttons">
          <button type="button" class="action secondary" @click="newGameFromScratch">{{ t.aliasNewGame }}</button>
          <button type="button" class="action primary" @click="resume">{{ t.aliasResume }}</button>
        </div>
      </footer>
    </template>

    <!-- Перед ходом: телефон передают объясняющему, слов на экране нет -->
    <template v-else-if="stage === 'handoff' && game && currentTeam">
      <header class="top">
        <button type="button" class="back" @click="exitGame">← {{ t.aliasExit }}</button>
        <h1 class="title">{{ t.alias }}</h1>
      </header>

      <div class="body handoff">
        <GameIcon name="alias" class="handoff-icon" />
        <p class="turn-of">{{ t.aliasTurnOf.replace('{team}', teamLabel(currentTeam)) }}</p>
        <p class="explainer-label">{{ t.aliasExplainer }}</p>
        <p class="explainer">{{ explainer }}</p>

        <section class="scores" :aria-label="t.aliasScore">
          <ul class="score-list">
            <li
              v-for="(team, index) in game.teams"
              :key="team.emoji"
              class="score"
              :class="{ current: index === game.turn }"
            >
              <span class="score-emoji" aria-hidden="true">{{ team.emoji }}</span>
              <span class="score-name">{{ team.name }}</span>
              <span class="score-value">{{ formatScore(team.score) }}</span>
            </li>
          </ul>
        </section>

        <p class="reminder">{{ t.aliasReminder }}</p>
      </div>

      <footer class="bottom">
        <button type="button" class="action primary" @click="ready">{{ t.aliasReady }}</button>
        <button type="button" class="finish-early" @click="finishEarly">{{ t.aliasFinishEarly }}</button>
      </footer>
    </template>

    <!-- Ход: таймер сверху, слово в центре, свайп или кнопки -->
    <template v-else-if="stage === 'turn'">
      <header class="top">
        <button type="button" class="back" @click="exitGame">← {{ t.aliasExit }}</button>
        <button type="button" class="back reset" @click="resetTurn">↺ {{ t.aliasResetTurn }}</button>
      </header>

      <p class="clock" :class="{ hurry }" role="timer" :aria-label="`${t.aliasTimeLeft}: ${countdown.secondsLeft.value}`">
        {{ countdown.secondsLeft.value }}
      </p>

      <section
        class="word-area"
        :aria-label="t.aliasSwipeHint"
        @pointerdown="onPointerDown"
        @pointerup="onPointerUp"
        @pointercancel="onPointerCancel"
      >
        <Transition :name="`word-${direction}`">
          <div :key="turnWords.length" class="word-face">
            <p class="word" :style="wordStyle" :lang="game?.lang" aria-live="polite">{{ word }}</p>
          </div>
        </Transition>
      </section>
      <p class="swipe-hint" aria-hidden="true">{{ t.aliasSwipeHint }}</p>

      <footer class="bottom">
        <div class="buttons">
          <button type="button" class="action secondary" @click="mark(false)">✗ {{ t.aliasSkip }}</button>
          <button type="button" class="action primary" @click="mark(true)">✓ {{ t.aliasGuessed }}</button>
        </div>
      </footer>
    </template>

    <!-- Последнее слово: угадывают все, объясняющий отмечает, кто первым -->
    <template v-else-if="stage === 'last' && game">
      <header class="top">
        <button type="button" class="back" @click="exitGame">← {{ t.aliasExit }}</button>
      </header>

      <div class="body last">
        <p class="last-note" role="status">{{ t.aliasLastWord }}</p>
        <div class="last-word-box">
          <p class="word" :style="wordStyle" :lang="game.lang">{{ word }}</p>
        </div>
        <h2 class="group-title last-who">{{ t.aliasLastWho }}</h2>
        <div class="last-teams">
          <button
            v-for="(team, index) in game.teams"
            :key="team.emoji"
            type="button"
            class="action secondary last-team"
            @click="pickLast(index)"
          >
            {{ teamLabel(team) }}
          </button>
          <button type="button" class="action secondary last-team nobody" @click="pickLast(null)">
            {{ t.aliasNobody }}
          </button>
        </div>
      </div>
    </template>

    <!-- Разбор: тап меняет отметки, итог пересчитывается сразу -->
    <template v-else-if="stage === 'review' && game">
      <header class="top">
        <button type="button" class="back" @click="exitGame">← {{ t.aliasExit }}</button>
        <h1 class="title">{{ t.aliasReview }}</h1>
      </header>

      <div class="body">
        <p class="hint review-hint">{{ t.aliasReviewHint }}</p>
        <ul class="review" :lang="game.lang">
          <li v-for="(item, index) in turnWords" :key="index">
            <button
              type="button"
              class="review-row"
              role="switch"
              :aria-checked="item.guessed"
              @click="toggleWord(index)"
            >
              <span class="review-word">{{ item.word }}</span>
              <span class="mark" :class="item.guessed ? 'yes' : 'no'" aria-hidden="true">
                {{ item.guessed ? '✓' : '✗' }}
              </span>
            </button>
          </li>
          <li>
            <button
              type="button"
              class="review-row last-row"
              :aria-label="t.aliasLastTo.replace('{word}', word).replace('{team}', lastLabel)"
              @click="cycleLast"
            >
              <span class="review-word">{{ word }}</span>
              <span class="last-to" :class="{ nobody: lastTeam === null }">{{ lastLabel }}</span>
            </button>
          </li>
        </ul>
      </div>

      <footer class="bottom">
        <p class="summary" role="status">
          <span v-for="item in summary" :key="item.team.emoji" class="summary-item">
            {{ item.team.emoji }} {{ item.team.name }}
            <strong :class="{ negative: item.delta < 0 }">{{ formatDelta(item.delta) }}</strong>
          </span>
        </p>
        <button type="button" class="action primary" @click="confirmTurn">{{ t.aliasConfirm }}</button>
      </footer>
    </template>

    <!-- Финал: победитель или ничья, счёт, кто сколько объяснил -->
    <template v-else-if="stage === 'over' && game">
      <header class="top">
        <NuxtLink to="/" class="back">← {{ t.decks }}</NuxtLink>
        <h1 class="title">{{ t.alias }}</h1>
      </header>

      <div class="body">
        <p class="winner" role="status">{{ winnerTitle }}</p>

        <section class="group">
          <h2 class="group-title">{{ t.aliasFinalScore }}</h2>
          <ul class="score-list">
            <li
              v-for="team in finalScores"
              :key="team.emoji"
              class="score"
              :class="{ current: winners.length === 1 && game.teams[winners[0]!] === team }"
            >
              <span class="score-emoji" aria-hidden="true">{{ team.emoji }}</span>
              <span class="score-name">{{ team.name }}</span>
              <span class="score-value">{{ formatScore(team.score) }}</span>
            </li>
          </ul>
        </section>

        <section class="group">
          <h2 class="group-title">{{ t.aliasExplainedTitle }}</h2>
          <ul class="score-list">
            <li v-for="row in explainedRows" :key="row.name" class="score explained">
              <span class="score-emoji" aria-hidden="true">{{ game.teams[row.team]!.emoji }}</span>
              <span class="score-name">
                {{ row.name }}
                <span v-if="row.best" class="best">🏅 {{ t.aliasBest }}</span>
              </span>
              <span class="score-value">{{ row.count }}</span>
            </li>
          </ul>
        </section>
      </div>

      <footer class="bottom">
        <div class="buttons">
          <button type="button" class="action secondary" @click="newGameFromScratch">{{ t.aliasNewGame }}</button>
          <button type="button" class="action primary" @click="playRematch">{{ t.aliasRematch }}</button>
        </div>
      </footer>
    </template>
  </main>
</template>

<style scoped>
/* Шапка и нижняя панель приколоты, прокручивается только середина. */
.screen {
  display: flex;
  flex-direction: column;
  max-width: 560px;
  height: 100dvh;
  margin: 0 auto;
  padding: calc(env(safe-area-inset-top, 0px) + 12px) calc(env(safe-area-inset-right, 0px) + 16px)
    calc(env(safe-area-inset-bottom, 0px) + 16px) calc(env(safe-area-inset-left, 0px) + 16px);
  overflow: hidden;
  overscroll-behavior: none;
}

.top {
  position: relative;
  display: flex;
  flex: none;
  align-items: center;
  gap: 12px;
  min-height: 44px;
  font-size: 17px;
}

.back {
  flex: none;
  padding: 8px 4px;
  border: 0;
  background: transparent;
  color: var(--accent);
  font: inherit;
  font-size: 17px;
  text-decoration: none;
  cursor: pointer;
  touch-action: manipulation;
}

/* Заголовок — по центру шапки, а не по центру остатка справа от «Назад». */
.title {
  position: absolute;
  left: 50%;
  margin: 0;
  transform: translateX(-50%);
  font-size: inherit;
  font-weight: 600;
  white-space: nowrap;
}

.body {
  flex: 1;
  min-height: 0;
  padding: 16px 0 8px;
  overflow-y: auto;
}

.bottom {
  display: flex;
  flex: none;
  flex-direction: column;
  gap: 8px;
  padding-top: 8px;
}

.buttons {
  display: flex;
  gap: 8px;
}

.group + .group {
  margin-top: 24px;
}

.group-title {
  margin: 0 0 10px 4px;
  font-size: 17px;
  font-weight: 600;
  color: var(--muted);
}

/* --- Команды --- */

.teams {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 0 0 8px;
  padding: 0;
  list-style: none;
}

.team {
  padding: 6px 6px 8px;
  border-radius: 14px;
  background: var(--surface);
}

.team-head {
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: 48px;
}

.team-emoji {
  flex: none;
  width: 44px;
  height: 44px;
  padding: 0;
  border: 0;
  border-radius: 10px;
  background: transparent;
  font-size: 26px;
  line-height: 1;
  text-align: center;
  cursor: pointer;
}

.team-emoji:active,
.team-emoji[aria-expanded='true'] {
  background: var(--surface-active);
}

/* Выбор значка: 6×6, занятые другими командами приглушены и не нажимаются. */
.emoji-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 4px;
  margin: 4px 0 8px;
}

.emoji-option {
  aspect-ratio: 1;
  min-height: 44px;
  padding: 0;
  border: 2px solid transparent;
  border-radius: 10px;
  background: var(--bg);
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
}

.emoji-option.current {
  border-color: var(--accent);
}

.emoji-option:disabled {
  opacity: 0.25;
  cursor: default;
}

.emoji-option:not(:disabled):active {
  background: var(--surface-active);
}

/* Название — поле, которое выглядит как заголовок; рамка появляется только при правке. */
.team-name {
  flex: 1;
  min-width: 0;
  min-height: 44px;
  padding: 6px 8px;
  border: 0;
  border-radius: 10px;
  background: transparent;
  color: var(--fg);
  font: inherit;
  font-size: 19px;
  font-weight: 700;
  text-overflow: ellipsis;
}

.team-name:focus {
  outline: 2px solid var(--accent);
  background: var(--bg);
}

.team-count {
  flex: none;
  min-width: 28px;
  color: var(--muted);
  font-size: 17px;
  font-variant-numeric: tabular-nums;
  text-align: center;
}

.remove {
  flex: none;
  width: 44px;
  height: 44px;
  border: 0;
  border-radius: 10px;
  background: transparent;
  color: var(--muted);
  font: inherit;
  font-size: 18px;
  cursor: pointer;
  touch-action: manipulation;
}

.remove:active {
  background: var(--surface-active);
  color: var(--danger);
}

/* Игрок — фишка: тап по имени переводит, крестик удаляет. */
.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 4px 0 0;
  padding: 0 4px;
  list-style: none;
}

.chip {
  display: flex;
  max-width: 100%;
  border-radius: 12px;
  background: var(--surface-active);
}

.chip-name,
.chip-remove {
  min-height: 44px;
  border: 0;
  background: transparent;
  color: var(--fg);
  font: inherit;
  cursor: pointer;
  touch-action: manipulation;
}

.chip-name {
  min-width: 0;
  padding: 6px 4px 6px 14px;
  overflow: hidden;
  font-size: 17px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chip-remove {
  flex: none;
  width: 36px;
  padding: 0;
  color: var(--muted);
  font-size: 14px;
}

.chip:has(.chip-name:active) {
  background: var(--accent);
}

.chip:has(.chip-name:active) .chip-name {
  color: var(--bg);
}

.chip-remove:active {
  color: var(--danger);
}

.add {
  display: flex;
  gap: 8px;
}

.input {
  flex: 1;
  min-width: 0;
  min-height: 52px;
  padding: 8px 16px;
  border: 0;
  border-radius: 14px;
  background: var(--surface);
  color: var(--fg);
  font: inherit;
  font-size: 18px;
}

.input::placeholder {
  color: var(--muted);
}

.input:focus {
  outline: 2px solid var(--accent);
}

.add-button {
  flex: none;
  min-height: 52px;
  padding: 8px 20px;
  border: 0;
  border-radius: 14px;
  background: var(--accent);
  color: var(--bg);
  font: inherit;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  touch-action: manipulation;
}

.add-button:disabled {
  background: var(--surface);
  color: var(--muted);
  cursor: default;
}

.hint {
  margin: 8px 4px 0;
  color: var(--muted);
  font-size: 15px;
  line-height: 1.35;
}

.tools {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.tool {
  flex: 1;
  min-height: 52px;
  padding: 8px 12px;
  border: 0;
  border-radius: 14px;
  background: var(--surface);
  color: var(--fg);
  font: inherit;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  touch-action: manipulation;
}

.tool:active {
  background: var(--surface-active);
}

.tool:disabled {
  color: var(--muted);
  opacity: 0.5;
  cursor: default;
}

/* --- Сегменты: одна подложка, выбранный — акцентный --- */

.segments {
  display: flex;
  gap: 4px;
  padding: 4px;
  border-radius: 14px;
  background: var(--surface);
}

.segment {
  flex: 1;
  min-width: 0;
  min-height: 52px;
  padding: 8px 4px;
  border: 0;
  border-radius: 10px;
  background: transparent;
  color: var(--fg);
  font: inherit;
  font-size: 18px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  cursor: pointer;
  touch-action: manipulation;
}

.segment:active {
  background: var(--surface-active);
}

.segment.selected {
  background: var(--accent);
  color: var(--bg);
}

/* --- Строки: уровни и тумблеры --- */

.rows {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.row {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 60px;
  padding: 6px 12px;
  border-radius: 14px;
  background: var(--surface);
}

.row-title {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  font-size: 18px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Уровень — строка целиком кликабельна: тап в любом месте ставит или снимает галочку. */
.level {
  cursor: pointer;
  touch-action: manipulation;
}

.level:active {
  background: var(--surface-active);
}

.check {
  flex: none;
  width: 24px;
  height: 24px;
  margin: 0 4px;
  accent-color: var(--accent);
  cursor: pointer;
}

.level-emoji {
  flex: none;
  font-size: 22px;
  line-height: 1;
}

/* Тумблер: дорожка и кружок, включённый — акцентный. */
.switch {
  position: relative;
  flex: none;
  width: 56px;
  height: 34px;
  padding: 0;
  border: 0;
  border-radius: 17px;
  background: var(--surface-active);
  cursor: pointer;
  touch-action: manipulation;
  transition: background 150ms ease;
}

.switch[aria-checked='true'] {
  background: var(--accent);
}

.knob {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--fg);
  transition: transform 150ms ease;
}

.switch[aria-checked='true'] .knob {
  transform: translateX(22px);
}

.warn {
  margin: 0 4px;
  color: var(--accent);
  font-size: 15px;
  line-height: 1.35;
}

/* --- Правила --- */

.rules {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin: 0;
  padding: 0 4px 0 28px;
  font-size: calc(17px * var(--font-scale));
  line-height: 1.4;
}

.rules li::marker {
  color: var(--accent);
  font-weight: 700;
}

/* --- Перед ходом --- */

.handoff {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.handoff-icon {
  flex: none;
  color: var(--accent);
  font-size: clamp(44px, 9vh, 72px);
}

.turn-of {
  margin: 12px 0 0;
  font-size: calc(22px * var(--font-scale));
  font-weight: 700;
}

.explainer-label {
  margin: 16px 0 0;
  color: var(--muted);
  font-size: calc(17px * var(--font-scale));
  font-weight: 600;
}

.explainer {
  max-width: 100%;
  margin: 2px 0 0;
  color: var(--accent);
  font-size: calc(36px * var(--font-scale));
  font-weight: 700;
  line-height: 1.15;
  overflow-wrap: anywhere;
}

.scores {
  width: 100%;
  margin-top: 20px;
}

.score-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.score {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 48px;
  padding: 6px 14px;
  border: 2px solid transparent;
  border-radius: 14px;
  background: var(--surface);
  font-size: 18px;
}

.score.current {
  border-color: var(--accent);
}

.score-emoji {
  flex: none;
  font-size: 22px;
  line-height: 1;
}

.score-name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  font-weight: 600;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.score-value {
  flex: none;
  font-size: 22px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.reminder {
  margin: 16px 4px 0;
  color: var(--muted);
  font-size: calc(16px * var(--font-scale));
  font-weight: 600;
  line-height: 1.35;
}

/* Второстепенное действие под «Я готов»: мелко, чтобы не нажать вместо него. */
.finish-early {
  align-self: center;
  min-height: 44px;
  padding: 8px 16px;
  border: 0;
  background: transparent;
  color: var(--muted);
  font: inherit;
  font-size: 16px;
  cursor: pointer;
  touch-action: manipulation;
}

/* --- Продолжить партию --- */

.resume-score {
  margin: 16px 0 0;
  font-size: calc(20px * var(--font-scale));
  font-weight: 600;
  line-height: 1.5;
}

.resume-team {
  white-space: nowrap;
}

.resume-team strong {
  color: var(--accent);
  font-variant-numeric: tabular-nums;
}

.resume-sep {
  color: var(--muted);
}

/* --- Финал --- */

.winner {
  margin: 8px 0 24px;
  font-size: calc(28px * var(--font-scale));
  font-weight: 700;
  line-height: 1.2;
  text-align: center;
  overflow-wrap: anywhere;
}

/* Имя и отметка «Лучший» переносятся, а не обрезаются: отметка — главное в строке лидера. */
.explained .score-name {
  white-space: normal;
}

.best {
  display: inline-block;
  color: var(--accent);
  font-size: 15px;
  font-weight: 700;
}

/* --- Ход --- */

.reset {
  margin-left: auto;
  color: var(--muted);
}

/* Цифры табличные — ширина отсчёта не прыгает от секунды к секунде. */
.clock {
  flex: none;
  margin: 4px 0 0;
  font-size: clamp(40px, 9vh, 64px);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  line-height: 1;
  text-align: center;
}

.clock.hurry {
  color: var(--accent);
}

/*
 * Поле слова — и контейнер для кегля (cqi), и зона свайпа. touch-action: none — браузер не
 * перехватывает вертикальный жест под скролл и «резинку», pointer-события доходят целиком.
 */
.word-area {
  position: relative;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  container-type: inline-size;
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
}

.word-face {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 4px;
  text-align: center;
}

/*
 * Кегль: базовый, умноженный на масштаб из настроек, но не больше, чем позволяет самая длинная
 * часть слова (--longest букв): 140cqi на всю часть — запас на широкие буквы вроде «ж» и «щ».
 */
.word {
  max-width: 100%;
  margin: 0;
  font-size: min(calc(56px * var(--font-scale)), calc(140cqi / var(--longest)), 14vh);
  font-weight: 700;
  line-height: 1.15;
  overflow-wrap: anywhere;
}

.swipe-hint {
  flex: none;
  margin: 0 0 8px;
  color: var(--muted);
  font-size: 14px;
  text-align: center;
}

/* Смена слова: угаданное уезжает вверх, пропущенное — вниз, новое въезжает с другой стороны. */
.word-up-enter-active,
.word-up-leave-active,
.word-down-enter-active,
.word-down-leave-active {
  transition:
    transform 180ms ease,
    opacity 180ms ease;
}

.word-up-leave-to,
.word-down-enter-from {
  transform: translateY(-40%);
  opacity: 0;
}

.word-up-enter-from,
.word-down-leave-to {
  transform: translateY(40%);
  opacity: 0;
}

/* --- Последнее слово --- */

.last {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  text-align: center;
}

.last-note {
  margin: 0;
  color: var(--accent);
  font-size: calc(18px * var(--font-scale));
  font-weight: 700;
  line-height: 1.3;
}

.last-word-box {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  min-height: 120px;
  padding: 12px 4px;
  container-type: inline-size;
}

.last-who {
  margin: 8px 0 10px;
}

.last-teams {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.last-team {
  flex: none;
  min-height: 56px;
  font-size: 20px;
}

.last-team.nobody {
  color: var(--muted);
}

/* --- Разбор --- */

.review-hint {
  margin: 0 4px 10px;
}

.review {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.review-row {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  min-height: 52px;
  padding: 8px 14px;
  border: 0;
  border-radius: 14px;
  background: var(--surface);
  color: var(--fg);
  font: inherit;
  text-align: left;
  cursor: pointer;
  touch-action: manipulation;
}

.review-row:active {
  background: var(--surface-active);
}

.review-word {
  flex: 1;
  min-width: 0;
  font-size: calc(18px * var(--font-scale));
  font-weight: 600;
  overflow-wrap: anywhere;
}

.mark {
  flex: none;
  width: 32px;
  font-size: 22px;
  font-weight: 700;
  text-align: center;
}

.mark.yes {
  color: var(--accent);
}

.mark.no {
  color: var(--muted);
}

/* Последнее слово — отдельно от остальных: рамка и команда вместо галочки. */
.last-row {
  margin-top: 6px;
  border: 2px dashed var(--surface-active);
}

.last-to {
  flex: none;
  max-width: 50%;
  overflow: hidden;
  color: var(--accent);
  font-size: 17px;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.last-to.nobody {
  color: var(--muted);
}

.summary {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 4px 16px;
  margin: 0;
  font-size: 19px;
  font-weight: 600;
}

.summary-item strong {
  color: var(--accent);
  font-variant-numeric: tabular-nums;
}

.summary-item strong.negative {
  color: var(--danger);
}

/* --- Кнопки --- */

.action {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  min-height: 60px;
  padding: 12px 20px;
  border: 0;
  border-radius: 16px;
  font: inherit;
  font-size: 22px;
  font-weight: 700;
  cursor: pointer;
  touch-action: manipulation;
}

.rules-button {
  flex: none;
  font-size: 18px;
}

.primary {
  background: var(--accent);
  color: var(--bg);
}

.secondary {
  background: var(--surface);
  color: var(--fg);
}

.primary:active {
  filter: brightness(0.85);
}

.secondary:active {
  background: var(--surface-active);
}

.action:disabled {
  background: var(--surface);
  color: var(--muted);
  cursor: default;
  filter: none;
}

@media (prefers-reduced-motion: reduce) {
  .switch,
  .knob,
  .word-up-enter-active,
  .word-up-leave-active,
  .word-down-enter-active,
  .word-down-leave-active {
    transition: none;
  }
}
</style>
