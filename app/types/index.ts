export const LANGS = ['ru', 'en'] as const
export type Lang = (typeof LANGS)[number]

/** Тип игры; порядок массива — порядок групп в списке колод. */
export const DECK_TYPES = ['most-likely', 'would-you-rather', 'never-have-i'] as const
export type DeckType = (typeof DECK_TYPES)[number]

export interface Deck {
  /** Уникален глобально: 'ru-food', 'en-food'. */
  id: string
  lang: Lang
  type: DeckType
  title: string
  emoji: string
  questions: string[]
  /** Колода 18+: в списке идёт последней, отдельной группой, помечена 🔞. */
  adult?: boolean
}

/** Сторона в «Мафии»: за кого играет роль и вместе с кем побеждает. */
export const FACTIONS = ['mafia', 'town', 'solo'] as const
export type Faction = (typeof FACTIONS)[number]

/** Роли «Мафии»; порядок массива — порядок на экране состава и в сводке, мирный последним. */
export const ROLE_IDS = ['mafia', 'don', 'detective', 'doctor', 'maniac', 'civilian'] as const
export type RoleId = (typeof ROLE_IDS)[number]

/** Роли со счётчиком на экране состава: все, кроме мирного (он — остаток). */
export type CountedRoleId = Exclude<RoleId, 'civilian'>

export interface MafiaRole {
  /** Он же имя рисунка в `GameIcon`. */
  id: RoleId
  faction: Faction
  /** Мирный — остаток состава, у него нет счётчика на экране состава. */
  counted: boolean
  /** Спецроль в единственном экземпляре (все, кроме мафии и мирного). */
  unique: boolean
  /** Дон без мафии не выдаётся. */
  requiresMafia?: boolean
  /** Место в порядке ночи; роли без действия ночью — без него. */
  nightOrder?: number
  title: Record<Lang, string>
  /** Строка «за кого играешь и когда побеждаешь». */
  tagline: Record<Lang, string>
  /** 2–3 фразы: что делаешь ночью и днём. */
  description: Record<Lang, string>
}

/** Состав партии — ровно в таком виде лежит в localStorage. */
export interface MafiaSetup {
  /** 3…20, по умолчанию 8. */
  total: number
  /** Счётчики ролей, кроме мирного: мирные — остаток `total` минус сумма счётчиков. */
  counts: Record<CountedRoleId, number>
}

/** Темы «Шпиона»; порядок массива — порядок на экране настроек. */
export const THEME_IDS = [
  'places',
  'animals',
  'professions',
  'countries',
  'cities',
  'sports',
  'fairy-tales',
  'cartoons',
  'superheroes',
  'home',
] as const
export type ThemeId = (typeof THEME_IDS)[number]

/** Тема «Шпиона» в справочнике: общая для обоих языков, слова лежат отдельно по языкам. */
export interface SpyTheme {
  id: ThemeId
  title: Record<Lang, string>
}

/** Настройки «Шпиона» — ровно в таком виде лежат в localStorage. */
export interface SpySetup {
  /** 3…20, по умолчанию 6. */
  total: number
  /** 1…total−2, по умолчанию 1. */
  spies: number
  /** Минуты на раунд, 3…10, по умолчанию 6. */
  minutes: number
  /** Отмеченные темы, по умолчанию ['places']; пустой список допустим — тогда раздать нельзя. */
  themes: ThemeId[]
}

/** Уровни слов Alias; порядок массива — порядок на экране начала. */
export const ALIAS_LEVELS = ['easy', 'normal', 'hard'] as const
export type AliasLevel = (typeof ALIAS_LEVELS)[number]

/** Уровень Alias в справочнике: общий для обоих языков, слова у каждого языка свои. */
export interface AliasLevelInfo {
  id: AliasLevel
  emoji: string
  title: Record<Lang, string>
}

export interface AliasTeam {
  /** Из набора `teamEmojis`, у каждой команды свой; по умолчанию — по месту команды. */
  emoji: string
  /** По умолчанию «Леди», «Бродяги»…; переименовывается. */
  name: string
  players: string[]
}

/** Экран начала Alias — ровно в таком виде лежит в localStorage. */
export interface AliasSetup {
  /** 2…4, по умолчанию 2. Отдельного списка игроков нет: состав — объединение `players` команд. */
  teams: AliasTeam[]
  /** До скольки очков играть, по умолчанию 30. */
  target: 20 | 30 | 50 | 75
  /** Длительность хода в секундах, по умолчанию 60. */
  turnSeconds: 30 | 45 | 60 | 90
  /** Отмеченные уровни, по умолчанию ['easy', 'normal']; пустой список допустим — тогда начать нельзя. */
  levels: AliasLevel[]
  skipPenalty: boolean
  sound: boolean
}

/** Партия Alias. Правила и команды снимаются с экрана начала на старте и дальше от него не зависят. */
export interface AliasGame {
  lang: Lang
  rules: Pick<AliasSetup, 'target' | 'turnSeconds' | 'levels' | 'skipPenalty' | 'sound'>
  /** `nextExplainer` — индекс в `players` того, кто объясняет в следующий ход команды. */
  teams: (AliasTeam & { score: number; nextExplainer: number })[]
  /** Индекс команды, которая ходит. */
  turn: number
  /** Имя игрока → слов, засчитанных его команде за его ходы. */
  explained: Record<string, number>
  finished: boolean
}

/** Тон данетки: мрачные — про смерти и преступления, по умолчанию не выдаются. */
export const DANETKA_TONES = ['light', 'dark'] as const
export type DanetkaTone = (typeof DANETKA_TONES)[number]

export interface Danetka {
  /** Стабилен навсегда: по нему хранится прогресс; удалённый id не переиспользуется. */
  id: number
  title: string
  tone: DanetkaTone
  story: string
  answer: string
  /** Откуда взята; в интерфейсе не показывается. */
  source: string
}

/** Состояние «Данеток» — ровно в таком виде лежит в localStorage. */
export interface DanetkiState {
  /** Мрачные истории в наборе, по умолчанию false. */
  dark: boolean
  /** id историй, у которых открывали ответ. */
  played: Record<Lang, number[]>
  /** Текущая история языка; null — не выдана. */
  current: Record<Lang, number | null>
}
