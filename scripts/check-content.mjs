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
/** Слова «Шпиона»: сколько в теме на каждом языке и какой длины, чтобы влезть на карточку. */
const MIN_WORDS = 20
const MAX_WORDS = 30
const MAX_WORD = 24
/** Слова Alias: сколько на каждом уровне каждого языка. */
const MIN_ALIAS_WORDS = 350
const MAX_ALIAS_WORDS = 450
/** Данетки: история с открытым ответом должна читаться на iPhone SE при «Огромном» шрифте с прокруткой середины. */
const MAX_DANETKA_TITLE = 40
const MAX_DANETKA_STORY = 260
const MAX_DANETKA_ANSWER = 240
/** Quest: каждый текст читается вслух примерно за 30 секунд; связка — одна-две фразы перед завязкой. */
const MAX_QUEST_TEXT = 500
const MAX_QUEST_BRIDGE = 160
/** Вариантов у каждого финала ровно столько. */
const QUEST_FINALE_VARIANTS = 2

const DECKS_DIR = new URL('../app/decks/', import.meta.url)
const { decks } = await import(new URL('index.ts', DECKS_DIR).href)
const {
  LANGS,
  DECK_TYPES,
  FACTIONS,
  ROLE_IDS,
  THEME_IDS,
  ALIAS_LEVELS,
  DANETKA_TONES,
  QUEST_ROLE_IDS,
  QUEST_SIDES,
  QUEST_BRIDGE_KINDS,
  QUEST_FINALE_KINDS,
  QUEST_NIGHT_OUTSIDERS,
} = await import(
  new URL('../app/types/index.ts', import.meta.url).href
)
const { roles } = await import(new URL('../app/mafia/roles.ts', import.meta.url).href)
const { themes, words } = await import(new URL('../app/spy/themes.ts', import.meta.url).href)
const { levels: aliasLevels, words: aliasWords } = await import(new URL('../app/alias/levels.ts', import.meta.url).href)
const { stories: danetki } = await import(new URL('../app/danetki/stories.ts', import.meta.url).href)
const { questRoles } = await import(new URL('../app/quest/roles.ts', import.meta.url).href)
const { directorsCut, expectedCards, QUEST_MIN_PLAYERS, TABLE_MAX_PLAYERS } = await import(
  new URL('../app/quest/lineups.ts', import.meta.url).href
)
const { tableaus } = await import(new URL('../app/quest/tableau.ts', import.meta.url).href)
const { questTexts } = await import(new URL('../app/quest/texts.ts', import.meta.url).href)
const { nightLines } = await import(new URL('../app/quest/night.ts', import.meta.url).href)

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

// --- Темы «Шпиона»: справочник общий, слова на каждом языке свои ---

if (themes.length !== THEME_IDS.length) fail('темы', `тем ${themes.length}, нужно ровно ${THEME_IDS.length}`)

const themeIds = new Set()
/** Названия тем по языкам: нормализованное название → id темы, где встретилось впервые. */
const themeTitles = new Map(LANGS.map((lang) => [lang, new Map()]))

for (const theme of themes) {
  const where = `тема ${theme.id ?? '(без id)'}`
  if (!THEME_IDS.includes(theme.id)) fail(where, `неизвестный id «${theme.id}»`)
  else if (themeIds.has(theme.id)) fail(where, 'id повторяется')
  else themeIds.add(theme.id)

  for (const lang of LANGS) {
    const title = theme.title?.[lang]
    if (typeof title !== 'string' || !title.trim()) {
      fail(where, `пустое название на ${lang}`)
      continue
    }
    const key = normalize(title)
    const first = themeTitles.get(lang).get(key)
    if (first) fail(where, `название на ${lang} совпадает с темой ${first}`)
    else themeTitles.get(lang).set(key, theme.id)
  }
}

