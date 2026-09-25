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
  id: RoleId
  emoji: string
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
