// Только type-импорты из `~/types` и относительные импорты с расширением: этот файл читает и Node-скрипт проверки контента.
import type { QuestLineup, QuestTexts } from '~/types'
import { QUEST_NIGHT_OUTSIDERS } from '../types/index.ts'
import { HIDDEN_MAX_PLAYERS } from './lineups.ts'

/** Сигнал ночи: какой звук прозвучит на шаге. */
export type NightSignal =
  | 'bell'
  | 'doubleBell'
  | 'harp'
  | 'doubleHarp'
  | 'gong'
  | 'doubleGong'
  | 'horn'
  | 'doubleHorn'
  | 'fanfare'

/** Пауза, чтобы все закрыли глаза. */
export const NIGHT_START_MS = 3000
/** Сколько длится шаг с открытыми глазами — константа, без настройки. */
export const NIGHT_STEP_MS = 8000
/** Пауза между шагами. */
export const NIGHT_GAP_MS = 2000
/** После фанфар — сколько дать им отзвучать, прежде чем показать первый поход. */
export const NIGHT_TAIL_MS = 2000

/** Роли, от которых зависят шаги ночи. */
type NightStepRoles = Pick<QuestLineup, 'scion' | 'arthur'>
/** Роли, от которых зависит текст ночи: шаги, палец Охотника, строки про Плута и тех, кто глаз не открывает. */
type NightTextRoles = NightStepRoles & Pick<QuestLineup, 'hunter' | 'trickster' | 'mutineer' | 'changeling'>

/** Шаг с пальцем Охотника есть только при 4–5 игроках и только если Охотник в составе. */
export function hasHunterStep(players: number, roles: Pick<QuestLineup, 'hunter'>): boolean {
  return players <= HIDDEN_MAX_PLAYERS && roles.hunter > 0
}

/** Пары сигналов «открыть / закрыть глаза» по порядку ночи; шагов без своих ролей нет. */
function steps(roles: NightStepRoles): [NightSignal, NightSignal][] {
  return [
    ['bell', 'doubleBell'],
    ...(roles.scion > 0 ? [['harp', 'doubleHarp'] as [NightSignal, NightSignal]] : []),
    ...(roles.arthur > 0 ? [['gong', 'doubleGong'] as [NightSignal, NightSignal]] : []),
    ['horn', 'doubleHorn'],
  ]
}

export interface NightSchedule {
  signals: { at: number; signal: NightSignal }[]
  /** Момент перехода к первому походу. */
  end: number
}

/**
 * Расписание ночи от нажатия «Начать ночь»: 3 с; на каждый шаг сигнал, 8 с, двойной сигнал, 2 с;
 * фанфары. Шаги: колокол (злодеи), арфа (Моргана и Отпрыск), гонг (Артур и Моргана), рог (Клирик).
 */
export function nightSchedule(roles: NightStepRoles): NightSchedule {
  const signals: NightSchedule['signals'] = []
  let at = NIGHT_START_MS
  for (const [open, close] of steps(roles)) {
    signals.push({ at, signal: open }, { at: at + NIGHT_STEP_MS, signal: close })
    at += NIGHT_STEP_MS + NIGHT_GAP_MS
  }
  signals.push({ at, signal: 'fanfare' })
  return { signals, end: at + NIGHT_TAIL_MS }
}

/** Текст про ночь по абзацам: по одному на шаг, вставки про роли — внутри своего шага. */
export function nightLines(texts: Pick<QuestTexts, 'night'>, players: number, roles: NightTextRoles): string[] {
  const night = texts.night
  const evil = [
    night.evil,
    ...(hasHunterStep(players, roles) ? [night.hunter] : []),
    ...QUEST_NIGHT_OUTSIDERS.filter((id) => roles[id] > 0).map((id) => night.outsiders[id]),
  ]
  return [
    night.start,
    evil.join(' '),
    ...(roles.scion > 0 ? [night.scion] : []),
    ...(roles.arthur > 0 ? [night.arthur] : []),
    roles.trickster > 0 ? `${night.cleric} ${night.trickster}` : night.cleric,
    night.end,
  ]
}
