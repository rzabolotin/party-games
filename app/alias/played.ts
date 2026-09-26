import { ALIAS_LEVELS, LANGS, type Lang } from '~/types'
import { words } from '~/alias/levels'

const STORAGE_KEY = 'koster.alias-played'

/**
 * Сыгранные слова по `<lang>-<level>` — ровно в таком виде лежат в localStorage.
 * Хранятся сами слова, а не индексы: когда правят контент, индексы уезжают.
 */
type Played = Record<string, string[]>

/**
 * Сыгранные слова языка одним множеством: внутри языка слово не повторяется между уровнями,
 * так что уровень по слову восстанавливается при записи. Битые записи и слова,
 * которых больше нет в контенте, отбрасываются.
 */
export function loadPlayed(lang: Lang): Set<string> {
  const raw = read()
  const played = new Set<string>()
  for (const level of ALIAS_LEVELS) {
    const entry = raw[`${lang}-${level}`]
    if (!Array.isArray(entry)) continue
    const known = new Set(words[lang][level])
    for (const word of entry) if (typeof word === 'string' && known.has(word)) played.add(word)
  }
  return played
}

/** Пишет сыгранные слова языка по уровням; записи другого языка остаются как были. */
export function savePlayed(lang: Lang, played: ReadonlySet<string>) {
  const raw = read()
  const next: Played = {}
  for (const other of LANGS) {
    for (const level of ALIAS_LEVELS) {
      const key = `${other}-${level}`
      const entry =
        other === lang
          ? words[lang][level].filter((word) => played.has(word))
          : Array.isArray(raw[key])
            ? (raw[key] as unknown[]).filter((word): word is string => typeof word === 'string')
            : []
      if (entry.length > 0) next[key] = entry
    }
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // Хранилище недоступно или переполнено — слова не повторяются хотя бы в этой партии.
  }
}

/** «Сбросить весь прогресс» в настройках: все уровни всех языков — с нуля. */
export function clearPlayed() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Нечего стирать.
  }
}

function read(): Record<string, unknown> {
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')
    return typeof raw === 'object' && raw !== null && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {}
  } catch {
    return {}
  }
}
