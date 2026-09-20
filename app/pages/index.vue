<script setup lang="ts">
import { decksByLang } from '~/decks'
import { APP_NAME, messages } from '~/i18n'
import { DECK_TYPES, type Lang } from '~/types'

// Язык пока захардкожен; переключатель появится вместе с настройками (тикет 06).
const lang: Lang = 'ru'
const t = messages[lang]

// Группы по типу игры в фиксированном порядке; колоды 18+ — отдельной последней группой.
const own = decksByLang(lang)
const groups = [
  ...DECK_TYPES.map((type) => ({
    key: type,
    title: t.deckTypes[type],
    decks: own.filter((deck) => deck.type === type && !deck.adult),
  })),
  { key: 'adult', title: t.adult, decks: own.filter((deck) => deck.adult) },
].filter((group) => group.decks.length > 0)
</script>

<template>
  <main class="screen">
    <h1 class="title">{{ APP_NAME }}</h1>

    <section v-for="group in groups" :key="group.key" class="group">
      <h2 class="group-title">{{ group.title }}</h2>
      <ul class="decks">
        <li v-for="deck in group.decks" :key="deck.id">
          <NuxtLink :to="`/play/${deck.id}`" class="deck">
            <span class="deck-emoji" aria-hidden="true">{{ deck.emoji }}</span>
            <span class="deck-title">{{ deck.title }}</span>
            <span v-if="deck.adult" class="deck-badge" role="img" :aria-label="t.adult">🔞</span>
          </NuxtLink>
        </li>
      </ul>
    </section>
  </main>
</template>

<style scoped>
.screen {
  max-width: 560px;
  min-height: 100dvh;
  margin: 0 auto;
  padding: calc(env(safe-area-inset-top, 0px) + 24px) calc(env(safe-area-inset-right, 0px) + 16px)
    calc(env(safe-area-inset-bottom, 0px) + 24px) calc(env(safe-area-inset-left, 0px) + 16px);
}

.title {
  margin: 0 0 24px;
  font-size: 36px;
  font-weight: 700;
}

.group + .group {
  margin-top: 28px;
}

.group-title {
  margin: 0 0 10px 4px;
  font-size: 17px;
  font-weight: 600;
  color: var(--muted);
}

.decks {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.deck {
  display: flex;
  align-items: center;
  gap: 14px;
  min-height: 60px;
  padding: 12px 16px;
  border-radius: 14px;
  background: var(--surface);
  color: inherit;
  font-size: 20px;
  font-weight: 500;
  text-decoration: none;
}

.deck:active {
  background: var(--surface-active);
}

.deck-emoji {
  width: 36px;
  font-size: 28px;
  line-height: 1;
  text-align: center;
}

.deck-title {
  flex: 1;
}

.deck-badge {
  font-size: 22px;
  line-height: 1;
}
</style>
