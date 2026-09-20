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
import ruNhieAdventures from './ru/nhie-adventures.ts'
import ruNhieChildhood from './ru/nhie-childhood.ts'
import ruNhieAwkward from './ru/nhie-awkward.ts'
import ruNhieFood from './ru/nhie-food.ts'
import ruNhieLittleSins from './ru/nhie-little-sins.ts'
import enWarmUp from './en/warm-up.ts'
import enHomeHabits from './en/home-habits.ts'
import enTravel from './en/travel.ts'
import enChildhood from './en/childhood.ts'
import enFood from './en/food.ts'
import enSillyDilemmas from './en/silly-dilemmas.ts'
import enWhatIf from './en/what-if.ts'
import enDeepTalk from './en/deep-talk.ts'
import enNhieAdventures from './en/nhie-adventures.ts'
import enNhieChildhood from './en/nhie-childhood.ts'
import enNhieAwkward from './en/nhie-awkward.ts'
import enNhieFood from './en/nhie-food.ts'
import enNhieLittleSins from './en/nhie-little-sins.ts'

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
  ruNhieAdventures,
  ruNhieChildhood,
  ruNhieAwkward,
  ruNhieFood,
  ruNhieLittleSins,
  // en
  enWarmUp,
  enHomeHabits,
  enTravel,
  enChildhood,
  enFood,
  enSillyDilemmas,
  enWhatIf,
  enDeepTalk,
  enNhieAdventures,
  enNhieChildhood,
  enNhieAwkward,
  enNhieFood,
  enNhieLittleSins,
]

export function decksByLang(lang: Lang): Deck[] {
  return decks.filter((deck) => deck.lang === lang)
}

export function getDeck(id: string): Deck | undefined {
  return decks.find((deck) => deck.id === id)
}
