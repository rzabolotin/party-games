// Только type-импорты: этот файл читает не только Vite, но и Node-скрипт проверки
// контента, а алиас `~/types` Node не разрешает (типы он просто срезает).
import type { QuestRole, QuestRoleId } from '~/types'

/**
 * Справочник ролей Quest. Способности пересказаны своими словами по правилам Director's Cut
 * и картам коробки, а не переведены. Порядок массива — порядок на экране состава: добро, потом зло.
 * Новая роль из коробки — новая запись здесь и id в `QUEST_ROLE_IDS`; интерфейс не меняется.
 */
export const questRoles: QuestRole[] = [
  {
    id: 'servant',
    side: 'good',
    title: 'Верный слуга Артура',
    original: 'Loyal Servant of Arthur',
    ability: 'Особых сил нет. Служит королю честным словом и зорким глазом: следит за походами и ищет предателей.',
    unique: false,
  },
  {
    id: 'cleric',
    side: 'good',
    title: 'Клирик',
    original: 'Cleric',
    ability:
      'Ночью узнаёт, на чьей стороне первый лидер: тот поднимает палец, если он злодей или Смутьян. Охотник ищет Клирика первым делом.',
    unique: true,
  },
  {
    id: 'arthur',
    side: 'good',
    title: 'Король Артур',
    original: 'Arthur',
    ability:
      'Ночью узнаёт Моргану: та поднимает палец. Должен оставаться скрытым — если зло его вычислит, добру придётся туго. На Охоту не влияет.',
    unique: true,
  },
  {
    id: 'youth',
    side: 'good',
    title: 'Юнец',
    original: 'Youth',
    ability: 'Играет за добро, но если получил жетон магии, обязан сыграть «Провал».',
    unique: true,
  },
  {
    id: 'troublemaker',
    side: 'good',
    title: 'Смутьян',
    original: 'Troublemaker',
    ability:
      'Играет за добро, но при проверке амулетом или Клириком обязан назваться злым. С жетоном магии обязан сыграть «Провал».',
    unique: true,
  },
  {
    id: 'duke',
    side: 'good',
    title: 'Герцог',
    original: 'Duke',
    ability: 'В Последнем шансе, когда злые опустили руки, может отменить один голос — опустить чью-то указующую руку.',
    unique: true,
  },
  {
    id: 'archduke',
    side: 'good',
    title: 'Эрцгерцог',
    original: 'Archduke',
    ability:
      'В Последнем шансе, когда злые опустили руки, может изменить один голос — перевести чью-то руку на другого игрока.',
    unique: true,
  },
  {
    id: 'apprentice',
    side: 'good',
    title: 'Ученик',
    original: 'Apprentice',
    ability: 'В Последнем шансе указывает одной рукой. Когда злые опустили руки, может поднять вторую.',
    unique: true,
  },
  {
    id: 'minion',
    side: 'evil',
    title: 'Приспешник Мордреда',
    original: 'Minion of Mordred',
    ability: 'Особых сил нет. Ночью узнаёт своих и помогает злу проваливать походы, не выдав себя.',
    unique: false,
  },
  {
    id: 'morgan',
    side: 'evil',
    title: 'Моргана',
    original: 'Morgan le Fey',
    ability: 'Жетон магии на неё не действует: даже с ним она вольна сыграть «Провал».',
    unique: true,
  },
  {
    id: 'hunter',
    side: 'evil',
    title: 'Слепой Охотник',
    original: 'Blind Hunter',
    ability:
      'На Финальном совете может открыться и объявить Охоту: назвать двух добрых по ролям, одним из них — Клирика. При 6+ игроках он и злодеи не знают друг друга, при 4–5 злодеи его знают.',
    unique: true,
  },
  {
    id: 'scion',
    side: 'evil',
    title: 'Отпрыск Морганы',
    original: 'Scion',
    ability: 'Его знает только Моргана: ночью он поднимает палец, а она смотрит. Сам он злых не знает и на колокол глаз не открывает.',
    unique: true,
  },
  {
    id: 'brute',
    side: 'evil',
    title: 'Громила',
    original: 'Brute',
    ability: 'Может играть «Провал» только в первых трёх походах, дальше — только «Успех».',
    unique: true,
  },
  {
    id: 'lunatic',
    side: 'evil',
    title: 'Безумец',
    original: 'Lunatic',
    ability: 'Обязан играть «Провал» в каждом походе. Жетон магии сильнее: с ним Безумец играет «Успех».',
    unique: true,
  },
  {
    id: 'revealer',
    side: 'evil',
    title: 'Разоблачённый',
    original: 'Revealer',
    ability: 'После третьего проваленного похода открывает свою сторону — в начале Финального совета. При 4 игроках совет наступает раньше, и он не раскрывается.',
    unique: true,
  },
  {
    id: 'trickster',
    side: 'evil',
    title: 'Плут',
    original: 'Trickster',
    ability:
      'Может лгать о своей стороне: при проверке амулетом назваться добрым, а первым лидером — не поднять палец для Клирика.',
    unique: true,
  },
  {
    id: 'mutineer',
    side: 'evil',
    title: 'Мятежник',
    original: 'Mutineer',
    ability:
      'Не знает злых, и злые не знают его. В Последнем шансе может перейти к добру: тогда указывает руками как добрый, а добро на него указывать не должно.',
    unique: true,
  },
  {
    id: 'changeling',
    side: 'evil',
    title: 'Подменыш',
    original: 'Changeling',
    ability: 'Играет за зло, но злых не знает, и злые не знают его: на колокол глаз не открывает.',
    unique: true,
  },
]

export function getQuestRole(id: QuestRoleId): QuestRole {
  return questRoles.find((role) => role.id === id) ?? questRoles[0]!
}
