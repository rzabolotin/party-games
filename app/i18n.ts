import type { DeckType, Faction, Lang, QuestFinaleKind } from '~/types'

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
  danetki: string
  danetkiSubtitle: string
  danetkiRulesTitle: string
  /** Пункты «Как играть» на экране начала. */
  danetkiRules: string[]
  danetkiDark: string
  danetkiDarkNote: string
  /** Экран начала: {n} — неразгаданных в наборе, {m} — размер набора. */
  danetkiLeft: string
  danetkiStart: string
  danetkiContinue: string
  /** Кнопка в шапке истории: назад к экрану начала с правилами и переключателем. */
  danetkiToStart: string
  /** Счётчик в шапке истории для чтения с экрана: {n} — разгадано, {m} — размер набора. */
  danetkiSolved: string
  danetkiDarkMark: string
  danetkiReveal: string
  danetkiAnswer: string
  danetkiHide: string
  danetkiNext: string
  danetkiNextConfirm: string
  danetkiDone: string
  /** Подсказка на финале, когда мрачные выключены; {n} — сколько там неразгаданных. */
  danetkiDarkLeft: string
  danetkiRestart: string
  danetkiNoStories: string
  quest: string
  questSubtitle: string
  /** Подпись на экране настройки: чей это помощник. */
  questTagline: string
  questPlayersCount: string
  questSides: Record<'good' | 'evil', string>
  /** Пометка при 4–5 игроках. */
  questHiddenNote: string
  /** Сумма карт под составом: {n} — в составе, {m} — нужно. */
  questCards: string
  /** Предупреждения под составом: показываются, но начать не мешают; в `wrongCount` {m} — сколько нужно. */
  questWarnings: Record<'nonStandard' | 'wrongCount', string>
  questStart: string
  questToSetup: string
  questNoTexts: string
  questResumeTitle: string
  questResume: string
  questNewGame: string
  /** Подзаголовок текста про ночь на экране вступления. */
  questNightTitle: string
  questStartNight: string
  /** Маленькая кнопка в углу чёрного экрана ночи. */
  questStopNight: string
  /** {n} — номер похода. */
  questNumber: string
  questTokensHint: string
  /** Размер отряда по планшету: {n} — сколько игроков. */
  questTeamSize: string
  /** На 4 игрока два планшета, и на 3-м и 4-м походах размеры разные: {a} или {b}. */
  questTeamSizeEither: string
  questDoubleFail: string
  /** Галочка «после похода вручают амулет» — ставится по планшету. */
  questAmulet: string
  questFailsPrompt: string
  /** Кнопка «три и больше» в вводе провалов. */
  questFailsMore: string
  questOutcome: Record<'success' | 'fail', string>
  /** Под заголовком исхода: {n} — сколько карт «Провал». */
  questFailsCount: string
  questCancel: string
  questPassLeadership: string
  questToFinale: string
  questToCouncil: string
  questHandoffTitle: string
  /** Подсказки передачи лидерства — по пункту на строку; `amulet` — только после похода, где вручают амулет (галочка на вводе). */
  questHandoffRules: { amulet: string[]; leader: string[] }
  questNewLeader: string
  /** Заголовок над текстом финала — кто и как победил. */
  questFinaleTitles: Record<QuestFinaleKind, string>
  questCouncil: string
  /** Под текстом совета: сколько обсуждать и что может Охотник. */
  questCouncilHint: string
  /** Подпись таймера совета для экранного диктора. */
  questCouncilTimer: string
  questHunt: string
  questToLastChance: string
  questHuntTitle: string
  /**
   * Правила Охоты: `base` — всегда; `target` — кого обязательно назвать, `targetArthur` вместо него, если Артур в составе;
   * `hidden` — при 4–5 игроках, `dukes` — если в составе Герцог или Эрцгерцог.
   */
  questHuntRules: { base: string; target: string; targetArthur: string; hidden: string; dukes: string; verdict: string }
  questHuntQuestion: string
  questHuntAnswers: Record<'yes' | 'no', string>
  /** Охоту объявили по ошибке — назад к совету. */
  questHuntBack: string
  questLastChanceTitle: string
  /** Подсказка Последнего шанса; строки `roles` — только для ролей из состава. */
  questLastChanceRules: {
    point: string
    roles: Record<'duke' | 'archduke' | 'apprentice' | 'mutineer', string>
    verdict: string
    veterans: string
  }
  questLastChanceQuestion: string
  questLastChanceResults: Record<'lastChanceGood' | 'lastChanceEvil' | 'veteransEvil', string>
  /** Кнопка справки в шапке партии и заголовок её слоя. */
  questHelp: string
  questHelpClose: string
  questHelpRoles: string
  /** Под ролями партии при 4–5 игроках. */
  questHelpHidden: string
  questHelpQuest: string
  /** Счёт в справке: {good} и {evil} — сколько походов у каждой стороны, {need} — порог провалов. */
  questHelpScore: string
  questHelpDoubleFail: string
  questHelpNow: string
  /**
   * Что делать на каждой фазе — по пункту на строку. Ночью справка недоступна (экран чёрный),
   * поэтому ночь описана во вступлении. В совете `revealer` (первой строкой) — только если Разоблачённый
   * в составе, `hunter` — только если Охотник в составе,
   * а объявленной Охоте вместо совета — `hunt`, между `reveal` и `result` — кого обязательно назвать;
   * в Последнем шансе между `point` и `result` встают строки `questLastChanceRules.roles` ролей состава.
   */
  questHelpPhases: Record<'intro' | 'quest' | 'outcome' | 'finale', string[]> & {
    hunt: { reveal: string; result: string }
    /** `amulet` — первой строкой, только после похода, где вручают амулет. */
    handoff: { amulet: string; base: string[] }
    council: { base: string[]; hunter: string; revealer: string }
    lastChance: { point: string; result: string }
  }
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
    danetki: 'Данетки',
    danetkiSubtitle: 'Загадочные истории',
    danetkiRulesTitle: 'Как играть',
    danetkiRules: [
      'Ведущий читает историю вслух, а ответ смотрит тайком.',
      'Остальные задают вопросы, на которые можно ответить «да» или «нет».',
      'Ведущий отвечает только «да», «нет» или «неважно».',
      'Разгадали или сдались — ведущий читает ответ и передаёт телефон следующему.',
    ],
    danetkiDark: 'Мрачные истории',
    danetkiDarkNote: 'Про смерти и преступления',
    danetkiLeft: 'Осталось историй: {n} из {m}',
    danetkiStart: 'Начать',
    danetkiContinue: 'Продолжить',
    danetkiToStart: 'Правила',
    danetkiSolved: 'Разгадано {n} из {m}',
    danetkiDarkMark: 'Мрачная история',
    danetkiReveal: 'Тапни, чтобы увидеть ответ',
    danetkiAnswer: 'Ответ',
    danetkiHide: 'Тапни, чтобы закрыть',
    danetkiNext: 'Следующая история',
    danetkiNextConfirm: 'Ответ ещё не открывали. Перейти к следующей? Эта история вернётся в колоду.',
    danetkiDone: 'Истории закончились',
    danetkiDarkLeft: 'Включите мрачные истории — там ещё {n}',
    danetkiRestart: 'Начать заново',
    danetkiNoStories: 'Историй на этом языке пока нет.',
    quest: 'Quest',
    questSubtitle: 'Рыцари Круглого стола',
    questTagline: 'Помощник для настольной игры Quest',
    questPlayersCount: 'Игроков',
    questSides: { good: 'Добро', evil: 'Зло' },
    questHiddenNote: 'Карт на одну больше, чем игроков: одну роль добра положите рубашкой вверх под планшет.',
    questCards: 'Карт в составе: {n} из {m}',
    questWarnings: {
      nonStandard: 'Состав нестандартный — не по таблице Director’s Cut.',
      wrongCount: 'Сумма карт не сходится: нужно {m}.',
    },
    questStart: 'Начать',
    questToSetup: 'К настройке',
    questNoTexts: 'Quest пока есть только на русском.',
    questResumeTitle: 'Продолжить партию?',
    questResume: 'Продолжить',
    questNewGame: 'Новая партия',
    questNightTitle: 'Ночь',
    questStartNight: 'Начать ночь',
    questStopNight: 'Прервать',
    questNumber: 'Поход {n}',
    questTokensHint: 'Раздай жетоны отряда и жетон магии.',
    questTeamSize: 'Размер отряда: {n}.',
    questTeamSizeEither: 'Размер отряда: {a} или {b} — смотря какой у вас планшет.',
    questDoubleFail: 'В этом походе нужно 2 провала',
    questAmulet: 'После похода вручают амулет',
    questFailsPrompt: 'Сколько карт «Провал»?',
    questFailsMore: '3+',
    questOutcome: { success: 'Успех', fail: 'Провал' },
    questFailsCount: 'Карт «Провал»: {n}',
    questCancel: 'Отменить',
    questPassLeadership: 'Передать лидерство',
    questToFinale: 'К финалу',
    questToCouncil: 'К совету',
    questHandoffTitle: 'Передача лидерства',
    questHandoffRules: {
      amulet: [
        'После этого похода — амулет. Лидер вручает его игроку, у которого амулета ещё нет. Себе вручить нельзя.',
        'Держатель амулета выбирает другого игрока и тайно смотрит, на чьей он стороне.',
      ],
      leader: [
        'Новый лидер — игрок, который ещё не был лидером (не ветеран) и не держит амулет.',
        'Отдай новому лидеру жетон лидера и телефон.',
      ],
    },
    questNewLeader: 'Я новый лидер',
    questFinaleTitles: {
      goodQuests: 'Победа добра',
      huntWon: 'Охота удалась — победа зла',
      huntLost: 'Охота не удалась — победа добра',
      lastChanceGood: 'Последний шанс — победа добра',
      lastChanceEvil: 'Последний шанс — победа зла',
      veteransEvil: 'Все ветераны злые — победа добра',
    },
    questCouncil: 'Финальный совет',
    questCouncilHint: 'Обсуждайте до 5 минут. Слепой Охотник может в любой момент открыться и объявить Охоту.',
    questCouncilTimer: 'Осталось времени',
    questHunt: 'Охотник объявил Охоту',
    questToLastChance: 'К Последнему шансу',
    questHuntTitle: 'Охота',
    questHuntRules: {
      base: 'Охотник открывает свою карту и называет двух добрых игроков по их ролям.',
      target: 'Одним из двух обязательно должен быть Клирик.',
      targetArthur: 'Одним из двух обязательно должен быть Клирик или король Артур.',
      hidden: 'Можно назвать и карту, что лежит рубашкой вверх под планшетом.',
      dukes: 'Герцог и Эрцгерцог в Охоте считаются Верными слугами.',
      verdict: 'Угадал обе роли — побеждает зло, ошибся хотя бы в одной — добро.',
    },
    questHuntQuestion: 'Охотник угадал обе роли?',
    questHuntAnswers: { yes: 'Угадал', no: 'Не угадал' },
    questHuntBack: 'Охоты не было',
    questLastChanceTitle: 'Последний шанс',
    questLastChanceRules: {
      point: 'Все одновременно указывают на двух игроков, которых считают злодеями. Злодеи опускают руки.',
      roles: {
        duke: 'Герцог может отменить один голос — опустить чью-то руку.',
        archduke: 'Эрцгерцог может изменить один голос — перевести чью-то руку на другого игрока.',
        apprentice: 'Ученик указывает одной рукой; когда злодеи опустили руки, может поднять вторую.',
        mutineer:
          'Мятежник может перейти к добру: тогда он указывает руками как добрый и руки не опускает, а добро на него указывать не должно.',
      },
      verdict: 'Добрые указывают ровно на всех злодеев — победа добра, иначе победа зла.',
      veterans: 'Но если все ветераны (бывшие лидеры) оказались злыми — побеждает добро: злу нельзя вести все походы самому.',
    },
    questLastChanceQuestion: 'Чем закончился Последний шанс?',
    questLastChanceResults: {
      lastChanceGood: 'Добро указало верно',
      lastChanceEvil: 'Добро ошиблось',
      veteransEvil: 'Все ветераны злые',
    },
    questHelp: 'Справка',
    questHelpClose: 'Закрыть',
    questHelpRoles: 'Роли партии',
    questHelpHidden: 'Одна роль добра лежит рубашкой вверх под планшетом — её нет ни у кого из игроков.',
    questHelpQuest: 'Поход',
    questHelpScore: 'Успехов {good} из 3, провалов {evil} из {need}',
    questHelpDoubleFail: 'В этом походе нужно 2 провала.',
    questHelpNow: 'Что делать сейчас',
    questHelpPhases: {
      intro: [
        'Лидер читает вслух вступление, а за ним текст про ночь.',
        'Когда все готовы, лидер жмёт «Начать ночь», кладёт телефон экраном вниз и закрывает глаза.',
        'Ночью телефон подаёт сигналы с паузами: открывайте и закрывайте глаза по ним. Фанфары — все открывают глаза.',
      ],
      quest: [
        'Лидер читает завязку похода и выбирает отряд — размер отряда на экране похода.',
        'Лидер раздаёт жетоны отряда и жетон магии. Отряд тайно играет карты, лидер их перемешивает и вскрывает.',
        'Где по планшету нужно 2 провала, переключатель включится сам — стол может его снять. Затем введи число карт «Провал».',
      ],
      outcome: [
        'Лидер читает исход похода вслух.',
        'Ошиблись с числом провалов — «Отменить» вернёт к вводу того же похода.',
        'Дальше — «Передать лидерство», а если партия решилась — к финалу или совету.',
      ],
      handoff: {
        amulet: 'После этого похода вручают амулет, и держатель тайно смотрит сторону другого игрока.',
        base: [
          'Новым лидером становится тот, кто ещё не был лидером и не держит амулет.',
          'Телефон и жетон лидера уходят новому лидеру, он жмёт «Я новый лидер».',
        ],
      },
      council: {
        base: [
          'Зло провалило походы — но добро ещё может победить.',
          'Стол обсуждает, кто злодей, до 5 минут — таймер на экране.',
          'Время вышло или стол готов — «К Последнему шансу».',
        ],
        hunter: 'Слепой Охотник может в любой момент открыться и объявить Охоту — тогда «Охотник объявил Охоту».',
        revealer: 'Разоблачённый сразу открывает свою сторону.',
      },
      hunt: {
        reveal: 'Охотник открыл карту и называет двух добрых игроков по ролям.',
        result: 'Отметь, угадал ли Охотник обе роли. Охоту объявили по ошибке — «Охоты не было».',
      },
      lastChance: {
        point: 'Все одновременно указывают на двух игроков, которых считают злодеями. Злодеи опускают руки.',
        result: 'Отметь итог одной из трёх кнопок.',
      },
      finale: ['Лидер читает финал вслух.', '«Новая партия» — тот же состав и новое вступление, «К настройке» — сменить состав.'],
    },
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
    danetki: 'Lateral puzzles',
    danetkiSubtitle: 'Mystery stories',
    danetkiRulesTitle: 'How to play',
    danetkiRules: [
      'The host reads the story out loud and peeks at the answer in secret.',
      'Everyone else asks questions that can be answered “yes” or “no”.',
      'The host only answers “yes”, “no” or “doesn’t matter”.',
      'Solved it or gave up — the host reads the answer and passes the phone on.',
    ],
    danetkiDark: 'Dark stories',
    danetkiDarkNote: 'About death and crime',
    danetkiLeft: 'Stories left: {n} of {m}',
    danetkiStart: 'Start',
    danetkiContinue: 'Continue',
    danetkiToStart: 'Rules',
    danetkiSolved: 'Solved {n} of {m}',
    danetkiDarkMark: 'Dark story',
    danetkiReveal: 'Tap to see the answer',
    danetkiAnswer: 'Answer',
    danetkiHide: 'Tap to hide',
    danetkiNext: 'Next story',
    danetkiNextConfirm: 'The answer hasn’t been opened yet. Go to the next one? This story will go back into the deck.',
    danetkiDone: 'No stories left',
    danetkiDarkLeft: 'Turn on dark stories — {n} more there',
    danetkiRestart: 'Start over',
    danetkiNoStories: 'No stories in this language yet.',
    quest: 'Quest',
    questSubtitle: 'Knights of the Round Table',
    questTagline: 'A companion for the Quest board game',
    questPlayersCount: 'Players',
    questSides: { good: 'Good', evil: 'Evil' },
    questHiddenNote: 'One more card than players: put one Good role face down under the tableau.',
    questCards: 'Cards in the lineup: {n} of {m}',
    questWarnings: {
      nonStandard: 'Non-standard lineup — not the Director’s Cut table.',
      wrongCount: 'The card count is off: {m} needed.',
    },
    questStart: 'Start',
    questToSetup: 'Back to setup',
    questNoTexts: 'Quest is only available in Russian for now.',
    questResumeTitle: 'Continue the game?',
    questResume: 'Continue',
    questNewGame: 'New game',
    questNightTitle: 'Night',
    questStartNight: 'Start the night',
    questStopNight: 'Stop',
    questNumber: 'Quest {n}',
    questTokensHint: 'Hand out the team tokens and the magic token.',
    questTeamSize: 'Team size: {n}.',
    questTeamSizeEither: 'Team size: {a} or {b}, depending on your tableau.',
    questDoubleFail: 'This quest needs 2 fails',
    questAmulet: 'An amulet is handed over after this quest',
    questFailsPrompt: 'How many Fail cards?',
    questFailsMore: '3+',
    questOutcome: { success: 'Success', fail: 'Fail' },
    questFailsCount: 'Fail cards: {n}',
    questCancel: 'Undo',
    questPassLeadership: 'Pass leadership',
    questToFinale: 'To the finale',
    questToCouncil: 'To the council',
    questHandoffTitle: 'Passing leadership',
    questHandoffRules: {
      amulet: [
        'An amulet comes after this quest. The leader gives it to a player who has no amulet yet. Not to themselves.',
        'The amulet holder picks another player and secretly checks their loyalty.',
      ],
      leader: [
        'The new leader is a player who has not led yet (not a veteran) and holds no amulet.',
        'Give the new leader the leader token and the phone.',
      ],
    },
    questNewLeader: 'I’m the new leader',
    questFinaleTitles: {
      goodQuests: 'Good triumphs',
      huntWon: 'The Hunt succeeds — Evil wins',
      huntLost: 'The Hunt fails — Good wins',
      lastChanceGood: 'Last Chance — Good wins',
      lastChanceEvil: 'Last Chance — Evil wins',
      veteransEvil: 'All Veterans are Evil — Good wins',
    },
    questCouncil: 'Final Council',
    questCouncilHint: 'Discuss for up to 5 minutes. The Blind Hunter may reveal and start the Hunt at any time.',
    questCouncilTimer: 'Time left',
    questHunt: 'The Hunter called the Hunt',
    questToLastChance: 'To the Last Chance',
    questHuntTitle: 'The Hunt',
    questHuntRules: {
      base: 'The Hunter reveals their card and names two Good players by their roles.',
      target: 'One of the two must be the Cleric.',
      targetArthur: 'One of the two must be the Cleric or King Arthur.',
      hidden: 'The face-down card under the tableau may be named too.',
      dukes: 'The Duke and the Archduke count as Loyal Servants in the Hunt.',
      verdict: 'Both right — Evil wins; any miss — Good wins.',
    },
    questHuntQuestion: 'Did the Hunter name both roles right?',
    questHuntAnswers: { yes: 'Right', no: 'Wrong' },
    questHuntBack: 'No Hunt after all',
    questLastChanceTitle: 'Last Chance',
    questLastChanceRules: {
      point: 'Everyone points at two players they think are Evil, all at once. Evil players drop their hands.',
      roles: {
        duke: 'The Duke may void one vote — lower someone’s hand.',
        archduke: 'The Archduke may change one vote — move someone’s hand to another player.',
        apprentice: 'The Apprentice points with one hand; once Evil has dropped their hands, may raise the other.',
        mutineer:
          'The Mutineer may switch to Good: then points like a Good player and keeps their hands up, and Good must not point at them.',
      },
      verdict: 'If Good points at exactly all the Evil players, Good wins; otherwise Evil wins.',
      veterans: 'But if all Veterans (former Leaders) turn out to be Evil, Good wins: Evil may not lead every quest.',
    },
    questLastChanceQuestion: 'How did the Last Chance end?',
    questLastChanceResults: {
      lastChanceGood: 'Good pointed right',
      lastChanceEvil: 'Good missed',
      veteransEvil: 'All Veterans are Evil',
    },
    questHelp: 'Help',
    questHelpClose: 'Close',
    questHelpRoles: 'Roles in this game',
    questHelpHidden: 'One Good role lies face down under the tableau — no player has it.',
    questHelpQuest: 'Quest',
    questHelpScore: 'Successes {good} of 3, fails {evil} of {need}',
    questHelpDoubleFail: 'This quest needs 2 fails.',
    questHelpNow: 'What to do now',
    questHelpPhases: {
      intro: [
        'The leader reads the intro aloud, then the night text.',
        'When everyone is ready, the leader taps “Start the night”, puts the phone face down and closes their eyes.',
        'At night the phone plays signals with pauses: open and close your eyes on them. Fanfare — everyone opens their eyes.',
      ],
      quest: [
        'The leader reads the quest setup and picks the team — its size is on the quest screen.',
        'The leader hands out the team tokens and the magic token. The team plays cards in secret, the leader shuffles and reveals them.',
        'Where the tableau needs 2 fails, the switch turns on by itself — the table may turn it off. Then enter the number of Fail cards.',
      ],
      outcome: [
        'The leader reads the outcome aloud.',
        'Wrong number of fails — “Undo” goes back to the same quest.',
        'Next is “Pass leadership”, or the finale or the council if the game is decided.',
      ],
      handoff: {
        amulet: 'An amulet is given out after this quest, and its holder secretly checks another player’s side.',
        base: [
          'The new leader is someone who has not led yet and holds no amulet.',
          'The phone and the leader token go to the new leader, who taps “I’m the new leader”.',
        ],
      },
      council: {
        base: [
          'Evil has failed the quests — but Good can still win.',
          'The table discusses who is Evil for up to 5 minutes — the timer is on the screen.',
          'Time is up or the table is ready — “To the Last Chance”.',
        ],
        hunter: 'The Blind Hunter may reveal at any time and start the Hunt — then “The Hunter called the Hunt”.',
        revealer: 'The Revealer reveals their side right away.',
      },
      hunt: {
        reveal: 'The Hunter has revealed and names two Good players by role.',
        result: 'Mark whether the Hunter named both roles right. Hunt called by mistake — “No Hunt after all”.',
      },
      lastChance: {
        point: 'Everyone points at the same time at two players they think are Evil. Evil players lower their hands.',
        result: 'Mark the result with one of the three buttons.',
      },
      finale: ['The leader reads the finale aloud.', '“New game” — same lineup and a new intro, “Back to setup” — change the lineup.'],
    },
  },
}
