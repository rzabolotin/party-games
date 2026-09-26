import type { DeckType, Faction, Lang } from '~/types'

/** Название приложения — одна запись; в манифесте продублировано в nuxt.config.ts. */
export const APP_NAME = 'Костёр'

/** Строки интерфейса. Текущий язык — в настройках; строки на нём выдаёт useMessages(). */
export interface Messages {
  deckTypes: Record<DeckType, string>
  adult: string
  /** Подпись ссылки «назад» на главную — список игр. */
  decks: string
  deckNotFound: string
  next: string
  finished: string
  restart: string
  /** Кнопка на финальной карточке: назад к темам раздела. */
  toDecks: string
  settings: string
  back: string
  language: string
  fontSize: string
  fontSizes: Record<'1' | '1.2' | '1.4', string>
  fontSample: string
  players: string
  playerName: string
  addPlayer: string
  removePlayer: string
  showReader: string
  showReaderHint: string
  nextReader: string
  resetProgress: string
  resetConfirm: string
  mafia: string
  mafiaSubtitle: string
  mafiaPlayersCount: string
  mafiaRoles: string
  factions: Record<Faction, string>
  /** Подсказка под составом: показывается, но раздачу не блокирует. */
  mafiaWarnings: Record<'noMafia' | 'tooMuchMafia' | 'noCivilians', string>
  mafiaDeal: string
  /** Подпись под рубашкой: {n} — номер игрока, {m} — сколько всего. */
  mafiaPlayerOf: string
  mafiaReveal: string
  mafiaPass: string
  mafiaExit: string
  mafiaExitConfirm: string
  mafiaLineup: string
  mafiaNightOrder: string
  mafiaNightIntro: string
  mafiaRedeal: string
  mafiaEditSetup: string
  spy: string
  spySubtitle: string
  spyPlayersCount: string
  spySpiesCount: string
  spyMinutes: string
  spyThemes: string
  /** Подсказка под счётчиками: показывается, но раздачу не блокирует. */
  spyWarnings: Record<'moreSpies' | 'tooManySpies', string>
  /** Почему «Раздать» заблокирована: не отмечено ни одной темы. */
  spyNoThemes: string
  spyDeal: string
  /** Подпись в шапке раздачи: {n} — номер игрока, {m} — сколько всего. */
  spyPlayerOf: string
  spyReveal: string
  spyYouAreSpy: string
  spyPass: string
  spyExit: string
  spyExitConfirm: string
  spyAllSeen: string
  spyStart: string
  spyTimeLeft: string
  spyPause: string
  spyResume: string
  spyPaused: string
  spyFinish: string
  spyFinishConfirm: string
  spyTimeout: string
  spyRoundOver: string
  spyNewRound: string
  spyEditSetup: string
}

/** Названия языков — на самом языке, чтобы переключатель читался при любом текущем. */
export const langNames: Record<Lang, string> = {
  ru: 'Русский',
  en: 'English',
}

