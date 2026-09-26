<script setup lang="ts">
import { useMessages } from '~/composables/useMessages'
import { useSettings } from '~/composables/useSettings'
import { useSpySetup } from '~/composables/useSpySetup'
import { useWakeLock } from '~/composables/useWakeLock'
import { dealNextRound, type SpyDeal } from '~/spy/deal'
import { getTheme } from '~/spy/themes'

const t = useMessages()
const settings = useSettings()
const {
  setup,
  warning,
  themesFor,
  canDeal,
  canChangeTotal,
  changeTotal,
  canChangeSpies,
  changeSpies,
  canChangeMinutes,
  changeMinutes,
  toggleTheme,
} = useSpySetup()
// Телефон едет по кругу, потом лежит на столе — экран не должен гаснуть ни на одном этапе.
useWakeLock()

// --- Стейт-машина: setup → deal → ready (раунд с таймером — тикет 03) ---

const stage = ref<'setup' | 'deal' | 'ready'>('setup')

/** Раздача раунда. Живёт только в памяти, в localStorage не уходит. */
const deal = ref<SpyDeal | null>(null)
/** Чей сейчас ход, от нуля. */
const index = ref(0)
/** Карта вскрыта — лицо видно, «Передать дальше» доступно. */
const revealed = ref(false)
/**
 * Шпион ли на лицевой стороне. Отдельно от `index`: лицо меняется только в момент вскрытия,
 * иначе на возврате рубашки мелькнула бы уже следующая карточка.
 */
const shownSpy = ref<boolean | null>(null)

const visibleThemes = computed(() => themesFor(settings.lang))
const dealable = computed(() => canDeal(settings.lang))
const themeTitle = computed(() => (deal.value ? getTheme(deal.value.theme).title[settings.lang] : ''))
const playerLabel = computed(() =>
  t.value.spyPlayerOf
    .replace('{n}', String(index.value + 1))
    .replace('{m}', String(deal.value?.isSpy.length ?? 0)),
)

function startDeal() {
  if (!dealable.value) return
  deal.value = dealNextRound(setup, settings.lang)
  index.value = 0
  revealed.value = false
  shownSpy.value = null
  stage.value = 'deal'
}

/** Тап по рубашке: лицо ставится и вскрывается в одном обновлении, чтобы переворот шёл с нужной карточкой. */
function reveal() {
  if (revealed.value || !deal.value) return
  shownSpy.value = deal.value.isSpy[index.value] ?? false
  revealed.value = true
}

/** «Передать дальше»: карточка прячется, ход переходит следующему; назад вернуться нельзя. */
function pass() {
  if (!revealed.value || !deal.value) return
  revealed.value = false
  if (index.value >= deal.value.isSpy.length - 1) stage.value = 'ready'
  else index.value += 1
}

/** Выход из раздачи — только через подтверждение: одно случайное касание не должно рушить круг. */
function exitDeal() {
  if (!confirm(t.value.spyExitConfirm)) return
  editSetup()
}

function editSetup() {
  deal.value = null
  shownSpy.value = null
  stage.value = 'setup'
}
</script>

