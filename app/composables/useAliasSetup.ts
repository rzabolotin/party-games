import { computed, reactive, watch } from 'vue'
import { ALIAS_LEVELS, type AliasLevel, type AliasSetup, type AliasTeam, type Lang } from '~/types'
import { levels, teamPresets } from '~/alias/levels'
import { useSettings } from '~/composables/useSettings'

export const ALIAS_MIN_PLAYERS = 4
export const ALIAS_MAX_PLAYERS = 20
export const ALIAS_MIN_TEAM = 2
export const MIN_TEAMS = 2
export const MAX_TEAMS = teamPresets.length
export const TARGETS = [20, 30, 50, 75] as const
export const TURN_SECONDS = [30, 45, 60, 90] as const

const STORAGE_KEY = 'koster.alias'

let state: AliasSetup | undefined

/**
 * Экран начала Alias: один реактивный объект, один ключ localStorage, читается один раз
 * при первом обращении, каждое изменение сразу пишется обратно.
 * Состав при первом запуске берётся из ⚙️, дальше два списка друг от друга не зависят.
 */
export function useAliasSetup() {
  const settings = useSettings()
  if (!state) {
    state = reactive(load(settings.players, settings.lang))
    // Первый состав пишется сразу: иначе до первой правки он собирался бы из ⚙️ заново.
    save(state)
    watch(state, save, { deep: true })
    // Непереименованные команды зовутся на текущем языке.
    watch(
      () => settings.lang,
      (lang) => localizeNames(state!.teams, lang),
    )
  }
  const setup = state

  const players = computed(() => setup.teams.flatMap((team) => team.players))

  /** Почему нельзя начать; проверки идут в этом порядке. */
  const blocker = computed<'fewPlayers' | 'smallTeam' | 'noLevels' | null>(() => {
    if (players.value.length < ALIAS_MIN_PLAYERS) return 'fewPlayers'
    if (setup.teams.some((team) => team.players.length < ALIAS_MIN_TEAM)) return 'smallTeam'
    if (setup.levels.length === 0) return 'noLevels'
    return null
  })

  /** Имя после обрезки пробелов; пустое, дубль без учёта регистра и 21-й игрок не добавляются. */
  function canAddPlayer(name: string): boolean {
    const trimmed = name.trim()
    return trimmed !== '' && players.value.length < ALIAS_MAX_PLAYERS && !hasName(players.value, trimmed)
  }

  /** Новый игрок — в самую маленькую команду, при равенстве в первую из них. */
  function addPlayer(name: string): boolean {
    if (!canAddPlayer(name)) return false
    smallest(setup.teams).players.push(name.trim())
    return true
  }

  function removePlayer(teamIndex: number, playerIndex: number) {
    setup.teams[teamIndex]?.players.splice(playerIndex, 1)
  }

  /** Тап по игроку: он уходит в конец следующей команды по кругу. */
  function movePlayer(teamIndex: number, playerIndex: number) {
    const [name] = setup.teams[teamIndex]?.players.splice(playerIndex, 1) ?? []
    if (name === undefined) return
    setup.teams[(teamIndex + 1) % setup.teams.length]!.players.push(name)
  }

  /** Фишер–Йетс, затем раскладка через одного: команды отличаются не больше чем на человека. */
  function shuffle(random = Math.random) {
    const all = [...players.value]
    for (let i = all.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1))
      ;[all[i], all[j]] = [all[j]!, all[i]!]
    }
    setup.teams.forEach((team, index) => {
      team.players = all.filter((_, position) => position % setup.teams.length === index)
    })
  }

  function canAddTeam(): boolean {
    return setup.teams.length < MAX_TEAMS
  }

  /** Добавляется пустая команда со следующими эмодзи и названием. */
  function addTeam() {
    if (!canAddTeam()) return
    setup.teams.push(presetTeam(setup.teams.length, settings.lang))
  }

  function canRemoveTeam(): boolean {
    return setup.teams.length > MIN_TEAMS
  }

  /** Удаляется только последняя команда; её игроки по одному уходят в самые маленькие из оставшихся. */
  function removeTeam() {
    if (!canRemoveTeam()) return
    const removed = setup.teams.pop()!
    for (const name of removed.players) smallest(setup.teams).players.push(name)
  }

  /** Пустое название не принимается — остаётся прежнее. */
  function renameTeam(teamIndex: number, name: string) {
    const team = setup.teams[teamIndex]
    const trimmed = name.trim()
    if (team && trimmed !== '') team.name = trimmed
  }

  /** Отметка уровня; порядок в списке — порядок справочника, чтобы сохранённое не зависело от кликов. */
  function toggleLevel(id: AliasLevel) {
    const on = new Set(setup.levels)
    if (on.has(id)) on.delete(id)
    else on.add(id)
    setup.levels = levels.map((level) => level.id).filter((levelId) => on.has(levelId))
  }

  return {
    setup,
    players,
    blocker,
    canAddPlayer,
    addPlayer,
    removePlayer,
    movePlayer,
    shuffle,
    canAddTeam,
    addTeam,
    canRemoveTeam,
    removeTeam,
    renameTeam,
    toggleLevel,
  }
}

