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

/**
 * Роли Quest; порядок массива — порядок на экране состава: сначала добро, потом зло.
 * Артур, Ученик и роли после Охотника — из коробки, в таблице Director's Cut их нет.
 * `duke-alt` удалён — id не переиспользуется.
 */
export const QUEST_ROLE_IDS = [
  'servant',
  'cleric',
  'arthur',
  'youth',
  'troublemaker',
  'duke',
  'archduke',
  'apprentice',
  'minion',
  'morgan',
  'hunter',
  'scion',
  'brute',
  'lunatic',
  'revealer',
  'trickster',
  'mutineer',
  'changeling',
] as const
export type QuestRoleId = (typeof QUEST_ROLE_IDS)[number]

export const QUEST_SIDES = ['good', 'evil'] as const
export type QuestSide = (typeof QUEST_SIDES)[number]

/** Роль Quest в справочнике. Режим только на русском, поэтому тексты — строки, а не по языкам. */
export interface QuestRole {
  id: QuestRoleId
  side: QuestSide
  /** «Клирик». */
  title: string
  /** «Cleric» — название на английских картах, показывается в скобках. */
  original: string
  /** Способность своими словами, по правилам Director's Cut. */
  ability: string
  /** Карта в единственном экземпляре: все, кроме слуги и приспешника. */
  unique: boolean
}

/** Состав роли → сколько карт. */
export type QuestLineup = Record<QuestRoleId, number>

/** Настройка Quest — ровно в таком виде лежит в `koster.quest.setup`. */
export interface QuestSetup {
  /** 4…12, по умолчанию 5. */
  players: number
  /** Состав, поправленный вручную; null — по таблице. */
  roles: Partial<QuestLineup> | null
}

/** Поход: название, завязка и три исхода. `id` — ключ прогресса, не перенумеровывается. */
export interface QuestTale {
  id: number
  title: string
  setup: string
  /** Поход удался. */
  success: string
  /** Провал от одной карты «Провал». */
  fail: string
  /** Провал от двух карт и больше. */
  failHeavy: string
}

/** Связки по счёту; `decisive` — обе стороны в шаге от победы. */
export const QUEST_BRIDGE_KINDS = ['first', 'goodOnBrink', 'evilOnBrink', 'decisive'] as const
export type QuestBridgeKind = (typeof QUEST_BRIDGE_KINDS)[number]

export interface QuestIntro {
  id: number
  text: string
}

export const QUEST_FINALE_KINDS = [
  'goodQuests',
  'huntWon',
  'huntLost',
  'lastChanceGood',
  'lastChanceEvil',
  'veteransEvil',
] as const
export type QuestFinaleKind = (typeof QUEST_FINALE_KINDS)[number]

/** Роли, которые на колокол глаз не открывают: злых не знают, злые не знают их. */
export const QUEST_NIGHT_OUTSIDERS = ['mutineer', 'changeling', 'scion'] as const satisfies readonly QuestRoleId[]

/** Тексты ночи Quest. */
export interface QuestNightTexts {
  /** Экран гаснет, все закрывают глаза. */
  start: string
  /** Колокол: злодеи узнают друг друга. */
  evil: string
  /** Палец Охотника — при 4–5 игроках с Охотником в составе, в абзаце колокола. */
  hunter: string
  /** Кто на колокол глаз не открывает — строки ролей состава, в абзаце колокола. */
  outsiders: Record<(typeof QUEST_NIGHT_OUTSIDERS)[number], string>
  /** Арфа: Моргана узнаёт Отпрыска — если Отпрыск в составе. */
  scion: string
  /** Гонг: Артур узнаёт Моргану — если Артур в составе. */
  arthur: string
  /** Рог: Клирик и палец первого лидера. */
  cleric: string
  /** Плут-лидер может не поднять палец — если Плут в составе, в абзаце рога. */
  trickster: string
  /** Фанфары. */
  end: string
}

/** Тексты Quest на одном языке. */
export interface QuestTexts {
  tales: QuestTale[]
  /** По 2–3 варианта на вид. */
  bridges: Record<QuestBridgeKind, string[]>
  intros: QuestIntro[]
  /** Вставки во вступление по ролям состава. */
  introRoleLines: Partial<Record<QuestRoleId, string>>
  /** Про роль рубашкой вверх, при 4–5 игроках. */
  introHiddenLine: string
  /** Объяснение ночи по шагам: каждый шаг — отдельный абзац, шагов без своих ролей нет. */
  night: QuestNightTexts
  council: string
  /** Вслед за текстом совета, если Разоблачённый в составе. */
  councilRevealerLine: string
  /** По 2 варианта на вид. */
  finales: Record<QuestFinaleKind, string[]>
  finaleRoleLines: Partial<Record<QuestRoleId, string>>
}

export const QUEST_PHASES = ['intro', 'night', 'quest', 'outcome', 'handoff', 'council', 'lastChance', 'finale'] as const
export type QuestPhase = (typeof QUEST_PHASES)[number]

/** Сыгранный поход партии. `fails` — число карт «Провал», «3+» записывается как 3. */
export interface QuestResult {
  taleId: number
  fails: number
  doubleFail: boolean
  success: boolean
}

/** Незаконченная партия — ровно в таком виде лежит в `koster.quest.game`. */
export interface QuestGame {
  /** Снимок состава на старте: правка настройки партию не меняет. */
  roles: QuestLineup
  players: number
  introId: number
  phase: QuestPhase
  /** Походы партии по порядку. На фазе `outcome` последний — только что введённый, «Отменить» его снимает. */
  quests: QuestResult[]
  /** Поход на столе; null — на вступлении. */
  currentTaleId: number | null
  finale: { kind: QuestFinaleKind; variant: number } | null
}

/** Состояние Quest в localStorage. */
export interface QuestState {
  setup: QuestSetup
  /** id походов, сыгранных в прошлых партиях и уже сыгранных в текущей. */
  playedTales: number[]
  /** Незаконченная партия; null — нет. */
  game: QuestGame | null
}
