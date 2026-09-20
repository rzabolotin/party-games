import { ref, type Ref } from 'vue'
import { getDeck } from '~/decks'

/** Прогресс одной колоды; индексы — позиции вопросов в массиве колоды. */
export interface DeckProgress {
  /** Уже показанные вопросы в порядке показа. */
  shown: number[]
  /** Текущий вопрос (входит в shown); null — с последнего вопроса уже ушли, колода пройдена. */
  current: number | null
}

/** Прогресс всех колод по id — ровно в таком виде лежит в localStorage. */
export type Progress = Record<string, DeckProgress>

const STORAGE_KEY = 'koster.progress'

let state: Ref<Progress> | undefined

/**
 * Общий прогресс всех колод: один ключ localStorage, читается один раз при первом обращении,
 * каждое изменение сразу пишется обратно. Выдача вопросов — в useDeckProgress.
 */
export function useProgress() {
  state ??= ref(load())
  const progress = state

  return {
    /** Сколько вопросов колоды уже показано — для «23 / 40» в списке. */
    shownCount: (deckId: string) => progress.value[deckId]?.shown.length ?? 0,
    get: (deckId: string): DeckProgress | undefined => progress.value[deckId],
    set(deckId: string, entry: DeckProgress) {
      progress.value[deckId] = entry
      save(progress.value)
    },
    remove(deckId: string) {
      delete progress.value[deckId]
      save(progress.value)
    },
  }
}

/** Читает сохранённый прогресс; битые записи и записи с индексами вне колоды отбрасываются. */
function load(): Progress {
  let raw: unknown
  try {
    raw = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')
  } catch {
    raw = null
  }
  if (!isRecord(raw)) return {}

  const progress: Progress = {}
  for (const [deckId, entry] of Object.entries(raw)) {
    const deck = getDeck(deckId)
    if (deck && isDeckProgress(entry, deck.questions.length)) progress[deckId] = entry
  }
  return progress
}

function save(progress: Progress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
  } catch {
    // Хранилище недоступно или переполнено — играем дальше, просто без сохранения.
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** Запись корректна, если shown — разные целые в пределах колоды, а current — один из них или null. */
function isDeckProgress(value: unknown, total: number): value is DeckProgress {
  if (!isRecord(value)) return false
  const { shown, current } = value
  const inRange = (index: unknown): index is number =>
    typeof index === 'number' && Number.isInteger(index) && index >= 0 && index < total
  return (
    Array.isArray(shown) &&
    shown.every(inRange) &&
    new Set(shown).size === shown.length &&
    (current === null || (inRange(current) && shown.includes(current)))
  )
}
