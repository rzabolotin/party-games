<script setup lang="ts">
import { useMessages } from '~/composables/useMessages'
import { useCountdown } from '~/composables/useCountdown'
import { useQuest } from '~/composables/useQuest'
import { useSettings } from '~/composables/useSettings'
import { useWakeLock } from '~/composables/useWakeLock'
import {
  COUNCIL_SECONDS,
  FINALE_WINNER,
  GOOD_WINS,
  LAST_CHANCE_ROLES,
  bridge,
  decided,
  evilThreshold,
  finaleRoleLines,
  introLines,
  outcomeText,
  score,
} from '~/quest/game'
import { HIDDEN_MAX_PLAYERS } from '~/quest/lineups'
import { questRoles } from '~/quest/roles'
import { tableauQuest } from '~/quest/tableau'
import { nightLines, nightSchedule } from '~/quest/night'
import { findIntro, findTale, questTexts } from '~/quest/texts'
import { playCouncil, playFinale, playNightSignal, playOutcome, playSignal, unlockSound } from '~/sound'
import type { QuestRoleId } from '~/types'

const t = useMessages()
const settings = useSettings()
const {
  setup,
  lineup,
  cards,
  expected,
  nonStandard,
  wrongCount,
  hasHidden,
  canChangePlayers,
  changePlayers,
  canChangeRole,
  changeRole,
  quest,
  startGame,
  startNight,
  abortNight,
  nextQuest,
  enterFails,
  cancelOutcome,
  leaveOutcome,
  toLastChance,
  huntResult,
  lastChanceResult,
  replay,
  endGame,
} = useQuest()

/** Тексты языка интерфейса; нет — режим недоступен: сообщение и ссылка на главную. */
const texts = computed(() => questTexts[settings.lang])
const available = computed(() => texts.value !== undefined)

// --- Стейт-машина ---
// setup → game; resume → game | setup. Внутри game — фазы партии из `koster.quest.game`:
// intro ─Начать ночь─▶ night ─(сигналы, конец)─▶ quest ─ввод─▶ outcome ─Отменить─▶ quest
// night ─Прервать, уход со страницы или перезагрузка─▶ intro
// outcome ─Передать лидерство─▶ handoff ─Я новый лидер─▶ quest
// outcome ─3 успеха─▶ finale(goodQuests); outcome ─порог провалов─▶ council
// council ─Охота─▶ (ввод «угадал / нет») ─▶ finale(huntWon | huntLost)
// council ─К Последнему шансу или время вышло─▶ lastChance ─итог─▶ finale(lastChanceGood | lastChanceEvil | veteransEvil)
// finale ─Новая партия─▶ intro (тот же состав) | ─К настройке─▶ setup

/** Незаконченная партия при входе — сначала «Продолжить партию?», как в Alias. */
const stage = ref<'setup' | 'resume' | 'game'>(quest.game ? 'resume' : 'setup')
const game = computed(() => quest.game)
/** Экран не гаснет на всех фазах после настройки. */
useWakeLock(computed(() => stage.value === 'game'))

function start() {
  if (!texts.value) return
  unlockSound()
  startGame(texts.value)
  stage.value = 'game'
}

/** «Новая партия» на «Продолжить?» и «К настройке» из партии: партия стирается. */
function toSetup() {
  endGame()
  stage.value = 'setup'
}

// --- Партия ---

const intro = computed(() => (game.value && texts.value ? findIntro(texts.value, game.value.introId) : undefined))
/** «Кто есть кто», вставки во вступление по составу партии и строка про роль рубашкой вверх при 4–5 игроках. */
const introRoleLines = computed(() =>
  game.value && texts.value ? introLines(texts.value, game.value.roles, game.value.players) : [],
)
/** Связка по счёту перед завязкой похода; не подходит ни одна — её нет. */
const questBridge = computed(() => (game.value && texts.value ? bridge(texts.value, game.value) : null))
const tale = computed(() =>
  game.value?.currentTaleId != null && texts.value ? findTale(texts.value, game.value.currentTaleId) : undefined,
)
/** Исход на экране — последний введённый поход. */
const result = computed(() => (game.value?.phase === 'outcome' ? game.value.quests.at(-1) : undefined))
const currentScore = computed(() => (game.value ? score(game.value) : { good: 0, evil: 0 }))
const evilSlots = computed(() => (game.value ? evilThreshold(game.value.players) : 3))
/** Номер похода на столе: на исходе он уже записан в партию. */
const questNumber = computed(() => {
  const played = game.value?.quests.length ?? 0
  return game.value?.phase === 'outcome' ? played : played + 1
})
const winner = computed(() => (game.value ? decided(game.value) : null))
const finaleText = computed(() => {
  const finale = game.value?.finale
  return finale && texts.value ? (texts.value.finales[finale.kind][finale.variant] ?? texts.value.finales[finale.kind][0]) : ''
})
/** Вставки в финал по ролям состава партии. */
const finaleLines = computed(() => (game.value && texts.value ? finaleRoleLines(texts.value, game.value.roles) : []))
const finaleSide = computed(() => (game.value?.finale ? FINALE_WINNER[game.value.finale.kind] : 'good'))

/** Текст про ночь по составу партии, по абзацу на шаг: шагов и строк без своих ролей нет. */
const night = computed(() =>
  game.value && texts.value ? nightLines(texts.value, game.value.players, game.value.roles) : [],
)

