// Проверяет контент колод; в `npm run build` запускается до `nuxt generate` и роняет сборку при ошибках.
// Запуск вручную: node scripts/check-content.mjs
// Колоды — TypeScript-модули, Node исполняет их сам (type stripping, есть во всех версиях, которые требует Nuxt).
import { existsSync, readdirSync } from 'node:fs'

const MIN_QUESTIONS = 40
const MAX_LENGTH = 90
/** Лимиты текстов ролей: карта «Мафии» должна помещаться в экран без скролла. */
const MAX_ROLE_TITLE = 24
const MAX_ROLE_TAGLINE = 90
const MAX_ROLE_DESCRIPTION = 180

const DECKS_DIR = new URL('../app/decks/', import.meta.url)
const { decks } = await import(new URL('index.ts', DECKS_DIR).href)
const { LANGS, DECK_TYPES, FACTIONS, ROLE_IDS } = await import(
  new URL('../app/types/index.ts', import.meta.url).href
)
const { roles } = await import(new URL('../app/mafia/roles.ts', import.meta.url).href)

const problems = []
const fail = (where, what) => problems.push(`${where}: ${what}`)

/** Ключ для поиска дублей: регистр и пробелы не различаются. */
const normalize = (text) => text.trim().replace(/\s+/g, ' ').toLowerCase()
/** Длина в символах (кодовых точках), а не в UTF-16-единицах: эмодзи считается за один символ. */
const length = (text) => [...text].length

// --- Колоды из индекса: структура, размер, длина и уникальность вопросов ---

const ids = new Set()
/** Уже встреченные вопросы по языкам: нормализованный текст → где встретился впервые. */
const seen = new Map(LANGS.map((lang) => [lang, new Map()]))

/** Языки, в которых уже встретилась колода 18+: после неё обычных быть не должно. */
const adultSeen = new Set()

for (const deck of decks) {
  const hasId = typeof deck.id === 'string' && deck.id.trim() !== ''
  const where = hasId ? deck.id : '(колода без id)'
  if (!hasId) fail(where, 'пустой id')
  else if (ids.has(deck.id)) fail(where, 'id повторяется')
  else ids.add(deck.id)

  if (deck.adult) adultSeen.add(deck.lang)
  else if (adultSeen.has(deck.lang)) fail(where, 'стоит в индексе после колоды 18+, а 18+ должна быть последней')

  if (!LANGS.includes(deck.lang)) fail(where, `неизвестный lang «${deck.lang}»`)
  if (!DECK_TYPES.includes(deck.type)) fail(where, `неизвестный type «${deck.type}»`)
  if (typeof deck.title !== 'string' || !deck.title.trim()) fail(where, 'пустой title')
  if (typeof deck.emoji !== 'string' || !deck.emoji.trim()) fail(where, 'пустой emoji')
  if (!Array.isArray(deck.questions)) {
    fail(where, 'questions — не массив')
    continue
  }
  if (deck.questions.length < MIN_QUESTIONS) {
    fail(where, `вопросов ${deck.questions.length}, нужно не меньше ${MIN_QUESTIONS}`)
  }

  const seenInLang = seen.get(deck.lang)
  for (const [i, question] of deck.questions.entries()) {
    const at = `${where} #${i + 1}`
    if (typeof question !== 'string' || !question.trim()) {
      fail(at, 'пустой вопрос')
      continue
    }
    if (length(question) > MAX_LENGTH) fail(at, `длина ${length(question)} > ${MAX_LENGTH} — «${question}»`)
    if (!seenInLang) continue
    const key = normalize(question)
    const first = seenInLang.get(key)
    if (first) fail(at, `повторяет ${first} — «${question}»`)
    else seenInLang.set(key, at)
  }
}

// --- Файлы колод: каждый лежит в папке своего языка и добавлен в индекс ---

for (const lang of LANGS) {
  const dir = new URL(`${lang}/`, DECKS_DIR)
  const files = existsSync(dir) ? readdirSync(dir).filter((file) => file.endsWith('.ts')).sort() : []
  for (const file of files) {
    const where = `app/decks/${lang}/${file}`
    const deck = (await import(new URL(file, dir).href)).default
    if (!deck) fail(where, 'нет default-экспорта с колодой')
    else if (!decks.includes(deck)) fail(where, 'колода не добавлена в app/decks/index.ts')
    else if (deck.lang !== lang) fail(where, `lang «${deck.lang}» не совпадает с папкой`)
  }
}

// --- Роли «Мафии»: набор фиксирован, тексты — на обоих языках и в размер карты ---

if (roles.length !== ROLE_IDS.length) {
  fail('роли', `ролей ${roles.length}, нужно ровно ${ROLE_IDS.length}`)
}

const roleIds = new Set()
const fillers = roles.filter((role) => !role.counted)
if (fillers.length !== 1) fail('роли', `остаточных ролей ${fillers.length}, нужна ровно одна (мирный)`)

for (const role of roles) {
  const where = `роль ${role.id ?? '(без id)'}`
  if (!ROLE_IDS.includes(role.id)) fail(where, `неизвестный id «${role.id}»`)
  else if (roleIds.has(role.id)) fail(where, 'id повторяется')
  else roleIds.add(role.id)

  if (!FACTIONS.includes(role.faction)) fail(where, `неизвестная фракция «${role.faction}»`)
  if (typeof role.counted !== 'boolean') fail(where, 'counted — не boolean')
  if (typeof role.unique !== 'boolean') fail(where, 'unique — не boolean')
  if (role.requiresMafia && role.id !== 'don') fail(where, 'requiresMafia бывает только у Дона')
  if (role.nightOrder !== undefined && !Number.isInteger(role.nightOrder)) {
    fail(where, `nightOrder «${role.nightOrder}» — не целое`)
  }

  for (const [field, limit] of [
    ['title', MAX_ROLE_TITLE],
    ['tagline', MAX_ROLE_TAGLINE],
    ['description', MAX_ROLE_DESCRIPTION],
  ]) {
    for (const lang of LANGS) {
      const text = role[field]?.[lang]
      if (typeof text !== 'string' || !text.trim()) fail(where, `пустой ${field} на ${lang}`)
      else if (length(text) > limit) fail(where, `${field} на ${lang}: длина ${length(text)} > ${limit}`)
    }
  }
}

/** Порядок ночи должен быть строгим: два шага с одним номером ведущему ничего не говорят. */
const nightOrders = roles.filter((role) => role.nightOrder !== undefined).map((role) => role.nightOrder)
if (new Set(nightOrders).size !== nightOrders.length) fail('роли', 'nightOrder повторяется')

// --- Итог ---

if (problems.length > 0) {
  console.error(`✗ Контент не прошёл проверку, проблем: ${problems.length} (номера вопросов — с единицы)`)
  for (const problem of problems) console.error(`  ${problem}`)
  process.exit(1)
}

const stats = LANGS.map((lang) => {
  const own = decks.filter((deck) => deck.lang === lang)
  const questions = own.reduce((sum, deck) => sum + deck.questions.length, 0)
  return `${lang}: колод ${own.length}, вопросов ${questions}`
})
console.log(`✓ Контент в порядке — ${stats.join('; ')}; ролей «Мафии» ${roles.length}`)
