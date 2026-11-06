import { computed, effectScope, reactive, watch, type EffectScope } from 'vue'
import {
  QUEST_FINALE_KINDS,
  QUEST_PHASES,
  QUEST_ROLE_IDS,
  type QuestFinaleKind,
  type QuestGame,
  type QuestLineup,
  type QuestPhase,
  type QuestResult,
  type QuestRoleId,
  type QuestSetup,
  type QuestState,
  type QuestTexts,
} from '~/types'
import {
  EITHER_MIN_PLAYERS,
  HIDDEN_MAX_PLAYERS,
  QUEST_MAX_PLAYERS,
  QUEST_MIN_PLAYERS,
  expectedCards,
  standardLineup,
} from '~/quest/lineups'
import { getQuestRole } from '~/quest/roles'
import { decided, drawTale, isSuccess, newGame, randomIndex } from '~/quest/game'
import { questTexts } from '~/quest/texts'

const STORAGE_KEY = 'koster.quest'
/** Потолок счётчика у неуникальных ролей: больше карт, чем игроков, не бывает. */
const MAX_COUNT = QUEST_MAX_PLAYERS

let state: QuestState | undefined
/** Своя область эффектов: наблюдатель за сохранением не должен умирать вместе с экраном, который первым позвал `useQuest`. */
let savingScope: EffectScope | undefined

/**
 * Quest: один реактивный объект, один ключ localStorage, читается один раз
 * при первом обращении, каждое изменение сразу пишется обратно — как «Шпион» и Данетки.
 */
