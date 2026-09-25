import { computed, reactive, watch } from 'vue'
import type { CountedRoleId, MafiaSetup, MafiaRole } from '~/types'
import { COUNTED_ROLE_IDS, getRole } from '~/mafia/roles'

export const MIN_PLAYERS = 3
export const MAX_PLAYERS = 20

const STORAGE_KEY = 'koster.mafia'

let state: MafiaSetup | undefined

/**
 * Состав партии «Мафии»: один реактивный объект, один ключ localStorage, читается
 * один раз при первом обращении, каждое изменение сразу пишется обратно.
 * Сама раздача в хранилище не попадает — иначе расклад партии можно прочитать в DevTools.
 */
export function useMafiaSetup() {
  if (!state) {
    state = reactive(load())
    watch(state, save, { deep: true })
    // Дон без мафии не выдаётся: убрали всю мафию — уходит и он.
    watch(
      () => state!.counts.mafia,
      (count) => {
        if (count === 0) state!.counts.don = 0
      },
    )
  }
  const setup = state

  /** Сумма счётчиков спецролей — сколько мест уже занято. */
  const special = computed(() => COUNTED_ROLE_IDS.reduce((sum, id) => sum + setup.counts[id], 0))
  /** Мирные — производное: всё, что осталось от общего числа. */
  const civilians = computed(() => setup.total - special.value)
  /** Команда мафии целиком — по ней считается перекос состава. */
  const mafiaTeam = computed(() => setup.counts.mafia + setup.counts.don)

  /**
   * Перекошенный состав: мафии нет вовсе, мафии половина стола и больше, мирных не осталось.
   * Подсказку показываем, но раздачу не блокируем — ведущий вправе сыграть по-своему.
   */
  const warning = computed<'noMafia' | 'tooMuchMafia' | 'noCivilians' | null>(() => {
    if (mafiaTeam.value === 0) return 'noMafia'
    if (mafiaTeam.value * 2 >= setup.total) return 'tooMuchMafia'
    if (civilians.value === 0) return 'noCivilians'
    return null
  })

  /** Общее число игроков: вверх — до потолка, вниз — не ниже суммы спецролей. */
  function canChangeTotal(delta: number): boolean {
    const next = setup.total + delta
    return next >= Math.max(MIN_PLAYERS, special.value) && next <= MAX_PLAYERS
  }

  /** Роли при изменении общего числа не пересчитываются: ручные правки состава не затираются. */
  function changeTotal(delta: number) {
    if (canChangeTotal(delta)) setup.total += delta
  }

  function maxOf(role: MafiaRole): number {
    return role.unique ? 1 : MAX_PLAYERS
  }

  function canChangeRole(id: CountedRoleId, delta: number): boolean {
    const role = getRole(id)
    const next = setup.counts[id] + delta
    if (next < 0 || next > maxOf(role)) return false
    // Роль занимает место мирного: свободных мест нет — расти некуда.
    if (delta > 0 && civilians.value <= 0) return false
    if (delta > 0 && role.requiresMafia && setup.counts.mafia === 0) return false
    return true
  }

  function changeRole(id: CountedRoleId, delta: number) {
    if (canChangeRole(id, delta)) setup.counts[id] += delta
  }

  return { setup, civilians, mafiaTeam, warning, canChangeTotal, changeTotal, canChangeRole, changeRole }
}

function defaults(): MafiaSetup {
  return { total: 8, counts: { mafia: 2, don: 0, detective: 1, doctor: 1, maniac: 0 } }
}

/**
 * Читает сохранённый состав; битые значения заменяются дефолтами: число игроков вне
 * диапазона, неизвестный id роли, счётчик спецроли больше единицы, сумма больше общего числа.
 */
function load(): MafiaSetup {
  let raw: unknown
  try {
    raw = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')
  } catch {
    raw = null
  }
  const fallback = defaults()
  if (!isRecord(raw)) return fallback

  const { total, counts } = raw
  if (typeof total !== 'number' || !Number.isInteger(total) || total < MIN_PLAYERS || total > MAX_PLAYERS) {
    return fallback
  }
  if (!isRecord(counts)) return fallback

  const parsed = {} as MafiaSetup['counts']
  for (const id of COUNTED_ROLE_IDS) {
    const value = counts[id]
    const max = getRole(id).unique ? 1 : MAX_PLAYERS
    if (typeof value !== 'number' || !Number.isInteger(value) || value < 0 || value > max) return fallback
    parsed[id] = value
  }
  // Состав целиком или дефолт целиком: половина отсюда и половина оттуда даёт отрицательных мирных.
  const sum = COUNTED_ROLE_IDS.reduce((acc, id) => acc + parsed[id], 0)
  if (sum > total || (parsed.don > 0 && parsed.mafia === 0)) return fallback

  return { total, counts: parsed }
}

function save(setup: MafiaSetup) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(setup))
  } catch {
    // Хранилище недоступно или переполнено — состав живёт до перезагрузки.
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
