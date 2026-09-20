import type { DeckType, Lang } from '~/types'

/** Название приложения — одна запись; в манифесте продублировано в nuxt.config.ts. */
export const APP_NAME = 'Костёр'

/** Строки интерфейса. Текущий язык пока захардкожен в страницах; переключатель — в настройках (тикет 06). */
export interface Messages {
  deckTypes: Record<DeckType, string>
  adult: string
  questions: string
  decks: string
  deckNotFound: string
}

export const messages: Record<Lang, Messages> = {
  ru: {
    deckTypes: {
      'most-likely': 'Кто из нас скорее всего…',
      'would-you-rather': 'Что бы ты выбрал',
      'never-have-i': 'Я никогда не…',
    },
    adult: 'Для взрослых',
    questions: 'Вопросов',
    decks: 'Колоды',
    deckNotFound: 'Колода не найдена',
  },
  en: {
    deckTypes: {
      'most-likely': 'Most Likely To',
      'would-you-rather': 'Would You Rather',
      'never-have-i': 'Never Have I Ever',
    },
    adult: 'Adults only',
    questions: 'Questions',
    decks: 'Decks',
    deckNotFound: 'Deck not found',
  },
}