export function useQuest() {
  if (!state) {
    const loaded = reactive(load())
    state = loaded
    savingScope = effectScope(true)
    savingScope.run(() => watch(loaded, save, { deep: true }))
  }
  const quest = state
  const setup = quest.setup

  /** Состав по таблице для текущего числа игроков и переключателя. */
  const standard = computed(() => standardLineup(setup))

  /** Состав, которым будут играть: ручной, если его правили, иначе по таблице. */
  const lineup = computed<QuestLineup>(() => (setup.roles ? fill(setup.roles) : standard.value))

  const cards = computed(() => QUEST_ROLE_IDS.reduce((sum, id) => sum + lineup.value[id], 0))
  const expected = computed(() => expectedCards(setup.players))

  /** Состав отличается от таблицы — предупреждение, но начать можно. */
  const nonStandard = computed(() => QUEST_ROLE_IDS.some((id) => lineup.value[id] !== standard.value[id]))
  /** Сумма карт не сходится с числом игроков — тоже предупреждение, решение за столом. */
  const wrongCount = computed(() => cards.value !== expected.value)

  /** При 4–5 игроках одна роль добра лежит рубашкой вверх. */
  const hasHidden = computed(() => setup.players <= HIDDEN_MAX_PLAYERS)
  /** Переключатель «Юнец / Смутьян» есть только там, где в таблице «1 of either». */
  const hasEither = computed(() => setup.players >= EITHER_MIN_PLAYERS)

  function canChangePlayers(delta: number): boolean {
    const next = setup.players + delta
    return next >= QUEST_MIN_PLAYERS && next <= QUEST_MAX_PLAYERS
  }

  /** Другое число игроков — другая строка таблицы: ручная правка сбрасывается. */
  function changePlayers(delta: number) {
    if (!canChangePlayers(delta)) return
    setup.players += delta
    setup.roles = null
  }

  /** Переключатель меняет местами Юнца и Смутьяна — и в таблице, и в ручном составе. */
  function chooseYouthOrTroublemaker(choice: QuestSetup['youthOrTroublemaker']) {
    if (setup.youthOrTroublemaker === choice) return
    setup.youthOrTroublemaker = choice
    if (setup.roles) {
      const { youth = 0, troublemaker = 0 } = setup.roles
      setup.roles = { ...setup.roles, youth: troublemaker, troublemaker: youth }
    }
  }

  function canChangeRole(id: QuestRoleId, delta: number): boolean {
    const next = lineup.value[id] + delta
    return next >= 0 && next <= (getQuestRole(id).unique ? 1 : MAX_COUNT)
  }

  /** Первая ручная правка снимает копию с таблицы; совпал с таблицей — снова «по таблице». */
  function changeRole(id: QuestRoleId, delta: number) {
    if (!canChangeRole(id, delta)) return
    const next = { ...lineup.value, [id]: lineup.value[id] + delta }
    setup.roles = QUEST_ROLE_IDS.every((role) => next[role] === standard.value[role]) ? null : next
  }

  // --- Партия ---

  /** «Начать»: партия со снимком состава, первым делом — вступление. */
  function startGame(texts: QuestTexts) {
    quest.game = newGame(texts, lineup.value, setup.players)
  }

  /** Новый поход на стол: случайный несыгранный, ввод с чистого листа. */
  function nextQuest(texts: QuestTexts) {
    const game = quest.game
    if (!game) return
    const drawn = drawTale(texts, quest.playedTales, game)
    quest.playedTales = drawn.played
    game.currentTaleId = drawn.taleId
    game.phase = 'quest'
  }

  /** Лидер ввёл число карт «Провал»: исход записывается в партию, счёт обновляется. */
  function enterFails(fails: number, doubleFail: boolean) {
    const game = quest.game
    if (!game || game.phase !== 'quest' || game.currentTaleId === null) return
    game.quests.push({ taleId: game.currentTaleId, fails, doubleFail, success: isSuccess(fails, doubleFail) })
    game.phase = 'outcome'
  }

  /** «Отменить» на исходе: ввод снимается, тот же поход, счёт и сыгранные как были. */
  function cancelOutcome() {
    const game = quest.game
    if (!game || game.phase !== 'outcome') return
    game.quests.pop()
    game.phase = 'quest'
  }

  /**
   * Уход с исхода вперёд: поход становится сыгранным. Партия решилась — финал добра или совет,
   * иначе передача лидерства.
   */
  function leaveOutcome(texts: QuestTexts) {
    const game = quest.game
    if (!game || game.phase !== 'outcome' || game.currentTaleId === null) return
    if (!quest.playedTales.includes(game.currentTaleId)) quest.playedTales.push(game.currentTaleId)
    const winner = decided(game)
    if (winner === 'good') {
      game.finale = { kind: 'goodQuests', variant: randomIndex(texts.finales.goodQuests.length) }
      game.phase = 'finale'
    } else if (winner === 'evil') {
      game.phase = 'council'
    } else {
      game.phase = 'handoff'
    }
  }

  /** Партия брошена или доиграна: следующий вход начнётся с настройки. */
  function endGame() {
    quest.game = null
  }

  return {
    quest,
    setup,
    lineup,
    cards,
    expected,
    nonStandard,
    wrongCount,
    hasHidden,
    hasEither,
    canChangePlayers,
    changePlayers,
    chooseYouthOrTroublemaker,
    canChangeRole,
    changeRole,
    startGame,
    nextQuest,
    enterFails,
    cancelOutcome,
    leaveOutcome,
    endGame,
  }
}

/**
 * «Сбросить весь прогресс» в настройках: ключ стирается целиком, вместе с составом.
 * Объект в памяти забывается, следующее обращение прочитает пустое хранилище заново.
 */
export function clearQuest() {
  savingScope?.stop()
  savingScope = undefined
  state = undefined
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Нечего стирать.
  }
}

function defaults(): QuestState {
  return { setup: { players: 5, youthOrTroublemaker: 'youth', roles: null }, playedTales: [], game: null }
}

/**
 * Читает сохранённое состояние. Битое поле заменяется своим дефолтом; в ручном составе
 * неизвестные роли отбрасываются, битый счётчик становится нулём, уникальная роль — не больше 1.
 */
