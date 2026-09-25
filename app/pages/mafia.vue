<script setup lang="ts">
import { useMafiaSetup } from '~/composables/useMafiaSetup'
import { useMessages } from '~/composables/useMessages'
import { useSettings } from '~/composables/useSettings'
import { useWakeLock } from '~/composables/useWakeLock'
import { dealRoles } from '~/mafia/deal'
import { getRole, roles } from '~/mafia/roles'
import type { CountedRoleId, RoleId } from '~/types'

const t = useMessages()
const settings = useSettings()
const { setup, civilians, warning, canChangeTotal, changeTotal, canChangeRole, changeRole } = useMafiaSetup()
// Телефон едет по кругу — экран не должен гаснуть ни на составе, ни на раздаче.
useWakeLock()

// --- Стейт-машина: setup → deal → done ---

const stage = ref<'setup' | 'deal' | 'done'>('setup')

/** Расклад партии: i-й элемент — роль i-го игрока. Живёт только в памяти, в localStorage не уходит. */
const hand = ref<RoleId[]>([])
/** Чей сейчас ход, от нуля. */
const index = ref(0)
/** Карта вскрыта — лицо видно, «Передать дальше» доступно. */
const revealed = ref(false)
/**
 * Роль на лицевой стороне. Отдельно от `index`: лицо меняется только в момент вскрытия,
 * иначе на возврате рубашки мелькнула бы уже следующая роль.
 */
const shown = ref<RoleId | null>(null)

const currentRole = computed(() => (shown.value ? getRole(shown.value) : null))
const playerLabel = computed(() =>
  t.value.mafiaPlayerOf.replace('{n}', String(index.value + 1)).replace('{m}', String(hand.value.length)),
)

function startDeal() {
  hand.value = dealRoles(setup)
  index.value = 0
  revealed.value = false
  shown.value = null
  stage.value = 'deal'
}

/** Тап по рубашке: лицо ставится и вскрывается в одном обновлении, чтобы переворот шёл с нужной ролью. */
function reveal() {
  if (revealed.value) return
  shown.value = hand.value[index.value] ?? null
  revealed.value = true
}

/** «Передать дальше»: роль прячется, ход переходит следующему; назад вернуться нельзя. */
function pass() {
  if (!revealed.value) return
  revealed.value = false
  if (index.value >= hand.value.length - 1) stage.value = 'done'
  else index.value += 1
}

/** Выход из раздачи — только через подтверждение: одно случайное касание не должно рушить круг. */
function exitDeal() {
  if (!confirm(t.value.mafiaExitConfirm)) return
  hand.value = []
  stage.value = 'setup'
}

function editSetup() {
  hand.value = []
  stage.value = 'setup'
}

// --- Экран состава ---

/** Раскрытое описание роли; одновременно развёрнута не больше одной. */
const expanded = ref<RoleId | null>(null)

function toggleRole(id: RoleId) {
  expanded.value = expanded.value === id ? null : id
}

/** Сколько игроков этой роли в составе; у мирного — остаток. */
function countOf(id: RoleId): number {
  return id === 'civilian' ? civilians.value : setup.counts[id as CountedRoleId]
}

// --- Финальный экран ---

/** Сводка: роли, которые реально в партии, в порядке справочника — мирные последними. */
const summary = computed(() =>
  roles
    .map((role) => ({ role, count: hand.value.filter((id) => id === role.id).length }))
    .filter((item) => item.count > 0),
)

/** Порядок ночи — только роли из состава, у которых есть ночное действие. */
const nightOrder = computed(() =>
  summary.value
    .map((item) => item.role)
    .filter((role) => role.nightOrder != null)
    .sort((a, b) => a.nightOrder! - b.nightOrder!),
)
</script>

