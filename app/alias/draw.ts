import type { AliasLevel } from '~/types'

/**
 * Следующее слово: равновероятно из объединения несыгранных слов отмеченных уровней.
 * Уровень, где несыгранных не осталось, считается сброшенным — из него берутся все слова;
 * забыть его сыгранные должен вызывающий (`forgetExhausted`).
 * Чистая функция: `random` подменяется в проверках, в приложении это `Math.random`.
 * Хотя бы один отмеченный уровень со словами должен быть — за этим следит экран начала.
 */
export function drawWord(
  pool: Record<AliasLevel, string[]>,
  levels: AliasLevel[],
  played: ReadonlySet<string>,
  random: () => number = Math.random,
): { level: AliasLevel; word: string } {
  const candidates: { level: AliasLevel; word: string }[] = []
  for (const level of levels) {
    const all = pool[level]
    const fresh = all.filter((word) => !played.has(word))
    for (const word of fresh.length > 0 ? fresh : all) candidates.push({ level, word })
  }
  return candidates[Math.floor(random() * candidates.length)]!
}

/** Отмеченные уровни, где сыграно всё, открываются заново: их слова убираются из сыгранных. */
export function forgetExhausted(pool: Record<AliasLevel, string[]>, levels: AliasLevel[], played: Set<string>) {
  for (const level of levels) {
    if (pool[level].every((word) => played.has(word))) {
      for (const word of pool[level]) played.delete(word)
    }
  }
}
