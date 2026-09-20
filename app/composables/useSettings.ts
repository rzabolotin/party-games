import { reactive, watch } from 'vue'
import { LANGS, type Lang } from '~/types'

export const FONT_SCALES = [1, 1.2, 1.4] as const
export type FontScale = (typeof FONT_SCALES)[number]

/** Настройки — ровно в таком виде лежат в localStorage. */
export interface Settings {
  lang: Lang
  /** Множитель кегля вопроса; уходит в CSS-переменную --font-scale. */
  fontScale: FontScale
  /** Имена игроков для карточки «Следующий: …» (тикет 07). */
  players: string[]
  /** Показывать карточку читающего между вопросами (тикет 07). */
  showReader: boolean
}

const STORAGE_KEY = 'koster.settings'

let state: Settings | undefined

/**
 * Общие настройки приложения: один реактивный объект, один ключ localStorage,
 * читается один раз при первом обращении, каждое изменение сразу пишется обратно.
 */
export function useSettings(): Settings {
  if (!state) {
    state = reactive(load())
    watch(state, save, { deep: true })
    // Без имён показывать некого: тумблер в настройках недоступен, а здесь он ещё и выключается.
    watch(
      () => state!.players.length,
      (count) => {
        if (count === 0) state!.showReader = false
      },
    )
  }
  return state
}

/** Язык по умолчанию — по языку телефона; применяется только пока настройка не сохранена. */
function defaultLang(): Lang {
  return navigator.language?.toLowerCase().startsWith('ru') ? 'ru' : 'en'
}

function defaults(): Settings {
  return { lang: defaultLang(), fontScale: 1.2, players: [], showReader: false }
}

/** Читает сохранённые настройки; каждое поле проверяется отдельно, битое — заменяется дефолтом. */
function load(): Settings {
  let raw: unknown
  try {
    raw = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')
  } catch {
    raw = null
  }
  const settings = defaults()
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) return settings

  const { lang, fontScale, players, showReader } = raw as Record<string, unknown>
  if (isLang(lang)) settings.lang = lang
  if (isFontScale(fontScale)) settings.fontScale = fontScale
  if (Array.isArray(players)) settings.players = players.filter((name): name is string => typeof name === 'string')
  if (typeof showReader === 'boolean') settings.showReader = showReader && settings.players.length > 0
  return settings
}

function save(settings: Settings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch {
    // Хранилище недоступно или переполнено — настройки живут до перезагрузки.
  }
}

function isLang(value: unknown): value is Lang {
  return (LANGS as readonly unknown[]).includes(value)
}

function isFontScale(value: unknown): value is FontScale {
  return (FONT_SCALES as readonly unknown[]).includes(value)
}