<template>
  <main class="screen">
    <!-- Состав -->
    <template v-if="stage === 'setup'">
      <header class="top">
        <NuxtLink to="/" class="back">← {{ t.decks }}</NuxtLink>
        <h1 class="title">{{ t.mafia }}</h1>
      </header>

      <div class="body">
        <section class="group">
          <div class="row">
            <span class="row-emoji" aria-hidden="true">👥</span>
            <span class="row-title">{{ t.mafiaPlayersCount }}</span>
            <span class="stepper">
              <button
                type="button"
                class="step"
                :disabled="!canChangeTotal(-1)"
                :aria-label="`${t.removePlayer}: ${t.mafiaPlayersCount}`"
                @click="changeTotal(-1)"
              >
                −
              </button>
              <span class="value" :aria-label="`${t.mafiaPlayersCount}: ${setup.total}`">{{ setup.total }}</span>
              <button
                type="button"
                class="step"
                :disabled="!canChangeTotal(1)"
                :aria-label="`${t.addPlayer}: ${t.mafiaPlayersCount}`"
                @click="changeTotal(1)"
              >
                +
              </button>
            </span>
          </div>
        </section>

        <section class="group">
          <h2 class="group-title">{{ t.mafiaRoles }}</h2>
          <ul class="roles">
            <li v-for="role in roles" :key="role.id" class="role" :class="`faction-${role.faction}`">
              <div class="row">
                <button
                  type="button"
                  class="row-name"
                  :aria-expanded="expanded === role.id"
                  @click="toggleRole(role.id)"
                >
                  <span class="row-emoji" aria-hidden="true">{{ role.emoji }}</span>
                  <span class="row-title">{{ role.title[settings.lang] }}</span>
                  <span class="chevron" :class="{ open: expanded === role.id }" aria-hidden="true">›</span>
                </button>
                <span v-if="role.counted" class="stepper">
                  <button
                    type="button"
                    class="step"
                    :disabled="!canChangeRole(role.id as CountedRoleId, -1)"
                    :aria-label="`${t.removePlayer}: ${role.title[settings.lang]}`"
                    @click="changeRole(role.id as CountedRoleId, -1)"
                  >
                    −
                  </button>
                  <span class="value">{{ countOf(role.id) }}</span>
                  <button
                    type="button"
                    class="step"
                    :disabled="!canChangeRole(role.id as CountedRoleId, 1)"
                    :aria-label="`${t.addPlayer}: ${role.title[settings.lang]}`"
                    @click="changeRole(role.id as CountedRoleId, 1)"
                  >
                    +
                  </button>
                </span>
                <!-- Мирные не редактируются: это всё, что осталось от общего числа. -->
                <span v-else class="value rest">{{ countOf(role.id) }}</span>
              </div>
              <div v-if="expanded === role.id" class="role-text">
                <p class="role-faction">{{ t.factions[role.faction] }}</p>
                <p class="role-tagline">{{ role.tagline[settings.lang] }}</p>
                <p class="role-description">{{ role.description[settings.lang] }}</p>
              </div>
            </li>
          </ul>
          <p v-if="warning" class="warn">{{ t.mafiaWarnings[warning] }}</p>
        </section>
      </div>

      <footer class="bottom">
        <button type="button" class="action primary" @click="startDeal">{{ t.mafiaDeal }}</button>
      </footer>
    </template>

    <!-- Раздача -->
    <template v-else-if="stage === 'deal'">
      <header class="top">
        <button type="button" class="back" @click="exitDeal">← {{ t.mafiaExit }}</button>
        <span class="counter">{{ playerLabel }}</span>
      </header>

      <div class="body deal">
        <button
          type="button"
          class="card"
          :class="{ flipped: revealed }"
          :aria-label="revealed ? undefined : t.mafiaReveal"
          @click="reveal"
        >
          <span class="card-inner">
            <span class="card-face card-back">
              <span class="moon" aria-hidden="true">🌙</span>
              <span class="back-hint">{{ t.mafiaReveal }}</span>
            </span>
            <span v-if="currentRole" class="card-face card-front" :class="`faction-${currentRole.faction}`">
              <span class="corner corner-start" aria-hidden="true">{{ currentRole.emoji }}</span>
              <span class="corner corner-end" aria-hidden="true">{{ currentRole.emoji }}</span>
              <span class="card-emoji" aria-hidden="true">{{ currentRole.emoji }}</span>
              <span class="card-name">{{ currentRole.title[settings.lang] }}</span>
              <span class="card-rule" aria-hidden="true" />
              <span class="card-tagline">{{ currentRole.tagline[settings.lang] }}</span>
              <span class="card-description">{{ currentRole.description[settings.lang] }}</span>
            </span>
          </span>
        </button>
      </div>

      <footer class="bottom">
        <button type="button" class="action primary" :disabled="!revealed" @click="pass">
          {{ t.mafiaPass }}
        </button>
      </footer>
    </template>

    <!-- Финал -->
    <template v-else>
      <header class="top">
        <NuxtLink to="/" class="back">← {{ t.decks }}</NuxtLink>
        <h1 class="title">{{ t.mafia }}</h1>
      </header>

      <div class="body">
        <section class="group">
          <h2 class="group-title">{{ t.mafiaLineup }}</h2>
          <ul class="roles">
            <li v-for="item in summary" :key="item.role.id" class="role" :class="`faction-${item.role.faction}`">
              <div class="row">
                <span class="row-emoji" aria-hidden="true">{{ item.role.emoji }}</span>
                <span class="row-title">{{ item.role.title[settings.lang] }}</span>
                <span class="value rest">{{ item.count }}</span>
              </div>
            </li>
          </ul>
        </section>

        <section class="group">
          <h2 class="group-title">{{ t.mafiaNightOrder }}</h2>
          <p class="night-intro">{{ t.mafiaNightIntro }}…</p>
          <ol class="night">
            <li v-for="role in nightOrder" :key="role.id" class="night-step" :class="`faction-${role.faction}`">
              <span class="row-emoji" aria-hidden="true">{{ role.emoji }}</span>
              <span class="row-title">{{ role.title[settings.lang] }}</span>
            </li>
          </ol>
        </section>
      </div>

      <footer class="bottom actions">
        <button type="button" class="action primary" @click="startDeal">{{ t.mafiaRedeal }}</button>
        <button type="button" class="action secondary" @click="editSetup">{{ t.mafiaEditSetup }}</button>
      </footer>
    </template>
  </main>
