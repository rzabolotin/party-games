import type { Danetka } from '~/types'

/**
 * Данетки на русском. `id` — ключ прогресса в localStorage: не перенумеровывать,
 * удалённые не переиспользовать, новым давать следующий свободный номер.
 */
export default [
  {
    id: 1,
    title: 'Стакан воды',
    tone: 'light',
    story:
      'Мужчина заходит в бар и просит стакан воды. Бармен вытаскивает ружьё и направляет на него. Мужчина благодарит и уходит довольный.',
    answer:
      'У мужчины была икота. Бармен понял это и напугал его — икота прошла, вода уже не понадобилась.',
    source: 'https://radiotochki.net/blog/history-hobby/danetki-polnoe-rukovodstvo-po-igre-v-zagadochnye-istorii-dlya-trenirovki-dedukcii-i-voobrazheniya.html',
  },
  {
    id: 2,
    title: 'Лифт',
    tone: 'light',
    story:
      'Мужчина живёт на 12 этаже. Утром он едет на лифте до первого этажа. Вечером доезжает до 8-го и дальше идёт пешком. Но если в лифте кто-то есть или на улице дождь — едет сразу до 12-го.',
    answer:
      'Он очень маленького роста и дотягивается только до кнопки 8. Попутчика можно попросить нажать 12, а в дождь у него с собой зонт.',
    source: 'https://radiotochki.net/blog/history-hobby/danetki-polnoe-rukovodstvo-po-igre-v-zagadochnye-istorii-dlya-trenirovki-dedukcii-i-voobrazheniya.html',
  },
  {
    id: 3,
    title: 'Мэри',
    tone: 'light',
    story:
      'Мужчина входит в комнату: окно распахнуто, на полу лужа и осколки, рядом лежит мёртвая Мэри.',
    answer:
      'Ветер распахнул окно и сбросил с подоконника аквариум. Мэри — рыбка.',
    source: 'https://parafraz.space/zagadki-danetki-slozhnyie-i-interesnyie/',
  },
  {
    id: 4,
    title: 'Без фар',
    tone: 'light',
    story:
      'Водитель едет без фар, фонари не горят, луны нет. Женщина в чёрном перебегает дорогу, но он вовремя её замечает и тормозит.',
    answer:
      'Всё происходит днём.',
    source: 'https://radiotochki.net/blog/history-hobby/danetki-polnoe-rukovodstvo-po-igre-v-zagadochnye-istorii-dlya-trenirovki-dedukcii-i-voobrazheniya.html',
  },
  {
    id: 5,
    title: 'Ночной звонок',
    tone: 'light',
    story:
      'Мужчина лежит в постели, звонит кому-то, ничего не говорит, кладёт трубку и спокойно засыпает.',
    answer:
      'Он в гостинице, за стеной храпит сосед. Звонок его разбудил, храп прекратился.',
    source: 'https://mensby.com/life/interesting/igra-danetki-s-otvetami-list-voprosov-dlja-igry-v-da-i-net',
  },
  {
    id: 6,
    title: 'Уступить место',
    tone: 'light',
    story:
      'Аня хотела уступить место в автобусе вошедшей женщине, но та смутилась и отказалась.',
    answer:
      'Аня маленькая и сидела у папы на коленях.',
    source: 'https://parafraz.space/zagadki-danetki-slozhnyie-i-interesnyie/',
  },
  {
    id: 7,
    title: 'Погоня',
    tone: 'light',
    story:
      'Человек бежит, за ним гонится толпа. Он кричит, что золота им не видать, и начинает стрелять. Зрители в восторге.',
    answer:
      'Это гонка по биатлону.',
    source: 'https://parafraz.space/zagadki-danetki-slozhnyie-i-interesnyie/',
  },
  {
    id: 8,
    title: 'Сказка в темноте',
    tone: 'light',
    story:
      'Отключили свет, но Билл продолжает читать сыну книгу на ночь.',
    answer:
      'Билл незрячий и читает книгу, напечатанную шрифтом Брайля.',
    source: 'https://parafraz.space/zagadki-danetki-slozhnyie-i-interesnyie/',
  },
  {
    id: 9,
    title: 'Средство от морской болезни',
    tone: 'light',
    story:
      'Бывший моряк продавал по почте «надёжное средство от морской болезни». Никого не обманул, но его всё равно арестовали.',
    answer:
      'Покупателям приходил листок с советом «Сидите дома».',
    source: 'https://parafraz.space/zagadki-danetki-slozhnyie-i-interesnyie/',
  },
  {
    id: 10,
    title: 'Куриная пушка',
    tone: 'light',
    story:
      'Инженеры построили пушку, которая стреляет курицами. Зачем?',
    answer:
      'Тушками стреляют в лобовое стекло самолёта, проверяя, выдержит ли оно столкновение с птицей.',
    source: 'https://parafraz.space/zagadki-danetki-slozhnyie-i-interesnyie/',
  },
  {
    id: 11,
    title: 'Непонятные слова',
    tone: 'light',
    story:
      'В инструкциях у полицейских есть слова на языке, которого они не знают. Зачем?',
    answer:
      'Это команды для служебных собак — чтобы посторонний не мог скомандовать собаке.',
    source: 'https://parafraz.space/zagadki-danetki-slozhnyie-i-interesnyie/',
  },
  {
    id: 12,
    title: 'Деревенский дурачок',
    tone: 'light',
    story:
      'Местному дурачку предлагают на выбор 10 центов или 5 долларов, и он всегда берёт монету. Почему?',
    answer:
      'Как только он возьмёт купюру, развлечение кончится и ему перестанут предлагать вообще. А так он получает монетки постоянно.',
    source: 'https://parafraz.space/zagadki-danetki-slozhnyie-i-interesnyie/',
  },
  {
    id: 13,
    title: 'Клад детства',
    tone: 'light',
    story:
      'Вася спрятал сокровище, а когда захотел его достать — не нашёл.',
    answer:
      'Он закопал его ребёнком и записал путь в шагах. Теперь шаги взрослые, длиннее.',
    source: 'https://parafraz.space/zagadki-danetki-slozhnyie-i-interesnyie/',
  },
  {
    id: 14,
    title: 'Свидетели',
    tone: 'light',
    story:
      'Двое заходят в зал, видят убийцу и окровавленную жертву, обсуждают увиденное и спокойно уходят.',
    answer:
      'Они в музее у картины «Иван Грозный и сын его Иван».',
    source: 'https://parafraz.space/zagadki-danetki-slozhnyie-i-interesnyie/',
  },
  {
    id: 15,
    title: 'Попутчики',
    tone: 'light',
    story:
      'Два человека прекрасно относятся друг к другу, но никогда не полетят одним самолётом.',
    answer:
      'Это наследники престола: их не сажают в один самолёт, чтобы страна не лишилась монархов в одной катастрофе.',
    source: 'https://parafraz.space/zagadki-danetki-slozhnyie-i-interesnyie/',
  },
  {
    id: 16,
    title: 'Близнецы',
    tone: 'light',
    story:
      'Сегодня Джулия отметила день рождения, а её сестра-близнец будет праздновать только послезавтра.',
    answer:
      'Джулия родилась 28 февраля перед полуночью, сестра — уже 1 марта. В високосный год между датами два дня.',
    source: 'https://parafraz.space/zagadki-danetki-slozhnyie-i-interesnyie/',
  },
  {
    id: 17,
    title: 'Несчастливые деньги',
    tone: 'light',
    story:
      'Девушка нашла деньги и очень расстроилась.',
    answer:
      'Она начинающая писательница: оставила свои книги в библиотеке и вложила в них купюры. Деньги лежат на месте — книги никто не открывал.',
    source: 'https://parafraz.space/zagadki-danetki-slozhnyie-i-interesnyie/',
  },
  {
    id: 18,
    title: 'Попугай',
    tone: 'light',
    story:
      'Женщине продали попугая, «повторяющего всё, что услышит». Попугай молчит. Она приходит вернуть деньги, но уходит ни с чем — и продавец прав.',
    answer:
      'Попугай глухой. Он действительно повторил бы всё услышанное — просто ничего не слышит.',
    source: 'https://parafraz.space/zagadki-danetki-slozhnyie-i-interesnyie/',
  },
  {
    id: 19,
    title: 'Спасительный звонок',
    tone: 'light',
    story:
      'Хозяйка не знала, как выпроводить засидевшихся гостей. Её выручил телефонный звонок.',
    answer:
      'Она сказала, что ей сообщили о пожаре в доме у кого-то из гостей, но не расслышала, у кого. Разошлись все.',
    source: 'https://parafraz.space/zagadki-danetki-slozhnyie-i-interesnyie/',
  },
  {
    id: 20,
    title: 'Скучный спектакль',
    tone: 'light',
    story:
      'Женщине стало скучно, и она ушла из театра в антракте. Из-за этого случился грандиозный скандал.',
    answer:
      'Она играла главную роль.',
    source: 'https://parafraz.space/zagadki-danetki-slozhnyie-i-interesnyie/',
  },
  {
    id: 21,
    title: 'Предсказатель',
    tone: 'light',
    story:
      'Задолго до УЗИ один гадатель предсказывал пол ребёнка, и никто ни разу не уличил его в ошибке.',
    answer:
      'Вслух он называл один пол, а в журнал записывал другой. Недовольным показывал журнал и говорил, что они ослышались.',
    source: 'https://parafraz.space/zagadki-danetki-slozhnyie-i-interesnyie/',
  },
  {
    id: 22,
    title: 'Шахматный клуб',
    tone: 'light',
    story:
      'Сыщик вошёл в шахматный клуб, огляделся и велел задержать одну пару игроков.',
    answer:
      'Они наспех расставили фигуры для вида — на их доске не было королей.',
    source: 'https://parafraz.space/zagadki-danetki-slozhnyie-i-interesnyie/',
  },
  {
    id: 23,
    title: 'Соль',
    tone: 'light',
    story:
      'Из-за курсантов военного училища за сутки в городе раскупили всю соль.',
    answer:
      'Курсантам велели очистить плац от снега, и они скупили соль, чтобы растопить его. Увидев военных с солью, горожане решили, что грядёт война, и бросились запасаться.',
    source: 'https://parafraz.space/zagadki-danetki-slozhnyie-i-interesnyie/',
  },
  {
    id: 24,
    title: 'Погоня с ножами',
    tone: 'light',
    story:
      'Тони выбегает из здания с двумя сумками, а следом бежит человек, кричит и размахивает ножами.',
    answer:
      'Тони набрал покупок в магазине и получил в подарок набор ножей, но забыл его. Кассир бежит отдать подарок.',
    source: 'https://parafraz.space/zagadki-danetki-slozhnyie-i-interesnyie/',
  },
  {
    id: 25,
    title: 'Умный класс',
    tone: 'light',
    story:
      'Проверяющий видит: на любой вопрос учителя руки тянет весь класс, и каждый вызванный отвечает верно.',
    answer:
      'Договорились: руку поднимают все, но знающие — левую, а не знающие — правую.',
    source: 'https://parafraz.space/zagadki-danetki-slozhnyie-i-interesnyie/',
  },
  {
    id: 26,
    title: 'Туфля в сейфе',
    tone: 'light',
    story:
      'Каждый вечер девушка кладёт в сейф одну туфлю и ложится спать.',
    answer:
      'Она стюардесса и держит документы в сейфе. Без туфли из дома не уйдёшь — значит, документы не забудет.',
    source: 'https://parafraz.space/zagadki-danetki-slozhnyie-i-interesnyie/',
  },
  {
    id: 27,
    title: 'Хлопок',
    tone: 'light',
    story:
      'Коля хлопнул в ладоши, и все остальные в комнате погибли.',
    answer:
      'Коля бил комаров.',
    source: 'https://parafraz.space/zagadki-danetki-slozhnyie-i-interesnyie/',
  },
  {
    id: 28,
    title: 'Сундук с золотом',
    tone: 'light',
    story:
      'Женщина откопала сундук с золотом, три года никому не говорила, а потом купила виллу и машину. Почему не раньше?',
    answer:
      'Она нашла клад на необитаемом острове после кораблекрушения и потратила его, когда её спасли.',
    source: 'https://parafraz.space/zagadki-danetki-slozhnyie-i-interesnyie/',
  },
  {
    id: 29,
    title: 'Взрывы',
    tone: 'light',
    story:
      'Маша смотрела кино и услышала серию взрывов и крики. Потом всё стихло, она выключила телевизор и пошла спать.',
    answer:
      'Была новогодняя ночь: она ждала, пока кончится салют.',
    source: 'https://parafraz.space/zagadki-danetki-slozhnyie-i-interesnyie/',
  },
  {
    id: 30,
    title: 'Двадцать браков',
    tone: 'light',
    story:
      'Мужчина за короткое время зарегистрировал 20 браков с разными женщинами, ни разу не разводился и многоженцем не стал.',
    answer:
      'Он работник ЗАГСа.',
    source: 'https://parafraz.space/zagadki-danetki-slozhnyie-i-interesnyie/',
  },
  {
    id: 31,
    title: 'Разбогатели',
    tone: 'light',
    story:
      'После свадьбы пара бросила все дела и только развлекалась. Через три года они стали миллионерами.',
    answer:
      'До свадьбы они были миллиардерами.',
    source: 'https://parafraz.space/zagadki-danetki-slozhnyie-i-interesnyie/',
  },
  {
    id: 32,
    title: 'Восемь котов',
    tone: 'light',
    story:
      'Хозяин уехал и попросил друга присмотреть за котом. Через неделю в квартире жили восемь котов.',
    answer:
      'Кот сбежал, друг дал объявление. Он плохо знал кота в лицо и оставлял всех похожих, кого приносили, — пока хозяин не опознает своего.',
    source: 'https://parafraz.space/zagadki-danetki-slozhnyie-i-interesnyie/',
  },
  {
    id: 33,
    title: 'Наследство',
    tone: 'light',
    story:
      'Внучка ждала большого наследства, а получила конверт с чеком на 20 долларов и выбросила его. Вскоре её горничная уволилась и стала миллионершей.',
    answer:
      'На конверте была наклеена коллекционная марка стоимостью в миллионы.',
    source: 'https://parafraz.space/zagadki-danetki-slozhnyie-i-interesnyie/',
  },
  {
    id: 34,
    title: 'Тишина за мелочь',
    tone: 'light',
    story:
      'Старику мешали дети, шумевшие под окнами. Горсть мелочи помогла ему добиться тишины.',
    answer:
      'Он стал платить детям за то, чтобы они кричали. Потом сказал, что платить больше нечем, — и кричать бесплатно им стало неинтересно.',
    source: 'https://parafraz.space/zagadki-danetki-slozhnyie-i-interesnyie/',
  },
  {
    id: 35,
    title: 'Сноска',
    tone: 'light',
    story:
      'Профессор мечтал подарить студенту крупную сумму, но никто так и не пришёл за деньгами.',
    answer:
      'Обещание было спрятано в сноске ближе к концу его учебника. До туда никто не дочитал.',
    source: 'https://parafraz.space/zagadki-danetki-slozhnyie-i-interesnyie/',
  },
  {
    id: 36,
    title: 'Гипс',
    tone: 'light',
    story:
      'Здоровая девушка наложила гипс на здоровую руку.',
    answer:
      'Перед устным экзаменом по иностранному языку: она заранее выучила рассказ о том, как «сломала руку», и экзаменатор, конечно, спросил именно об этом.',
    source: 'https://parafraz.space/zagadki-danetki-slozhnyie-i-interesnyie/',
  },
  {
    id: 37,
    title: 'Опоздавший студент',
    tone: 'light',
    story:
      'Студент сдал работу последним, после срока. Преподаватель не хотел её брать, но студент всё равно получил хорошую оценку.',
    answer:
      'Он спросил, знает ли преподаватель его фамилию, и, услышав «нет», сунул работу в середину стопки и убежал.',
    source: 'https://parafraz.space/zagadki-danetki-slozhnyie-i-interesnyie/',
  },
  {
    id: 38,
    title: 'Вещий сон',
    tone: 'light',
    story:
      'Сторож рассказал фермеру, что видел во сне крушение поезда. Фермер не поехал, поезд и правда сошёл с рельсов. А сторожа уволили.',
    answer:
      'Он ночной сторож — ночью он должен был не спать.',
    source: 'https://parafraz.space/zagadki-danetki-slozhnyie-i-interesnyie/',
  },
  {
    id: 39,
    title: 'Пятёрка без ответа',
    tone: 'light',
    story:
      'Курсант вытянул билет, через пару минут молча подошёл с зачёткой и получил «отлично».',
    answer:
      'Экзамен по азбуке Морзе: преподаватель простучал карандашом, что первый расшифровавший получит пятёрку сразу.',
    source: 'https://parafraz.space/zagadki-danetki-slozhnyie-i-interesnyie/',
  },
  {
    id: 40,
    title: 'Оружие в огороде',
    tone: 'light',
    story:
      'Муж написал жене, что на заднем дворе закопано оружие, хотя это неправда. Зачем?',
    answer:
      'Он в тюрьме, письма читают. Полиция перекопала огород в поисках оружия.',
    source: 'https://parafraz.space/zagadki-danetki-slozhnyie-i-interesnyie/',
  },
  {
    id: 41,
    title: 'Спичка',
    tone: 'dark',
    story:
      'Посреди пустыни лежит голый мёртвый мужчина со сломанной спичкой в руке. Других следов нет.',
    answer:
      'Он падал на воздушном шаре с друзьями. Выбросили всё, включая одежду, но не хватило. Тянули спички, кому прыгать, — ему выпала короткая.',
    source: 'https://radiotochki.net/blog/history-hobby/danetki-polnoe-rukovodstvo-po-igre-v-zagadochnye-istorii-dlya-trenirovki-dedukcii-i-voobrazheniya.html',
  },
  {
    id: 42,
    title: 'Музыка',
    tone: 'dark',
    story:
      'Музыка смолкла, и женщина погибла.',
    answer:
      'Она канатоходка и шла с завязанными глазами под музыку, которая заканчивалась ровно в конце каната. Музыка оборвалась раньше, она шагнула вниз.',
    source: 'https://radiotochki.net/blog/history-hobby/danetki-polnoe-rukovodstvo-po-igre-v-zagadochnye-istorii-dlya-trenirovki-dedukcii-i-voobrazheniya.html',
  },
  {
    id: 43,
    title: 'Аквалангист',
    tone: 'dark',
    story:
      'В выгоревшем лесу нашли мёртвого аквалангиста в полном снаряжении.',
    answer:
      'Пожарный самолёт/вертолёт набирал воду в озере, зачерпнул его и сбросил на огонь.',
    source: 'https://radiotochki.net/blog/history-hobby/danetki-polnoe-rukovodstvo-po-igre-v-zagadochnye-istorii-dlya-trenirovki-dedukcii-i-voobrazheniya.html',
  },
  {
    id: 44,
    title: 'Рюкзак',
    tone: 'dark',
    story:
      'Посреди поля лежит мёртвый человек, рядом — нераскрытый рюкзак.',
    answer:
      'В рюкзаке парашют, который не раскрылся.',
    source: 'https://radiotochki.net/blog/history-hobby/danetki-polnoe-rukovodstvo-po-igre-v-zagadochnye-istorii-dlya-trenirovki-dedukcii-i-voobrazheniya.html',
  },
  {
    id: 45,
    title: 'Новые туфли',
    tone: 'dark',
    story:
      'Женщина купила туфли на более высоком каблуке, пришла в них на работу и погибла.',
    answer:
      'Она ассистентка метателя ножей в цирке. Стала выше — и нож, брошенный по привычке, попал в неё.',
    source: 'https://mensby.com/life/interesting/igra-danetki-s-otvetami-list-voprosov-dlja-igry-v-da-i-net',
  },
  {
    id: 46,
    title: 'Маяк',
    tone: 'dark',
    story:
      'Мужчина выключил свет и лёг спать. Утром выглянул в окно и пришёл в ужас.',
    answer:
      'Он смотритель маяка и по ошибке погасил маяк. Ночью у берега разбились корабли.',
    source: 'https://mensby.com/life/interesting/igra-danetki-s-otvetami-list-voprosov-dlja-igry-v-da-i-net',
  },
  {
    id: 47,
    title: 'Бумажка на кактусе',
    tone: 'dark',
    story:
      'Человек в пустыне подходит к кактусу, видит наколотый листок бумаги и теряет всякую надежду.',
    answer:
      'Он заблудился и, чтобы проверить, не ходит ли кругами, сам оставил этот листок. Значит, ходит.',
    source: 'https://mensby.com/life/interesting/igra-danetki-s-otvetami-list-voprosov-dlja-igry-v-da-i-net',
  },
  {
    id: 48,
    title: 'Отравленный лёд',
    tone: 'dark',
    story:
      'Все гости, пившие пунш, отравились. Выжил только тот, кто выпил первым и быстро ушёл.',
    answer:
      'Яд был в кубиках льда. Пока он пил, лёд ещё не растаял.',
    source: 'https://parafraz.space/zagadki-danetki-slozhnyie-i-interesnyie/',
  },
  {
    id: 49,
    title: 'Роковой выстрел',
    tone: 'dark',
    story:
      'Охотник выстрелил, тут же понял, что ошибся, и через пару минут погиб.',
    answer:
      'Дело было в горах зимой — выстрел вызвал лавину.',
    source: 'https://mensby.com/life/interesting/igra-danetki-s-otvetami-list-voprosov-dlja-igry-v-da-i-net',
  },
  {
    id: 50,
    title: 'Три комнаты',
    tone: 'dark',
    story:
      'Приговорённому дают выбрать: расстрел, электрический стул или комната с тиграми, которых полгода не кормили.',
    answer:
      'Комната с тиграми: за полгода без еды они давно умерли.',
    source: 'https://mensby.com/life/interesting/igra-danetki-s-otvetami-list-voprosov-dlja-igry-v-da-i-net',
  },
  {
    id: 51,
    title: 'Билет в одну сторону',
    tone: 'dark',
    story:
      'Прочитав в газете о гибели женщины на отдыхе, мужчина понял, что это убийство.',
    answer:
      'Он турагент и продавал этой паре путёвку: мужу — туда и обратно, жене — только туда.',
    source: 'https://mensby.com/life/interesting/igra-danetki-s-otvetami-list-voprosov-dlja-igry-v-da-i-net',
  },
  {
    id: 52,
    title: 'Орнитолог',
    tone: 'dark',
    story:
      'Орнитолог увидел редчайшую птицу и вскоре погиб.',
    answer:
      'Он летел в самолёте и видел, как птицу затянуло в двигатель.',
    source: 'https://mensby.com/life/interesting/igra-danetki-s-otvetami-list-voprosov-dlja-igry-v-da-i-net',
  },
  {
    id: 53,
    title: 'Тёща',
    tone: 'dark',
    story:
      'Тёща хотела отравить зятя, а тот ел только то, что ела она. Она разрезала мясо пополам, одну половину съела сама, другую отдала ему — и он умер.',
    answer:
      'Яд был только на одной стороне лезвия ножа.',
    source: 'https://bbf.ru/riddles/tag/435/',
  },
  {
    id: 54,
    title: 'Пунктуальный человек',
    tone: 'dark',
    story:
      'Глухой педант каждый день в одно и то же время переходил железную дорогу — за час до первого поезда. Однажды его сбил поезд.',
    answer:
      'Ночью перевели часы, а он свои не перевёл и вышел на час позже.',
    source: 'https://parafraz.space/zagadki-danetki-slozhnyie-i-interesnyie/',
  },
  {
    id: 55,
    title: 'Тиканье',
    tone: 'dark',
    story:
      'Мужчина не мог уснуть в гостинице. Мимо проехала машина, после чего он заглянул под кровать и нашёл труп.',
    answer:
      'Фары осветили настенные часы — они стояли, а тиканье было слышно. Тикали наручные часы на трупе.',
    source: 'https://parafraz.space/zagadki-danetki-slozhnyie-i-interesnyie/',
  },
] satisfies Danetka[]
