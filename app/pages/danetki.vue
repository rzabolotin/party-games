<script setup lang="ts">
import { useDanetki } from '~/composables/useDanetki'
import { useMessages } from '~/composables/useMessages'
import { useSettings } from '~/composables/useSettings'
import { useWakeLock } from '~/composables/useWakeLock'
import { hasStories } from '~/danetki/stories'

const t = useMessages()
const settings = useSettings()
const { danetki, setOf, unplayedOf, solvedCount, exhausted, darkLeft, current, isPlayed, markPlayed, drawNext, restart } =
  useDanetki()

// --- Стейт-машина: start → story → story …; story → finished → story («Начать заново»); story → start (шапка) ---

type Stage = 'start' | 'story' | 'finished'

/** Идущая история на этом языке — сразу к ней: случайный «назад» или выгрузка вкладки игру не теряют. */
const stage = ref<Stage>(current(settings.lang) ? 'story' : 'start')
/** Ответ открыт. Только на экране: после возврата к истории ответ снова закрыт. */
const revealed = ref(false)

// Пока идут вопросы, телефон лежит у ведущего — экран не должен гаснуть.
useWakeLock(computed(() => stage.value === 'story'))

const available = computed(() => hasStories(settings.lang))
const story = computed(() => current(settings.lang))
const setSize = computed(() => setOf(settings.lang).length)
const solved = computed(() => solvedCount(settings.lang))
const leftLabel = computed(() =>
  t.value.danetkiLeft
    .replace('{n}', String(unplayedOf(settings.lang).length))
    .replace('{m}', String(setSize.value)),
)
const solvedLabel = computed(() =>
  t.value.danetkiSolved.replace('{n}', String(solved.value)).replace('{m}', String(setSize.value)),
)
/** Подсказка на финале: мрачные выключены, а среди них есть неразгаданные. */
const darkHint = computed(() => {
  if (danetki.dark) return null
  const left = darkLeft(settings.lang)
  return left > 0 ? t.value.danetkiDarkLeft.replace('{n}', String(left)) : null
})

function showStory() {
  revealed.value = false
  stage.value = 'story'
}

/** «Начать» / «Продолжить»: идущая история, иначе новая; набор пройден — к финалу. */
function begin() {
  if (story.value) return showStory()
  if (drawNext(settings.lang)) showStory()
  else stage.value = 'finished'
}

/** Тап по рубашке: первый показ ответа отмечает историю разгаданной; повторный тап закрывает. */
function toggleAnswer() {
  if (!story.value) return
  if (!revealed.value) markPlayed(settings.lang, story.value.id)
  revealed.value = !revealed.value
}

/** «Следующая история»: без открытого ответа — с подтверждением, история вернётся в колоду. */
function next() {
  const shown = story.value
  if (shown && !isPlayed(settings.lang, shown.id) && !confirm(t.value.danetkiNextConfirm)) return
  if (drawNext(settings.lang)) showStory()
  else stage.value = 'finished'
}

/** «Начать заново»: сыгранные сбрасываются только в текущем наборе, сразу новая история. */
function startOver() {
  restart(settings.lang)
  begin()
}
</script>

