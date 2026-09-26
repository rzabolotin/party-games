<script setup lang="ts">
import { useMessages } from '~/composables/useMessages'
import { deckTypeEmoji } from '~/decks'
import { APP_NAME } from '~/i18n'
import { DECK_TYPES } from '~/types'

const t = useMessages()
</script>

<template>
  <main class="screen">
    <header class="header">
      <h1 class="title">{{ APP_NAME }}</h1>
      <NuxtLink to="/settings" class="gear" :aria-label="t.settings" :title="t.settings">⚙️</NuxtLink>
    </header>

    <!-- Один список игр: сначала разделы с колодами (тема выбирается внутри), потом режимы. -->
    <ul class="games">
      <li v-for="type in DECK_TYPES" :key="type">
        <MenuRow :to="`/decks/${type}`" :emoji="deckTypeEmoji[type]" :title="t.deckTypes[type]" />
      </li>
      <li>
        <MenuRow to="/mafia" emoji="🎭" :title="t.mafia" :note="t.mafiaSubtitle" />
      </li>
      <li>
        <MenuRow to="/spy" :title="t.spy" :note="t.spySubtitle">
          <template #icon><GameIcon name="spy" /></template>
        </MenuRow>
      </li>
      <li>
        <MenuRow to="/alias" :title="t.alias" :note="t.aliasSubtitle">
          <template #icon><GameIcon name="alias" /></template>
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

.games {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}
</style>
