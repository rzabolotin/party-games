<script setup lang="ts">
import { useMessages } from '~/composables/useMessages'
import { useProgress } from '~/composables/useProgress'
import { FONT_SCALES, useSettings } from '~/composables/useSettings'
import { langNames } from '~/i18n'
import { LANGS } from '~/types'

const settings = useSettings()
const t = useMessages()
const progress = useProgress()

function resetProgress() {
  if (confirm(t.value.resetConfirm)) progress.clear()
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
