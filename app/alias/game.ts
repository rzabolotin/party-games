import type { AliasGame, AliasSetup, Lang } from '~/types'

/** Отметки хода в том виде, в каком их правят на разборе. */
export interface AliasTurn {
  /** Слова хода по порядку показа, кроме последнего. */
  words: { word: string; guessed: boolean }[]
  /** Слово, которое было на экране, когда вышло время; `team` — кто угадал первым, `null` — никто. */
  last: { word: string; team: number | null }
}

/** Новая партия: правила и команды копируются, чтобы правки экрана начала её не трогали. */
export function newGame(setup: AliasSetup, lang: Lang): AliasGame {
  const { target, turnSeconds, levels, skipPenalty, sound } = setup
  return {
    lang,
    rules: { target, turnSeconds, levels: [...levels], skipPenalty, sound },
    teams: setup.teams.map((team) => ({ ...team, players: [...team.players], score: 0, nextExplainer: 0 })),
    turn: 0,
    explained: Object.fromEntries(setup.teams.flatMap((team) => team.players).map((name) => [name, 0])),
    finished: false,
  }
}

/** Кто объясняет в текущий ход. */
export function explainerOf(game: AliasGame): string {
  const team = game.teams[game.turn]!
  return team.players[team.nextExplainer % team.players.length]!
}

/**
 * Итог хода по командам. Ходящей — «✓» минус «✗», если штраф включён, иначе только «✓»;
 * может быть отрицательным. Последнее слово даёт +1 выбранной команде, при «Никто» — ничего.
 */
export function turnDeltas(game: AliasGame, turn: AliasTurn): number[] {
  const guessed = turn.words.filter((item) => item.guessed).length
  const skipped = turn.words.length - guessed
  const deltas = game.teams.map(() => 0)
  deltas[game.turn] = guessed - (game.rules.skipPenalty ? skipped : 0)
  if (turn.last.team !== null) deltas[turn.last.team]! += 1
  return deltas
}

/**
 * «Подтвердить» на разборе: очки в счёт, объясняющему — его «✓» и последнее слово, если его
 * угадала своя команда; объясняющий команды сдвигается по кругу, ход переходит следующей.
 */
export function applyTurn(game: AliasGame, turn: AliasTurn) {
  const deltas = turnDeltas(game, turn)
  game.teams.forEach((team, index) => {
    team.score += deltas[index]!
  })

  const team = game.teams[game.turn]!
  const name = explainerOf(game)
  const own = turn.words.filter((item) => item.guessed).length + (turn.last.team === game.turn ? 1 : 0)
  game.explained[name] = (game.explained[name] ?? 0) + own

  team.nextExplainer = (team.nextExplainer + 1) % team.players.length
  game.turn = (game.turn + 1) % game.teams.length
}
