import type { Lang, SpySetup, ThemeId } from '~/types'
import { wordsOf } from '~/spy/themes'

export interface SpyDeal {
  theme: ThemeId
  word: string
  /** i-й элемент — шпион ли i-й игрок; имён в раскладе нет, игроки безымянные. */
  isSpy: boolean[]
}

/** Ключ сыгранного слова: язык в нём, чтобы смена языка посреди вечера ничего не путала. */
export function playedKey(lang: Lang, theme: ThemeId, word: string): string {
  return `${lang}:${theme}:${word}`
}

/**
 * Раздача на раунд: сначала тема среди отмеченных, где остались несыгранные слова, потом
 * несыгранное слово в ней, шпионы рассаживаются Фишером–Йетсом. Если несыгранных не осталось
 * нигде, выбор идёт из всех слов отмеченных тем — забыть сыгранные должен вызывающий.
 * Чистая функция: `random` подменяется в проверках, в приложении это `Math.random`.
 * Отмеченных тем со словами на этом языке должно быть хотя бы одна — за этим следит экран настроек.
 */
export function dealSpy(
  setup: SpySetup,
  lang: Lang,
  played: ReadonlySet<string>,
  random: () => number = Math.random,
): SpyDeal {
  const pick = <T>(items: readonly T[]): T => items[Math.floor(random() * items.length)]!

  const fresh = (theme: ThemeId) => wordsOf(lang, theme).filter((word) => !played.has(playedKey(lang, theme, word)))
  let candidates = setup.themes.filter((theme) => fresh(theme).length > 0)
  const exhausted = candidates.length === 0
  if (exhausted) candidates = setup.themes.filter((theme) => wordsOf(lang, theme).length > 0)

  const theme = pick(candidates)
  const word = pick(exhausted ? wordsOf(lang, theme) : fresh(theme))

  const isSpy = Array.from({ length: setup.total }, (_, i) => i < setup.spies)
  for (let i = isSpy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[isSpy[i], isSpy[j]] = [isSpy[j]!, isSpy[i]!]
  }
  return { theme, word, isSpy }
}

/** Слова, сыгранные за сессию. Только в памяти: после перезагрузки страницы список пустой. */
const played = new Set<string>()

/**
 * Раздача с учётом сыгранного в этой сессии: слово запоминается и больше не выпадает.
 * Кончились несыгранные слова во всех отмеченных темах — сыгранные для этих тем забываются.
 */
export function dealNextRound(setup: SpySetup, lang: Lang): SpyDeal {
  const left = setup.themes.some((theme) =>
    wordsOf(lang, theme).some((word) => !played.has(playedKey(lang, theme, word))),
  )
  if (!left) {
    for (const theme of setup.themes) {
      for (const word of wordsOf(lang, theme)) played.delete(playedKey(lang, theme, word))
    }
  }
  const deal = dealSpy(setup, lang, played)
  played.add(playedKey(lang, deal.theme, deal.word))
  return deal
}
