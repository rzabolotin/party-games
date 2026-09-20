import type { Deck, Lang } from '~/types'
// Расширения .ts в импортах обязательны: этот индекс загружает не только Vite,
// но и Node-скрипт проверки контента (scripts/check-content.mjs).
import ruWarmUp from './ru/warm-up.ts'
import ruHomeHabits from './ru/home-habits.ts'
import ruTravel from './ru/travel.ts'
import ruChildhood from './ru/childhood.ts'
import ruFood from './ru/food.ts'
import ruFunnyDilemmas from './ru/funny-dilemmas.ts'
import ruWhatIf from './ru/what-if.ts'
import ruPhilosophy from './ru/philosophy.ts'
import ruUniversal from './ru/universal.ts'
import enWarmUp from './en/warm-up.ts'
import enHomeHabits from './en/home-habits.ts'
import enTravel from './en/travel.ts'
import enChildhood from './en/childhood.ts'
import enFood from './en/food.ts'

/** Все колоды. Порядок массива — порядок в списке; 18+ в каждом языке последняя. */
export const decks: Deck[] = [
  // ru
  ruWarmUp,
  ruHomeHabits,
  ruTravel,
  ruChildhood,
  ruFood,
  ruFunnyDilemmas,
  ruWhatIf,
  ruPhilosophy,
  ruUniversal,
  // en
  enWarmUp,
  enHomeHabits,
  enTravel,
  enChildhood,
  enFood,
]

export function decksByLang(lang: Lang): Deck[] {
  return decks.filter((deck) => deck.lang === lang)
}

export function getDeck(id: string): Deck | undefined {
  return decks.find((deck) => deck.id === id)
}