/** Переключатель «нужно 2 провала» — на каждый поход заново; «Отменить» возвращает введённое. */
const doubleFail = ref(false)
/** Галочка «после похода вручают амулет» — так же, как «нужно 2 провала». */
const amulet = ref(false)

/** Поход на столе по планшету; на исходе — только что сыгранный. */
const tableau = computed(() => (game.value ? tableauQuest(game.value.players, questNumber.value) : undefined))

/** Новый поход на столе (и поход после перезагрузки) — переключатель встаёт по планшету. */
watch(
  () => game.value?.currentTaleId,
  () => {
    if (game.value?.phase !== 'quest') return
    doubleFail.value = tableau.value?.doubleFail ?? false
    amulet.value = tableau.value?.amulet ?? false
  },
  { immediate: true },
)

/** Размер отряда по планшету; на 4 игрока у 3-го и 4-го походов два варианта. */
const teamSize = computed(() => {
  const team = tableau.value?.team
  if (team === undefined) return ''
  return typeof team === 'number'
    ? t.value.questTeamSize.replace('{n}', String(team))
    : t.value.questTeamSizeEither.replace('{a}', String(team[0])).replace('{b}', String(team[1]))
})

/** После только что сыгранного похода вручают амулет (галочка на вводе) — это подсказка передачи лидерства. */
const amuletNow = computed(() => (game.value?.phase === 'handoff' ? (game.value.quests.at(-1)?.amulet ?? false) : false))
const handoffRules = computed(() => [
  ...(amuletNow.value ? t.value.questHandoffRules.amulet : []),
  ...t.value.questHandoffRules.leader,
])

/** Звук разблокируется каждым тапом партии: после перезагрузки первым может оказаться любой. */
function toQuest() {
  if (!texts.value) return
  unlockSound()
  nextQuest(texts.value)
}

function cancel() {
  doubleFail.value = result.value?.doubleFail ?? false
  amulet.value = result.value?.amulet ?? false
  cancelOutcome()
}

function enter(fails: number) {
  unlockSound()
  enterFails(fails, doubleFail.value, amulet.value)
  if (result.value) playOutcome(result.value.success)
}

function proceed() {
  if (!texts.value) return
  unlockSound()
  leaveOutcome(texts.value)
  if (game.value?.phase === 'council') playCouncil()
  else if (game.value?.phase === 'finale') playFinale(finaleSide.value === 'good')
}

// --- Ночь ---

/**
 * Ночь ведёт страница: время считается от нажатия по `Date.now()`, а не накоплением тиков —
 * в фоне браузер притормаживает таймеры, а ночь отставать не должна. Тик звучит последним
 * наступившим сигналом; пропущенные в фоне не играются пачкой. Живёт только на экране:
 * сохраняется лишь фаза, а перезагрузка возвращает ко вступлению.
 */
let nightTicker: ReturnType<typeof setInterval> | null = null
let nightStartedAt = 0
/** Сколько сигналов расписания уже наступило. */
let nightPlayed = 0

function beginNight() {
  unlockSound()
  startNight()
  nightStartedAt = Date.now()
  nightPlayed = 0
  stopNightTicker()
  nightTicker = setInterval(nightTick, 200)
}

function nightTick() {
  if (nightTicker === null) return
  if (game.value?.phase !== 'night') {
    stopNightTicker()
    return
  }
  const elapsed = Date.now() - nightStartedAt
  // Конец — только после фанфар: без них никто не узнает, что пора открывать глаза.
  const { signals, end } = nightSchedule(game.value.roles)
  if (elapsed >= end && nightPlayed === signals.length) {
    stopNightTicker()
    toQuest()
    return
  }
  let due = nightPlayed
  while (due < signals.length && signals[due]!.at <= elapsed) due++
  if (due > nightPlayed) {
    nightPlayed = due
    const step = signals[due - 1]!
    playNightSignal(step.signal)
    // Фанфары опоздали (вкладка спала дольше конца ночи) — отсчёт сдвигается, чтобы им дали отзвучать.
    if (due === signals.length && elapsed > step.at) nightStartedAt = Date.now() - step.at
  }
}

function stopNightTicker() {
  if (nightTicker !== null) clearInterval(nightTicker)
  nightTicker = null
}

function stopNight() {
  stopNightTicker()
  abortNight()
}

/** Вернулись из фона — сразу догнать расписание, не дожидаясь притормозившего тика. */
function onNightVisibility() {
  if (document.visibilityState === 'visible') nightTick()
}

onMounted(() => document.addEventListener('visibilitychange', onNightVisibility))
/** Ушли со страницы посреди ночи — она прерывается, как по кнопке. */
onBeforeUnmount(() => {
  document.removeEventListener('visibilitychange', onNightVisibility)
  if (nightTicker !== null) stopNight()
})

function resume() {
  unlockSound()
  stage.value = 'game'
}

// --- Финальный совет ---

/** Охотник объявил Охоту: вместо кнопок совета — ввод «угадал / не угадал». Живёт только на экране. */
const hunting = ref(false)
const council = useCountdown(COUNCIL_SECONDS)
const councilClock = computed(() => {
  const left = council.secondsLeft.value
  return `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`
})

