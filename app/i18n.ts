import type { DeckType, Lang } from '~/types'

/** Название приложения — одна запись; в манифесте продублировано в nuxt.config.ts. */
export const APP_NAME = 'Костёр'

/** Строки интерфейса. Текущий язык — в настройках; строки на нём выдаёт useMessages(). */
export interface Messages {
  deckTypes: Record<DeckType, string>
  adult: string
  decks: string
  deckNotFound: string
  next: string
  finished: string
  restart: string
  toDecks: string
  settings: string
  back: string
  language: string
  fontSize: string
  fontSizes: Record<'1' | '1.2' | '1.4', string>
  fontSample: string
  resetProgress: string
  resetConfirm: string
}

/** Названия языков — на самом языке, чтобы переключатель читался при любом текущем. */
export const langNames: Record<Lang, string> = {
  ru: 'Русский',
  en: 'English',
}

export const messages: Record<Lang, Messages> = {
  ru: {
    deckTypes: {
      'most-likely': 'Кто из нас скорее всего…',
      'would-you-rather': 'Что бы ты выбрал',
      'never-have-i': 'Я никогда не…',
    },
    adult: 'Для взрослых',
    decks: 'Колоды',
    deckNotFound: 'Колода не найдена',
    next: 'Дальше',
    finished: 'Вопросы закончились',
    restart: 'Заново',
    toDecks: 'К колодам',
    settings: 'Настройки',
    back: 'Назад',
    language: 'Язык',
    fontSize: 'Размер шрифта',
    fontSizes: { '1': 'Обычный', '1.2': 'Крупный', '1.4': 'Огромный' },
    fontSample: 'Кто из нас скорее всего заснёт первым у костра?',
    resetProgress: 'Сбросить весь прогресс',
    resetConfirm: 'Сбросить прогресс всех колод? Отменить будет нельзя.',
  },
  en: {
    deckTypes: {
      'most-likely': 'Most Likely To',
      'would-you-rather': 'Would You Rather',
      'never-have-i': 'Never Have I Ever',
    },
    adult: 'Adults only',
    decks: 'Decks',
    deckNotFound: 'Deck not found',
    next: 'Next',
    finished: 'No more questions',
    restart: 'Restart',
    toDecks: 'To decks',
    settings: 'Settings',
    back: 'Back',
    language: 'Language',
    fontSize: 'Font size',
    fontSizes: { '1': 'Normal', '1.2': 'Large', '1.4': 'Huge' },
    fontSample: 'Who is most likely to fall asleep first by the fire?',
    resetProgress: 'Reset all progress',
    resetConfirm: 'Reset progress of all decks? This cannot be undone.',
  },
}
