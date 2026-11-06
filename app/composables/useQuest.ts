import { computed, effectScope, reactive, watch, type EffectScope } from 'vue'
import { QUEST_ROLE_IDS, type QuestLineup, type QuestRoleId, type QuestSetup, type QuestState } from '~/types'
import {
  EITHER_MIN_PLAYERS,
  HIDDEN_MAX_PLAYERS,
  QUEST_MAX_PLAYERS,
  QUEST_MIN_PLAYERS,
  expectedCards,
  standardLineup,
} from '~/quest/lineups'
import { getQuestRole } from '~/quest/roles'

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
  return { setup: { players: 5, youthOrTroublemaker: 'youth', roles: null } }
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
  if (!isRecord(raw) || !isRecord(raw.setup)) return result
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