/** Таймер идёт, пока на экране совет; после перезагрузки — снова с полных 5 минут. */
watch(
  () => stage.value === 'game' && game.value?.phase === 'council',
  (inCouncil) => {
    hunting.value = false
    if (inCouncil) council.start()
    else council.stop()
  },
  { immediate: true },
)

/** Время вышло: сигнал, и стол идёт к Последнему шансу — если только Охота уже не объявлена. */
council.onEnd(() => {
  playSignal()
  if (!hunting.value) toLastChance()
})

function startHunt() {
  unlockSound()
  hunting.value = true
}

function endHunt(guessed: boolean) {
  if (!texts.value) return
  unlockSound()
  huntResult(texts.value, guessed)
  playFinale(finaleSide.value === 'good')
}

function lastChance() {
  unlockSound()
  toLastChance()
}

/** При 4–5 игроках одна роль добра лежит рубашкой вверх — это поминают правила Охоты и справка. */
const hiddenCard = computed(() => (game.value?.players ?? 0) <= HIDDEN_MAX_PLAYERS)

/** Строки вмешательства в Последний шанс — только для ролей из состава; их берут подсказка фазы и справка. */
const lastChanceRoleLines = computed(() => {
  const roles = game.value?.roles
  return LAST_CHANCE_ROLES.filter((id) => (roles?.[id] ?? 0) > 0).map((id) => t.value.questLastChanceRules.roles[id])
})

/**
 * Разоблачённый раскрывается после третьего провала — то есть в начале совета.
 * При 4 игроках совет наступает уже после второго, и раскрываться ему не с чего.
 */
const revealerAtCouncil = computed(() => (game.value?.roles.revealer ?? 0) > 0 && evilSlots.value >= 3)

/** Кого Охотник обязан назвать: Клирика, а если Артур в составе — Клирика или Артура. */
const huntTarget = computed(() =>
  (game.value?.roles.arthur ?? 0) > 0 ? t.value.questHuntRules.targetArthur : t.value.questHuntRules.target,
)

/** Правила Охоты для этой партии: про карту рубашкой вверх и про герцогов — только если это про нас. */
const huntRules = computed(() => {
  const rules = t.value.questHuntRules
  const roles = game.value?.roles
  return [
    rules.base,
    huntTarget.value,
    ...(hiddenCard.value ? [rules.hidden] : []),
    ...(roles && (roles.duke > 0 || roles.archduke > 0) ? [rules.dukes] : []),
    rules.verdict,
  ]
})

/** Подсказка Последнего шанса: строки вмешательства — только для ролей из состава. */
const lastChanceRules = computed(() => {
  const rules = t.value.questLastChanceRules
  return [
    rules.point,
    ...lastChanceRoleLines.value,
    rules.verdict,
    rules.veterans,
  ]
})

const LAST_CHANCE_RESULTS = ['lastChanceGood', 'lastChanceEvil', 'veteransEvil'] as const

function endLastChance(kind: (typeof LAST_CHANCE_RESULTS)[number]) {
  if (!texts.value) return
  unlockSound()
  lastChanceResult(texts.value, kind)
  playFinale(finaleSide.value === 'good')
}

/** «Новая партия» после финала: тот же состав, сразу вступление. */
function playAgain() {
  if (!texts.value) return
  unlockSound()
  replay(texts.value)
}

const FAIL_OPTIONS = [0, 1, 2, 3] as const

// --- Справка ---

/**
 * Слой справки поверх фазы. Живёт только на экране и в партию не пишется: открытие и закрытие
 * ничего не сбрасывают, а после перезагрузки партия просто на своей фазе, без справки.
 * Ночью кнопки нет — чёрный экран закрывает и шапку.
 */
const helpOpen = ref(false)

/** Роли этой партии в порядке справочника, с числом карт. */
const helpRoles = computed(() => {
  const roles = game.value?.roles
  return roles ? questRoles.filter((role) => roles[role.id] > 0).map((role) => ({ role, count: roles[role.id] })) : []
})

/** Номер похода — пока он на столе или ещё впереди; после решения партии остаётся только счёт. */
const helpShowsQuest = computed(() => {
  const phase = game.value?.phase
  return phase === 'intro' || phase === 'quest' || phase === 'outcome' || phase === 'handoff'
})
/** «Нужно 2 провала» — то, что включено на вводе, или то, с чем введён исход. */
const helpDoubleFail = computed(() => {
  const phase = game.value?.phase
  return (phase === 'quest' && doubleFail.value) || (phase === 'outcome' && result.value?.doubleFail === true)
})
const helpScore = computed(() =>
  t.value.questHelpScore
    .replace('{good}', String(currentScore.value.good))
    .replace('{evil}', String(currentScore.value.evil))
    .replace('{need}', String(evilSlots.value)),
)

/**
 * Подсказка фазы. В совете строка про Охоту — если Охотник в составе, а объявленной Охоте — своя подсказка;
 * в Последнем шансе — строки ролей состава.
 */
