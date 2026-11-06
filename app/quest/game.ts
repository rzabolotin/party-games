// Только type-импорты: правила партии Quest без Vue и хранилища.
import type { QuestGame, QuestLineup, QuestResult, QuestTale, QuestTexts } from '~/types'

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

/** Текст исхода: успех; провал от одной карты; провал от двух и больше. */
export function outcomeText(tale: QuestTale, result: QuestResult): string {
  if (result.success) return tale.success
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
