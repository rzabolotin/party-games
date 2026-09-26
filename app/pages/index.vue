<script setup lang="ts">
import { useMessages } from '~/composables/useMessages'
import { useProgress } from '~/composables/useProgress'
import { useSettings } from '~/composables/useSettings'
import { decksByLang } from '~/decks'
import { APP_NAME } from '~/i18n'
import { DECK_TYPES } from '~/types'

const settings = useSettings()
const t = useMessages()
const { shownCount } = useProgress()

// Колоды текущего языка, группы по типу игры в фиксированном порядке; 18+ — отдельной последней группой.
const groups = computed(() => {
  const own = decksByLang(settings.lang)
  return [
    ...DECK_TYPES.map((type) => ({
      key: type,
      title: t.value.deckTypes[type],
      decks: own.filter((deck) => deck.type === type && !deck.adult),
    })),
    { key: 'adult', title: t.value.adult, decks: own.filter((deck) => deck.adult) },
  ].filter((group) => group.decks.length > 0)
})
</script>

<template>
  <main class="screen">
    <header class="header">
      <h1 class="title">{{ APP_NAME }}</h1>
      <NuxtLink to="/settings" class="gear" :aria-label="t.settings" :title="t.settings">⚙️</NuxtLink>
    </header>

    <section v-for="group in groups" :key="group.key" class="group">
      <h2 class="group-title">{{ group.title }}</h2>
      <ul class="decks">
        <li v-for="deck in group.decks" :key="deck.id">
          <NuxtLink :to="`/play/${deck.id}`" class="deck">
            <span class="deck-emoji" aria-hidden="true">{{ deck.emoji }}</span>
            <span class="deck-title">{{ deck.title }}</span>
            <span v-if="deck.adult" class="deck-badge" role="img" :aria-label="t.adult">🔞</span>
            <span class="deck-count">{{ shownCount(deck.id) }} / {{ deck.questions.length }}</span>
          </NuxtLink>
        </li>
      </ul>
    </section>

    <!-- «Другие игры» — не колоды, а режимы; всегда последней группой, ниже всех колод. -->
    <section class="group">
      <h2 class="group-title">{{ t.otherGames }}</h2>
      <ul class="decks">
        <li>
          <NuxtLink to="/mafia" class="deck">
            <span class="deck-emoji" aria-hidden="true">🎭</span>
            <span class="deck-title">{{ t.mafia }}</span>
            <span class="deck-count">{{ t.mafiaSubtitle }}</span>
          </NuxtLink>
        </li>
        <li>
          <NuxtLink to="/spy" class="deck">
            <span class="deck-emoji deck-icon" aria-hidden="true"><GameIcon name="spy" /></span>
            <span class="deck-title">{{ t.spy }}</span>
            <span class="deck-count">{{ t.spySubtitle }}</span>
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

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin: 0 0 24px;
}

.title {
  margin: 0;
  font-size: 36px;
  font-weight: 700;
}

/* Шестерёнка: цель не меньше 44×44, сама иконка чуть меньше заголовка. */
.gear {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 14px;
  font-size: 28px;
  line-height: 1;
  text-decoration: none;
}

.gear:active {
  background: var(--surface-active);
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

/* Рисунок вместо эмодзи: то же место и тот же кегль, по центру слота. */
.deck-icon {
  display: flex;
  justify-content: center;
  color: var(--accent);
}

.deck-title {
  flex: 1;
}

.deck-badge {
  font-size: 22px;
  line-height: 1;
}

.deck-count {
  color: var(--muted);
  font-size: 16px;
  font-variant-numeric: tabular-nums;
}
</style>
