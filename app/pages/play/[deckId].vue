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
const { current, shownCount, total, finished, next } = useDeckProgress(deckId)
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

    <section class="card">
      <p v-if="!deck" class="question">{{ t.deckNotFound }}</p>
      <!-- Финальная карточка с «Заново» и «К колодам» — тикет 05; пока только заголовок. -->
      <p v-else-if="finished" class="question">{{ t.finished }}</p>
      <p v-else class="question">{{ current }}</p>
    </section>

    <footer class="bottom">
      <button v-if="deck && !finished" type="button" class="next" @click="next">{{ t.next }} →</button>
    </footer>
  </main>
</template>

<style scoped>
.screen {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  padding: calc(env(safe-area-inset-top, 0px) + 12px) calc(env(safe-area-inset-right, 0px) + 16px)
    calc(env(safe-area-inset-bottom, 0px) + 16px) calc(env(safe-area-inset-left, 0px) + 16px);
}

.top {
  display: flex;
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

.card {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 8px;
  text-align: center;
}

.question {
  margin: 0;
  font-size: clamp(28px, 8vw, 44px);
  font-weight: 600;
  line-height: 1.25;
  overflow-wrap: anywhere;
}

.bottom {
  display: flex;
}

.next {
  flex: 1;
  min-height: 60px;
  padding: 12px 20px;
  border: 0;
  border-radius: 16px;
  background: var(--accent);
  color: var(--bg);
  font: inherit;
  font-size: 22px;
  font-weight: 700;
  cursor: pointer;
}

.next:active {
  filter: brightness(0.85);
}
</style>
