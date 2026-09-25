// Только type-импорты: этот файл читает не только Vite, но и Node-скрипт проверки
// контента, а алиас `~/types` Node не разрешает (типы он просто срезает).
import type { CountedRoleId, MafiaRole, RoleId } from '~/types'

/**
 * Справочник ролей «Мафии». В отличие от колод, набор ролей общий для обоих языков,
 * поэтому языковые варианты лежат внутри роли, а не в отдельных файлах по языкам.
 * Порядок массива — порядок на экране состава и в сводке; мирный последний, он остаток.
 */
export const roles: MafiaRole[] = [
  {
    id: 'mafia',
    emoji: '🎭',
    faction: 'mafia',
    counted: true,
    unique: false,
    nightOrder: 1,
    title: { ru: 'Мафия', en: 'Mafia' },
    tagline: {
      ru: 'Играешь за мафию. Побеждаете, когда вас столько же, сколько остальных.',
      en: 'You play for the mafia. You win when your team matches the rest of the table.',
    },
    description: {
      ru: 'Ночью просыпаешься вместе с другой мафией, и вы молча выбираете, кого вывести из игры. Днём говоришь как обычный житель и стараешься не выдать своих.',
      en: 'At night you wake with the other mafia and you silently pick who leaves the game. By day you talk like any other townsfolk and keep your team hidden.',
    },
  },
  {
    id: 'don',
    emoji: '🎩',
    faction: 'mafia',
    counted: true,
    unique: true,
    requiresMafia: true,
    nightOrder: 2,
    title: { ru: 'Дон', en: 'Don' },
    tagline: {
      ru: 'Главный в мафии. Побеждаешь вместе с ней.',
      en: 'You lead the mafia. You win together with them.',
    },
    description: {
      ru: 'Ночью просыпаешься с мафией, а потом ещё раз — проверить, не комиссар ли перед тобой. Днём держишься как самый спокойный человек за столом.',
      en: 'At night you wake with the mafia, then open your eyes once more to check whether a player is the detective. By day you act like the calmest person here.',
    },
  },
  {
    id: 'detective',
    emoji: '🕵️',
    faction: 'town',
    counted: true,
    unique: true,
    nightOrder: 3,
    title: { ru: 'Комиссар', en: 'Detective' },
    tagline: {
      ru: 'Играешь за город. Побеждаете, когда мафии не осталось.',
      en: 'You play for the town. You win when no mafia is left.',
    },
    description: {
      ru: 'Ночью проверяешь одного игрока, и ведущий показывает, мафия он или нет. Днём решаешь, открываться ли: город поверит, но и мафия услышит.',
      en: 'At night you check one player and the host shows you whether they are mafia. By day you decide when to speak up: the town will listen, but so will the mafia.',
    },
  },
  {
    id: 'doctor',
    emoji: '🩺',
    faction: 'town',
    counted: true,
    unique: true,
    nightOrder: 4,
    title: { ru: 'Доктор', en: 'Doctor' },
    tagline: {
      ru: 'Играешь за город. Побеждаете, когда мафии не осталось.',
      en: 'You play for the town. You win when no mafia is left.',
    },
    description: {
      ru: 'Ночью выбираешь, кого уберечь: выбранного этой ночью из игры не выведут. Себя можно спасти только один раз за партию.',
      en: 'At night you choose someone to protect, and that player survives the night. You may save yourself only once per game.',
    },
  },
  {
    id: 'maniac',
    emoji: '🃏',
    faction: 'solo',
    counted: true,
    unique: true,
    nightOrder: 5,
    title: { ru: 'Маньяк', en: 'Maniac' },
    tagline: {
      ru: 'Играешь сам за себя. Побеждаешь, когда остаёшься последним.',
      en: 'You play for yourself. You win when you are the last one standing.',
    },
    description: {
      ru: 'Ночью выбираешь одного игрока и выводишь его из игры. Днём подыгрываешь обеим сторонам: тебе выгодно, чтобы город и мафия мешали друг другу.',
      en: 'At night you pick one player and take them out of the game. By day you help both sides a little, so the town and the mafia keep fighting each other.',
    },
  },
  {
    id: 'civilian',
    emoji: '🙂',
    faction: 'town',
    counted: false,
    unique: false,
    title: { ru: 'Мирный житель', en: 'Civilian' },
    tagline: {
      ru: 'Играешь за город. Побеждаете, когда мафии не осталось.',
      en: 'You play for the town. You win when no mafia is left.',
    },
    description: {
      ru: 'Ночью спишь и ничего не выбираешь. Днём слушаешь, споришь и голосуешь: твоё оружие — внимание и логика.',
      en: 'At night you sleep and choose nothing. By day you listen, argue and vote: attention and logic are all you have.',
    },
  },
]

/** Роли со счётчиком на экране состава, в порядке справочника. */
export const countedRoles: MafiaRole[] = roles.filter((role) => role.counted)

/** Идентификаторы ролей со счётчиком — по ним же строится `counts` в составе. */
export const COUNTED_ROLE_IDS = countedRoles.map((role) => role.id as CountedRoleId)

/** Остаточная роль: ею добирается состав до общего числа игроков. */
export const fillerRole: MafiaRole = roles.find((role) => !role.counted) ?? roles[roles.length - 1]!

export function getRole(id: RoleId): MafiaRole {
  return roles.find((role) => role.id === id) ?? roles[0]!
}

export function isRoleId(value: unknown): value is RoleId {
  return roles.some((role) => role.id === value)
}
