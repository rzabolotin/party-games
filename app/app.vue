<script setup lang="ts">
import { useSettings } from '~/composables/useSettings'

const settings = useSettings()

// Язык документа и масштаб шрифта вопроса — из настроек, на <html>, чтобы действовали на всех страницах.
useHead({
  htmlAttrs: {
    lang: () => settings.lang,
    style: () => `--font-scale: ${settings.fontScale}`,
  },
})
</script>

<template>
  <NuxtPage />
</template>
