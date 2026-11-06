import type { Lang } from '~/types'

/**
 * Режим доступен, если для языка есть тексты; Quest пишется только на русском.
 * Пока корпуса текстов нет, доступность задана списком; с текстами проверка перейдёт на них.
 */
const QUEST_LANGS: readonly Lang[] = ['ru']

export function hasQuest(lang: Lang): boolean {
  return QUEST_LANGS.includes(lang)
}
