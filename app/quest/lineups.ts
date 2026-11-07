// Только type-импорты: этот файл читает и Node-скрипт проверки контента.
import type { QuestLineup } from '~/types'

export const QUEST_MIN_PLAYERS = 4
export const QUEST_MAX_PLAYERS = 12
/** Последняя строка таблицы и планшет на 10; при большем числе игроков берутся они. */
export const TABLE_MAX_PLAYERS = 10
/** До этого числа игроков включительно одна роль добра лежит рубашкой вверх. */
export const HIDDEN_MAX_PLAYERS = 5

/**
 * Таблица Director's Cut: число игроков → состав. Ячейка «1 of either» записана как Юнец:
 * Смутьян вместо него — ручная правка, и состав считается нестандартным. Ролей из коробки (Ученик, Артур и др.) в таблице нет.
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

/** Состав по таблице; больше 10 игроков — строка на 10, недостающие карты стол добавляет сам. */
export function standardLineup(players: number): QuestLineup {
  return { ...(directorsCut[Math.min(players, TABLE_MAX_PLAYERS)] ?? directorsCut[QUEST_MIN_PLAYERS]!) }
}

function row(counts: Partial<QuestLineup>): QuestLineup {
  return {
    servant: 0,
    cleric: 0,
    arthur: 0,
    youth: 0,
    troublemaker: 0,
    duke: 0,
    archduke: 0,
    apprentice: 0,
    minion: 0,
    morgan: 0,
    hunter: 0,
    scion: 0,
    brute: 0,
    lunatic: 0,
    revealer: 0,
    trickster: 0,
    mutineer: 0,
    changeling: 0,
    ...counts,
  }
}
