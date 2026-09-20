import type { Deck, Lang } from '~/types'
// Расширения .ts в импортах обязательны: этот индекс загружает не только Vite,
// но и Node-скрипт проверки контента (scripts/check-content.mjs).
import ruWarmUp from './ru/warm-up.ts'
import enWarmUp from './en/warm-up.ts'

/** Все колоды. Порядок массива — порядок в списке; 18+ в каждом языке последняя. */
export const decks: Deck[] = [
  // ru
  ruWarmUp,
  // en
  enWarmUp,
]

export function decksByLang(lang: Lang): Deck[] {
  return decks.filter((deck) => deck.lang === lang)
}

export function getDeck(id: string): Deck | undefined {
  return decks.find((deck) => deck.id === id)
}