const helpNow = computed(() => {
  const phases = t.value.questHelpPhases
  switch (game.value?.phase) {
    case 'council':
      if (hunting.value) return [phases.hunt.reveal, huntTarget.value, phases.hunt.result]
      return [
        ...(revealerAtCouncil.value ? [phases.council.revealer] : []),
        ...phases.council.base,
        ...(game.value.roles.hunter > 0 ? [phases.council.hunter] : []),
      ]
    case 'lastChance':
      return [phases.lastChance.point, ...lastChanceRoleLines.value, phases.lastChance.result]
    case 'handoff':
      return [...(amuletNow.value ? [phases.handoff.amulet] : []), ...phases.handoff.base]
    case 'quest':
    case 'outcome':
    case 'finale':
      return phases[game.value.phase]
    default:
      return phases.intro
  }
})

/** Партия ушла со страницы или закончилась — справка не висит над другим экраном. */
watch(
  () => stage.value === 'game' && game.value !== null,
  (inGame) => {
    if (!inGame) helpOpen.value = false
  },
)

function onHelpKey(event: KeyboardEvent) {
  if (event.key === 'Escape' && helpOpen.value) helpOpen.value = false
}
onMounted(() => document.addEventListener('keydown', onHelpKey))
onBeforeUnmount(() => document.removeEventListener('keydown', onHelpKey))

// --- Экран настройки ---

/** Группы состава по сторонам: роли таблицы и роли из коробки — одним списком. */
const groups = computed(() => [
  { key: 'good', title: t.value.questSides.good, roles: questRoles.filter((r) => r.side === 'good') },
  { key: 'evil', title: t.value.questSides.evil, roles: questRoles.filter((r) => r.side === 'evil') },
])

/** Раскрытое описание роли; одновременно развёрнута не больше одной. */
const expanded = ref<QuestRoleId | null>(null)

function toggleRole(id: QuestRoleId) {
  expanded.value = expanded.value === id ? null : id
}

const cardsLabel = computed(() =>
  t.value.questCards.replace('{n}', String(cards.value)).replace('{m}', String(expected.value)),
)
const wrongCountLabel = computed(() => t.value.questWarnings.wrongCount.replace('{m}', String(expected.value)))
</script>

