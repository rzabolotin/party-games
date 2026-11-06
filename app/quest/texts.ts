// Только type-импорты из `~/types`: этот файл читает и Node-скрипт проверки контента.
import type { Lang, QuestIntro, QuestTale, QuestTexts } from '~/types'
import ru from './texts/ru.ts'

/** Тексты Quest по языкам. Quest пишется только на русском; язык без текстов — режим скрыт. */
export const questTexts: Partial<Record<Lang, QuestTexts>> = { ru }

/** Режим доступен, если для языка есть тексты. */
export function hasQuest(lang: Lang): boolean {
  return questTexts[lang] !== undefined
}

export function findTale(texts: QuestTexts, id: number): QuestTale | undefined {
  return texts.tales.find((tale) => tale.id === id)
}

export function findIntro(texts: QuestTexts, id: number): QuestIntro | undefined {
  return texts.intros.find((intro) => intro.id === id)
}