<template>
  <main class="screen">
    <!-- Настройки -->
    <template v-if="stage === 'setup'">
      <header class="top">
        <NuxtLink to="/" class="back">← {{ t.decks }}</NuxtLink>
        <h1 class="title">{{ t.spy }}</h1>
      </header>

      <div class="body">
        <section class="group">
          <ul class="rows">
            <li class="row">
              <GameIcon name="players" class="row-icon" />
              <span class="row-title">{{ t.spyPlayersCount }}</span>
              <span class="stepper">
                <button
                  type="button"
                  class="step"
                  :disabled="!canChangeTotal(-1)"
                  :aria-label="`${t.removePlayer}: ${t.spyPlayersCount}`"
                  @click="changeTotal(-1)"
                >
                  −
                </button>
                <span class="value" :aria-label="`${t.spyPlayersCount}: ${setup.total}`">{{ setup.total }}</span>
                <button
                  type="button"
                  class="step"
                  :disabled="!canChangeTotal(1)"
                  :aria-label="`${t.addPlayer}: ${t.spyPlayersCount}`"
                  @click="changeTotal(1)"
                >
                  +
                </button>
              </span>
            </li>
            <li class="row">
              <GameIcon name="spy" class="row-icon" />
              <span class="row-title">{{ t.spySpiesCount }}</span>
              <span class="stepper">
                <button
                  type="button"
                  class="step"
                  :disabled="!canChangeSpies(-1)"
                  :aria-label="`${t.removePlayer}: ${t.spySpiesCount}`"
                  @click="changeSpies(-1)"
                >
                  −
                </button>
                <span class="value" :aria-label="`${t.spySpiesCount}: ${setup.spies}`">{{ setup.spies }}</span>
                <button
                  type="button"
                  class="step"
                  :disabled="!canChangeSpies(1)"
                  :aria-label="`${t.addPlayer}: ${t.spySpiesCount}`"
                  @click="changeSpies(1)"
                >
                  +
                </button>
              </span>
            </li>
            <li class="row">
              <GameIcon name="timer" class="row-icon" />
              <span class="row-title">{{ t.spyMinutes }}</span>
              <span class="stepper">
                <button
                  type="button"
                  class="step"
                  :disabled="!canChangeMinutes(-1)"
                  :aria-label="`−1: ${t.spyMinutes}`"
                  @click="changeMinutes(-1)"
                >
                  −
                </button>
                <span class="value" :aria-label="`${t.spyMinutes}: ${setup.minutes}`">{{ setup.minutes }}</span>
                <button
                  type="button"
                  class="step"
                  :disabled="!canChangeMinutes(1)"
                  :aria-label="`+1: ${t.spyMinutes}`"
                  @click="changeMinutes(1)"
                >
                  +
                </button>
              </span>
            </li>
          </ul>
          <p v-if="warning" class="warn">{{ t.spyWarnings[warning] }}</p>
        </section>

        <section class="group">
          <h2 class="group-title">{{ t.spyThemes }}</h2>
          <ul class="rows">
            <li v-for="theme in visibleThemes" :key="theme.id">
              <label class="row theme">
                <input
                  type="checkbox"
                  class="check"
                  :checked="setup.themes.includes(theme.id)"
                  @change="toggleTheme(theme.id)"
                />
                <span class="row-title">{{ theme.title[settings.lang] }}</span>
              </label>
            </li>
          </ul>
          <p v-if="!dealable" id="spy-no-themes" class="warn">{{ t.spyNoThemes }}</p>
        </section>
      </div>

      <footer class="bottom">
        <button
          type="button"
          class="action primary"
          :disabled="!dealable"
          :aria-describedby="dealable ? undefined : 'spy-no-themes'"
          @click="startDeal"
        >
          {{ t.spyDeal }}
        </button>
      </footer>
    </template>

    <!-- Раздача -->
    <template v-else-if="stage === 'deal'">
      <header class="top">
        <button type="button" class="back" @click="exitDeal">← {{ t.spyExit }}</button>
        <span class="counter">{{ playerLabel }}</span>
      </header>

      <div class="body deal">
        <button
          type="button"
          class="card"
          :class="{ flipped: revealed }"
          :aria-label="revealed ? undefined : t.spyReveal"
          @click="reveal"
        >
          <span class="card-inner">
            <span class="card-face card-back">
              <GameIcon name="spy" class="back-icon" />
              <span class="back-hint">{{ t.spyReveal }}</span>
            </span>
            <!--
              Лицо мирного и шпиона — одна и та же сетка: тема сверху, крупная строка в центре,
              одинаковые уголки. Через плечо по раскладке не понять, чья это карточка.
            -->
            <span v-if="shownSpy !== null" class="card-face card-front" :lang="settings.lang">
              <GameIcon name="spy" class="corner corner-start" />
              <GameIcon name="spy" class="corner corner-end" />
              <span class="card-theme">{{ themeTitle }}</span>
              <span class="card-word">{{ shownSpy ? t.spyYouAreSpy : deal?.word }}</span>
            </span>
          </span>
        </button>
      </div>

      <footer class="bottom">
        <button type="button" class="action primary" :disabled="!revealed" @click="pass">
          {{ t.spyPass }}
        </button>
      </footer>
    </template>

    <!-- Все посмотрели: пока заглушка, раунд с таймером — тикет 03 -->
    <template v-else>
      <header class="top">
        <NuxtLink to="/" class="back">← {{ t.decks }}</NuxtLink>
        <h1 class="title">{{ t.spy }}</h1>
      </header>

      <div class="body ready">
        <p class="ready-text">{{ t.spyAllSeen }}</p>
      </div>

      <footer class="bottom">
        <button type="button" class="action secondary" @click="editSetup">{{ t.spyEditSetup }}</button>
      </footer>
    </template>
  </main>