<template>
  <main class="screen">
    <!-- Нет текстов на языке: режим скрыт с главной, но по прямой ссылке — понятное сообщение -->
    <template v-if="!available">
      <header class="top">
        <NuxtLink to="/" class="back">← {{ t.decks }}</NuxtLink>
        <h1 class="title">{{ t.quest }}</h1>
      </header>

      <div class="body center">
        <p class="message">{{ t.questNoTexts }}</p>
        <NuxtLink to="/" class="link">{{ t.decks }}</NuxtLink>
      </div>
    </template>

    <!-- Настройка состава -->
    <template v-else-if="stage === 'setup'">
      <header class="top">
        <NuxtLink to="/" class="back">← {{ t.decks }}</NuxtLink>
        <h1 class="title">{{ t.quest }}</h1>
      </header>

      <div class="body">
        <p class="tagline">{{ t.questTagline }}</p>

        <section class="group">
          <div class="plain">
            <div class="row">
              <GameIcon name="players" class="row-icon" />
              <span class="row-title">{{ t.questPlayersCount }}</span>
              <span class="stepper">
                <button
                  type="button"
                  class="step"
                  :disabled="!canChangePlayers(-1)"
                  :aria-label="`${t.removePlayer}: ${t.questPlayersCount}`"
                  @click="changePlayers(-1)"
                >
                  −
                </button>
                <span class="value" :aria-label="`${t.questPlayersCount}: ${setup.players}`">{{ setup.players }}</span>
                <button
                  type="button"
                  class="step"
                  :disabled="!canChangePlayers(1)"
                  :aria-label="`${t.addPlayer}: ${t.questPlayersCount}`"
                  @click="changePlayers(1)"
                >
                  +
                </button>
              </span>
            </div>
          </div>

          <p v-if="hasHidden" class="note">{{ t.questHiddenNote }}</p>
        </section>

        <section v-for="group in groups" :key="group.key" class="group">
          <h2 class="group-title">{{ group.title }}</h2>
          <ul class="roles">
            <li
              v-for="role in group.roles"
              :key="role.id"
              class="role"
              :class="[`side-${role.side}`, { empty: lineup[role.id] === 0 }]"
            >
              <div class="row">
                <button
                  type="button"
                  class="row-name"
                  :aria-expanded="expanded === role.id"
                  @click="toggleRole(role.id)"
                >
                  <span class="row-title">
                    {{ role.title }} <span class="original">({{ role.original }})</span>
                  </span>
                  <span class="chevron" :class="{ open: expanded === role.id }" aria-hidden="true">›</span>
                </button>
                <span class="stepper">
                  <button
                    type="button"
                    class="step"
                    :disabled="!canChangeRole(role.id, -1)"
                    :aria-label="`${t.removePlayer}: ${role.title}`"
                    @click="changeRole(role.id, -1)"
                  >
                    −
                  </button>
                  <span class="value">{{ lineup[role.id] }}</span>
                  <button
                    type="button"
                    class="step"
                    :disabled="!canChangeRole(role.id, 1)"
                    :aria-label="`${t.addPlayer}: ${role.title}`"
                    @click="changeRole(role.id, 1)"
                  >
                    +
                  </button>
                </span>
              </div>
              <div v-if="expanded === role.id" class="role-text">
                <p class="role-side">{{ t.questSides[role.side] }}</p>
                <p class="role-ability">{{ role.ability }}</p>
              </div>
            </li>
          </ul>
        </section>

        <section class="group summary">
          <p class="cards">{{ cardsLabel }}</p>
          <p v-if="nonStandard" class="warn">{{ t.questWarnings.nonStandard }}</p>
          <p v-if="wrongCount" class="warn">{{ wrongCountLabel }}</p>
        </section>
      </div>

      <!-- Предупреждения начать не мешают: нестандартный состав — решение стола. -->
      <footer class="bottom">
        <button type="button" class="action primary" @click="start">{{ t.questStart }}</button>
      </footer>
    </template>

    <!-- Незаконченная партия: продолжить с той же фазы или начать заново -->
    <template v-else-if="stage === 'resume' && game">
      <header class="top">
        <NuxtLink to="/" class="back">← {{ t.decks }}</NuxtLink>
        <h1 class="title">{{ t.quest }}</h1>
      </header>

      <div class="body center">
        <GameIcon name="quest" class="big-icon" />
        <p class="message">{{ t.questResumeTitle }}</p>
        <p v-if="game.quests.length > 0" class="resume-score">
          {{ t.questSides.good }} <strong>{{ currentScore.good }}</strong> : <strong>{{ currentScore.evil }}</strong>
          {{ t.questSides.evil }}
        </p>
      </div>

      <footer class="bottom">
        <button type="button" class="action secondary" @click="toSetup">{{ t.questNewGame }}</button>
        <button type="button" class="action primary" @click="resume">{{ t.questResume }}</button>
      </footer>
    </template>

    <!-- Партия: шапка и кнопки приколоты, текст прокручивается -->
    <template v-else-if="game">
      <header class="top">
        <NuxtLink to="/" class="back">← {{ t.decks }}</NuxtLink>
        <h1 class="title">{{ t.quest }}</h1>
        <button
          type="button"
          class="help-button"
          :aria-label="t.questHelp"
          aria-haspopup="dialog"
          :aria-expanded="helpOpen"
          @click="helpOpen = true"
        >
          ?
        </button>
      </header>

      <!-- Справка: слой поверх фазы, сама фаза под ним не трогается -->
      <div v-if="helpOpen" class="help" role="dialog" aria-modal="true" :aria-label="t.questHelp">
        <header class="top">
          <h2 class="title">{{ t.questHelp }}</h2>
          <button type="button" class="help-close" @click="helpOpen = false">{{ t.questHelpClose }}</button>
        </header>
        <div class="body">
          <section class="group">
            <h3 class="group-title">{{ t.questHelpNow }}</h3>
            <ul class="rules">
              <li v-for="line in helpNow" :key="line">{{ line }}</li>
            </ul>
          </section>

          <section class="group">
            <h3 class="group-title">{{ t.questHelpQuest }}</h3>
            <ul class="hints help-quest">
              <li v-if="helpShowsQuest" class="help-number">{{ t.questNumber.replace('{n}', String(questNumber)) }}</li>
              <li>{{ helpScore }}</li>
              <li v-if="helpDoubleFail">{{ t.questHelpDoubleFail }}</li>
              <li v-if="helpShowsQuest && teamSize">{{ teamSize }}</li>
            </ul>
          </section>

          <section class="group">
            <h3 class="group-title">{{ t.questHelpRoles }}</h3>
            <ul class="roles">
              <li v-for="{ role, count } in helpRoles" :key="role.id" class="role" :class="`side-${role.side}`">
                <div class="role-text help-role">
                  <p class="row-title">
                    {{ role.title }} <span class="original">({{ role.original }})</span>
                    <span v-if="count > 1" class="help-count">× {{ count }}</span>
                  </p>
                  <p class="role-side">{{ t.questSides[role.side] }}</p>
                  <p class="role-ability">{{ role.ability }}</p>
                </div>
              </li>
            </ul>
            <p v-if="hiddenCard" class="note">{{ t.questHelpHidden }}</p>
          </section>
        </div>
      </div>

      <!-- «Кто есть кто», вступление и строки ролей, за ними текст про ночь; ночью поверх — чёрный экран с маленькой «Прервать» -->
      <template v-if="game.phase === 'intro' || game.phase === 'night'">
        <div class="body">
          <p class="reading">{{ texts?.introLore }}</p>
          <p class="reading">{{ intro?.text }}</p>
          <p v-for="line in introRoleLines" :key="line" class="reading">{{ line }}</p>
          <h2 class="tale-title">{{ t.questNightTitle }}</h2>
          <p v-for="line in night" :key="line" class="reading">{{ line }}</p>
        </div>
        <footer class="bottom">
          <button type="button" class="action primary" @click="beginNight">{{ t.questStartNight }}</button>
        </footer>
        <div v-if="game.phase === 'night'" class="night">
          <button type="button" class="night-stop" @click="stopNight">{{ t.questStopNight }}</button>
        </div>
      </template>

      <!-- Поход и его исход: общий номер и счёт кружками, ниже завязка с вводом или исход -->
      <template v-else-if="(game.phase === 'quest' || game.phase === 'outcome') && tale">
        <div class="body">
          <div class="status">
            <span class="number">{{ t.questNumber.replace('{n}', String(questNumber)) }}</span>
            <span class="score" :aria-label="`${t.questSides.good} ${currentScore.good}, ${t.questSides.evil} ${currentScore.evil}`">
              <span class="dots side-good" aria-hidden="true">
                <span v-for="i in GOOD_WINS" :key="i" class="dot" :class="{ on: i <= currentScore.good }" />
              </span>
              <span class="dots side-evil" aria-hidden="true">
                <span v-for="i in evilSlots" :key="i" class="dot" :class="{ on: i <= currentScore.evil }" />
              </span>
            </span>
          </div>
          <template v-if="result">
            <p class="verdict" :class="result.success ? 'side-good' : 'side-evil'">
              {{ result.success ? t.questOutcome.success : t.questOutcome.fail }}
            </p>
            <p class="fails-count">
              {{ t.questFailsCount.replace('{n}', result.fails >= 3 ? t.questFailsMore : String(result.fails)) }}
            </p>
            <h2 class="tale-title">{{ tale.title }}</h2>
            <p class="reading">{{ outcomeText(tale, result) }}</p>
            <p v-if="result.amulet" class="reading">{{ tale.amulet }}</p>
          </template>
          <template v-else>
            <p v-if="questBridge" class="bridge">{{ questBridge }}</p>
            <h2 class="tale-title">{{ tale.title }}</h2>
            <p class="reading">{{ tale.setup }}</p>
            <ul class="hints">
              <li>{{ t.questTokensHint }}</li>
              <li v-if="teamSize">{{ teamSize }}</li>
            </ul>
          </template>
        </div>
        <footer v-if="result" class="bottom">
          <button type="button" class="action secondary" @click="cancel">{{ t.questCancel }}</button>
          <button type="button" class="action primary" @click="proceed">
            {{ winner === 'good' ? t.questToFinale : winner === 'evil' ? t.questToCouncil : t.questPassLeadership }}
          </button>
        </footer>
        <footer v-else class="bottom input">
          <label class="toggle">
            <input v-model="doubleFail" type="checkbox" />
            <span>{{ t.questDoubleFail }}</span>
          </label>
          <label class="toggle">
            <input v-model="amulet" type="checkbox" />
            <span>{{ t.questAmulet }}</span>
          </label>
          <p class="prompt">{{ t.questFailsPrompt }}</p>
          <div class="fails">
            <button
              v-for="fails in FAIL_OPTIONS"
              :key="fails"
              type="button"
              class="action fail-button"
              :class="fails === 0 ? 'secondary' : 'primary'"
              @click="enter(fails)"
            >
              {{ fails === 3 ? t.questFailsMore : fails }}
            </button>
          </div>
        </footer>
      </template>

      <!-- Передача лидерства -->
      <template v-else-if="game.phase === 'handoff'">
        <div class="body">
          <h2 class="tale-title">{{ t.questHandoffTitle }}</h2>
          <ul class="rules">
            <li v-for="rule in handoffRules" :key="rule">{{ rule }}</li>
          </ul>
        </div>
        <footer class="bottom">
          <button type="button" class="action primary" @click="toQuest">{{ t.questNewLeader }}</button>
        </footer>
      </template>

      <!-- Финальный совет: текст, таймер на 5 минут; Охота или Последний шанс -->
      <template v-else-if="game.phase === 'council'">
        <div class="body">
          <template v-if="hunting">
            <h2 class="tale-title">{{ t.questHuntTitle }}</h2>
            <ul class="rules">
              <li v-for="rule in huntRules" :key="rule">{{ rule }}</li>
            </ul>
          </template>
          <template v-else>
            <h2 class="tale-title">{{ t.questCouncil }}</h2>
            <p class="reading">{{ texts?.council }}</p>
            <p v-if="revealerAtCouncil" class="reading">{{ texts?.councilRevealerLine }}</p>
            <p class="note">{{ t.questCouncilHint }}</p>
          </template>
          <p
            class="clock"
            :class="{ over: council.secondsLeft.value === 0 }"
            role="timer"
            :aria-label="`${t.questCouncilTimer}: ${councilClock}`"
          >
            {{ councilClock }}
          </p>
        </div>
        <footer v-if="hunting" class="bottom input">
          <p class="prompt">{{ t.questHuntQuestion }}</p>
          <div class="fails">
            <button type="button" class="action primary side-evil-bg" @click="endHunt(true)">
              {{ t.questHuntAnswers.yes }}
            </button>
            <button type="button" class="action primary" @click="endHunt(false)">{{ t.questHuntAnswers.no }}</button>
          </div>
          <button type="button" class="action secondary small" @click="hunting = false">{{ t.questHuntBack }}</button>
        </footer>
        <footer v-else class="bottom input">
          <button type="button" class="action secondary" @click="startHunt">{{ t.questHunt }}</button>
          <button type="button" class="action primary" @click="lastChance">{{ t.questToLastChance }}</button>
        </footer>
      </template>

      <!-- Последний шанс: подсказка по механике и три кнопки итога -->
      <template v-else-if="game.phase === 'lastChance'">
        <div class="body">
          <h2 class="tale-title">{{ t.questLastChanceTitle }}</h2>
          <ul class="rules">
            <li v-for="rule in lastChanceRules" :key="rule">{{ rule }}</li>
          </ul>
        </div>
        <footer class="bottom input">
          <p class="prompt">{{ t.questLastChanceQuestion }}</p>
          <button
            v-for="kind in LAST_CHANCE_RESULTS"
            :key="kind"
            type="button"
            class="action"
            :class="kind === 'lastChanceEvil' ? 'secondary' : 'primary'"
            @click="endLastChance(kind)"
          >
            {{ t.questLastChanceResults[kind] }}
          </button>
        </footer>
      </template>

      <!-- Финал: заголовок цвета победившей стороны, текст и вставки по ролям состава -->
      <template v-else>
        <div class="body">
          <h2 class="tale-title verdict-title" :class="`side-${finaleSide}`">
            {{ game.finale ? t.questFinaleTitles[game.finale.kind] : '' }}
          </h2>
          <p class="reading">{{ finaleText }}</p>
          <p v-for="line in finaleLines" :key="line" class="reading">{{ line }}</p>
        </div>
        <footer class="bottom">
          <button type="button" class="action secondary" @click="toSetup">{{ t.questToSetup }}</button>
          <button type="button" class="action primary" @click="playAgain">{{ t.questNewGame }}</button>
        </footer>
      </template>
    </template>
  </main>
