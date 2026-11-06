<script setup lang="ts">
import { useMessages } from '~/composables/useMessages'
import { useQuest } from '~/composables/useQuest'
import { useSettings } from '~/composables/useSettings'
import { useWakeLock } from '~/composables/useWakeLock'
import { GOOD_WINS, decided, evilThreshold, outcomeText, score } from '~/quest/game'
import { questRoles } from '~/quest/roles'
import { findIntro, findTale, questTexts } from '~/quest/texts'
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
  hasEither,
  canChangePlayers,
  changePlayers,
  chooseYouthOrTroublemaker,
  canChangeRole,
  changeRole,
  quest,
  startGame,
  nextQuest,
  enterFails,
  cancelOutcome,
  leaveOutcome,
  endGame,
} = useQuest()

/** Тексты языка интерфейса; нет — режим недоступен: сообщение и ссылка на главную. */
const texts = computed(() => questTexts[settings.lang])
const available = computed(() => texts.value !== undefined)

// --- Стейт-машина ---
// setup → game; resume → game | setup. Внутри game — фазы партии из `koster.quest.game`:
// intro ─Дальше─▶ quest ─ввод─▶ outcome ─Отменить─▶ quest
// outcome ─Передать лидерство─▶ handoff ─Я новый лидер─▶ quest
// outcome ─3 успеха─▶ finale(goodQuests); outcome ─порог провалов─▶ council (пока заглушка)

/** Незаконченная партия при входе — сначала «Продолжить партию?», как в Alias. */
const stage = ref<'setup' | 'resume' | 'game'>(quest.game ? 'resume' : 'setup')
const game = computed(() => quest.game)
/** Экран не гаснет на всех фазах после настройки. */
useWakeLock(computed(() => stage.value === 'game'))

function start() {
  if (!texts.value) return
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

/** Переключатель «нужно 2 провала» — на каждый поход заново; «Отменить» возвращает введённое. */
const doubleFail = ref(false)

function toQuest() {
  if (!texts.value) return
  nextQuest(texts.value)
  doubleFail.value = false
}

function cancel() {
  doubleFail.value = result.value?.doubleFail ?? false
  cancelOutcome()
}

function proceed() {
  if (texts.value) leaveOutcome(texts.value)
}

const FAIL_OPTIONS = [0, 1, 2, 3] as const

// --- Экран настройки ---

/** Группы состава: роли таблицы по сторонам, альтернативные роли автора — отдельно в конце. */
const groups = computed(() => [
  { key: 'good', title: t.value.questSides.good, roles: questRoles.filter((r) => r.side === 'good' && !r.alternative) },
  { key: 'evil', title: t.value.questSides.evil, roles: questRoles.filter((r) => r.side === 'evil' && !r.alternative) },
  { key: 'alt', title: t.value.questAlternatives, roles: questRoles.filter((r) => r.alternative) },
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

          <!-- «1 of either» в таблице: только при 6+ игроках -->
          <div
            v-if="hasEither"
            class="segments"
            role="radiogroup"
            :aria-label="t.questYouthOrTroublemaker"
          >
            <button
              v-for="choice in ['youth', 'troublemaker'] as const"
              :key="choice"
              type="button"
              class="segment"
              :class="{ selected: setup.youthOrTroublemaker === choice }"
              role="radio"
              :aria-checked="setup.youthOrTroublemaker === choice"
              @click="chooseYouthOrTroublemaker(choice)"
            >
              {{ questRoles.find((role) => role.id === choice)?.title }}
            </button>
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
        <button type="button" class="action primary" @click="stage = 'game'">{{ t.questResume }}</button>
      </footer>
    </template>

    <!-- Партия: шапка и кнопки приколоты, текст прокручивается -->
    <template v-else-if="game">
      <header class="top">
        <NuxtLink to="/" class="back">← {{ t.decks }}</NuxtLink>
        <h1 class="title">{{ t.quest }}</h1>
      </header>

      <!-- Вступление; ночь пока пропускается кнопкой «Дальше» -->
      <template v-if="game.phase === 'intro' || game.phase === 'night'">
        <div class="body">
          <p class="reading">{{ intro?.text }}</p>
        </div>
        <footer class="bottom">
          <button type="button" class="action primary" @click="toQuest">{{ t.questNext }}</button>
        </footer>
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
          </template>
          <template v-else>
            <h2 class="tale-title">{{ tale.title }}</h2>
            <p class="reading">{{ tale.setup }}</p>
            <ul class="hints">
              <li>{{ t.questTokensHint }}</li>
              <li>{{ t.questTeamSize }}</li>
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
          <p class="prompt">{{ t.questFailsPrompt }}</p>
          <div class="fails">
            <button
              v-for="fails in FAIL_OPTIONS"
              :key="fails"
              type="button"
              class="action fail-button"
              :class="fails === 0 ? 'secondary' : 'primary'"
              @click="enterFails(fails, doubleFail)"
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
            <li v-for="rule in t.questHandoffRules" :key="rule">{{ rule }}</li>
          </ul>
        </div>
        <footer class="bottom">
          <button type="button" class="action primary" @click="toQuest">{{ t.questNewLeader }}</button>
        </footer>
      </template>

      <!-- Финал -->
      <template v-else-if="game.phase === 'finale'">
        <div class="body">
          <h2 class="tale-title">{{ t.questGoodWins }}</h2>
          <p class="reading">{{ finaleText }}</p>
        </div>
        <footer class="bottom">
          <button type="button" class="action secondary" @click="toSetup">{{ t.questToSetup }}</button>
        </footer>
      </template>

      <!-- Финальный совет: заглушка до тикета 03 -->
      <template v-else>
        <div class="body center">
          <GameIcon name="quest" class="big-icon" />
          <p class="message">{{ t.questCouncil }}</p>
          <p class="note">{{ t.questStub }}</p>
        </div>
        <footer class="bottom">
          <button type="button" class="action secondary" @click="toSetup">{{ t.questToSetup }}</button>
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

.segments {
  display: flex;
  gap: 4px;
  margin-top: 8px;
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

@media (prefers-reduced-motion: reduce) {
  .chevron {
    transition: none;
  }
}
</style>
