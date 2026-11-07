// Только относительный импорт с расширением: этот файл читает и Node-скрипт проверки контента.
import { TABLE_MAX_PLAYERS } from './lineups.ts'

/** Поход на планшете Director's Cut. */
export interface TableauQuest {
  /** Сколько игроков в отряде; пара — у двух планшетов на 4 игрока здесь разные числа. */
  team: number | readonly [number, number]
  /** Поход проваливается только от двух карт «Провал». */
  doubleFail: boolean
  /** После похода лидер вручает амулет. */
  amulet: boolean
}

const q = (team: TableauQuest['team'], doubleFail = false, amulet = false): TableauQuest => ({ team, doubleFail, amulet })

/**
 * Планшеты Director's Cut: число игроков → походы по порядку. Источник — планшеты из коробки
 * (их пересказал пользователь) и карта правил: «при 8+ игроках два провала на 3-м и 4-м походах».
 * На 4 игрока планшетов два — 3, 2, 3, 2 и 3, 2, 2, 3; походов там не больше четырёх (2 провала или 3 успеха).
 */
export const tableaus: Record<number, readonly TableauQuest[]> = {
  4: [q(3), q(2), q([3, 2]), q([2, 3])],
  5: [q(3), q(2), q(3), q(4, true), q(3)],
  6: [q(3), q(2), q(3), q(4, true, true), q(3)],
  7: [q(3), q(2), q(3, false, true), q(4, true, true), q(3)],
  8: [q(4), q(3, false, true), q(4, true, true), q(5, true, true), q(4)],
  9: [q(4), q(3, false, true), q(4, true, true), q(5, true, true), q(4)],
  10: [q(4), q(3, false, true), q(4, true, true), q(5, true, true), q(4)],
}

/** Поход планшета по числу игроков и номеру (с единицы); больше 10 игроков — планшет на 10. */
export function tableauQuest(players: number, number: number): TableauQuest | undefined {
  return tableaus[Math.min(players, TABLE_MAX_PLAYERS)]?.[number - 1]
}
