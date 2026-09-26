<script setup lang="ts">
import { levels } from '~/alias/levels'
import { ALIAS_MAX_PLAYERS, TARGETS, TURN_SECONDS, useAliasSetup } from '~/composables/useAliasSetup'
import { useMessages } from '~/composables/useMessages'
import { useSettings } from '~/composables/useSettings'

const t = useMessages()
const settings = useSettings()
const {
  setup,
  players,
  blocker,
  canAddPlayer,
  addPlayer,
  removePlayer,
  movePlayer,
  shuffle,
  canAddTeam,
  addTeam,
  canRemoveTeam,
  removeTeam,
  renameTeam,
  toggleLevel,
} = useAliasSetup()

// --- Стейт-машина: setup ⇄ rules; setup → soon (ход — тикет 03) ---

const stage = ref<'setup' | 'rules' | 'soon'>('setup')

function start() {
  if (blocker.value) return
  stage.value = 'soon'
}

// --- Состав ---

const newName = ref('')
const canAdd = computed(() => canAddPlayer(newName.value))
const full = computed(() => players.value.length >= ALIAS_MAX_PLAYERS)

function submitPlayer() {
  if (addPlayer(newName.value)) newName.value = ''
}

function moveLabel(teamIndex: number, name: string): string {
  const next = setup.teams[(teamIndex + 1) % setup.teams.length]!
  return t.value.aliasMoveTo.replace('{name}', name).replace('{team}', next.name)
}

/** Пустое название не принимается: поле возвращается к прежнему. */
function commitName(teamIndex: number, event: Event) {
  const input = event.target as HTMLInputElement
  renameTeam(teamIndex, input.value)
  input.value = setup.teams[teamIndex]?.name ?? ''
}

const rulesItems = computed(() =>
  t.value.aliasRulesItems.map((item) => item.replace('{n}', String(setup.target))),
)
</script>

