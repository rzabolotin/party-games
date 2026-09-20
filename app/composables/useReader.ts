import { useSettings } from '~/composables/useSettings'

/**
 * Случайное имя из списка, не равное предыдущему, если есть из чего выбирать.
 * При одном игроке предыдущий не учитывается — иначе выбирать было бы не из кого.
 */
export function pickReader(players: readonly string[], previous: string | null): string | null {
  if (players.length === 0) return null
  const candidates = players.length >= 2 ? players.filter((name) => name !== previous) : players
  return candidates[Math.floor(Math.random() * candidates.length)] ?? null
}

/** Предыдущий читающий — в памяти на время сессии, а не в localStorage: после перезапуска очередь начинается заново. */
let previous: string | null = null

/** Выбор читающего для карточки «Следующий: …»: каждый вызов next() — новое имя, не совпадающее с прошлым. */
export function useReader() {
  const settings = useSettings()

  /** Показывать ли карточку читающего: тумблер включён и есть хотя бы одно имя. */
  const enabled = computed(() => settings.showReader && settings.players.length >= 1)

  function next(): string | null {
    const name = pickReader(settings.players, previous)
    if (name !== null) previous = name
    return name
  }

  return { enabled, next }
}