for (const lang of LANGS) {
  const own = words[lang] ?? {}
  // Слова без темы в справочнике на экран не попадут — значит, забыли завести тему.
  for (const id of Object.keys(own)) {
    if (!themeIds.has(id)) fail(`слова ${lang}`, `тема «${id}» не заведена в справочнике`)
  }

  /** Уже встреченные слова языка: нормализованное слово → где встретилось впервые. */
  const seenWords = new Map()
  for (const theme of themes) {
    const where = `слова ${lang}/${theme.id}`
    const list = own[theme.id]
    // Темы одинаковые в обоих языках: у каждой темы справочника слова есть на каждом языке.
    if (!Array.isArray(list)) {
      fail(where, 'нет слов на этом языке')
      continue
    }
    if (list.length < MIN_WORDS || list.length > MAX_WORDS) {
      fail(where, `слов ${list.length}, нужно от ${MIN_WORDS} до ${MAX_WORDS}`)
    }
    for (const [i, word] of list.entries()) {
      const at = `${where} #${i + 1}`
      if (typeof word !== 'string' || !word.trim()) {
        fail(at, 'пустое слово')
        continue
      }
      if (length(word) > MAX_WORD) fail(at, `длина ${length(word)} > ${MAX_WORD} — «${word}»`)
      const key = normalize(word)
      const first = seenWords.get(key)
      if (first) fail(at, `повторяет ${first} — «${word}»`)
      else seenWords.set(key, at)
    }
  }
}

// --- Уровни и слова Alias: справочник общий, слова на каждом языке свои ---

if (aliasLevels.length !== ALIAS_LEVELS.length) {
  fail('уровни Alias', `уровней ${aliasLevels.length}, нужно ровно ${ALIAS_LEVELS.length}`)
}

const aliasLevelIds = new Set()
for (const level of aliasLevels) {
  const where = `уровень Alias ${level.id ?? '(без id)'}`
  if (!ALIAS_LEVELS.includes(level.id)) fail(where, `неизвестный id «${level.id}»`)
  else if (aliasLevelIds.has(level.id)) fail(where, 'id повторяется')
  else aliasLevelIds.add(level.id)
  if (typeof level.emoji !== 'string' || !level.emoji.trim()) fail(where, 'пустой emoji')
  for (const lang of LANGS) {
    const title = level.title?.[lang]
    if (typeof title !== 'string' || !title.trim()) fail(where, `пустое название на ${lang}`)
  }
}

for (const lang of LANGS) {
  const own = aliasWords[lang] ?? {}
  for (const id of Object.keys(own)) {
    if (!aliasLevelIds.has(id)) fail(`слова Alias ${lang}`, `уровень «${id}» не заведён в справочнике`)
  }

  /** Уже встреченные слова языка, в том числе на других уровнях: нормализованное слово → где впервые. */
  const seenWords = new Map()
  for (const level of aliasLevels) {
    const where = `слова Alias ${lang}/${level.id}`
    const list = own[level.id]
    if (!Array.isArray(list) || list.length === 0) {
      fail(where, 'нет слов на этом языке')
      continue
    }
    if (list.length < MIN_ALIAS_WORDS || list.length > MAX_ALIAS_WORDS) {
      fail(where, `слов ${list.length}, нужно от ${MIN_ALIAS_WORDS} до ${MAX_ALIAS_WORDS}`)
    }
    for (const [i, word] of list.entries()) {
      const at = `${where} #${i + 1}`
      if (typeof word !== 'string' || !word.trim()) {
        fail(at, 'пустое слово')
        continue
      }
      if (length(word) > MAX_WORD) fail(at, `длина ${length(word)} > ${MAX_WORD} — «${word}»`)
      const key = normalize(word)
      const first = seenWords.get(key)
      if (first) fail(at, `повторяет ${first} — «${word}»`)
      else seenWords.set(key, at)
    }
  }
}

// --- Данетки: у каждого языка свой список, пустой допустим — тогда режим скрыт ---

