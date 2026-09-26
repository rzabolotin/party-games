import { computed, onBeforeUnmount, onMounted, ref, toValue, type MaybeRefOrGetter } from 'vue'

/**
 * Обратный отсчёт на `seconds` секунд. Время считается от момента окончания (`Date.now()`),
 * а не накоплением тиков: браузер притормаживает таймеры в свёрнутой вкладке, а отсчёт
 * отставать не должен. Идёт — задан `endsAt`; на паузе — `endsAt` пуст, остаток лежит в `remainingMs`.
 * Длительность читается в момент `start()`, так что можно передать геттер от настроек.
 * При уходе со страницы отсчёт останавливается, окончание уже не наступит.
 */
export function useCountdown(seconds: MaybeRefOrGetter<number>) {
  const endsAt = ref<number | null>(null)
  const remainingMs = ref(0)
  let ticker: ReturnType<typeof setInterval> | null = null
  const endHandlers: (() => void)[] = []

  /** Отсчёт идёт: запущен и не на паузе. */
  const running = computed(() => endsAt.value !== null)
  /** Остаток в целых секундах, округлённый вверх: «0» показывается только в самом конце. */
  const secondsLeft = computed(() => Math.max(0, Math.ceil(remainingMs.value / 1000)))

  function tick() {
    if (endsAt.value === null) return
    remainingMs.value = Math.max(0, endsAt.value - Date.now())
    if (remainingMs.value === 0) {
      halt()
      for (const handler of endHandlers) handler()
    }
  }

  function halt() {
    if (ticker !== null) clearInterval(ticker)
    ticker = null
    endsAt.value = null
  }

  function run() {
    halt()
    endsAt.value = Date.now() + remainingMs.value
    // Чаще секунды — чтобы смена цифры не запаздывала на целый тик.
    ticker = setInterval(tick, 250)
  }

  /** Запустить заново на полное время. */
  function start() {
    remainingMs.value = toValue(seconds) * 1000
    run()
  }

  /** Пауза: остаток сперва пересчитывается — если время как раз вышло, сработает окончание. */
  function pause() {
    tick()
    halt()
  }

  function resume() {
    if (running.value || remainingMs.value === 0) return
    run()
  }

  /** Остановить без события окончания. */
  function stop() {
    halt()
  }

  /** Подписка на окончание: время вышло само, а не по `stop()`. */
  function onEnd(handler: () => void) {
    endHandlers.push(handler)
  }

  // Вкладку вернули из фона — пересчитать сразу, не дожидаясь следующего тика.
  function onVisibilityChange() {
    if (document.visibilityState === 'visible') tick()
  }
  onMounted(() => document.addEventListener('visibilitychange', onVisibilityChange))
  onBeforeUnmount(() => {
    document.removeEventListener('visibilitychange', onVisibilityChange)
    halt()
  })

  return { remainingMs, secondsLeft, running, start, pause, resume, stop, onEnd }
}
