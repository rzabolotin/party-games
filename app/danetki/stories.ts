// Только type-импорты из `~/types`: этот файл читает и Node-скрипт проверки контента,
// а алиас `~/types` Node не разрешает (типы он просто срезает).
import type { Danetka, Lang } from '~/types'
import en from './stories/en.ts'
import ru from './stories/ru.ts'

/**
 * Данетки по языкам. Это не переводы друг друга: у каждого языка свой список,
 * язык без историй — пустой массив, и режим в нём не показывается.
 */
export const stories: Record<Lang, Danetka[]> = { ru, en }

/** Режим доступен, если на языке есть хоть одна история. */
export function hasStories(lang: Lang): boolean {
  return stories[lang].length > 0
}

export function findStory(lang: Lang, id: number): Danetka | undefined {
  return stories[lang].find((story) => story.id === id)
}
