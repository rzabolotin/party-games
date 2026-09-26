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
  alias: string
  aliasSubtitle: string
  aliasTeams: string
  /** Подпись для чтения с экрана у игрока: {name} — игрок, {team} — куда он уйдёт по тапу. */
  aliasMoveTo: string
  aliasMoveHint: string
  aliasTeamName: string
  aliasTeamEmoji: string
  aliasRemoveTeam: string
  aliasAddTeam: string
  aliasShuffle: string
  aliasPlayerName: string
  /** Подсказка под полем, когда состав упёрся в потолок; {n} — потолок. */
  aliasPlayersFull: string
  aliasTarget: string
  aliasTurnSeconds: string
  /** Подпись значения длительности; {n} — секунды. */
  aliasSeconds: string
  aliasLevels: string
  aliasSkipPenalty: string
  aliasSound: string
  /** Почему «Начать» недоступна; выводится над кнопкой. */
  aliasBlockers: Record<'fewPlayers' | 'smallTeam' | 'noLevels', string>
  aliasRules: string
  /** Пункты листа «Правила»; {n} — до скольки очков играть. */
  aliasRulesItems: string[]
  aliasStart: string
  /** Экран перед ходом: {team} — эмодзи и название ходящей команды. */
  aliasTurnOf: string
  aliasExplainer: string
  aliasScore: string
  aliasReminder: string
  aliasReady: string
  aliasExit: string
  aliasExitConfirm: string
  aliasResetTurn: string
  aliasResetConfirm: string
  aliasTimeLeft: string
  aliasGuessed: string
  aliasSkip: string
  aliasSwipeHint: string
  aliasLastWord: string
  aliasLastWho: string
  aliasNobody: string
  aliasReview: string
  aliasReviewHint: string
  /** Подпись для чтения с экрана у последнего слова: {word} — слово, {team} — кому очко. */
  aliasLastTo: string
  aliasConfirm: string
  aliasFinishEarly: string
  aliasFinishConfirm: string
  /** {team} — эмодзи и название команды-победителя. */
  aliasWinner: string
  aliasDraw: string
  aliasFinalScore: string
  aliasExplainedTitle: string
  aliasBest: string
  aliasRematch: string
  aliasNewGame: string
  aliasResumeTitle: string
  aliasResume: string
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
    alias: 'Alias',
    aliasSubtitle: 'Объясняй слова командами',
    aliasTeams: 'Команды',
    aliasMoveTo: '{name} — перевести в команду «{team}»',
    aliasMoveHint: 'Тап по игроку переводит его в следующую команду.',
    aliasTeamName: 'Название команды',
    aliasTeamEmoji: 'Значок команды',
    aliasRemoveTeam: 'Удалить команду',
    aliasAddTeam: '+ команда',
    aliasShuffle: 'Перемешать',
    aliasPlayerName: 'Добавить игрока',
    aliasPlayersFull: 'Больше {n} игроков добавить нельзя.',
    aliasTarget: 'До скольки очков',
    aliasTurnSeconds: 'Длительность хода',
    aliasSeconds: '{n} с',
    aliasLevels: 'Слова',
    aliasSkipPenalty: 'Штраф за пропуск',
    aliasSound: 'Звук',
    aliasBlockers: {
      fewPlayers: 'Нужно хотя бы 4 игрока.',
      smallTeam: 'В каждой команде должно быть хотя бы 2 человека.',
      noLevels: 'Отметьте хотя бы один уровень слов.',
    },
    aliasRules: 'Правила',
    aliasRulesItems: [
      'Команды ходят по очереди, объясняющий внутри команды меняется.',
      'Объясняй слово другими словами. Нельзя однокоренные, жесты, звуки «похоже на…» и перевод на другой язык.',
      'Угадали — +1, пропустили — −1, если штраф включён.',
      'Когда время вышло, последнее слово могут угадывать все. Очко получает команда, которая угадала первой.',
      'После хода слова можно исправить.',
      'Игра идёт до {n} очков, круг доигрывается до конца, при ничьей играется ещё круг.',
    ],
    aliasStart: 'Начать',
    aliasTurnOf: 'Ходят {team}',
    aliasExplainer: 'объясняет',
    aliasScore: 'Счёт',
    aliasReminder: 'Нельзя: однокоренные, жесты, перевод',
    aliasReady: 'Я готов',
    aliasExit: 'Выйти',
    aliasExitConfirm: 'Выйти из партии? Счёт сохранится, её можно будет продолжить. Незаконченный ход не засчитается.',
    aliasResetTurn: 'Сбросить ход',
    aliasResetConfirm: 'Сбросить ход? Очки этого хода не засчитаются, ход начнётся заново.',
    aliasTimeLeft: 'Осталось',
    aliasGuessed: 'Угадали',
    aliasSkip: 'Пропустить',
    aliasSwipeHint: 'Вверх — угадали, вниз — пропуск',
    aliasLastWord: 'Время вышло! Последнее слово угадывают все',
    aliasLastWho: 'Кто угадал первым?',
    aliasNobody: 'Никто',
    aliasReview: 'Разбор хода',
    aliasReviewHint: 'Тап по слову меняет отметку.',
    aliasLastTo: '{word} — очко: {team}',
    aliasConfirm: 'Подтвердить',
    aliasFinishEarly: 'Закончить досрочно',
    aliasFinishConfirm: 'Закончить партию сейчас? Победит команда, которая ведёт.',
    aliasWinner: '🏆 Победили {team}!',
    aliasDraw: 'Ничья',
    aliasFinalScore: 'Итоговый счёт',
    aliasExplainedTitle: 'Кто сколько объяснил',
    aliasBest: 'Лучший объясняющий',
    aliasRematch: 'Реванш',
    aliasNewGame: 'Новая игра',
    aliasResumeTitle: 'Продолжить партию?',
    aliasResume: 'Продолжить',
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
    alias: 'Alias',
    aliasSubtitle: 'Explain words in teams',
    aliasTeams: 'Teams',
    aliasMoveTo: '{name} — move to team “{team}”',
    aliasMoveHint: 'Tap a player to move them to the next team.',
    aliasTeamName: 'Team name',
    aliasTeamEmoji: 'Team icon',
    aliasRemoveTeam: 'Remove team',
    aliasAddTeam: '+ team',
    aliasShuffle: 'Shuffle',
    aliasPlayerName: 'Add a player',
    aliasPlayersFull: 'No more than {n} players.',
    aliasTarget: 'Play to',
    aliasTurnSeconds: 'Turn length',
    aliasSeconds: '{n} s',
    aliasLevels: 'Words',
    aliasSkipPenalty: 'Penalty for skipping',
    aliasSound: 'Sound',
    aliasBlockers: {
      fewPlayers: 'You need at least 4 players.',
      smallTeam: 'Every team needs at least 2 people.',
      noLevels: 'Pick at least one word level.',
    },
    aliasRules: 'Rules',
    aliasRulesItems: [
      'Teams take turns, and the explainer within a team rotates.',
      'Explain the word in other words. No words with the same root, no gestures, no “sounds like…” and no translating into another language.',
      'Guessed — +1, skipped — −1 if the penalty is on.',
      'When time is up, everyone may guess the last word. The team that guesses first gets the point.',
      'After the turn, words can be corrected.',
      'Play to {n} points; the round is played to the end, and a tie for first place means one more round.',
    ],
    aliasStart: 'Start',
    aliasTurnOf: '{team} to play',
    aliasExplainer: 'explaining',
    aliasScore: 'Score',
    aliasReminder: 'No same-root words, gestures or translation',
    aliasReady: 'I’m ready',
    aliasExit: 'Exit',
    aliasExitConfirm: 'Leave the game? The score is saved and you can continue later. An unfinished turn will not count.',
    aliasResetTurn: 'Restart turn',
    aliasResetConfirm: 'Restart the turn? Its points will not count, and the turn starts over.',
    aliasTimeLeft: 'Time left',
    aliasGuessed: 'Got it',
    aliasSkip: 'Skip',
    aliasSwipeHint: 'Swipe up — got it, down — skip',
    aliasLastWord: 'Time’s up! Anyone can guess the last word',
    aliasLastWho: 'Who guessed first?',
    aliasNobody: 'Nobody',
    aliasReview: 'Turn review',
    aliasReviewHint: 'Tap a word to change its mark.',
    aliasLastTo: '{word} — point: {team}',
    aliasConfirm: 'Confirm',
    aliasFinishEarly: 'End game early',
    aliasFinishConfirm: 'End the game now? The team in the lead wins.',
    aliasWinner: '🏆 {team} win!',
    aliasDraw: 'It’s a draw',
    aliasFinalScore: 'Final score',
    aliasExplainedTitle: 'Words explained',
    aliasBest: 'Best explainer',
    aliasRematch: 'Rematch',
    aliasNewGame: 'New game',
    aliasResumeTitle: 'Continue the game?',
    aliasResume: 'Continue',
  },
}
