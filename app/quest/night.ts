// Только type-импорты из `~/types` и относительный импорт с расширением: этот файл читает и Node-скрипт проверки контента.
import type { QuestLineup, QuestTexts } from '~/types'
import { HIDDEN_MAX_PLAYERS } from './lineups.ts'

/** Сигнал ночи: какой звук прозвучит на шаге. */
export type NightSignal = 'bell' | 'doubleBell' | 'horn' | 'doubleHorn' | 'fanfare'

/** Пауза, чтобы все закрыли глаза. */
export const NIGHT_START_MS = 3000
/** Сколько длится шаг с открытыми глазами — константа, без настройки. */
export const NIGHT_STEP_MS = 8000
/** Пауза между шагами. */
export const NIGHT_GAP_MS = 2000
/** После фанфар — сколько дать им отзвучать, прежде чем показать первый поход. */
export const NIGHT_TAIL_MS = 2000

/**
 * Расписание ночи от нажатия «Начать ночь»: колокол, 8 с, двойной колокол; 2 с;
 * рог, 8 с, двойной рог; 2 с; фанфары. `end` — момент перехода к первому походу.
 */
export const NIGHT_SCHEDULE: readonly { at: number; signal: NightSignal }[] = (() => {
  const bell = NIGHT_START_MS
  const horn = bell + NIGHT_STEP_MS + NIGHT_GAP_MS
  const fanfare = horn + NIGHT_STEP_MS + NIGHT_GAP_MS
  return [
    { at: bell, signal: 'bell' },
    { at: bell + NIGHT_STEP_MS, signal: 'doubleBell' },
    { at: horn, signal: 'horn' },
    { at: horn + NIGHT_STEP_MS, signal: 'doubleHorn' },
    { at: fanfare, signal: 'fanfare' },
  ]
})()

export const NIGHT_END_MS = NIGHT_SCHEDULE.at(-1)!.at + NIGHT_TAIL_MS

/** Место в `nightText`, куда встаёт строка про палец Охотника. */
export const NIGHT_HUNTER_SLOT = '{hunter}'

/** Шаг с пальцем Охотника есть только при 4–5 игроках и только если Охотник в составе. */
export function hasHunterStep(players: number, roles: Pick<QuestLineup, 'hunter'>): boolean {
  return players <= HIDDEN_MAX_PLAYERS && roles.hunter > 0
}

/** Текст про ночь для состава: строка Охотника подставляется или выпадает вместе с пробелом перед ней. */
export function nightText(texts: Pick<QuestTexts, 'nightText' | 'nightHunterLine'>, withHunter: boolean): string {
  return texts.nightText.replace(` ${NIGHT_HUNTER_SLOT}`, withHunter ? ` ${texts.nightHunterLine}` : '')
}