for (const lang of LANGS) {
  const list = danetki[lang]
  if (!Array.isArray(list)) {
    fail(`данетки ${lang}`, 'не массив')
    continue
  }

  const danetkaIds = new Set()
  /** Уже встреченные названия и тексты языка: нормализованный текст → где встретился впервые. */
  const seenTitles = new Map()
  const seenStories = new Map()
  for (const [i, danetka] of list.entries()) {
    const where = `данетка ${lang} #${i + 1}${Number.isInteger(danetka.id) ? ` (id ${danetka.id})` : ''}`
    if (!Number.isInteger(danetka.id) || danetka.id <= 0) fail(where, `id «${danetka.id}» — не целое положительное`)
    else if (danetkaIds.has(danetka.id)) fail(where, 'id повторяется')
    else danetkaIds.add(danetka.id)

    if (!DANETKA_TONES.includes(danetka.tone)) fail(where, `неизвестный tone «${danetka.tone}»`)

    for (const [field, limit] of [
      ['title', MAX_DANETKA_TITLE],
      ['story', MAX_DANETKA_STORY],
      ['answer', MAX_DANETKA_ANSWER],
      ['source', Infinity],
    ]) {
      const text = danetka[field]
      if (typeof text !== 'string' || !text.trim()) fail(where, `пустой ${field}`)
      else if (length(text) > limit) fail(where, `${field}: длина ${length(text)} > ${limit}`)
    }

    for (const [field, seenTexts] of [
      ['title', seenTitles],
      ['story', seenStories],
    ]) {
      const text = danetka[field]
      if (typeof text !== 'string' || !text.trim()) continue
      const key = normalize(text)
      const first = seenTexts.get(key)
      if (first) fail(where, `${field} повторяет ${first}`)
      else seenTexts.set(key, where)
    }
  }
}

// --- Quest: справочник ролей и таблица составов Director's Cut ---

if (questRoles.length !== QUEST_ROLE_IDS.length) {
  fail('роли Quest', `ролей ${questRoles.length}, нужно ровно ${QUEST_ROLE_IDS.length}`)
}

const questRoleIds = new Set()
/** Роли по id — для проверки таблицы: уникальность. */
const questRoleById = new Map()
for (const role of questRoles) {
  const where = `роль Quest ${role.id ?? '(без id)'}`
  if (!QUEST_ROLE_IDS.includes(role.id)) fail(where, `неизвестный id «${role.id}»`)
  else if (questRoleIds.has(role.id)) fail(where, 'id повторяется')
  else questRoleIds.add(role.id)
  questRoleById.set(role.id, role)

  if (!QUEST_SIDES.includes(role.side)) fail(where, `неизвестная сторона «${role.side}»`)
  if (typeof role.unique !== 'boolean') fail(where, 'unique — не boolean')
  for (const field of ['title', 'original', 'ability']) {
    const text = role[field]
    if (typeof text !== 'string' || !text.trim()) fail(where, `пустой ${field}`)
  }
}
for (const id of QUEST_ROLE_IDS) {
  if (!questRoleIds.has(id)) fail('роли Quest', `нет роли «${id}» в справочнике`)
}

for (let players = QUEST_MIN_PLAYERS; players <= TABLE_MAX_PLAYERS; players++) {
  const where = `состав Quest на ${players}`
  const row = directorsCut[players]
  if (!row) {
    fail(where, 'нет строки в таблице')
    continue
  }
  let sum = 0
  for (const [id, count] of Object.entries(row)) {
    const role = questRoleById.get(id)
    if (!role) {
      fail(where, `неизвестная роль «${id}»`)
      continue
    }
    if (!Number.isInteger(count) || count < 0) {
      fail(where, `${id}: «${count}» — не целое неотрицательное`)
      continue
    }
    if (role.unique && count > 1) fail(where, `уникальная роль ${id} — ${count} карты`)
    sum += count
  }
  if (sum !== expectedCards(players)) fail(where, `карт ${sum}, нужно ${expectedCards(players)}`)
}
for (const key of Object.keys(directorsCut)) {
  const players = Number(key)
  if (!(players >= QUEST_MIN_PLAYERS && players <= TABLE_MAX_PLAYERS)) {
    fail('составы Quest', `лишняя строка на ${key} игроков`)
  }
}