<template>
  <main class="screen">
    <!-- Нет историй на языке: режим скрыт с главной, но по прямой ссылке — понятное сообщение -->
    <template v-if="!available">
      <header class="top">
        <NuxtLink to="/" class="back">← {{ t.decks }}</NuxtLink>
        <h1 class="title">{{ t.danetki }}</h1>
      </header>

      <div class="body center">
        <p class="message">{{ t.danetkiNoStories }}</p>
        <NuxtLink to="/" class="link">{{ t.decks }}</NuxtLink>
      </div>
    </template>

    <!-- Экран начала: правила, переключатель мрачных, сколько осталось -->
    <template v-else-if="stage === 'start'">
      <header class="top">
        <NuxtLink to="/" class="back">← {{ t.decks }}</NuxtLink>
        <h1 class="title">{{ t.danetki }}</h1>
      </header>

      <div class="body">
        <section class="group">
          <h2 class="group-title">{{ t.danetkiRulesTitle }}</h2>
          <ol class="rules" :lang="settings.lang">
            <li v-for="item in t.danetkiRules" :key="item">{{ item }}</li>
          </ol>
        </section>

        <section class="group">
          <div class="row toggle">
            <span class="toggle-text">
              <span class="row-title">{{ t.danetkiDark }}</span>
              <span class="row-note">{{ t.danetkiDarkNote }}</span>
            </span>
            <button
              type="button"
              class="switch"
              role="switch"
              :aria-checked="danetki.dark"
              :aria-label="t.danetkiDark"
              @click="danetki.dark = !danetki.dark"
            >
              <span class="knob" aria-hidden="true" />
            </button>
          </div>
        </section>
      </div>

      <!-- Остаток — над кнопкой, а не под правилами: при крупном шрифте он не уезжает за край. -->
      <footer class="bottom stacked">
        <p class="left" role="status">{{ leftLabel }}</p>
        <button type="button" class="action primary" @click="begin">
          {{ story ? t.danetkiContinue : t.danetkiStart }}
        </button>
      </footer>
    </template>

    <!-- История: название и текст крупно, ответ под рубашкой -->
    <template v-else-if="stage === 'story' && story">
      <header class="top">
        <button type="button" class="back" @click="stage = 'start'">← {{ t.danetkiToStart }}</button>
        <h1 class="title">{{ t.danetki }}</h1>
        <span class="counter" :aria-label="solvedLabel">{{ solved }} / {{ setSize }}</span>
      </header>

      <!-- Ключ по истории: новая история — с начала прокрутки и без анимации переворота. -->
      <div :key="story.id" class="body story" :lang="settings.lang">
        <h2 class="story-title">
          <span v-if="story.tone === 'dark'" class="dark-mark" role="img" :aria-label="t.danetkiDarkMark">🌑</span>
          {{ story.title }}
        </h2>
        <p class="story-text">{{ story.story }}</p>

        <button
          type="button"
          class="card"
          :class="{ flipped: revealed }"
          :aria-expanded="revealed"
          @click="toggleAnswer"
        >
          <span class="card-inner">
            <span class="card-face card-back" :aria-hidden="revealed">
              <GameIcon name="danetki" class="back-icon" />
              <span class="back-hint">{{ t.danetkiReveal }}</span>
            </span>
            <span class="card-face card-front" :aria-hidden="!revealed">
              <span class="answer-label">{{ t.danetkiAnswer }}</span>
              <span class="answer">{{ story.answer }}</span>
              <span class="answer-hint">{{ t.danetkiHide }}</span>
            </span>
          </span>
        </button>
      </div>

      <footer class="bottom">
        <button type="button" class="action primary" @click="next">{{ t.danetkiNext }}</button>
      </footer>
    </template>

    <!-- Набор пройден -->
    <template v-else>
      <header class="top">
        <NuxtLink to="/" class="back">← {{ t.decks }}</NuxtLink>
        <h1 class="title">{{ t.danetki }}</h1>
      </header>

      <div class="body center">
        <p class="message" role="status">{{ t.danetkiDone }}</p>
        <button v-if="darkHint" type="button" class="link" @click="stage = 'start'">{{ darkHint }}</button>
      </div>

      <footer class="bottom">
        <button type="button" class="action primary" @click="startOver">{{ t.danetkiRestart }}</button>
      </footer>
    </template>
  </main>
</template>

<style scoped>
/* Шапка и нижняя панель приколоты, прокручивается только середина — как в «Шпионе». */
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