</template>

<style scoped>
/* Шапка и нижняя панель приколоты, прокручивается только середина; на раздаче не прокручивается ничего. */
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

/* Заголовок и счётчик — по центру шапки, а не по центру остатка справа от «Назад». */
.title,
.counter {
  position: absolute;
  left: 50%;
  margin: 0;
  transform: translateX(-50%);
  font-size: inherit;
  font-weight: 600;
  white-space: nowrap;
}

.counter {
  color: var(--muted);
  font-variant-numeric: tabular-nums;
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

.group + .group {
  margin-top: 24px;
}

.group-title {
  margin: 0 0 10px 4px;
  font-size: 17px;
  font-weight: 600;
  color: var(--muted);
}

/* --- Строки настроек --- */

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
  padding: 6px 10px 6px 12px;
  border-radius: 14px;
  background: var(--surface);
}

.row-icon {
  flex: none;
  margin: 0 4px;
  font-size: 24px;
  color: var(--muted);
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

/* Тема — строка целиком кликабельна: тап в любом месте ставит или снимает галочку. */
.theme {
  cursor: pointer;
  touch-action: manipulation;
}

.theme:active {
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

.warn {
  margin: 12px 4px 0;
  color: var(--accent);
  font-size: 15px;
  line-height: 1.35;
}

/* --- Раздача: карта --- */

.deal {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 0;
  overflow: hidden;
  perspective: 1400px;
}

.card {
  width: 100%;
  max-width: 420px;
  height: 100%;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--fg);
  font: inherit;
  cursor: pointer;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

.card-inner {
  position: relative;
  display: block;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform 450ms ease;
}

.card.flipped .card-inner {
  transform: rotateY(180deg);
}

.card-face {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px 18px;
  border-radius: 20px;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  overflow: hidden;
  text-align: center;
}

/* Рубашка: узор в клетку и шпион — одинаковая у всех игроков. */
.card-back {
  gap: 20px;
  background:
    repeating-linear-gradient(45deg, transparent 0 10px, rgb(255 255 255 / 4%) 10px 20px),
    repeating-linear-gradient(-45deg, transparent 0 10px, rgb(255 255 255 / 4%) 10px 20px), var(--surface);
  border: 2px solid var(--surface-active);
}

.back-icon {
  color: var(--muted);
  font-size: clamp(56px, 14vh, 96px);
}

.back-hint {
  color: var(--muted);
  font-size: calc(17px * var(--font-scale));
  font-weight: 600;
}

/*
 * Лицо: тема приколота к верху, слово — по центру карты. Ширина лица — контейнер для кегля
 * слова: самое длинное (24 символа) на «Огромном» шрифте переносится по словам и влезает
 * в карту iPhone SE без скролла.
 */
.card-front {
  container-type: inline-size;
  justify-content: center;
  padding: 56px 20px;
  background: var(--surface);
  border: 2px solid var(--accent);
  box-shadow: inset 0 0 60px -20px var(--accent);
  transform: rotateY(180deg);
}

.corner {
  position: absolute;
  color: var(--accent);
  font-size: 22px;
  opacity: 0.45;
}

.corner-start {
  top: 12px;
  left: 14px;
}

.corner-end {
  right: 14px;
  bottom: 12px;
  transform: rotate(180deg);
}

.card-theme {
  position: absolute;
  top: 16px;
  right: 48px;
  left: 48px;
  color: var(--muted);
  font-size: calc(16px * var(--font-scale));
  font-weight: 700;
  letter-spacing: 0.04em;
  line-height: 1.2;
  text-transform: uppercase;
  overflow-wrap: anywhere;
}

.card-word {
  max-width: 100%;
  font-size: min(calc(32px * var(--font-scale)), 10cqi);
  font-weight: 700;
  line-height: 1.15;
  overflow-wrap: break-word;
  hyphens: auto;
}

/* --- Все посмотрели --- */

.ready {
  display: flex;
  align-items: center;
  justify-content: center;
}

.ready-text {
  margin: 0;
  font-size: calc(28px * var(--font-scale));
  font-weight: 700;
  text-align: center;
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

.action:disabled {
  background: var(--surface);
  color: var(--muted);
  cursor: default;
  filter: none;
}

@media (prefers-reduced-motion: reduce) {
  .card-inner {
    transition: none;
  }
}
</style>
