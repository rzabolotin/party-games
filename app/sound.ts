/**
 * Звуки таймеров: тоны синтезируются через Web Audio API, без аудиофайлов — прекэш PWA не растёт.
 * iOS пускает звук только из контекста, созданного или возобновлённого по жесту пользователя,
 * поэтому `unlockSound` вызывается по тапу, который запускает таймер («Старт», «Я готов»),
 * а `playSignal` и `playTick` потом звучат уже без жеста.
 */

let context: AudioContext | null = null

/** По тапу: создать или возобновить AudioContext. Нет API — тихо, остаются вибрация и экран. */
export function unlockSound() {
  try {
    const Ctor = window.AudioContext ?? (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctor) return
    context ??= new Ctor()
    if (context.state === 'suspended') void context.resume().catch(() => {})
  } catch {
    context = null
  }
}

/** Один тон с короткими атакой и затуханием — без щелчков на краях. */
function tone(
  ctx: AudioContext,
  t0: number,
  duration: number,
  frequency: number,
  volume: number,
  type: OscillatorType = 'square',
) {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = type
  osc.frequency.value = frequency
  gain.gain.setValueAtTime(0, t0)
  gain.gain.linearRampToValueAtTime(volume, t0 + 0.01)
  gain.gain.setValueAtTime(volume, t0 + duration - 0.03)
  gain.gain.linearRampToValueAtTime(0, t0 + duration)
  osc.connect(gain).connect(ctx.destination)
  osc.start(t0)
  osc.stop(t0 + duration + 0.02)
}

/** Вибрация сигнала конца там, где она есть (на iOS её нет). Звучит и при выключенном звуке. */
export function vibrateSignal() {
  try {
    navigator.vibrate?.([300, 150, 300, 150, 600])
  } catch {
    // Вибрация — необязательная часть сигнала.
  }
}

/** Сигнал конца: три коротких тона и длинный четвёртый, плюс вибрация. */
export function playSignal() {
  vibrateSignal()
  if (!context) return
  if (context.state === 'suspended') void context.resume().catch(() => {})

  const start = context.currentTime + 0.05
  const tones: [offset: number, duration: number][] = [
    [0, 0.18],
    [0.3, 0.18],
    [0.6, 0.18],
    [0.9, 0.6],
  ]
  for (const [offset, duration] of tones) tone(context, start + offset, duration, 880, 0.25)
}

/**
 * Один короткий тон — отсчёт последних секунд. Пока контекст не разблокирован или стоит
 * на паузе, молчит: тон, поставленный в замёрзший контекст, прозвучал бы невпопад позже.
 */
export function playTick() {
  if (!context) return
  if (context.state !== 'running') {
    void context.resume().catch(() => {})
    return
  }
  tone(context, context.currentTime + 0.02, 0.08, 660, 0.15)
}

// --- Звуковые акценты Quest: короткие мелодии мягким треугольным тоном, звучат сразу по тапу ---

type Note = [offset: number, duration: number, frequency: number]

/** Сыграть мелодию. Контекст не разблокирован — тихо: акценты не обязательны. */
function melody(notes: Note[], volume = 0.3) {
  if (!context) return
  if (context.state === 'suspended') void context.resume().catch(() => {})
  const start = context.currentTime + 0.05
  for (const [offset, duration, frequency] of notes) tone(context, start + offset, duration, frequency, volume, 'triangle')
}

/** Вскрытие исхода: успех — восходящее мажорное арпеджио, провал — нисходящие низкие ноты. */
export function playOutcome(success: boolean) {
  melody(
    success
      ? [
          [0, 0.14, 523],
          [0.14, 0.14, 659],
          [0.28, 0.14, 784],
          [0.42, 0.45, 1047],
        ]
      : [
          [0, 0.3, 392],
          [0.3, 0.3, 311],
          [0.6, 0.7, 233],
        ],
  )
}

/** Начало Финального совета: два долгих низких удара, как гонг. */
export function playCouncil() {
  melody(
    [
      [0, 0.7, 196],
      [0.8, 1.1, 147],
    ],
    0.35,
  )
}

/** Финал: победа добра — фанфара «та-та-та-таам», победа зла — медленный спуск вниз. */
export function playFinale(goodWon: boolean) {
  melody(
    goodWon
      ? [
          [0, 0.12, 392],
          [0.15, 0.12, 392],
          [0.3, 0.12, 392],
          [0.45, 0.35, 523],
          [0.85, 0.15, 659],
          [1.0, 0.8, 784],
        ]
      : [
          [0, 0.45, 330],
          [0.45, 0.45, 311],
          [0.9, 0.45, 294],
          [1.35, 1.0, 220],
        ],
  )
}
