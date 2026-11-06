// Только type-импорты: этот файл читает и Node-скрипт проверки контента.
import type { QuestLineup, QuestSetup } from '~/types'

export const QUEST_MIN_PLAYERS = 4
export const QUEST_MAX_PLAYERS = 10
/** С этого числа игроков ячейка «1 of either»: Юнец или Смутьян на выбор. */
export const EITHER_MIN_PLAYERS = 6
/** До этого числа игроков включительно одна роль добра лежит рубашкой вверх. */
export const HIDDEN_MAX_PLAYERS = 5

/**
 * Таблица Director's Cut: число игроков → состав. Ячейка «1 of either» записана как Юнец,
 * Смутьяна подставляет переключатель (`standardLineup`). Альтернативных ролей автора в таблице нет.
 * Источник — «Quest Director's Cut Rules Summary» (2024-09-01), лежит в `drafts/`.
 */
export const directorsCut: Record<number, QuestLineup> = {
  4: row({ servant: 1, cleric: 1, youth: 1, morgan: 1, hunter: 1 }),
  5: row({ servant: 1, cleric: 1, youth: 1, minion: 1, morgan: 1, hunter: 1 }),
  6: row({ cleric: 1, youth: 1, duke: 1, minion: 1, morgan: 1, hunter: 1 }),
  7: row({ cleric: 1, youth: 1, duke: 1, minion: 2, morgan: 1, hunter: 1 }),
  8: row({ servant: 1, cleric: 1, youth: 1, duke: 1, minion: 2, morgan: 1, hunter: 1 }),
  9: row({ servant: 1, cleric: 1, youth: 1, archduke: 1, minion: 3, morgan: 1, hunter: 1 }),
  10: row({ servant: 1, cleric: 1, youth: 1, duke: 1, archduke: 1, minion: 3, morgan: 1, hunter: 1 }),
}

/** Сколько карт в составе по правилам: при 4–5 игроках на одну больше — она уходит рубашкой вверх. */
export function expectedCards(players: number): number {
  return players <= HIDDEN_MAX_PLAYERS ? players + 1 : players
}

/** Состав по таблице с учётом переключателя «Юнец / Смутьян». */
export function standardLineup(setup: Pick<QuestSetup, 'players' | 'youthOrTroublemaker'>): QuestLineup {
  const base = { ...(directorsCut[setup.players] ?? directorsCut[QUEST_MIN_PLAYERS]!) }
  if (setup.players >= EITHER_MIN_PLAYERS && setup.youthOrTroublemaker === 'troublemaker') {
    base.troublemaker = base.youth
    base.youth = 0
  }
  return base
}

function row(counts: Partial<QuestLineup>): QuestLineup {
  return {
    servant: 0,
    cleric: 0,
    youth: 0,
    troublemaker: 0,
    duke: 0,
    archduke: 0,
    'duke-alt': 0,
    apprentice: 0,
    minion: 0,
    morgan: 0,
    hunter: 0,
    ...counts,
  }
}