</template>

<style scoped>
/* Цвет стороны: добро — цвет города, зло — цвет мафии из палитры main.css. */
.side-good {
  --side: var(--faction-town);
}

.side-evil {
  --side: var(--faction-mafia);
}

/* Шапка и нижняя панель приколоты, прокручивается только середина. */
.screen {
  display: flex;
  flex-direction: column;
  height: 100dvh;
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
  gap: 8px;
  min-height: 60px;
}

.tagline {
  margin: 0 4px 16px;
  color: var(--muted);
  font-size: 16px;
  font-style: italic;
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

/* --- Число игроков и переключатель --- */

.plain {
  border-radius: 14px;
  background: var(--surface);
}

.note {
  margin: 10px 4px 0;
  color: var(--muted);
  font-size: 15px;
  line-height: 1.35;
}

/* --- Строки состава --- */

.roles {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.role {
  border-radius: 14px;
  background: var(--surface);
  /* Тонкая полоса слева — цвет стороны. */
  border-left: 4px solid var(--side);
}

/* Роль не в составе: строка остаётся, чтобы её можно было добавить, но читается тише. */
.role.empty .row-title {
  color: var(--muted);
}

.row {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 60px;
  padding: 6px 10px 6px 12px;
}

/* Название роли — кнопка во всю свободную ширину: тап разворачивает описание. */
.row-name {
  display: flex;
  flex: 1;
  align-items: center;
  gap: 8px;
  min-width: 0;
  min-height: 48px;
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
  touch-action: manipulation;
}

.row-icon {
  flex: none;
  margin: 0 4px;
  font-size: 24px;
  color: var(--muted);
}

/* Название с оригиналом может быть длинным: переносится, а не обрезается. */
.row-title {
  flex: 1;
  min-width: 0;
  font-size: 18px;
  font-weight: 600;
  line-height: 1.2;
  overflow-wrap: anywhere;
}

.original {
  color: var(--muted);
  font-size: 15px;
  font-weight: 400;
}

.chevron {
  flex: none;
  padding: 0 4px;
  color: var(--muted);
  font-size: 20px;
  line-height: 1;
  transition: transform 150ms ease;
}

.chevron.open {
  transform: rotate(90deg);
}

/* --- Счётчики --- */

.stepper {
  display: flex;
  flex: none;
  align-items: center;
  gap: 2px;
}

.step {
  width: 44px;
  height: 44px;
  border: 0;
  border-radius: 12px;
  background: var(--surface-active);
  color: var(--fg);
  font: inherit;
  font-size: 22px;
  font-weight: 700;
  line-height: 1;
  cursor: pointer;
  touch-action: manipulation;
}

.step:active {
  background: var(--accent);
  color: var(--bg);
}

.step:disabled {
  background: transparent;
  color: var(--muted);
  opacity: 0.4;
  cursor: default;
}

.value {
  min-width: 32px;
  font-size: 20px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  text-align: center;
}

/* --- Описание роли --- */

.role-text {
  padding: 0 16px 14px 12px;
}

.role-side {
  margin: 0 0 6px;
  color: var(--side);
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.role-ability {
  margin: 0;
  color: var(--muted);
  font-size: 16px;
  line-height: 1.35;
}

/* --- Итог и предупреждения --- */

.cards {
  margin: 0 4px;
  font-size: 17px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.warn {
  margin: 8px 4px 0;
  color: var(--accent);
  font-size: 15px;
  line-height: 1.35;
}

/* --- Сообщения и заглушка --- */

.center {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  text-align: center;
}

.center .note {
  margin: 0;
}

.message {
  margin: 0;
  font-size: calc(24px * var(--font-scale));
  font-weight: 700;
}

.link {
  min-height: 44px;
  padding: 8px 12px;
  color: var(--accent);
  font-size: 18px;
  font-weight: 600;
  text-decoration: none;
}

.big-icon {
  color: var(--accent);
  font-size: 84px;
}

.resume-score {
  margin: 0;
  color: var(--muted);
  font-size: 18px;
}

.resume-score strong {
  color: var(--fg);
}

/* --- Партия --- */

.status {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin: 0 4px 16px;
}

.number {
  font-size: 17px;
  font-weight: 700;
  color: var(--muted);
}

.score {
  display: flex;
  gap: 14px;
}

.dots {
  display: flex;
  gap: 5px;
}

.dot {
  width: 14px;
  height: 14px;
  border: 2px solid var(--side);
  border-radius: 50%;
}

.dot.on {
  background: var(--side);
}

.tale-title {
  margin: 0 4px 12px;
  font-size: calc(24px * var(--font-scale));
  font-weight: 700;
  line-height: 1.2;
  overflow-wrap: break-word;
}

/* Связка по счёту — курсивом над названием похода, читается вслух вместе с завязкой. */
.bridge {
  margin: 0 4px 12px;
  color: var(--muted);
  font-size: calc(18px * var(--font-scale));
  font-style: italic;
  line-height: 1.4;
  overflow-wrap: break-word;
}

.reading {
  margin: 0 4px 16px;
  font-size: calc(20px * var(--font-scale));
  line-height: 1.4;
  overflow-wrap: break-word;
  hyphens: auto;
}

.hints,
.rules {
  margin: 0 4px;
  padding-left: 20px;
  color: var(--muted);
  font-size: calc(16px * var(--font-scale));
  line-height: 1.4;
}

.rules {
  color: var(--fg);
  font-size: calc(18px * var(--font-scale));
}

.hints li + li,
.rules li + li {
  margin-top: 8px;
}

.verdict {
  margin: 0 4px 4px;
  color: var(--side);
  font-size: calc(30px * var(--font-scale));
  font-weight: 800;
}

.fails-count {
  margin: 0 4px 16px;
  color: var(--muted);
  font-size: 16px;
}

/* Ввод провалов: переключатель, вопрос и четыре кнопки — всё в приколотой панели. */
.bottom.input {
  flex-direction: column;
  gap: 8px;
  padding-top: 8px;
}

.toggle {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 48px;
  padding: 4px 14px;
  border-radius: 14px;
  background: var(--surface);
  font-size: 17px;
  font-weight: 600;
  cursor: pointer;
}

.toggle input {
  flex: none;
  width: 24px;
  height: 24px;
  margin: 0;
  accent-color: var(--accent);
}

.prompt {
  margin: 0 4px;
  color: var(--muted);
  font-size: 15px;
}

.fails {
  display: flex;
  gap: 8px;
}

.fail-button {
  min-width: 0;
  padding: 12px 4px;
  font-variant-numeric: tabular-nums;
}

/* --- Совет и финал --- */

.clock {
  margin: 8px 4px 0;
  font-size: calc(48px * var(--font-scale));
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  text-align: center;
}

.clock.over {
  color: var(--accent);
}

.verdict-title {
  color: var(--side);
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
  text-decoration: none;
  cursor: pointer;
  touch-action: manipulation;
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

/* «Охотник угадал» — победа зла: кнопка цвета зла. */
.side-evil-bg {
  background: var(--faction-mafia);
  color: #fff;
}

.small {
  flex: none;
  min-height: 48px;
  font-size: 18px;
}

/* --- Справка: слой во весь экран поверх фазы, ниже чёрного экрана ночи --- */

.help-button {
  flex: none;
  width: 44px;
  height: 44px;
  margin-left: auto;
  border: 0;
  border-radius: 50%;
  background: var(--surface);
  color: var(--accent);
  font: inherit;
  font-size: 22px;
  font-weight: 700;
  line-height: 1;
  cursor: pointer;
  touch-action: manipulation;
}

.help-button:active {
  background: var(--surface-active);
}

.help {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  flex-direction: column;
  padding: calc(env(safe-area-inset-top, 0px) + 12px) calc(env(safe-area-inset-right, 0px) + 16px)
    calc(env(safe-area-inset-bottom, 0px) + 16px) calc(env(safe-area-inset-left, 0px) + 16px);
  background: var(--bg);
  overscroll-behavior: contain;
}

.help-close {
  flex: none;
  margin-left: auto;
  padding: 8px 4px;
  border: 0;
  background: transparent;
  color: var(--accent);
  font: inherit;
  font-size: 17px;
  font-weight: 600;
  cursor: pointer;
  touch-action: manipulation;
}

.help-quest {
  color: var(--fg);
  font-size: calc(18px * var(--font-scale));
}

.help-number {
  font-weight: 700;
}

.help-role {
  padding-top: 12px;
}

.help-role .row-title {
  margin: 0 0 6px;
}

.help-count {
  color: var(--muted);
  font-variant-numeric: tabular-nums;
}

/* --- Ночь: чёрный экран поверх всего, ничего не подсвечивает --- */

.night {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: #000;
}

/* Тусклая, но достаточная для пальца: в углу, чтобы не нажать случайно. */
.night-stop {
  position: absolute;
  top: calc(env(safe-area-inset-top, 0px) + 12px);
  right: calc(env(safe-area-inset-right, 0px) + 12px);
  min-height: 44px;
  padding: 8px 14px;
  border: 1px solid #222;
  border-radius: 12px;
  background: transparent;
  color: #444;
  font: inherit;
  font-size: 15px;
  cursor: pointer;
  touch-action: manipulation;
}

@media (prefers-reduced-motion: reduce) {
  .chevron {
    transition: none;
  }
}
</style>
