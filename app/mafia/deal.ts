import type { MafiaSetup, RoleId } from '~/types'
import { COUNTED_ROLE_IDS, fillerRole } from '~/mafia/roles'

/**
 * Расклад на партию: роли состава плюс добор мирными до общего числа, перемешанные
 * Фишером–Йетсом. i-й элемент — роль i-го игрока; имён в раскладе нет, игроки безымянные.
 * Чистая функция: `random` подменяется в проверках, в приложении это `Math.random`.
 */
export function dealRoles(setup: MafiaSetup, random: () => number = Math.random): RoleId[] {
  const hand: RoleId[] = []
  for (const id of COUNTED_ROLE_IDS) {
    for (let i = 0; i < setup.counts[id]; i++) hand.push(id)
  }
  // Состав всегда влезает в общее число (за этим следит экран состава), но лишнее всё равно срезаем.
  hand.length = Math.min(hand.length, setup.total)
  while (hand.length < setup.total) hand.push(fillerRole.id)

  for (let i = hand.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[hand[i], hand[j]] = [hand[j]!, hand[i]!]
  }
  return hand
}
