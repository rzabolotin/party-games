// Только type-импорты из `~/types`: этот файл читает не только Vite, но и Node-скрипт
// проверки контента, а алиас `~/types` Node не разрешает (типы он просто срезает).
import type { Lang, SpyTheme, ThemeId } from '~/types'
import en from './words/en.ts'
import ru from './words/ru.ts'

/**
 * Справочник тем «Шпиона»: набор общий для обоих языков, как у ролей «Мафии».
 * Порядок массива — порядок на экране настроек.
 */
export const themes: SpyTheme[] = [{ id: 'places', title: { ru: 'Места', en: 'Places' } }]

/**
 * Слова по языкам. Это не переводы друг друга, как и колоды: персонажи и мультфильмы
 * у разных культур разные, поэтому у каждого языка свой список.
 */
export const words: Record<Lang, Partial<Record<ThemeId, string[]>>> = { ru, en }

export function getTheme(id: ThemeId): SpyTheme {
  const theme = themes.find((item) => item.id === id)
  if (!theme) throw new Error(`Unknown theme: ${id}`)
  return theme
}

/** Слова темы на языке; темы без слов на этом языке в интерфейсе не показываются. */
export function wordsOf(lang: Lang, id: ThemeId): string[] {
  return words[lang][id] ?? []
}
