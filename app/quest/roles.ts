// Только type-импорты: этот файл читает не только Vite, но и Node-скрипт проверки
// контента, а алиас `~/types` Node не разрешает (типы он просто срезает).
import type { QuestRole, QuestRoleId } from '~/types'

/**
 * Справочник ролей Quest. Способности пересказаны своими словами по правилам Director's Cut,
 * а не переведены с карт. Порядок массива — порядок на экране состава: добро, потом зло.
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
    ability: 'В Последнем шансе может отменить один голос — опустить чью-то указующую руку.',
    unique: true,
  },
  {
    id: 'archduke',
    side: 'good',
    title: 'Эрцгерцог',
    original: 'Archduke',
    ability: 'В Последнем шансе может изменить один голос — перевести чью-то руку на другого игрока.',
    unique: true,
  },
  {
    id: 'duke-alt',
    side: 'good',
    title: 'Герцог — вариант автора',
    original: 'Duke, alt.',
    ability:
      'Первоначальный Герцог автора. В Последнем шансе указывает одной рукой, а если злодей остался неназванным, может поднять вторую.',
    unique: true,
    alternative: true,
  },
  {
    id: 'apprentice',
    side: 'good',
    title: 'Ученик',
    original: 'Apprentice',
    ability:
      'Альтернатива Эрцгерцогу от автора. В Последнем шансе указывает одной рукой и может опустить её, если она указывает на доброго.',
    unique: true,
    alternative: true,
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
    title: 'Моргана Фея',
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
]

export function getQuestRole(id: QuestRoleId): QuestRole {
  return questRoles.find((role) => role.id === id) ?? questRoles[0]!
}