<template>
  <main class="screen">
    <!-- Экран начала -->
    <template v-if="stage === 'setup'">
      <header class="top">
        <NuxtLink to="/" class="back">← {{ t.decks }}</NuxtLink>
        <h1 class="title">{{ t.alias }}</h1>
      </header>

      <div class="body">
        <section class="group">
          <h2 class="group-title">{{ t.aliasTeams }}</h2>
          <ul class="teams">
            <li v-for="(team, teamIndex) in setup.teams" :key="team.emoji" class="team">
              <div class="team-head">
                <span class="team-emoji" aria-hidden="true">{{ team.emoji }}</span>
                <input
                  class="team-name"
                  type="text"
                  :value="team.name"
                  :aria-label="`${t.aliasTeamName}: ${team.emoji}`"
                  maxlength="20"
                  autocomplete="off"
                  enterkeyhint="done"
                  @change="commitName(teamIndex, $event)"
                  @keydown.enter="($event.target as HTMLInputElement).blur()"
                />
                <span class="team-count">{{ team.players.length }}</span>
                <button
                  v-if="teamIndex === setup.teams.length - 1 && canRemoveTeam()"
                  type="button"
                  class="remove"
                  :aria-label="`${t.aliasRemoveTeam}: ${team.name}`"
                  @click="removeTeam"
                >
                  ✕
                </button>
              </div>
              <ul v-if="team.players.length > 0" class="chips">
                <li v-for="(name, playerIndex) in team.players" :key="name" class="chip">
                  <button
                    type="button"
                    class="chip-name"
                    :aria-label="moveLabel(teamIndex, name)"
                    @click="movePlayer(teamIndex, playerIndex)"
                  >
                    {{ name }}
                  </button>
                  <button
                    type="button"
                    class="chip-remove"
                    :aria-label="`${t.removePlayer}: ${name}`"
                    @click="removePlayer(teamIndex, playerIndex)"
                  >
                    ✕
                  </button>
                </li>
              </ul>
            </li>
          </ul>

          <form class="add" @submit.prevent="submitPlayer">
            <input
              v-model="newName"
              class="input"
              type="text"
              :placeholder="t.aliasPlayerName"
              :aria-label="t.aliasPlayerName"
              :disabled="full"
              maxlength="30"
              autocomplete="off"
              autocapitalize="words"
              enterkeyhint="done"
            />
            <button type="submit" class="add-button" :disabled="!canAdd">{{ t.addPlayer }}</button>
          </form>
          <p v-if="full" class="hint">{{ t.aliasPlayersFull.replace('{n}', String(ALIAS_MAX_PLAYERS)) }}</p>
          <p v-else-if="players.length > 1" class="hint">{{ t.aliasMoveHint }}</p>

          <div class="tools">
            <button type="button" class="tool" :disabled="!canAddTeam()" @click="addTeam">{{ t.aliasAddTeam }}</button>
            <button type="button" class="tool" :disabled="players.length < 2" @click="shuffle()">
              {{ t.aliasShuffle }}
            </button>
          </div>
        </section>

        <section class="group">
          <h2 class="group-title">{{ t.aliasTarget }}</h2>
          <div class="segments" role="radiogroup" :aria-label="t.aliasTarget">
            <button
              v-for="value in TARGETS"
              :key="value"
              type="button"
              class="segment"
              :class="{ selected: setup.target === value }"
              role="radio"
              :aria-checked="setup.target === value"
              @click="setup.target = value"
            >
              {{ value }}
            </button>
          </div>
        </section>

        <section class="group">
          <h2 class="group-title">{{ t.aliasTurnSeconds }}</h2>
          <div class="segments" role="radiogroup" :aria-label="t.aliasTurnSeconds">
            <button
              v-for="value in TURN_SECONDS"
              :key="value"
              type="button"
              class="segment"
              :class="{ selected: setup.turnSeconds === value }"
              role="radio"
              :aria-checked="setup.turnSeconds === value"
              @click="setup.turnSeconds = value"
            >
              {{ t.aliasSeconds.replace('{n}', String(value)) }}
            </button>
          </div>
        </section>

        <section class="group">
          <h2 class="group-title">{{ t.aliasLevels }}</h2>
          <ul class="rows">
            <li v-for="level in levels" :key="level.id">
              <label class="row level">
                <input
                  type="checkbox"
                  class="check"
                  :checked="setup.levels.includes(level.id)"
                  @change="toggleLevel(level.id)"
                />
                <span class="level-emoji" aria-hidden="true">{{ level.emoji }}</span>
                <span class="row-title">{{ level.title[settings.lang] }}</span>
              </label>
            </li>
          </ul>
        </section>

        <section class="group">
          <ul class="rows">
            <li class="row toggle">
              <span class="row-title">{{ t.aliasSkipPenalty }}</span>
              <button
                type="button"
                class="switch"
                role="switch"
                :aria-checked="setup.skipPenalty"
                :aria-label="t.aliasSkipPenalty"
                @click="setup.skipPenalty = !setup.skipPenalty"
              >
                <span class="knob" aria-hidden="true" />
              </button>
            </li>
            <li class="row toggle">
              <span class="row-title">{{ t.aliasSound }}</span>
              <button
                type="button"
                class="switch"
                role="switch"
                :aria-checked="setup.sound"
                :aria-label="t.aliasSound"
                @click="setup.sound = !setup.sound"
              >
                <span class="knob" aria-hidden="true" />
              </button>
            </li>
          </ul>
        </section>
      </div>

      <footer class="bottom">
        <p v-if="blocker" id="alias-blocker" class="warn">{{ t.aliasBlockers[blocker] }}</p>
        <div class="buttons">
          <button type="button" class="action secondary rules-button" @click="stage = 'rules'">
            {{ t.aliasRules }}
          </button>
          <button
            type="button"
            class="action primary"
            :disabled="blocker !== null"
            :aria-describedby="blocker ? 'alias-blocker' : undefined"
            @click="start"
          >
            {{ t.aliasStart }}
          </button>
        </div>
      </footer>
    </template>

    <!-- Правила: короткий лист, возврат — к экрану начала -->
    <template v-else-if="stage === 'rules'">
      <header class="top">
        <button type="button" class="back" @click="stage = 'setup'">← {{ t.back }}</button>
        <h1 class="title">{{ t.aliasRules }}</h1>
      </header>

      <div class="body">
        <ol class="rules" :lang="settings.lang">
          <li v-for="item in rulesItems" :key="item">{{ item }}</li>
        </ol>
      </div>
    </template>

    <!-- Заглушка вместо хода -->
    <template v-else>
      <header class="top">
        <button type="button" class="back" @click="stage = 'setup'">← {{ t.back }}</button>
        <h1 class="title">{{ t.alias }}</h1>
      </header>

      <div class="body soon">
        <GameIcon name="alias" class="soon-icon" />
        <p class="soon-text">{{ t.aliasSoon }}</p>
      </div>
    </template>
  </main>
