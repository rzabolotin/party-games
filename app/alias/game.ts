import { ALIAS_LEVELS, LANGS, type AliasGame, type AliasSetup, type Lang } from '~/types'
import { teamPresets } from '~/alias/levels'
import { TARGETS, TURN_SECONDS } from '~/composables/useAliasSetup'

const STORAGE_KEY = 'koster.alias-game'

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

  // Ход вернулся к первой команде — круг закрыт, у всех поровну ходов. Ничья на первом месте — ещё круг.
  if (game.turn === 0 && Math.max(...game.teams.map((item) => item.score)) >= game.rules.target) {
    game.finished = leaders(game).length === 1
  }
}

/** Индексы команд с наибольшим счётом: одна — победитель, несколько — ничья. */
export function leaders(game: AliasGame): number[] {
  const top = Math.max(...game.teams.map((team) => team.score))
  return game.teams.flatMap((team, index) => (team.score === top ? [index] : []))
}

/** «Кто сколько объяснил» по убыванию; при равенстве — в порядке команд. `best` — у всех, кто делит первое место. */
export function explainedTable(game: AliasGame): { name: string; team: number; count: number; best: boolean }[] {
  const rows = game.teams.flatMap((team, index) =>
    team.players.map((name) => ({ name, team: index, count: game.explained[name] ?? 0 })),
  )
  rows.sort((a, b) => b.count - a.count)
  // Никто ничего не объяснил (закончили досрочно до первого слова) — лучшего нет.
  const top = Math.max(0, ...rows.map((row) => row.count))
  return rows.map((row) => ({ ...row, best: top > 0 && row.count === top }))
}

/** «Реванш»: те же команды и правила, счёт и статистика с нуля, объясняющие с первого. */
export function rematch(game: AliasGame): AliasGame {
  return newGame({ ...game.rules, teams: game.teams }, game.lang)
}

/** Сохранённая партия или `null`, если её нет или запись битая: режим без неё просто начинается с экрана начала. */
export function loadGame(): AliasGame | null {
  try {
    return parseGame(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null'))
  } catch {
    return null
  }
}

/** Пишется только между ходами: после «Подтвердить», на старте, реванше и «Закончить досрочно». */
export function saveGame(game: AliasGame) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(game))
  } catch {
    // Хранилище недоступно или переполнено — партия живёт до перезагрузки.
  }
}

export function clearGame() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Нечего стирать.
  }
}

/** Партия проходит, только если цела вся: иначе ход упадёт посреди игры на пустой команде или уровне. */
function parseGame(raw: unknown): AliasGame | null {
  if (!isRecord(raw) || !isRecord(raw.rules) || !Array.isArray(raw.teams) || !isRecord(raw.explained)) return null
  const { rules } = raw
  const lang = oneOf(raw.lang, LANGS)
  const target = oneOf(rules.target, TARGETS)
  const turnSeconds = oneOf(rules.turnSeconds, TURN_SECONDS)
  if (lang === null || target === null || turnSeconds === null) return null
  if (typeof rules.skipPenalty !== 'boolean' || typeof rules.sound !== 'boolean') return null
  if (!Array.isArray(rules.levels) || rules.levels.length === 0) return null
  if (!rules.levels.every((level) => oneOf(level, ALIAS_LEVELS) !== null)) return null
  const levels = ALIAS_LEVELS.filter((level) => (rules.levels as unknown[]).includes(level))

  if (raw.teams.length < 2 || raw.teams.length > teamPresets.length) return null
  const teams: AliasGame['teams'] = []
  for (const team of raw.teams) {
    if (!isRecord(team) || typeof team.emoji !== 'string' || typeof team.name !== 'string') return null
    if (!Array.isArray(team.players) || team.players.length === 0) return null
    if (!team.players.every((name) => typeof name === 'string' && name !== '')) return null
    if (!Number.isInteger(team.score) || !Number.isInteger(team.nextExplainer)) return null
    const nextExplainer = team.nextExplainer as number
    if (nextExplainer < 0 || nextExplainer >= team.players.length) return null
    teams.push({
      emoji: team.emoji,
      name: team.name,
      players: [...(team.players as string[])],
      score: team.score as number,
      nextExplainer,
    })
  }

  const turn = raw.turn
  if (!Number.isInteger(turn) || (turn as number) < 0 || (turn as number) >= teams.length) return null
  if (typeof raw.finished !== 'boolean') return null
  const explained: Record<string, number> = {}
  for (const [name, count] of Object.entries(raw.explained)) {
    if (!Number.isInteger(count)) return null
    explained[name] = count as number
  }

  return {
    lang,
    rules: { target, turnSeconds, levels, skipPenalty: rules.skipPenalty, sound: rules.sound },
    teams,
    turn: turn as number,
    explained,
    finished: raw.finished,
  }
}

function oneOf<T>(value: unknown, allowed: readonly T[]): T | null {
  return (allowed as readonly unknown[]).includes(value) ? (value as T) : null
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
