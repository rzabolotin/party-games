<script setup lang="ts">
import { useDeckProgress } from '~/composables/useDeckProgress'
import { getDeck } from '~/decks'
import { messages } from '~/i18n'
import type { Lang } from '~/types'

// Язык пока захардкожен; переключатель появится вместе с настройками (тикет 06).
const lang: Lang = 'ru'
const t = messages[lang]

const route = useRoute()
const deckId = String(route.params.deckId)
const deck = getDeck(deckId)
const { current, shownCount, total, finished, next, reset } = useDeckProgress(deckId)

/** Ключ карточки для <Transition>: меняется на каждом «Дальше», включая переход к финальной. */
const cardKey = computed(() => (finished.value ? 'finished' : `${shownCount.value}`))

/** Кегль по длине текста: короткие вопросы крупнее, чтобы экран использовался целиком. */
const sizeClass = computed(() => {
  const length = current.value?.length ?? 0
  return length <= 40 ? 'size-l' : length <= 70 ? 'size-m' : 'size-s'
})

// --- Листание ---

/** Куда уезжает текущая карточка: в сторону свайпа, при тапе и кнопке — влево. */
const direction = ref<'left' | 'right'>('left')
/** Пока идёт анимация, «Дальше» заблокирован — иначе быстрый двойной тап перескочит через вопрос. */
const animating = ref(false)

function advance(to: 'left' | 'right' = 'left') {
  if (!deck || finished.value || animating.value) return
  direction.value = to
  animating.value = true
  next()
}

/** «Заново» на финальной карточке: прогресс колоды стирается, первый вопрос нового круга въезжает как обычный. */
function restart() {
  if (!deck || !finished.value || animating.value) return
  direction.value = 'left'
  animating.value = true
  reset()
}

const SWIPE_THRESHOLD = 40
const TAP_THRESHOLD = 10

let start: { id: number; x: number; y: number } | null = null

function onPointerDown(event: PointerEvent) {
  // Кнопки финальной карточки листать не должны.
  if (!event.isPrimary || (event.target as Element).closest('button, a')) return
  start = { id: event.pointerId, x: event.clientX, y: event.clientY }
  // Захват — pointerup придёт на карточку, даже если палец отпустили над панелью.
  ;(event.currentTarget as Element).setPointerCapture(event.pointerId)
}

function onPointerUp(event: PointerEvent) {
  if (!start || event.pointerId !== start.id) return
  const dx = event.clientX - start.x
  const dy = event.clientY - start.y
  start = null

  if (Math.abs(dx) < TAP_THRESHOLD && Math.abs(dy) < TAP_THRESHOLD) {
    advance('left')
  } else if (Math.abs(dx) >= SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy)) {
    advance(dx < 0 ? 'left' : 'right')
  }
  // Вертикальные и слишком короткие движения — не жест.
}

function onPointerCancel() {
  start = null
}
</script>

<template>
  <main class="screen">
    <header class="top">
      <NuxtLink to="/" class="back">← {{ t.decks }}</NuxtLink>
      <template v-if="deck">
        <h1 class="deck-title">{{ deck.title }}</h1>
        <span class="counter">{{ shownCount }} / {{ total }}</span>
      </template>
    </header>

    <section
      class="card"
      @pointerdown="onPointerDown"
      @pointerup="onPointerUp"
      @pointercancel="onPointerCancel"
    >
      <div v-if="!deck" class="face">
        <p class="question size-l">{{ t.deckNotFound }}</p>
      </div>
      <Transition
        v-else
        :name="`slide-${direction}`"
        @after-enter="animating = false"
        @enter-cancelled="animating = false"
      >
        <div :key="cardKey" class="face">
          <div v-if="finished" class="end">
            <p class="question size-l">{{ t.finished }}</p>
            <button type="button" class="action primary" @click="restart">{{ t.restart }}</button>
            <NuxtLink to="/" class="action secondary">{{ t.toDecks }}</NuxtLink>
          </div>
          <p v-else class="question" :class="sizeClass">{{ current }}</p>
        </div>
      </Transition>
    </section>

    <footer class="bottom">
      <button v-if="deck && !finished" type="button" class="next" @click="advance('left')">
        {{ t.next }} →
      </button>
    </footer>
  </main>
</template>

<style scoped>
/* Ровно один экран: без скролла, панели и карточка делят 100dvh за вычетом выреза и домашней полосы. */
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
  color: var(--accent);
  text-decoration: none;
}

.deck-title {
  flex: 1;
  min-width: 0;
  margin: 0;
  overflow: hidden;
  font-size: inherit;
  font-weight: 600;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.counter {
  flex: none;
  padding: 8px 4px;
  color: var(--muted);
  font-variant-numeric: tabular-nums;
}

/* touch-action: none — браузер не перехватывает свайпы под скролл и «резинку», pointer-события доходят целиком. */
.card {
  position: relative;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
}

/* Все карточки абсолютные — уходящая и въезжающая лежат в одном месте, без скачков вёрстки. */
.face {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 8px;
  text-align: center;
}

/* Кегль: базовое значение по длине текста, умноженное на масштаб из настроек  */
.question {
  margin: 0;
  font-size: calc(var(--question-size) * var(--font-scale));
  font-weight: 600;
  line-height: 1.25;
  overflow-wrap: anywhere;
}

.size-l {
  --question-size: clamp(32px, min(10.5vw, 6vh), 52px);
}

.size-m {
  --question-size: clamp(28px, min(8.5vw, 4.8vh), 42px);
}

.size-s {
  --question-size: clamp(24px, min(7vw, 4vh), 34px);
}

/* Перелистывание: уходящая уезжает в сторону свайпа, новая въезжает с противоположной. */
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition:
    transform 200ms ease,
    opacity 200ms ease;
}

.slide-left-leave-to,
.slide-right-enter-from {
  transform: translateX(-60%);
  opacity: 0;
}

.slide-left-enter-from,
.slide-right-leave-to {
  transform: translateX(60%);
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .slide-left-enter-active,
  .slide-left-leave-active,
  .slide-right-enter-active,
  .slide-right-leave-active {
    transition: none;
  }
}

/* Финальная карточка: заголовок и две кнопки столбиком, во всю ширину карточки. */
.end {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 16px;
  width: 100%;
  max-width: 420px;
}

.end .question {
  margin-bottom: 16px;
}

.bottom {
  display: flex;
  flex: none;
  min-height: 60px;
}

.next,
.action {
  display: flex;
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

.next,
.primary {
  background: var(--accent);
  color: var(--bg);
}

.secondary {
  background: var(--surface);
  color: var(--fg);
}

.next {
  flex: 1;
}

.next:active,
.primary:active {
  filter: brightness(0.85);
}

.secondary:active {
  background: var(--surface-active);
}
</style>
