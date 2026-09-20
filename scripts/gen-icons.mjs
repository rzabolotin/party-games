// Генерирует PNG-иконки приложения (костёр на тёмном фоне) на чистом Node.
// Запуск: node scripts/gen-icons.mjs → public/icons/*.png
import { deflateSync } from 'node:zlib'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'icons')

const BG = [0x14, 0x11, 0x0f]
const LOG = [0x8a, 0x56, 0x2a]
const LOG_SHADOW = [0x5e, 0x3a, 0x1c]
const FLAME_OUTER = [0xff, 0x5f, 0x1f]
const FLAME_MID = [0xff, 0xa2, 0x2b]
const FLAME_INNER = [0xff, 0xe2, 0x6e]

// Все фигуры — в единичных координатах: x, y ∈ [-1, 1], y направлен вверх.

/** «Капля»: круг радиуса r с центром (cx, cy), сужающийся к острию на высоте cy + h. */
function teardrop(px, py, cx, cy, r, h, lean = 0) {
  const dy = py - cy
  const dx = px - cx - lean * Math.max(dy, 0)
  if (dy <= 0) return dx * dx + dy * dy <= r * r
  if (dy >= h) return false
  const w = r * Math.pow(Math.cos((dy / h) * Math.PI / 2), 0.8)
  return Math.abs(dx) <= w
}

/** Капсула — отрезок AB с толщиной 2·radius. */
function capsule(px, py, ax, ay, bx, by, radius) {
  const abx = bx - ax, aby = by - ay
  const apx = px - ax, apy = py - ay
  const t = Math.max(0, Math.min(1, (apx * abx + apy * aby) / (abx * abx + aby * aby)))
  const dx = apx - t * abx, dy = apy - t * aby
  return dx * dx + dy * dy <= radius * radius
}

/** Цвет точки сцены — фигуры перечислены от верхней к нижней. */
function scene(x, y) {
  if (teardrop(x, y, 0.0, -0.32, 0.15, 0.40)) return FLAME_INNER
  if (teardrop(x, y, 0.0, -0.28, 0.27, 0.68, 0.04)) return FLAME_MID
  if (teardrop(x, y, 0.0, -0.22, 0.42, 0.94, -0.06)) return FLAME_OUTER
  if (teardrop(x, y, 0.36, -0.36, 0.14, 0.42, 0.20)) return FLAME_OUTER
  if (teardrop(x, y, -0.36, -0.38, 0.13, 0.36, -0.20)) return FLAME_OUTER
  if (capsule(x, y, -0.62, -0.62, 0.62, -0.42, 0.09)) return LOG
  if (capsule(x, y, -0.62, -0.42, 0.62, -0.62, 0.09)) return LOG_SHADOW
  return BG
}

/**
 * Растеризует сцену в RGB-буфер размером size×size.
 * scale — во сколько раз растянуть сцену; для maskable-иконок меньше, чтобы попасть в безопасную зону.
 */
function render(size, scale, samples = 4) {
  const rgb = Buffer.alloc(size * size * 3)
  const half = size / 2
  for (let j = 0; j < size; j++) {
    for (let i = 0; i < size; i++) {
      let r = 0, g = 0, b = 0
      for (let sy = 0; sy < samples; sy++) {
        for (let sx = 0; sx < samples; sx++) {
          const px = i + (sx + 0.5) / samples
          const py = j + (sy + 0.5) / samples
          const x = (px - half) / half / scale
          const y = (half - py) / half / scale
          const c = scene(x, y)
          r += c[0]; g += c[1]; b += c[2]
        }
      }
      const n = samples * samples
      const o = (j * size + i) * 3
      rgb[o] = Math.round(r / n)
      rgb[o + 1] = Math.round(g / n)
      rgb[o + 2] = Math.round(b / n)
    }
  }
  return rgb
}

// --- PNG ---

const CRC_TABLE = new Uint32Array(256).map((_, n) => {
  let c = n
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  return c >>> 0
})

function crc32(buf) {
  let c = 0xffffffff
  for (const byte of buf) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii')
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])))
  return Buffer.concat([len, typeBuf, data, crc])
}

function encodePng(size, rgb) {
  const stride = size * 3
  const raw = Buffer.alloc((stride + 1) * size)
  for (let j = 0; j < size; j++) {
    raw[j * (stride + 1)] = 0 // фильтр None
    rgb.copy(raw, j * (stride + 1) + 1, j * stride, (j + 1) * stride)
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8 // бит на канал
  ihdr[9] = 2 // RGB
  ihdr[10] = 0
  ihdr[11] = 0
  ihdr[12] = 0
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

// --- Набор иконок ---

const ICONS = [
  { file: 'icon-192.png', size: 192, scale: 1.2 },
  { file: 'icon-512.png', size: 512, scale: 1.2 },
  { file: 'apple-touch-icon-180.png', size: 180, scale: 1.2 },
  // maskable: содержимое в центральных 80 % (безопасная зона), фон — на всю площадь
  { file: 'icon-maskable-192.png', size: 192, scale: 0.8 },
  { file: 'icon-maskable-512.png', size: 512, scale: 0.8 },
]

mkdirSync(OUT_DIR, { recursive: true })
for (const { file, size, scale } of ICONS) {
  const png = encodePng(size, render(size, scale))
  writeFileSync(join(OUT_DIR, file), png)
  console.log(`${file}  ${size}×${size}  ${png.length} bytes`)
}
