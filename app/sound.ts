/**
 * Звуки таймеров: тоны синтезируются через Web Audio API, без аудиофайлов — прекэш PWA не растёт.
 * iOS пускает звук только из контекста, созданного или возобновлённого по жесту пользователя,
 * поэтому `unlockSound` вызывается по тапу, который запускает таймер («Старт», «Я готов»),
 * а `playSignal` и `playTick` потом звучат уже без жеста.
 */

import type { NightSignal } from '~/quest/night'

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

/**
 * Контекст, готовый звучать, и момент начала звука — чуть позже «сейчас», чтобы атака не обрезалась.
 * Не разблокирован — `null`: звук необязателен, остаются вибрация и экран.
 */
function ready(): [AudioContext, number] | null {
  if (!context) return null
  if (context.state === 'suspended') void context.resume().catch(() => {})
  return [context, context.currentTime + 0.05]
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
  const sound = ready()
  if (!sound) return
  const [ctx, start] = sound
  const tones: [offset: number, duration: number][] = [
    [0, 0.18],
    [0.3, 0.18],
    [0.6, 0.18],
    [0.9, 0.6],
  ]
  for (const [offset, duration] of tones) tone(ctx, start + offset, duration, 880, 0.25)
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
  const sound = ready()
  if (!sound) return
  const [ctx, start] = sound
  for (const [offset, duration, frequency] of notes) tone(ctx, start + offset, duration, frequency, volume, 'triangle')
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

// --- Ночь Quest: сигналы для закрытых глаз — тембры разные, чтобы колокол не спутать с рогом ---

/** Удар колокола: несколько негармоничных синусов с долгим затуханием, как у настоящего колокола. */
function strike(ctx: AudioContext, t0: number, frequency: number, volume: number, decay = 2.2) {
  const partials: [ratio: number, level: number][] = [
    [1, 1],
    [2, 0.5],
    [2.76, 0.35],
    [5.4, 0.15],
  ]
  for (const [ratio, level] of partials) {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = frequency * ratio
    // Высокие призвуки гаснут быстрее основного тона.
    const length = decay / ratio ** 0.5
    gain.gain.setValueAtTime(0, t0)
    gain.gain.linearRampToValueAtTime(volume * level, t0 + 0.005)
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + length)
    osc.connect(gain).connect(ctx.destination)
    osc.start(t0)
    osc.stop(t0 + length + 0.05)
  }
}

/** Медный тон — рог и фанфары: пила через фильтр, мягкая атака, без щелчка в конце. */
function brass(ctx: AudioContext, t0: number, duration: number, frequency: number, volume: number, brightness = 1400) {
  const osc = ctx.createOscillator()
  const filter = ctx.createBiquadFilter()
  const gain = ctx.createGain()
  osc.type = 'sawtooth'
  osc.frequency.value = frequency
  filter.type = 'lowpass'
  filter.frequency.value = brightness
  gain.gain.setValueAtTime(0, t0)
  gain.gain.linearRampToValueAtTime(volume, t0 + 0.06)
  gain.gain.setValueAtTime(volume, t0 + duration - 0.08)
  gain.gain.linearRampToValueAtTime(0, t0 + duration)
  osc.connect(filter).connect(gain).connect(ctx.destination)
  osc.start(t0)
  osc.stop(t0 + duration + 0.02)
}

/** Щипок струны — арфа: треугольник с быстрой атакой и затуханием, плюс тихая октава сверху. */
function pluck(ctx: AudioContext, t0: number, frequency: number, volume: number, decay = 1.2) {
  for (const [ratio, level] of [
    [1, 1],
    [2, 0.3],
  ] as const) {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'triangle'
    osc.frequency.value = frequency * ratio
    gain.gain.setValueAtTime(0, t0)
    gain.gain.linearRampToValueAtTime(volume * level, t0 + 0.004)
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + decay)
    osc.connect(gain).connect(ctx.destination)
    osc.start(t0)
    osc.stop(t0 + decay + 0.05)
  }
}

/** Удар гонга: низкий гул с плотными негармоничными призвуками и долгим хвостом. */
function gong(ctx: AudioContext, t0: number, frequency: number, volume: number, decay = 4) {
  const partials: [ratio: number, level: number][] = [
    [1, 1],
    [1.48, 0.6],
    [2.12, 0.45],
    [2.93, 0.3],
    [3.9, 0.2],
  ]
  for (const [ratio, level] of partials) {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = frequency * ratio
    const length = decay / ratio ** 0.3
    gain.gain.setValueAtTime(0, t0)
    // Гонг «раскрывается» не сразу — атака мягче, чем у колокола.
    gain.gain.linearRampToValueAtTime(volume * level, t0 + 0.06)
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + length)
    osc.connect(gain).connect(ctx.destination)
    osc.start(t0)
    osc.stop(t0 + length + 0.05)
  }
}

/**
 * Сигнал ночи Quest. Колокол — злодеи открывают глаза, двойной колокол — закрывают;
 * арфа — Моргана узнаёт Отпрыска; гонг — Артур узнаёт Моргану;
 * рог — Клирик открывает, двойной рог — закрывает; фанфары — просыпаются все.
 */
export function playNightSignal(signal: NightSignal) {
  const sound = ready()
  if (!sound) return
  const [ctx, t0] = sound
  switch (signal) {
    case 'bell':
      strike(ctx, t0, 392, 0.35, 3)
      break
    case 'doubleBell':
      strike(ctx, t0, 392, 0.35, 1.6)
      strike(ctx, t0 + 0.5, 392, 0.35, 2.4)
      break
    case 'harp':
      // Восходящее арпеджио, как перебор струн: до — ми — соль — до.
      for (const [i, frequency] of [523, 659, 784, 1047].entries()) pluck(ctx, t0 + i * 0.12, frequency, 0.3)
      break
    case 'doubleHarp':
      pluck(ctx, t0, 784, 0.3, 0.8)
      pluck(ctx, t0 + 0.5, 784, 0.3, 1.2)
      break
    case 'gong':
      gong(ctx, t0, 98, 0.3)
      break
    case 'doubleGong':
      gong(ctx, t0, 98, 0.3, 1.6)
      gong(ctx, t0 + 0.6, 98, 0.3, 2.6)
      break
    case 'horn':
      // Долгий низкий зов с подъёмом на кварту.
      brass(ctx, t0, 0.5, 147, 0.3, 900)
      brass(ctx, t0 + 0.5, 1.1, 196, 0.3, 900)
      break
    case 'doubleHorn':
      brass(ctx, t0, 0.35, 196, 0.3, 900)
      brass(ctx, t0 + 0.5, 0.35, 196, 0.3, 900)
      break
    case 'fanfare': {
      // «Та-да-да-таам» на трубах: быстрый триолет, затем подъём к долгой верхней ноте.
      const notes: Note[] = [
        [0, 0.12, 523],
        [0.14, 0.12, 523],
        [0.28, 0.12, 523],
        [0.42, 0.4, 659],
        [0.86, 0.2, 587],
        [1.08, 0.2, 659],
        [1.3, 0.9, 784],
      ]
      for (const [offset, duration, frequency] of notes) brass(ctx, t0 + offset, duration, frequency, 0.22, 2600)
      break
    }
  }
}
