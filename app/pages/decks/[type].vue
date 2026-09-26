<script setup lang="ts">
import { useMessages } from '~/composables/useMessages'
import { useProgress } from '~/composables/useProgress'
import { useSettings } from '~/composables/useSettings'
import { decksByLang } from '~/decks'
import { DECK_TYPES, type DeckType } from '~/types'

const settings = useSettings()
const t = useMessages()
const { shownCount } = useProgress()

const route = useRoute()
const raw = String(route.params.type)
const type = DECK_TYPES.find((known) => known === raw) as DeckType | undefined
// Неизвестный раздел — на главную, отдельного экрана «не найдено» не держим.
if (!type) await navigateTo('/', { replace: true })

/** Колоды раздела на текущем языке; 18+ в массиве колод и так идут последними. */
const decks = computed(() => decksByLang(settings.lang).filter((deck) => deck.type === type))
</script>

<template>
  <main v-if="type" class="screen">
    <header class="header">
      <NuxtLink to="/" class="back">← {{ t.decks }}</NuxtLink>
      <h1 class="title">{{ t.deckTypes[type] }}</h1>
    </header>

    <ul class="decks">
      <li v-for="deck in decks" :key="deck.id">
        <MenuRow
          :to="`/play/${deck.id}`"
          :emoji="deck.emoji"
          :title="deck.title"
          :note="`${shownCount(deck.id)} / ${deck.questions.length}`"
        >
          <template v-if="deck.adult" #badge>
            <span class="badge" role="img" :aria-label="t.adult">🔞</span>
          </template>
        </MenuRow>
      </li>
    </ul>
  </main>
</template>

<style scoped>
.screen {
  max-width: 560px;
  min-height: 100dvh;
  margin: 0 auto;
  padding: calc(env(safe-area-inset-top, 0px) + 12px) calc(env(safe-area-inset-right, 0px) + 16px)
    calc(env(safe-area-inset-bottom, 0px) + 24px) calc(env(safe-area-inset-left, 0px) + 16px);
}

.header {
  margin: 0 0 24px;
}

.back {
  display: inline-block;
  min-height: 44px;
  padding: 8px 4px;
  color: var(--accent);
  font-size: 17px;
  line-height: 28px;
  text-decoration: none;
}

.title {
  margin: 4px 0 0;
  font-size: 30px;
  font-weight: 700;
  line-height: 1.2;
}

.decks {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.badge {
  font-size: 22px;
  line-height: 1;
}
</style>