// --- Quest: планшеты Director's Cut — походов 5 (на 4 игрока 4), отряд не больше числа игроков ---

for (let players = QUEST_MIN_PLAYERS; players <= TABLE_MAX_PLAYERS; players++) {
  const where = `планшет Quest на ${players}`
  const quests = tableaus[players]
  const need = players === QUEST_MIN_PLAYERS ? 4 : 5
  if (!Array.isArray(quests)) {
    fail(where, 'нет планшета')
    continue
  }
  if (quests.length !== need) fail(where, `походов ${quests.length}, нужно ${need}`)
  for (const [i, quest] of quests.entries()) {
    const sizes = typeof quest.team === 'number' ? [quest.team] : quest.team
    for (const size of sizes) {
      if (!Number.isInteger(size) || size < 2 || size > players) fail(`${where}, поход ${i + 1}`, `отряд «${size}»`)
    }
    if (typeof quest.doubleFail !== 'boolean' || typeof quest.amulet !== 'boolean') fail(`${where}, поход ${i + 1}`, 'флаги не boolean')
  }
}

// --- Quest: тексты по языкам; языка нет в списке — режим в нём скрыт ---

for (const [lang, texts] of Object.entries(questTexts)) {
  const at = `тексты Quest ${lang}`
  /** Все тексты языка: нормализованный текст → где встретился впервые. Повтор в любом поле — ошибка. */
  const seenTexts = new Map()
  const text = (where, value, limit) => {
    if (typeof value !== 'string' || !value.trim()) {
      fail(where, 'пустой текст')
      return
    }
    if (length(value) > limit) fail(where, `длина ${length(value)} > ${limit}`)
    const key = normalize(value)
    const first = seenTexts.get(key)
    if (first) fail(where, `повторяет ${first}`)
    else seenTexts.set(key, where)
  }
  const list = (where, value) => {
    if (Array.isArray(value)) return value
    fail(where, 'не массив')
    return []
  }
  const withIds = (where, items) => {
    const ids = new Set()
    for (const [i, item] of items.entries()) {
      const label = `${where} #${i + 1}${Number.isInteger(item?.id) ? ` (id ${item.id})` : ''}`
      if (!Number.isInteger(item?.id) || item.id <= 0) fail(label, `id «${item?.id}» — не целое положительное`)
      else if (ids.has(item.id)) fail(label, 'id повторяется')
      else ids.add(item.id)
    }
  }

  const tales = list(`${at}, походы`, texts.tales)
  if (tales.length === 0) fail(`${at}, походы`, 'нет ни одного похода')
  withIds(`${at}, поход`, tales)
  for (const [i, tale] of tales.entries()) {
    for (const field of ['title', 'setup', 'success', 'fail', 'failHeavy']) {
      text(`${at}, поход #${i + 1} ${field}`, tale?.[field], MAX_QUEST_TEXT)
    }
  }

  const intros = list(`${at}, вступления`, texts.intros)
  if (intros.length === 0) fail(`${at}, вступления`, 'нет ни одного вступления')
  withIds(`${at}, вступление`, intros)
  for (const [i, intro] of intros.entries()) text(`${at}, вступление #${i + 1}`, intro?.text, MAX_QUEST_TEXT)
  text(`${at}, introLore`, texts.introLore, MAX_QUEST_TEXT)

  for (const kind of QUEST_BRIDGE_KINDS) {
    const variants = list(`${at}, связки ${kind}`, texts.bridges?.[kind])
    if (variants.length === 0) fail(`${at}, связки ${kind}`, 'нет ни одного варианта')
    for (const [i, bridge] of variants.entries()) text(`${at}, связка ${kind} #${i + 1}`, bridge, MAX_QUEST_BRIDGE)
  }
  for (const kind of Object.keys(texts.bridges ?? {})) {
    if (!QUEST_BRIDGE_KINDS.includes(kind)) fail(`${at}, связки`, `неизвестный вид «${kind}»`)
  }

  for (const kind of QUEST_FINALE_KINDS) {
    const variants = list(`${at}, финал ${kind}`, texts.finales?.[kind])
    if (variants.length !== QUEST_FINALE_VARIANTS) {
      fail(`${at}, финал ${kind}`, `вариантов ${variants.length}, нужно ${QUEST_FINALE_VARIANTS}`)
    }
    for (const [i, finale] of variants.entries()) text(`${at}, финал ${kind} #${i + 1}`, finale, MAX_QUEST_TEXT)
  }
  for (const kind of Object.keys(texts.finales ?? {})) {
    if (!QUEST_FINALE_KINDS.includes(kind)) fail(`${at}, финалы`, `неизвестный вид «${kind}»`)
  }

  for (const id of QUEST_ROLE_IDS) {
    text(`${at}, вставка во вступление ${id}`, texts.introRoleLines?.[id], MAX_QUEST_TEXT)
    text(`${at}, вставка в финал ${id}`, texts.finaleRoleLines?.[id], MAX_QUEST_TEXT)
  }
  for (const [field, lines] of [
    ['introRoleLines', texts.introRoleLines],
    ['finaleRoleLines', texts.finaleRoleLines],
  ]) {
    for (const [id, line] of Object.entries(lines ?? {})) {
      if (!QUEST_ROLE_IDS.includes(id)) fail(`${at}, ${field}`, `неизвестная роль «${id}»`)
    }
  }

  text(`${at}, introHiddenLine`, texts.introHiddenLine, MAX_QUEST_TEXT)
  for (const field of ['start', 'evil', 'hunter', 'scion', 'arthur', 'cleric', 'trickster', 'end']) {
    text(`${at}, ночь ${field}`, texts.night?.[field], MAX_QUEST_TEXT)
  }
  for (const id of QUEST_NIGHT_OUTSIDERS) text(`${at}, ночь outsiders.${id}`, texts.night?.outsiders?.[id], MAX_QUEST_TEXT)
  // Абзацы ночи — в самом длинном виде: все шаги и все вставки (при 4 игроках, со всеми ролями).
  if (texts.night?.outsiders) {
    const all = Object.fromEntries(QUEST_ROLE_IDS.map((id) => [id, 1]))
    for (const [i, line] of nightLines(texts, QUEST_MIN_PLAYERS, all).entries()) {
      if (length(line) > MAX_QUEST_TEXT) fail(`${at}, ночь абзац #${i + 1}`, `длина ${length(line)} > ${MAX_QUEST_TEXT}`)
    }
  }
  text(`${at}, council`, texts.council, MAX_QUEST_TEXT)
  text(`${at}, councilRevealerLine`, texts.councilRevealerLine, MAX_QUEST_TEXT)
}

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
const danetkiStats = LANGS.map((lang) => {
  const list = danetki[lang]
  const dark = list.filter((danetka) => danetka.tone === 'dark').length
  return `${lang} ${list.length} (светлых ${list.length - dark}, мрачных ${dark})`
})
const questStats = Object.entries(questTexts)
  .map(([lang, texts]) => {
    const finales = QUEST_FINALE_KINDS.reduce((sum, kind) => sum + texts.finales[kind].length, 0)
    return `Quest ${lang}: походов ${texts.tales.length}, вступлений ${texts.intros.length}, финалов ${finales}`
  })
  .join('; ')
console.log(
  `✓ Контент в порядке — ${stats.join('; ')}; ролей «Мафии» ${roles.length}; тем «Шпиона» ${themes.length}; уровней Alias ${aliasLevels.length}; данеток: ${danetkiStats.join(', ')}; Quest: ролей ${questRoles.length}, составов ${Object.keys(directorsCut).length}; ${questStats}`,
)
