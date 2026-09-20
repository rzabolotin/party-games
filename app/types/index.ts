export const LANGS = ['ru', 'en'] as const
export type Lang = (typeof LANGS)[number]

/** Тип игры; порядок массива — порядок групп в списке колод. */
export const DECK_TYPES = ['most-likely', 'would-you-rather', 'never-have-i'] as const
export type DeckType = (typeof DECK_TYPES)[number]

export interface Deck {
  /** Уникален глобально: 'ru-food', 'en-food'. */
  id: string
  lang: Lang
  type: DeckType
  title: string
  emoji: string
  questions: string[]
  /** Колода 18+: в списке идёт последней, отдельной группой, помечена 🔞. */
  adult?: boolean
}
