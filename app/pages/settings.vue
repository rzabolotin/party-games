<script setup lang="ts">
import { clearPlayed } from '~/alias/played'
import { clearDanetki } from '~/composables/useDanetki'
import { useMessages } from '~/composables/useMessages'
import { useProgress } from '~/composables/useProgress'
import { FONT_SCALES, useSettings } from '~/composables/useSettings'
import { langNames } from '~/i18n'
import { LANGS } from '~/types'

const settings = useSettings()
const t = useMessages()
const progress = useProgress()

// --- Игроки ---

const newName = ref('')

/** Имя после обрезки пробелов; пустое или уже есть в списке (без учёта регистра) — не добавляется. */
const canAdd = computed(() => {
  const name = newName.value.trim()
  return name !== '' && !settings.players.some((existing) => existing.toLowerCase() === name.toLowerCase())
})

function addPlayer() {
  if (!canAdd.value) return
  settings.players.push(newName.value.trim())
  newName.value = ''
}

function removePlayer(index: number) {
  settings.players.splice(index, 1)
}

const hasPlayers = computed(() => settings.players.length > 0)

function resetProgress() {
  if (!confirm(t.value.resetConfirm)) return
  progress.clear()
  // Сыгранные слова Alias — тоже с нуля; состав и сохранённая партия остаются.
  clearPlayed()
  // Данетки — целиком: разгаданные, текущие истории и переключатель мрачных.
  clearDanetki()
}
</script>

<template>
  <main class="screen">
    <header class="header">
      <NuxtLink to="/" class="back">← {{ t.back }}</NuxtLink>
      <h1 class="title">{{ t.settings }}</h1>
    </header>

    <section class="group">
      <h2 class="group-title">{{ t.language }}</h2>
      <div class="segments" role="radiogroup" :aria-label="t.language">
        <button
          v-for="lang in LANGS"
          :key="lang"
          type="button"
          class="segment"
          :class="{ selected: settings.lang === lang }"
          role="radio"
          :aria-checked="settings.lang === lang"
          :lang="lang"
          @click="settings.lang = lang"
        >
          {{ langNames[lang] }}
        </button>
      </div>
    </section>

    <section class="group">
      <h2 class="group-title">{{ t.fontSize }}</h2>
      <div class="segments" role="radiogroup" :aria-label="t.fontSize">
        <button
          v-for="scale in FONT_SCALES"
          :key="scale"
          type="button"
          class="segment"
          :class="{ selected: settings.fontScale === scale }"
          role="radio"
          :aria-checked="settings.fontScale === scale"
          @click="settings.fontScale = scale"
        >
          {{ t.fontSizes[`${scale}`] }}
        </button>
      </div>
      <!-- Образец в масштабе выбранной ступени: --font-scale на <html> уже обновился. -->
      <p class="sample" aria-hidden="true">{{ t.fontSample }}</p>
    </section>

    <section class="group">
      <h2 class="group-title">{{ t.players }}</h2>
      <ul v-if="hasPlayers" class="players">
        <li v-for="(name, index) in settings.players" :key="name" class="player">
          <span class="player-name">{{ name }}</span>
          <button
            type="button"
            class="remove"
            :aria-label="`${t.removePlayer}: ${name}`"
            @click="removePlayer(index)"
          >
            ✕
          </button>
        </li>
      </ul>
      <form class="add" @submit.prevent="addPlayer">
        <input
          v-model="newName"
          class="input"
          type="text"
          :placeholder="t.playerName"
          :aria-label="t.playerName"
          maxlength="30"
          autocomplete="off"
          autocapitalize="words"
          enterkeyhint="done"
        />
        <button type="submit" class="add-button" :disabled="!canAdd">{{ t.addPlayer }}</button>
      </form>

      <label class="toggle" :class="{ disabled: !hasPlayers }">
        <span class="toggle-label">{{ t.showReader }}</span>
        <button
          type="button"
          class="switch"
          role="switch"
          :aria-checked="settings.showReader"
          :disabled="!hasPlayers"
          @click="settings.showReader = !settings.showReader"
        >
          <span class="knob" aria-hidden="true" />
        </button>
      </label>
      <p v-if="!hasPlayers" class="hint">{{ t.showReaderHint }}</p>
    </section>

    <section class="group">
      <button type="button" class="danger" @click="resetProgress">{{ t.resetProgress }}</button>
    </section>
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

/* Сегменты: одна подложка, выбранный — акцентный. */
.segments {
  display: flex;
  gap: 4px;
  padding: 4px;
  border-radius: 14px;
  background: var(--surface);
}

.segment {
  flex: 1;
  min-height: 52px;
  padding: 8px 12px;
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

/* Образец — как средний вопрос на карточке, с тем же множителем. */
.sample {
  margin: 20px 0 0;
  padding: 24px 16px;
  border-radius: 14px;
  background: var(--surface);
  font-size: calc(28px * var(--font-scale));
  font-weight: 600;
  line-height: 1.25;
  text-align: center;
  overflow-wrap: anywhere;
}

/* Игроки: строка — имя и крестик; ниже поле с «Добавить»; тумблер читающего. */
.players {
  margin: 0 0 8px;
  padding: 0;
  list-style: none;
  border-radius: 14px;
  background: var(--surface);
}

.player {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 52px;
  padding: 4px 4px 4px 16px;
}

.player + .player {
  border-top: 1px solid var(--bg);
}

.player-name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  font-size: 18px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.remove {
  flex: none;
  width: 44px;
  height: 44px;
  border: 0;
  border-radius: 10px;
  background: transparent;
  color: var(--muted);
  font: inherit;
  font-size: 18px;
  cursor: pointer;
  touch-action: manipulation;
}

.remove:active {
  background: var(--surface-active);
  color: var(--danger);
}

.add {
  display: flex;
  gap: 8px;
}

.input {
  flex: 1;
  min-width: 0;
  min-height: 52px;
  padding: 8px 16px;
  border: 0;
  border-radius: 14px;
  background: var(--surface);
  color: var(--fg);
  font: inherit;
  font-size: 18px;
}

.input::placeholder {
  color: var(--muted);
}

.input:focus {
  outline: 2px solid var(--accent);
}

.add-button {
  flex: none;
  min-height: 52px;
  padding: 8px 20px;
  border: 0;
  border-radius: 14px;
  background: var(--accent);
  color: var(--bg);
  font: inherit;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  touch-action: manipulation;
}

.add-button:disabled {
  background: var(--surface);
  color: var(--muted);
  cursor: default;
}

.toggle {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 60px;
  margin-top: 16px;
  padding: 8px 12px 8px 16px;
  border-radius: 14px;
  background: var(--surface);
}

.toggle.disabled {
  color: var(--muted);
}

.toggle-label {
  flex: 1;
  font-size: 18px;
  font-weight: 600;
}

/* Тумблер: дорожка и кружок, включённый — акцентный; disabled — притушен. */
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

.switch:disabled {
  opacity: 0.45;
  cursor: default;
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

.hint {
  margin: 8px 4px 0;
  color: var(--muted);
  font-size: 15px;
}

.danger {
  width: 100%;
  min-height: 60px;
  padding: 12px 20px;
  border: 0;
  border-radius: 16px;
  background: var(--surface);
  color: var(--danger);
  font: inherit;
  font-size: 20px;
  font-weight: 700;
  cursor: pointer;
  touch-action: manipulation;
}

.danger:active {
  background: var(--surface-active);
}
</style>
