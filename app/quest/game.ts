// Только type-импорты из `~/types` и относительный импорт с расширением: правила партии Quest без Vue и хранилища.
import type { QuestBridgeKind, QuestFinaleKind, QuestGame, QuestLineup, QuestResult, QuestRoleId, QuestTale, QuestTexts } from '~/types'
import { HIDDEN_MAX_PLAYERS } from './lineups.ts'

/** Добро побеждает после стольких успехов. */
export const GOOD_WINS = 3

/** Порог провалов, после которого наступает Финальный совет: 3, при 4 игроках 2. */
export function evilThreshold(players: number): number {
  return players === 4 ? 2 : 3
}

/** Поход провален, если карт «Провал» не меньше, чем нужно: 2 при «нужно 2 провала», иначе 1. */
export function isSuccess(fails: number, doubleFail: boolean): boolean {
  return fails < (doubleFail ? 2 : 1)
}

/** Текст исхода: успех; успех, несмотря на одну карту «Провал»; провал от одной карты; провал от двух и больше. */
export function outcomeText(tale: QuestTale, result: QuestResult): string {
  if (result.success) return result.fails > 0 ? tale.successNarrow : tale.success
  return result.fails >= 2 ? tale.failHeavy : tale.fail
}

export function score(game: Pick<QuestGame, 'quests'>): { good: number; evil: number } {
  const good = game.quests.filter((quest) => quest.success).length
  return { good, evil: game.quests.length - good }
}

/** Чем решилась партия по счёту: добро набрало успехи, зло — порог провалов, или ещё ничем. */
export function decided(game: Pick<QuestGame, 'quests' | 'players'>): 'good' | 'evil' | null {
  const { good, evil } = score(game)
  if (good >= GOOD_WINS) return 'good'
  if (evil >= evilThreshold(game.players)) return 'evil'
  return null
}

/** Кто победил в каждом финале. «Все ветераны злые» — победа добра: злу нельзя вести все походы самому. */
export const FINALE_WINNER: Record<QuestFinaleKind, 'good' | 'evil'> = {
  goodQuests: 'good',
  huntWon: 'evil',
  huntLost: 'good',
  lastChanceGood: 'good',
  lastChanceEvil: 'evil',
  veteransEvil: 'good',
}

/** Финальный совет длится 5 минут. */
export const COUNCIL_SECONDS = 5 * 60

/** Роли с вмешательством в Последний шанс — их строки подсказки показываются, только если роль в составе. */
export const LAST_CHANCE_ROLES = ['duke', 'archduke', 'apprentice', 'mutineer'] as const satisfies readonly QuestRoleId[]

/** Финал: случайный вариант текста; он сохраняется в партии, чтобы после перезагрузки звучал тот же. */
export function finale(texts: QuestTexts, kind: QuestFinaleKind): NonNullable<QuestGame['finale']> {
  return { kind, variant: randomIndex(texts.finales[kind].length) }
}

/** Строки ролей состава из словаря вставок, в порядке справочника. */
function roleLines(lines: Partial<Record<QuestRoleId, string>>, roles: QuestLineup): string[] {
  return (Object.keys(roles) as QuestRoleId[]).filter((id) => roles[id] > 0).flatMap((id) => lines[id] ?? [])
}

/** Вставки в финал по ролям состава. */
export function finaleRoleLines(texts: QuestTexts, roles: QuestLineup): string[] {
  return roleLines(texts.finaleRoleLines, roles)
}

/**
 * Строки ролей вступления по составу, затем — при 4–5 игроках — строка про роль,
 * что лежит рубашкой вверх. «Кто есть кто» и сам текст вступления идут перед ними.
 */
export function introLines(texts: QuestTexts, roles: QuestLineup, players: number): string[] {
  const lines = roleLines(texts.introRoleLines, roles)
  return players <= HIDDEN_MAX_PLAYERS ? [...lines, texts.introHiddenLine] : lines
}

/**
 * Связка перед завязкой по счёту, по приоритету: обе стороны в шаге от победы → зло в шаге →
 * добро в шаге → первый поход; иначе связки нет. Вариант выбирается по id похода,
 * чтобы после перезагрузки звучал тот же.
 */
export function bridge(texts: QuestTexts, game: Pick<QuestGame, 'quests' | 'players' | 'currentTaleId'>): string | null {
  const { good, evil } = score(game)
  const goodOnBrink = good === GOOD_WINS - 1
  const evilOnBrink = evil === evilThreshold(game.players) - 1
  const kind: QuestBridgeKind | null =
    goodOnBrink && evilOnBrink
      ? 'decisive'
      : evilOnBrink
        ? 'evilOnBrink'
        : goodOnBrink
          ? 'goodOnBrink'
          : game.quests.length === 0
            ? 'first'
            : null
  if (!kind) return null
  const variants = texts.bridges[kind]
  return variants[(game.currentTaleId ?? 0) % variants.length] ?? null
}

/** Новая партия: вступление, походов ещё нет. */
export function newGame(texts: QuestTexts, roles: QuestLineup, players: number): QuestGame {
  return {
    roles: { ...roles },
    players,
    introId: pick(texts.intros).id,
    phase: 'intro',
    quests: [],
    currentTaleId: null,
    finale: null,
  }
}

/**
 * Следующий поход: случайный из несыгранных и не встречавшихся в партии.
 * Несыгранных не осталось — сыгранные очищаются, кроме походов этой партии, и выбор повторяется.
 * Возвращает id похода и новый список сыгранных.
 */
export function drawTale(
  texts: QuestTexts,
  played: readonly number[],
  game: Pick<QuestGame, 'quests' | 'currentTaleId'>,
): { taleId: number; played: number[] } {
  const inGame = new Set(game.quests.map((quest) => quest.taleId))
  if (game.currentTaleId !== null) inGame.add(game.currentTaleId)
  const fresh = (skip: Set<number>) => texts.tales.filter((tale) => !skip.has(tale.id) && !inGame.has(tale.id))

  let candidates = fresh(new Set(played))
  let nextPlayed = [...played]
  if (candidates.length === 0) {
    nextPlayed = nextPlayed.filter((id) => inGame.has(id))
    candidates = fresh(new Set())
  }
  // Походов меньше, чем в партии, — повтор лучше пустого экрана.
  if (candidates.length === 0) candidates = texts.tales.filter((tale) => tale.id !== game.currentTaleId)
  if (candidates.length === 0) candidates = texts.tales
  return { taleId: pick(candidates).id, played: nextPlayed }
}

/** Индекс случайного варианта текста. */
export function randomIndex(length: number): number {
  return Math.floor(Math.random() * length)
}

function pick<T>(list: readonly T[]): T {
  return list[randomIndex(list.length)]!
}