function presetTeam(index: number, lang: Lang): AliasTeam {
  const preset = teamPresets[index]!
  return { emoji: preset.emoji, name: preset.name[lang], players: [] }
}

/** Первая из самых маленьких команд. */
function smallest(teams: AliasTeam[]): AliasTeam {
  return teams.reduce((min, team) => (team.players.length < min.players.length ? team : min))
}

function hasName(names: string[], name: string): boolean {
  const lower = name.toLowerCase()
  return names.some((existing) => existing.toLowerCase() === lower)
}

/** Название по умолчанию на любом языке меняется на название на текущем; своё не трогается. */
function localizeNames(teams: AliasTeam[], lang: Lang) {
  teams.forEach((team, index) => {
    const preset = teamPresets[index]
    if (preset && Object.values(preset.name).includes(team.name)) team.name = preset.name[lang]
  })
}

/** Две команды, игроки из ⚙️ через одного: без пустых, дублей и сверх потолка. */
function defaultTeams(settingsPlayers: string[], lang: Lang): AliasTeam[] {
  const names: string[] = []
  for (const raw of settingsPlayers) {
    const name = raw.trim()
    if (name !== '' && names.length < ALIAS_MAX_PLAYERS && !hasName(names, name)) names.push(name)
  }
  const teams = [presetTeam(0, lang), presetTeam(1, lang)]
  names.forEach((name, index) => teams[index % teams.length]!.players.push(name))
  return teams
}

function defaults(settingsPlayers: string[], lang: Lang): AliasSetup {
  return {
    teams: defaultTeams(settingsPlayers, lang),
    target: 30,
    turnSeconds: 60,
    levels: ['easy', 'normal'],
    skipPenalty: true,
    sound: true,
  }
}

/**
 * Читает сохранённый экран начала. Поля настроек независимы: битое заменяется своим дефолтом,
 * неизвестные уровни отбрасываются. Команды — целиком или дефолт целиком: половина отсюда
 * и половина оттуда даёт дубли имён.
 */
function load(settingsPlayers: string[], lang: Lang): AliasSetup {
  let raw: unknown
  try {
    raw = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')
  } catch {
    raw = null
  }
  const fallback = defaults(settingsPlayers, lang)
  if (!isRecord(raw)) return fallback

  const teams = parseTeams(raw.teams) ?? fallback.teams
  localizeNames(teams, lang)
  const target = oneOf(raw.target, TARGETS) ?? fallback.target
  const turnSeconds = oneOf(raw.turnSeconds, TURN_SECONDS) ?? fallback.turnSeconds
  const saved = Array.isArray(raw.levels) ? new Set<unknown>(raw.levels) : null
  const picked = saved ? ALIAS_LEVELS.filter((id) => saved.has(id)) : fallback.levels
  const skipPenalty = typeof raw.skipPenalty === 'boolean' ? raw.skipPenalty : fallback.skipPenalty
  const sound = typeof raw.sound === 'boolean' ? raw.sound : fallback.sound

  return { teams, target, turnSeconds, levels: picked, skipPenalty, sound }
}

/** Команды проходят, только если целы все: число, эмодзи по местам, названия, имена без дублей. */
function parseTeams(value: unknown): AliasTeam[] | null {
  if (!Array.isArray(value) || value.length < MIN_TEAMS || value.length > MAX_TEAMS) return null
  const seen: string[] = []
  const teams: AliasTeam[] = []
  for (const [index, item] of value.entries()) {
    if (!isRecord(item) || item.emoji !== teamPresets[index]!.emoji) return null
    if (typeof item.name !== 'string' || item.name.trim() === '') return null
    if (!Array.isArray(item.players)) return null
    const players: string[] = []
    for (const name of item.players) {
      if (typeof name !== 'string' || name.trim() !== name || name === '' || hasName(seen, name)) return null
      seen.push(name)
      players.push(name)
    }
    teams.push({ emoji: item.emoji, name: item.name.trim(), players })
  }
  return seen.length <= ALIAS_MAX_PLAYERS ? teams : null
}

function save(setup: AliasSetup) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(setup))
  } catch {
    // Хранилище недоступно или переполнено — состав живёт до перезагрузки.
  }
}

function oneOf<T>(value: unknown, allowed: readonly T[]): T | null {
  return (allowed as readonly unknown[]).includes(value) ? (value as T) : null
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
