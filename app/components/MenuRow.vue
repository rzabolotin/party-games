<script setup lang="ts">
/**
 * Строка списка на главной и в разделе: слева значок, справа подпись помельче.
 * Значок — эмодзи из `emoji` или рисунок в слоте `icon` (тогда красится акцентом).
 */
defineProps<{ to: string; title: string; emoji?: string; note?: string }>()
</script>

<template>
  <NuxtLink :to="to" class="row">
    <span v-if="$slots.icon" class="row-emoji row-icon" aria-hidden="true"><slot name="icon" /></span>
    <span v-else class="row-emoji" aria-hidden="true">{{ emoji }}</span>
    <span class="row-title">{{ title }}</span>
    <slot name="badge" />
    <span v-if="note" class="row-note">{{ note }}</span>
  </NuxtLink>
</template>

<style scoped>
.row {
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

.row:active {
  background: var(--surface-active);
}

.row-emoji {
  width: 36px;
  font-size: 28px;
  line-height: 1;
  text-align: center;
}

/* Рисунок вместо эмодзи: то же место и тот же кегль, по центру слота. */
.row-icon {
  display: flex;
  justify-content: center;
  color: var(--accent);
}

.row-title {
  flex: 1;
}

.row-note {
  color: var(--muted);
  font-size: 16px;
  font-variant-numeric: tabular-nums;
}
</style>