</template>

<style scoped>
/* Цвет стороны: токены палитры в main.css, здесь — привязка к роли на строке или карте. */
.faction-mafia {
  --faction: var(--faction-mafia);
}

.faction-town {
  --faction: var(--faction-town);
}

.faction-solo {
  --faction: var(--faction-solo);
}

/* Шапка и нижняя панель приколоты, прокручивается только середина; на раздаче не прокручивается ничего. */
.screen {
  display: flex;
  flex-direction: column;
  height: 100dvh;
  padding: calc(env(safe-area-inset-top, 0px) + 12px) calc(env(safe-area-inset-right, 0px) + 16px)
    calc(env(safe-area-inset-bottom, 0px) + 16px) calc(env(safe-area-inset-left, 0px) + 16px);
  overflow: hidden;
  overscroll-behavior: none;
}

.top {
  position: relative;
  display: flex;
  flex: none;
  align-items: center;
  gap: 12px;
  min-height: 44px;
  font-size: 17px;
}

.back {
  flex: none;
  padding: 8px 4px;
  border: 0;
  background: transparent;
  color: var(--accent);
  font: inherit;
  font-size: 17px;
  text-decoration: none;
  cursor: pointer;
  touch-action: manipulation;
}

/* Заголовок и счётчик — по центру шапки, а не по центру остатка справа от «Назад». */
.title,
.counter {
  position: absolute;
  left: 50%;
  margin: 0;
  transform: translateX(-50%);
  font-size: inherit;
  font-weight: 600;
  white-space: nowrap;
}

.counter {
  color: var(--muted);
  font-variant-numeric: tabular-nums;
}

.body {
  flex: 1;
  min-height: 0;
  padding: 16px 0 8px;
  overflow-y: auto;
}

.bottom {
  display: flex;
  flex: none;
  gap: 8px;
  min-height: 60px;
}

.group + .group {
  margin-top: 24px;
}

.group-title {
  margin: 0 0 10px 4px;
  font-size: 17px;
  font-weight: 600;
  color: var(--muted);
}

/* --- Строки состава и сводки --- */

