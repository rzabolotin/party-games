import { computed, reactive, watch } from 'vue'
import type { Lang, SpySetup, ThemeId } from '~/types'
import { themes, wordsOf } from '~/spy/themes'

export const SPY_MIN_PLAYERS = 3
export const SPY_MAX_PLAYERS = 20
export const MIN_MINUTES = 3
export const MAX_MINUTES = 10

const STORAGE_KEY = 'koster.spy'

let state: SpySetup | undefined

/**
 * Настройки «Шпиона»: один реактивный объект, один ключ localStorage, читается один раз
 * при первом обращении, каждое изменение сразу пишется обратно. Сама раздача в хранилище
 * не попадает, как и в «Мафии».
 */
export function useSpySetup() {
  if (!state) {
    state = reactive(load())
    watch(state, save, { deep: true })
  }
  const setup = state

  /**
   * Подсказка о составе: большой стол с одним шпионом или шпионов половина стола и больше.
   * Раздачу она не блокирует — ведущий вправе сыграть по-своему.
   */
  const warning = computed<'moreSpies' | 'tooManySpies' | null>(() => {
    if (setup.total >= 9 && setup.spies === 1) return 'moreSpies'
    if (setup.spies * 2 >= setup.total) return 'tooManySpies'
    return null
  })

  /** Темы, у которых есть слова на этом языке, — только их и показываем. */
  function themesFor(lang: Lang) {
    return themes.filter((theme) => wordsOf(lang, theme.id).length > 0)
  }

  /** Раздать можно, если отмечена хоть одна тема со словами на этом языке. */
  function canDeal(lang: Lang): boolean {
    return setup.themes.some((id) => wordsOf(lang, id).length > 0)
  }

  /** Игроков не меньше, чем шпионов плюс двое мирных, — иначе вычислять некому. */
  function canChangeTotal(delta: number): boolean {
    const next = setup.total + delta
    return next >= Math.max(SPY_MIN_PLAYERS, setup.spies + 2) && next <= SPY_MAX_PLAYERS
  }

  /** Шпионы при изменении числа игроков не пересчитываются, как роли в «Мафии». */
  function changeTotal(delta: number) {
    if (canChangeTotal(delta)) setup.total += delta
  }

  function canChangeSpies(delta: number): boolean {
    const next = setup.spies + delta
    return next >= 1 && next <= setup.total - 2
  }

  function changeSpies(delta: number) {
    if (canChangeSpies(delta)) setup.spies += delta
  }

  function canChangeMinutes(delta: number): boolean {
    const next = setup.minutes + delta
    return next >= MIN_MINUTES && next <= MAX_MINUTES
  }

  function changeMinutes(delta: number) {
    if (canChangeMinutes(delta)) setup.minutes += delta
  }

  /** Отметка темы; порядок в списке — порядок справочника, чтобы сохранённое не зависело от кликов. */
  function toggleTheme(id: ThemeId) {
    const on = new Set(setup.themes)
    if (on.has(id)) on.delete(id)
    else on.add(id)
    setup.themes = themes.map((theme) => theme.id).filter((themeId) => on.has(themeId))
  }

  return {
    setup,
    warning,
    themesFor,
    canDeal,
    canChangeTotal,
    changeTotal,
    canChangeSpies,
    changeSpies,
    canChangeMinutes,
    changeMinutes,
    toggleTheme,
  }
}

function defaults(): SpySetup {
  return { total: 6, spies: 1, minutes: 6, themes: ['places'] }
}

/**
 * Читает сохранённые настройки. В отличие от «Мафии», поля независимы, поэтому битое поле
 * заменяется своим дефолтом, а не всё целиком. Неизвестные id тем отбрасываются; если после
 * этого список пуст — это обычное состояние, раздать просто нельзя.
 */
function load(): SpySetup {
  let raw: unknown
  try {
    raw = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')
  } catch {
    raw = null
  }
  const fallback = defaults()
  if (!isRecord(raw)) return fallback

  const total = intIn(raw.total, SPY_MIN_PLAYERS, SPY_MAX_PLAYERS) ?? fallback.total
  const spies = intIn(raw.spies, 1, total - 2) ?? fallback.spies
  const minutes = intIn(raw.minutes, MIN_MINUTES, MAX_MINUTES) ?? fallback.minutes
  const known = new Set<unknown>(themes.map((theme) => theme.id))
  const saved = Array.isArray(raw.themes) ? new Set(raw.themes.filter((id) => known.has(id))) : null
  const picked = saved ? themes.map((theme) => theme.id).filter((id) => saved.has(id)) : fallback.themes

  return { total, spies, minutes, themes: picked }
}

function save(setup: SpySetup) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(setup))
  } catch {
    // Хранилище недоступно или переполнено — настройки живут до перезагрузки.
  }
}

function intIn(value: unknown, min: number, max: number): number | null {
  return typeof value === 'number' && Number.isInteger(value) && value >= min && value <= max ? value : null
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
