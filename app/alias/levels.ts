// Только type-импорты из `~/types`: этот файл читает и Node-скрипт проверки контента,
// а алиас `~/types` Node не разрешает (типы он просто срезает).
import type { AliasLevel, AliasLevelInfo, Lang } from '~/types'
import en from './words/en.ts'
import ru from './words/ru.ts'

/**
 * Справочник уровней Alias: общий для обоих языков, как темы «Шпиона».
 * Порядок массива — порядок галочек на экране начала.
 */
export const levels: AliasLevelInfo[] = [
  { id: 'easy', emoji: '🐣', title: { ru: 'Лёгкие', en: 'Easy' } },
  { id: 'normal', emoji: '🙂', title: { ru: 'Обычные', en: 'Normal' } },
  { id: 'hard', emoji: '🔥', title: { ru: 'Сложные', en: 'Hard' } },
]

/**
 * Слова по языкам и уровням. Это не переводы друг друга, как и слова «Шпиона»:
 * у каждого языка свой список. Внутри языка слово не повторяется, в том числе между уровнями.
 */
export const words: Record<Lang, Record<AliasLevel, string[]>> = { ru, en }

export function getLevel(id: AliasLevel): AliasLevelInfo {
  const level = levels.find((item) => item.id === id)
  if (!level) throw new Error(`Unknown level: ${id}`)
  return level
}

/** Команды по местам: эмодзи и название по умолчанию. Их четыре — это и потолок числа команд. */
export const teamPresets: { emoji: string; name: Record<Lang, string> }[] = [
  { emoji: '🦊', name: { ru: 'Лисы', en: 'Foxes' } },
  { emoji: '🐻', name: { ru: 'Медведи', en: 'Bears' } },
  { emoji: '🦉', name: { ru: 'Совы', en: 'Owls' } },
  { emoji: '🐺', name: { ru: 'Волки', en: 'Wolves' } },
]