.counter {
  margin-left: auto;
  color: var(--muted);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.body {
  flex: 1;
  min-height: 0;
  padding: 16px 0 12px;
  overflow-y: auto;
}

.bottom {
  display: flex;
  flex: none;
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

/* --- Экран начала --- */

.rules {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 0;
  /* Отступ в em: номера пунктов растут вместе со шрифтом и не обрезаются. */
  padding: 0 4px 0 1.7em;
  font-size: calc(17px * var(--font-scale));
  line-height: 1.4;
}

.rules li::marker {
  color: var(--accent);
  font-weight: 700;
}

.row {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 60px;
  padding: 8px 12px 8px 16px;
  border-radius: 14px;
  background: var(--surface);
}

.toggle-text {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.row-title {
  font-size: 18px;
  font-weight: 600;
}

.row-note {
  color: var(--muted);
  font-size: 15px;
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

.stacked {
  flex-direction: column;
  gap: 8px;
}

.left {
  margin: 0 4px;
  color: var(--muted);
  font-size: 17px;
  font-variant-numeric: tabular-nums;
}

/* --- История --- */

.story-title {
  margin: 0 0 12px;
  font-size: calc(26px * var(--font-scale));
  font-weight: 700;
  line-height: 1.2;
  overflow-wrap: break-word;
}

.dark-mark {
  margin-right: 0.2em;
}

.story-text {
  margin: 0 0 20px;
  font-size: calc(20px * var(--font-scale));
  line-height: 1.4;
  overflow-wrap: break-word;
  hyphens: auto;
}

/*
 * Ответ: рубашка и лицо лежат в одной ячейке сетки, карта высотой с большую из сторон —
 * длинный ответ не обрезается, а прокручивается вместе с серединой экрана.
 */
.card {
  display: block;
  width: 100%;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--fg);
  font: inherit;
  text-align: left;
  cursor: pointer;
  touch-action: manipulation;
  perspective: 1400px;
  -webkit-tap-highlight-color: transparent;
}

.card-inner {
  display: grid;
  transform-style: preserve-3d;
  transition: transform 450ms ease;
}

.card.flipped .card-inner {
  transform: rotateY(180deg);
}

.card-face {
  grid-area: 1 / 1;
  display: flex;
  flex-direction: column;
  min-height: 140px;
  padding: 18px;
  border-radius: 20px;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

/* Рубашка: узор в клетку, как у карт «Шпиона». */
.card-back {
  align-items: center;
  justify-content: center;
  gap: 12px;
  background:
    repeating-linear-gradient(45deg, transparent 0 10px, rgb(255 255 255 / 4%) 10px 20px),
    repeating-linear-gradient(-45deg, transparent 0 10px, rgb(255 255 255 / 4%) 10px 20px), var(--surface);
  border: 2px solid var(--surface-active);
  text-align: center;
}

.back-icon {
  color: var(--muted);
  font-size: 56px;
}

.back-hint {
  color: var(--muted);
  font-size: calc(17px * var(--font-scale));
  font-weight: 600;
}

.card-front {
  gap: 8px;
  background: var(--surface);
  border: 2px solid var(--accent);
  box-shadow: inset 0 0 60px -20px var(--accent);
  transform: rotateY(180deg);
}

.answer-label {
  color: var(--accent);
  font-size: calc(14px * var(--font-scale));
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.answer {
  font-size: calc(19px * var(--font-scale));
  font-weight: 600;
  line-height: 1.4;
  overflow-wrap: break-word;
  hyphens: auto;
}

.answer-hint {
  margin-top: auto;
  padding-top: 4px;
  color: var(--muted);
  font-size: 14px;
}

/* --- Финал и сообщения --- */

.center {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  text-align: center;
}

.message {
  margin: 0;
  font-size: calc(28px * var(--font-scale));
  font-weight: 700;
}

.link {
  min-height: 44px;
  padding: 8px 12px;
  border: 0;
  background: transparent;
  color: var(--accent);
  font: inherit;
  font-size: 18px;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  touch-action: manipulation;
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

.primary {
  background: var(--accent);
  color: var(--bg);
}

.primary:active {
  filter: brightness(0.85);
}

@media (prefers-reduced-motion: reduce) {
  .card-inner {
    transition: none;
  }
}
</style>
