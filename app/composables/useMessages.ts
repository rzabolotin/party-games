import { computed } from 'vue'
import { useSettings } from '~/composables/useSettings'
import { messages } from '~/i18n'

/** Строки интерфейса на текущем языке из настроек; в шаблоне — `t.next`, в скрипте — `t.value.next`. */
export function useMessages() {
  const settings = useSettings()
  return computed(() => messages[settings.lang])
}