.roles {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.role {
  border-radius: 14px;
  background: var(--surface);
  /* Тонкая полоса слева — цвет стороны; на сводке и в порядке ночи та же. */
  border-left: 4px solid var(--faction);
}

.row {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 60px;
  padding: 6px 10px 6px 12px;
}

/* Название роли — кнопка во всю свободную ширину: тап разворачивает описание. */
.row-name {
  display: flex;
  flex: 1;
  align-items: center;
  gap: 8px;
  min-width: 0;
  min-height: 48px;
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
  touch-action: manipulation;
}

.row-emoji {
  flex: none;
  width: 32px;
  font-size: 24px;
  line-height: 1;
  text-align: center;
}

.row-title {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  font-size: 18px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chevron {
  flex: none;
  padding: 0 4px;
  color: var(--muted);
  font-size: 20px;
  line-height: 1;
  transition: transform 150ms ease;
}

.chevron.open {
  transform: rotate(90deg);
}

/* --- Счётчики --- */

.stepper {
  display: flex;
  flex: none;
  align-items: center;
  gap: 2px;
}

.step {
  width: 44px;
  height: 44px;
  border: 0;
  border-radius: 12px;
  background: var(--surface-active);
  color: var(--fg);
  font: inherit;
  font-size: 22px;
  font-weight: 700;
  line-height: 1;
  cursor: pointer;
  touch-action: manipulation;
}

.step:active {
  background: var(--accent);
  color: var(--bg);
}

.step:disabled {
  background: transparent;
  color: var(--muted);
  opacity: 0.4;
  cursor: default;
}

.value {
  min-width: 32px;
  font-size: 20px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  text-align: center;
}

/* Мирные и сводка — то же место, что у счётчика, но без кнопок. */
.rest {
  padding-right: 12px;
  color: var(--muted);
}

/* --- Описание роли --- */

.role-text {
  padding: 0 16px 14px 12px;
}

.role-faction {
  margin: 0 0 6px;
  color: var(--faction);
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.role-tagline {
  margin: 0 0 6px;
  font-size: 16px;
  font-weight: 600;
}

.role-description {
  margin: 0;
  color: var(--muted);
  font-size: 16px;
  line-height: 1.35;
}

.warn {
  margin: 12px 4px 0;
  color: var(--accent);
  font-size: 15px;
  line-height: 1.35;
}

/* --- Раздача: карта --- */

.deal {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 0;
  overflow: hidden;
  perspective: 1400px;
}

.card {
  width: 100%;
  max-width: 420px;
  height: 100%;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--fg);
  font: inherit;
  cursor: pointer;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

.card-inner {
  position: relative;
  display: block;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform 450ms ease;
}

.card.flipped .card-inner {
  transform: rotateY(180deg);
}

.card-face {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px 18px;
  border-radius: 20px;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  overflow: hidden;
  text-align: center;
  overflow-wrap: anywhere;
}

/* Рубашка: узор в клетку и луна — одинаковая у всех игроков. */
.card-back {
  gap: 20px;
  background:
    repeating-linear-gradient(45deg, transparent 0 10px, rgb(255 255 255 / 4%) 10px 20px),
    repeating-linear-gradient(-45deg, transparent 0 10px, rgb(255 255 255 / 4%) 10px 20px), var(--surface);
  border: 2px solid var(--surface-active);
}

.moon {
  font-size: clamp(56px, 14vh, 96px);
  line-height: 1;
}

.back-hint {
  color: var(--muted);
  font-size: calc(17px * var(--font-scale));
  font-weight: 600;
}

/* Лицо: цвет рамки и свечения — по стороне роли. */
.card-front {
  gap: calc(6px * var(--font-scale));
  background: var(--surface);
  border: 2px solid var(--faction);
  box-shadow: inset 0 0 60px -20px var(--faction);
  transform: rotateY(180deg);
}

.corner {
  position: absolute;
  font-size: 22px;
  line-height: 1;
  opacity: 0.5;
}

.corner-start {
  top: 12px;
  left: 14px;
}

.corner-end {
  right: 14px;
  bottom: 12px;
  transform: rotate(180deg);
}

.card-emoji {
  font-size: clamp(48px, 11vh, 84px);
  line-height: 1;
}

.card-name {
  font-size: calc(26px * var(--font-scale));
  font-weight: 700;
  line-height: 1.1;
  overflow-wrap: anywhere;
}

.card-rule {
  width: 64px;
  height: 2px;
  margin: 2px 0;
  border-radius: 1px;
  background: var(--faction);
}

.card-tagline {
  font-size: calc(15px * var(--font-scale));
  font-weight: 600;
  line-height: 1.3;
}

.card-description {
  color: var(--muted);
  font-size: calc(14px * var(--font-scale));
  line-height: 1.35;
}

/* --- Финал --- */

.night-intro {
  margin: 0 4px 10px;
  color: var(--muted);
  font-size: 16px;
  font-style: italic;
}

.night {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 0;
  padding: 0 0 0 28px;
}

.night-step {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 52px;
  padding: 6px 12px;
  border-radius: 14px;
  border-left: 4px solid var(--faction);
  background: var(--surface);
  font-variant-numeric: tabular-nums;
}

.night-step::marker {
  color: var(--muted);
  font-size: 16px;
  font-weight: 700;
}

/* --- Кнопки --- */

.actions {
  flex-direction: column;
  gap: 8px;
}

.action {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  min-height: 60px;
  padding: 12px 20px;
  border: 0;
  border-radius: 16px;
  font: inherit;
  font-size: 22px;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
  touch-action: manipulation;
}

.primary {
  background: var(--accent);
  color: var(--bg);
}

.secondary {
  background: var(--surface);
  color: var(--fg);
}

.primary:active {
  filter: brightness(0.85);
}

.secondary:active {
  background: var(--surface-active);
}

.action:disabled {
  background: var(--surface);
  color: var(--muted);
  cursor: default;
  filter: none;
}

@media (prefers-reduced-motion: reduce) {
  .card-inner,
  .chevron {
    transition: none;
  }
}
</style>
