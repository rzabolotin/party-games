import { onBeforeUnmount, onMounted } from 'vue'

/**
 * Экран не гаснет, пока открыт игровой экран: Wake Lock запрашивается при монтировании,
 * отпускается при уходе. Когда приложение сворачивают, система снимает блокировку сама,
 * поэтому при возврате (страница снова видима) запрос повторяется.
 * Нет API или запрос отклонён (http вместо https, режим энергосбережения) — тихо, без ошибок.
 */
export function useWakeLock() {
  let sentinel: WakeLockSentinel | null = null
  /** Между mount и unmount — чтобы запрос, завершившийся после ухода с экрана, не оставил блокировку. */
  let active = false

  async function request() {
    if (!active || sentinel || !('wakeLock' in navigator)) return
    try {
      const lock = await navigator.wakeLock.request('screen')
      if (!active) {
        await lock.release()
        return
      }
      sentinel = lock
      // Система отпускает блокировку при уходе в фон — забываем её, чтобы запросить заново.
      lock.addEventListener('release', () => {
        if (sentinel === lock) sentinel = null
      })
    } catch {
      // Отказ — штатная ситуация, приложение работает как обычно.
    }
  }

  function release() {
    sentinel?.release().catch(() => {})
    sentinel = null
  }

  function onVisibilityChange() {
    if (document.visibilityState === 'visible') void request()
  }

  onMounted(() => {
    active = true
    document.addEventListener('visibilitychange', onVisibilityChange)
    void request()
  })

  onBeforeUnmount(() => {
    active = false
    document.removeEventListener('visibilitychange', onVisibilityChange)
    release()
  })
}