export const messages: Record<Lang, Messages> = {
  ru: {
    deckTypes: {
      'most-likely': 'Кто из нас скорее всего…',
      'would-you-rather': 'Что бы ты выбрал',
      'never-have-i': 'Я никогда не…',
    },
    adult: 'Для взрослых',
    decks: 'Игры',
    deckNotFound: 'Колода не найдена',
    next: 'Дальше',
    finished: 'Вопросы закончились',
    restart: 'Заново',
    toDecks: 'К темам',
    settings: 'Настройки',
    back: 'Назад',
    language: 'Язык',
    fontSize: 'Размер шрифта',
    fontSizes: { '1': 'Обычный', '1.2': 'Крупный', '1.4': 'Огромный' },
    fontSample: 'Кто из нас скорее всего заснёт первым у костра?',
    players: 'Игроки',
    playerName: 'Имя',
    addPlayer: 'Добавить',
    removePlayer: 'Удалить',
    showReader: 'Показывать, кто читает',
    showReaderHint: 'Добавьте имена игроков, чтобы включить.',
    nextReader: 'Следующий:',
    resetProgress: 'Сбросить весь прогресс',
    resetConfirm: 'Сбросить прогресс всех колод? Отменить будет нельзя.',
    mafia: 'Мафия',
    mafiaSubtitle: 'Раздача ролей',
    mafiaPlayersCount: 'Игроков',
    mafiaRoles: 'Роли',
    factions: { mafia: 'Мафия', town: 'Город', solo: 'Сам за себя' },
    mafiaWarnings: {
      noMafia: 'В составе нет мафии — искать будет некого.',
      tooMuchMafia: 'Мафии половина стола и больше — у города почти нет шансов.',
      noCivilians: 'Мирных жителей не осталось.',
    },
    mafiaDeal: 'Раздать роли',
    mafiaPlayerOf: 'Игрок {n} из {m}',
    mafiaReveal: 'Тапни, чтобы увидеть роль',
    mafiaPass: 'Передать дальше',
    mafiaExit: 'Выйти',
    mafiaExitConfirm: 'Прервать раздачу? Роли придётся раздать заново.',
    mafiaLineup: 'Состав партии',
    mafiaNightOrder: 'Порядок ночи',
    mafiaNightIntro: 'Город засыпает',
    mafiaRedeal: 'Раздать заново',
    mafiaEditSetup: 'Изменить состав',
    spy: 'Шпион',
    spySubtitle: 'Найди, кто не в теме',
    spyPlayersCount: 'Игроков',
    spySpiesCount: 'Шпионов',
    spyMinutes: 'Минут на раунд',
    spyThemes: 'Темы',
    spyWarnings: {
      moreSpies: 'За большим столом интереснее играть с двумя шпионами.',
      tooManySpies: 'Шпионов половина стола и больше — вычислить их будет почти некому.',
    },
    spyNoThemes: 'Отметьте хотя бы одну тему, чтобы раздать.',
    spyDeal: 'Раздать',
    spyPlayerOf: 'Игрок {n} из {m}',
    spyReveal: 'Тапни, чтобы увидеть карточку',
    spyYouAreSpy: 'Ты шпион',
    spyPass: 'Передать дальше',
    spyExit: 'Выйти',
    spyExitConfirm: 'Прервать раздачу? Карточки придётся раздать заново.',
    spyAllSeen: 'Все посмотрели',
    spyStart: 'Старт',
    spyTimeLeft: 'Осталось',
    spyPause: 'Пауза',
    spyResume: 'Продолжить',
    spyPaused: 'Пауза',
    spyFinish: 'Завершить',
    spyFinishConfirm: 'Завершить раунд?',
    spyTimeout: 'Время вышло — шпион победил!',
    spyRoundOver: 'Раунд окончен',
    spyNewRound: 'Новый раунд',
    spyEditSetup: 'Изменить состав',
  },
  en: {
    deckTypes: {
      'most-likely': 'Most Likely To',
      'would-you-rather': 'Would You Rather',
      'never-have-i': 'Never Have I Ever',
    },
    adult: 'Adults only',
    decks: 'Games',
    deckNotFound: 'Deck not found',
    next: 'Next',
    finished: 'No more questions',
    restart: 'Restart',
    toDecks: 'To topics',
    settings: 'Settings',
    back: 'Back',
    language: 'Language',
    fontSize: 'Font size',
    fontSizes: { '1': 'Normal', '1.2': 'Large', '1.4': 'Huge' },
    fontSample: 'Who is most likely to fall asleep first by the fire?',
    players: 'Players',
    playerName: 'Name',
    addPlayer: 'Add',
    removePlayer: 'Remove',
    showReader: 'Show who reads next',
    showReaderHint: 'Add player names to enable.',
    nextReader: 'Next up:',
    resetProgress: 'Reset all progress',
    resetConfirm: 'Reset progress of all decks? This cannot be undone.',
    mafia: 'Mafia',
    mafiaSubtitle: 'Deal out roles',
    mafiaPlayersCount: 'Players',
    mafiaRoles: 'Roles',
    factions: { mafia: 'Mafia', town: 'Town', solo: 'On their own' },
    mafiaWarnings: {
      noMafia: 'No mafia in the line-up — there will be nobody to find.',
      tooMuchMafia: 'Mafia is half the table or more — the town has almost no chance.',
      noCivilians: 'No civilians left.',
    },
    mafiaDeal: 'Deal roles',
    mafiaPlayerOf: 'Player {n} of {m}',
    mafiaReveal: 'Tap to see your role',
    mafiaPass: 'Pass on',
    mafiaExit: 'Exit',
    mafiaExitConfirm: 'Stop dealing? The roles will have to be dealt again.',
    mafiaLineup: 'Line-up',
    mafiaNightOrder: 'Night order',
    mafiaNightIntro: 'The town falls asleep',
    mafiaRedeal: 'Deal again',
    mafiaEditSetup: 'Change line-up',
    spy: 'Spy',
    spySubtitle: 'Find who is out of the loop',
    spyPlayersCount: 'Players',
    spySpiesCount: 'Spies',
    spyMinutes: 'Minutes per round',
    spyThemes: 'Themes',
    spyWarnings: {
      moreSpies: 'A big table is more fun with two spies.',
      tooManySpies: 'Spies are half the table or more — there will be almost nobody to catch them.',
    },
    spyNoThemes: 'Pick at least one theme to deal.',
    spyDeal: 'Deal',
    spyPlayerOf: 'Player {n} of {m}',
    spyReveal: 'Tap to see your card',
    spyYouAreSpy: 'You are the spy',
    spyPass: 'Pass on',
    spyExit: 'Exit',
    spyExitConfirm: 'Stop dealing? The cards will have to be dealt again.',
    spyAllSeen: 'Everyone has seen their card',
    spyStart: 'Start',
    spyTimeLeft: 'Time left',
    spyPause: 'Pause',
    spyResume: 'Resume',
    spyPaused: 'Paused',
    spyFinish: 'End round',
    spyFinishConfirm: 'End the round?',
    spyTimeout: 'Time is up — the spy wins!',
    spyRoundOver: 'Round over',
    spyNewRound: 'New round',
    spyEditSetup: 'Change setup',
  },
}
