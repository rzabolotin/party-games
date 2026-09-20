<script setup lang="ts">
// Заглушка игрового экрана: название колоды и число вопросов. Сама игра — тикет 03.
import { getDeck } from '~/decks'
import { messages } from '~/i18n'
import type { Lang } from '~/types'

// Язык пока захардкожен; переключатель появится вместе с настройками (тикет 06).
const lang: Lang = 'ru'
const t = messages[lang]

const route = useRoute()
const deck = getDeck(String(route.params.deckId))
</script>

<template>
  <main class="screen">
    <NuxtLink to="/" class="back">← {{ t.decks }}</NuxtLink>

    <div class="card">
      <template v-if="deck">
        <div class="emoji" aria-hidden="true">{{ deck.emoji }}</div>
        <h1 class="title">{{ deck.title }}</h1>
        <p class="hint">{{ t.questions }}: {{ deck.questions.length }}</p>
      </template>
      <h1 v-else class="title">{{ t.deckNotFound }}</h1>
    </div>
  </main>
</template>

<style scoped>
.screen {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  padding: calc(env(safe-area-inset-top, 0px) + 16px) calc(env(safe-area-inset-right, 0px) + 16px)
    calc(env(safe-area-inset-bottom, 0px) + 16px) calc(env(safe-area-inset-left, 0px) + 16px);
}

.back {
  align-self: flex-start;
  padding: 8px 4px;
  color: var(--accent);
  font-size: 18px;
  text-decoration: none;
}

.card {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  text-align: center;
}

.emoji {
  font-size: 80px;
  line-height: 1;
}

.title {
  margin: 0;
  font-size: 36px;
  font-weight: 700;
}

.hint {
  margin: 0;
  font-size: 20px;
  color: var(--muted);
}
</style>
