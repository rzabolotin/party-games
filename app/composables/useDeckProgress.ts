import { computed } from 'vue'
import { getDeck } from '~/decks'
import { useProgress } from '~/composables/useProgress'

/**
 * Выдача вопросов и прогресс одной колоды. Если текущего вопроса нет (первый вход,
 * после сброса), вопрос выдаётся сразу при вызове.
 */
export function useDeckProgress(deckId: string) {
  const deck = getDeck(deckId)
  const store = useProgress()
  const total = deck?.questions.length ?? 0

  const entry = computed(() => store.get(deckId))
  const shownCount = computed(() => entry.value?.shown.length ?? 0)
  /** Все вопросы показаны и с последнего уже ушли «Дальше». */
  const finished = computed(() => total > 0 && shownCount.value >= total && entry.value?.current === null)
  /** Текст текущего вопроса; null — колода пройдена или не найдена. */
  const current = computed(() => {
    const index = entry.value?.current
    return deck && index != null ? (deck.questions[index] ?? null) : null
  })

  /** Случайный ещё не показанный вопрос; если таких нет — колода пройдена. */
  function next() {
    if (!deck || finished.value) return
    const shown = entry.value?.shown ?? []
    const unshown = deck.questions.map((_, index) => index).filter((index) => !shown.includes(index))
    if (unshown.length === 0) {
      store.set(deckId, { shown, current: null })
      return
    }
    const index = unshown[Math.floor(Math.random() * unshown.length)]!
    store.set(deckId, { shown: [...shown, index], current: index })
  }

  /** «Заново»: прогресс колоды стирается, первый вопрос нового круга выдаётся сразу. */
  function reset() {
    if (!deck) return
    store.remove(deckId)
    next()
  }

  // Первый вход (или после сброса всего прогресса) — текущего вопроса нет, выдаём сразу.
  if (deck && current.value === null && !finished.value) next()

  return { current, shownCount, total, finished, next, reset }
}
