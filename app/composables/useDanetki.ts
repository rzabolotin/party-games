import { reactive, watch, type WatchStopHandle } from 'vue'
import { LANGS, type Danetka, type DanetkiState, type Lang } from '~/types'
import { findStory, stories } from '~/danetki/stories'

const STORAGE_KEY = 'koster.danetki'

let state: DanetkiState | undefined
let stopSaving: WatchStopHandle | undefined

/**
 * «Данетки»: один реактивный объект, один ключ localStorage, читается один раз
 * при первом обращении, каждое изменение сразу пишется обратно — как настройки «Шпиона».
 * Набор — истории языка, отфильтрованные переключателем: светлые всегда, мрачные только при `dark`.
 */
export function useDanetki() {
  if (!state) {
    state = reactive(load())
    stopSaving = watch(state, save, { deep: true })
  }
  const danetki = state

  /** Истории текущего набора языка. */
  function setOf(lang: Lang): Danetka[] {
    return stories[lang].filter((story) => danetki.dark || story.tone === 'light')
  }

  /** Истории набора, у которых ответ ещё не открывали. */
  function unplayedOf(lang: Lang): Danetka[] {
    const played = new Set(danetki.played[lang])
    return setOf(lang).filter((story) => !played.has(story.id))
  }

  /** Сколько историй набора разгадано. */
  function solvedCount(lang: Lang): number {
    return setOf(lang).length - unplayedOf(lang).length
  }

  /** Набор пройден: в нём не осталось историй с неоткрытым ответом. */
  function exhausted(lang: Lang): boolean {
    return unplayedOf(lang).length === 0
  }

  /** Неразгаданные мрачные — для подсказки на финале, когда мрачные выключены. */
  function darkLeft(lang: Lang): number {
    const played = new Set(danetki.played[lang])
    return stories[lang].filter((story) => story.tone === 'dark' && !played.has(story.id)).length
  }

  function current(lang: Lang): Danetka | null {
    const id = danetki.current[lang]
    return id === null ? null : (findStory(lang, id) ?? null)
  }

  function isPlayed(lang: Lang, id: number): boolean {
    return danetki.played[lang].includes(id)
  }

  /** Открыли ответ — история сыграна сразу, а не при переходе; повторное закрытие отметку не снимает. */
  function markPlayed(lang: Lang, id: number) {
    if (!isPlayed(lang, id)) danetki.played[lang].push(id)
  }

  /**
   * Следующая история: случайная неразгаданная из набора, текущая — только если других нет.
   * Пропущенная без ответа остаётся кандидатом. Набор пройден — `current` сбрасывается в null.
   */
  function drawNext(lang: Lang): Danetka | null {
    const candidates = unplayedOf(lang)
    const others = candidates.filter((story) => story.id !== danetki.current[lang])
    const pool = others.length > 0 ? others : candidates
    const next = pool[Math.floor(Math.random() * pool.length)] ?? null
    danetki.current[lang] = next?.id ?? null
    return next
  }

  /** «Начать заново»: из сыгранных убираются только истории текущего набора. */
  function restart(lang: Lang) {
    const inSet = new Set(setOf(lang).map((story) => story.id))
    danetki.played[lang] = danetki.played[lang].filter((id) => !inSet.has(id))
  }

  return {
    danetki,
    setOf,
    unplayedOf,
    solvedCount,
    exhausted,
    darkLeft,
    current,
    isPlayed,
    markPlayed,
    drawNext,
    restart,
  }
}

/**
 * «Сбросить весь прогресс» в настройках: ключ стирается целиком, вместе с переключателем.
 * Объект в памяти забывается, следующее обращение прочитает пустое хранилище заново.
 */
export function clearDanetki() {
  stopSaving?.()
  stopSaving = undefined
  state = undefined
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Нечего стирать.
  }
}

function defaults(): DanetkiState {
  return {
    dark: false,
    played: Object.fromEntries(LANGS.map((lang) => [lang, [] as number[]])) as Record<Lang, number[]>,
    current: Object.fromEntries(LANGS.map((lang) => [lang, null])) as Record<Lang, number | null>,
  }
}

/**
 * Читает сохранённое состояние. Битое поле заменяется своим дефолтом, неизвестные id
 * отбрасываются из сыгранных, неизвестный текущий id превращается в null.
 */
function load(): DanetkiState {
  let raw: unknown
  try {
    raw = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')
  } catch {
    raw = null
  }
  const result = defaults()
  if (!isRecord(raw)) return result

  if (typeof raw.dark === 'boolean') result.dark = raw.dark
  const played = isRecord(raw.played) ? raw.played : {}
  const current = isRecord(raw.current) ? raw.current : {}
  for (const lang of LANGS) {
    const known = new Set(stories[lang].map((story) => story.id))
    const saved = played[lang]
    if (Array.isArray(saved)) {
      result.played[lang] = [...new Set(saved.filter((id): id is number => typeof id === 'number' && known.has(id)))]
    }
    const id = current[lang]
    result.current[lang] = typeof id === 'number' && known.has(id) ? id : null
  }
  return result
}

function save(danetki: DanetkiState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(danetki))
  } catch {
    // Хранилище недоступно или переполнено — прогресс живёт до перезагрузки.
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
