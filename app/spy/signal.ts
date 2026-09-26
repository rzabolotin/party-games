/**
 * Сигнал конца раунда: тоны синтезируются через Web Audio API, без аудиофайла — прекэш PWA не растёт.
 * iOS пускает звук только из контекста, созданного или возобновлённого по жесту пользователя,
 * поэтому `unlockSignal` вызывается по тапу «Старт», а `playSignal` потом звучит уже без жеста.
 */

let context: AudioContext | null = null

/** По тапу «Старт»: создать или возобновить AudioContext. Нет API — тихо, остаются вибрация и экран. */
export function unlockSignal() {
  try {
    const Ctor = window.AudioContext ?? (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctor) return
    context ??= new Ctor()
    if (context.state === 'suspended') void context.resume().catch(() => {})
  } catch {
    context = null
  }
}

/** Три коротких тона и длинный четвёртый, плюс вибрация там, где она есть (на iOS её нет). */
export function playSignal() {
  try {
    navigator.vibrate?.([300, 150, 300, 150, 600])
  } catch {
    // Вибрация — необязательная часть сигнала.
  }
  if (!context) return
  if (context.state === 'suspended') void context.resume().catch(() => {})

  const start = context.currentTime + 0.05
  const tones: [offset: number, duration: number][] = [
    [0, 0.18],
    [0.3, 0.18],
    [0.6, 0.18],
    [0.9, 0.6],
  ]
  for (const [offset, duration] of tones) {
    const osc = context.createOscillator()
    const gain = context.createGain()
    osc.type = 'square'
    osc.frequency.value = 880
    // Короткие атака и затухание — без щелчков на краях тона.
    const t0 = start + offset
    gain.gain.setValueAtTime(0, t0)
    gain.gain.linearRampToValueAtTime(0.25, t0 + 0.01)
    gain.gain.setValueAtTime(0.25, t0 + duration - 0.03)
    gain.gain.linearRampToValueAtTime(0, t0 + duration)
    osc.connect(gain).connect(context.destination)
    osc.start(t0)
    osc.stop(t0 + duration + 0.02)
  }
}