function load(): QuestState {
  let raw: unknown
  try {
    raw = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')
  } catch {
    raw = null
  }
  const result = defaults()
  if (!isRecord(raw)) return result
  if (Array.isArray(raw.playedTales)) {
    const known = knownTaleIds()
    result.playedTales = [...new Set(raw.playedTales.filter((id): id is number => typeof id === 'number' && known.has(id)))]
  }
  result.game = loadGame(raw.game)
  if (!isRecord(raw.setup)) return result
  const saved = raw.setup

  const players = saved.players
  if (typeof players === 'number' && Number.isInteger(players) && players >= QUEST_MIN_PLAYERS && players <= QUEST_MAX_PLAYERS) {
    result.setup.players = players
  }
  if (saved.youthOrTroublemaker === 'youth' || saved.youthOrTroublemaker === 'troublemaker') {
    result.setup.youthOrTroublemaker = saved.youthOrTroublemaker
  }
  if (isRecord(saved.roles)) {
    const roles: Partial<QuestLineup> = {}
    for (const id of QUEST_ROLE_IDS) {
      const count = saved.roles[id]
      const max = getQuestRole(id).unique ? 1 : MAX_COUNT
      roles[id] = typeof count === 'number' && Number.isInteger(count) && count >= 0 ? Math.min(count, max) : 0
    }
    result.setup.roles = roles
  }
  return result
}

/** id походов на всех языках с текстами: неизвестные из хранилища отбрасываются. */
function knownTaleIds(): Set<number> {
  return new Set(Object.values(questTexts).flatMap((texts) => texts.tales.map((tale) => tale.id)))
}

/** Незаконченная партия из хранилища. Любое битое поле — партии нет: продолжать её всё равно нечем. */
function loadGame(raw: unknown): QuestGame | null {
  if (!isRecord(raw) || !isRecord(raw.roles)) return null
  const tales = knownTaleIds()
  const intros = new Set(Object.values(questTexts).flatMap((texts) => texts.intros.map((intro) => intro.id)))
  const isCount = (value: unknown): value is number => typeof value === 'number' && Number.isInteger(value) && value >= 0

  const roles = {} as QuestLineup
  for (const id of QUEST_ROLE_IDS) {
    const count = raw.roles[id]
    if (!isCount(count)) return null
    roles[id] = count
  }
  const { players, introId, phase, currentTaleId, finale } = raw
  if (!isCount(players) || players < QUEST_MIN_PLAYERS || players > QUEST_MAX_PLAYERS) return null
  if (typeof introId !== 'number' || !intros.has(introId)) return null
  if (typeof phase !== 'string' || !(QUEST_PHASES as readonly string[]).includes(phase)) return null
  if (!Array.isArray(raw.quests)) return null

  const quests: QuestResult[] = []
  for (const item of raw.quests) {
    if (!isRecord(item) || typeof item.taleId !== 'number' || !tales.has(item.taleId)) return null
    if (!isCount(item.fails) || typeof item.doubleFail !== 'boolean') return null
    // Исход пересчитывается по правилу, а не берётся на веру.
    quests.push({ taleId: item.taleId, fails: item.fails, doubleFail: item.doubleFail, success: isSuccess(item.fails, item.doubleFail) })
  }

  let current: number | null = null
  if (typeof currentTaleId === 'number' && tales.has(currentTaleId)) current = currentTaleId
  else if (currentTaleId !== null) return null

  let savedFinale: QuestGame['finale'] = null
  if (isRecord(finale)) {
    const kind = finale.kind
    if (typeof kind !== 'string' || !(QUEST_FINALE_KINDS as readonly string[]).includes(kind) || !isCount(finale.variant)) {
      return null
    }
    savedFinale = { kind: kind as QuestFinaleKind, variant: finale.variant }
  } else if (finale !== null) return null

  const game: QuestGame = { roles, players, introId, phase: phase as QuestPhase, quests, currentTaleId: current, finale: savedFinale }
  // Фаза должна сходиться с тем, что лежит рядом: иначе экрану нечего показать.
  if (['quest', 'outcome', 'handoff'].includes(game.phase) && current === null) return null
  if (game.phase === 'outcome' && quests.at(-1)?.taleId !== current) return null
  if (game.phase === 'finale' && !savedFinale) return null
  return game
}

function save(quest: QuestState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(quest))
  } catch {
    // Хранилище недоступно или переполнено — состав живёт до перезагрузки.
  }
}

/** Ручной состав с нулями у ролей, которых в нём нет. */
function fill(roles: Partial<QuestLineup>): QuestLineup {
  return Object.fromEntries(QUEST_ROLE_IDS.map((id) => [id, roles[id] ?? 0])) as QuestLineup
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