</template>

<style scoped>
/* Шапка и нижняя панель приколоты, прокручивается только середина. */
.screen {
  display: flex;
  flex-direction: column;
  max-width: 560px;
  height: 100dvh;
  margin: 0 auto;
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

/* Заголовок — по центру шапки, а не по центру остатка справа от «Назад». */
.title {
  position: absolute;
  left: 50%;
  margin: 0;
  transform: translateX(-50%);
  font-size: inherit;
  font-weight: 600;
  white-space: nowrap;
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
  flex-direction: column;
  gap: 8px;
  padding-top: 8px;
}

.buttons {
  display: flex;
  gap: 8px;
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

/* --- Команды --- */

.teams {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 0 0 8px;
  padding: 0;
  list-style: none;
}

.team {
  padding: 6px 6px 8px;
  border-radius: 14px;
  background: var(--surface);
}

.team-head {
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: 48px;
}

.team-emoji {
  flex: none;
  width: 36px;
  font-size: 26px;
  line-height: 1;
  text-align: center;
}

/* Название — поле, которое выглядит как заголовок; рамка появляется только при правке. */
.team-name {
  flex: 1;
  min-width: 0;
  min-height: 44px;
  padding: 6px 8px;
  border: 0;
  border-radius: 10px;
  background: transparent;
  color: var(--fg);
  font: inherit;
  font-size: 19px;
  font-weight: 700;
  text-overflow: ellipsis;
}

.team-name:focus {
  outline: 2px solid var(--accent);
  background: var(--bg);
}

.team-count {
  flex: none;
  min-width: 28px;
  color: var(--muted);
  font-size: 17px;
  font-variant-numeric: tabular-nums;
  text-align: center;
}

.remove {
  flex: none;
  width: 44px;
  height: 44px;
  border: 0;
  border-radius: 10px;
  background: transparent;
  color: var(--muted);
  font: inherit;
  font-size: 18px;
  cursor: pointer;
  touch-action: manipulation;
}

.remove:active {
  background: var(--surface-active);
  color: var(--danger);
}

/* Игрок — фишка: тап по имени переводит, крестик удаляет. */
.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 4px 0 0;
  padding: 0 4px;
  list-style: none;
}

.chip {
  display: flex;
  max-width: 100%;
  border-radius: 12px;
  background: var(--surface-active);
}

.chip-name,
.chip-remove {
  min-height: 44px;
  border: 0;
  background: transparent;
  color: var(--fg);
  font: inherit;
  cursor: pointer;
  touch-action: manipulation;
}

.chip-name {
  min-width: 0;
  padding: 6px 4px 6px 14px;
  overflow: hidden;
  font-size: 17px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chip-remove {
  flex: none;
  width: 36px;
  padding: 0;
  color: var(--muted);
  font-size: 14px;
}

.chip:has(.chip-name:active) {
  background: var(--accent);
}

.chip:has(.chip-name:active) .chip-name {
  color: var(--bg);
}

.chip-remove:active {
  color: var(--danger);
}

.add {
  display: flex;
  gap: 8px;
}

.input {
  flex: 1;
  min-width: 0;
  min-height: 52px;
  padding: 8px 16px;
  border: 0;
  border-radius: 14px;
  background: var(--surface);
  color: var(--fg);
  font: inherit;
  font-size: 18px;
}

.input::placeholder {
  color: var(--muted);
}

.input:focus {
  outline: 2px solid var(--accent);
}

.add-button {
  flex: none;
  min-height: 52px;
  padding: 8px 20px;
  border: 0;
  border-radius: 14px;
  background: var(--accent);
  color: var(--bg);
  font: inherit;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  touch-action: manipulation;
}

.add-button:disabled {
  background: var(--surface);
  color: var(--muted);
  cursor: default;
}

.hint {
  margin: 8px 4px 0;
  color: var(--muted);
  font-size: 15px;
  line-height: 1.35;
}

.tools {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.tool {
  flex: 1;
  min-height: 52px;
  padding: 8px 12px;
  border: 0;
  border-radius: 14px;
  background: var(--surface);
  color: var(--fg);
  font: inherit;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  touch-action: manipulation;
}

.tool:active {
  background: var(--surface-active);
}

.tool:disabled {
  color: var(--muted);
  opacity: 0.5;
  cursor: default;
}

/* --- Сегменты: одна подложка, выбранный — акцентный --- */

.segments {
  display: flex;
  gap: 4px;
  padding: 4px;
  border-radius: 14px;
  background: var(--surface);
}

.segment {
  flex: 1;
  min-width: 0;
  min-height: 52px;
  padding: 8px 4px;
  border: 0;
  border-radius: 10px;
  background: transparent;
  color: var(--fg);
  font: inherit;
  font-size: 18px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  cursor: pointer;
  touch-action: manipulation;
}

.segment:active {
  background: var(--surface-active);
}

.segment.selected {
  background: var(--accent);
  color: var(--bg);
}

/* --- Строки: уровни и тумблеры --- */

.rows {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.row {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 60px;
  padding: 6px 12px;
  border-radius: 14px;
  background: var(--surface);
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

/* Уровень — строка целиком кликабельна: тап в любом месте ставит или снимает галочку. */
.level {
  cursor: pointer;
  touch-action: manipulation;
}

.level:active {
  background: var(--surface-active);
}

.check {
  flex: none;
  width: 24px;
  height: 24px;
  margin: 0 4px;
  accent-color: var(--accent);
  cursor: pointer;
}

.level-emoji {
  flex: none;
  font-size: 22px;
  line-height: 1;
}

/* Тумблер: дорожка и кружок, включённый — акцентный. */
.switch {
  position: relative;
  flex: none;
  width: 56px;
  height: 34px;
  padding: 0;
  border: 0;
  border-radius: 17px;
  background: var(--surface-active);
  cursor: pointer;
  touch-action: manipulation;
  transition: background 150ms ease;
}

.switch[aria-checked='true'] {
  background: var(--accent);
}

.knob {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--fg);
  transition: transform 150ms ease;
}

.switch[aria-checked='true'] .knob {
  transform: translateX(22px);
}

.warn {
  margin: 0 4px;
  color: var(--accent);
  font-size: 15px;
  line-height: 1.35;
}

/* --- Правила --- */

.rules {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin: 0;
  padding: 0 4px 0 28px;
  font-size: calc(17px * var(--font-scale));
  line-height: 1.4;
}

.rules li::marker {
  color: var(--accent);
  font-weight: 700;
}

/* --- Заглушка --- */

.soon {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.soon-icon {
  color: var(--accent);
  font-size: clamp(56px, 14vh, 96px);
}

.soon-text {
  margin: 0;
  font-size: calc(28px * var(--font-scale));
  font-weight: 700;
}

/* --- Кнопки --- */

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
  cursor: pointer;
  touch-action: manipulation;
}

.rules-button {
  flex: none;
  font-size: 18px;
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
  .switch,
  .knob {
    transition: none;
  }
}
</style>
