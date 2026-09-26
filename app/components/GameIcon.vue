<script setup lang="ts">
import type { RoleId } from '~/types'

/**
 * Рисунки мини-игр: роли «Мафии», группа игроков, луна на рубашке карты,
 * шпион и таймер для «Шпиона».
 * Рисуем сами, а не берём готовый набор: приложение офлайновое, иконки должны ехать
 * внутри бандла и краситься в цвет стороны, а `currentColor` это и даёт.
 * Сетка 64×64, только обводка — линия одинаково читается и в строке 24px, и на карте 84px.
 */
defineProps<{ name: RoleId | 'players' | 'moon' | 'spy' | 'timer' }>()
</script>

<template>
  <svg
    class="icon"
    viewBox="0 0 64 64"
    fill="none"
    stroke="currentColor"
    stroke-width="3"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <!-- Мафия: федора и лацканы пиджака, лицо в тени под полями -->
    <g v-if="name === 'mafia'">
      <path d="M20 27c0-11 5-17 12-17s12 6 12 17" />
      <path d="M20 24c3 2 7 3 12 3s9-1 12-3" />
      <ellipse cx="32" cy="27" rx="23" ry="4.5" />
      <path d="M22 29v5c0 6 4 10 10 10s10-4 10-10v-5" />
      <path d="M27 35h2M35 35h2" />
      <path d="M12 58c0-8 9-14 20-14s20 6 20 14" />
    </g>

    <!-- Дон: цилиндр с лентой, воротник и бабочка -->
    <g v-else-if="name === 'don'">
      <path d="M23 29V9c0-2 4-3 9-3s9 1 9 3v20" />
      <path d="M23 22c2 2 5 2 9 2s7 0 9-2" />
      <ellipse cx="32" cy="29" rx="19" ry="4" />
      <path d="M24 38l8 7 8-7" />
      <path d="M30 50l-12-7v14l12-7zM34 50l12-7v14l-12-7z" />
      <circle cx="32" cy="50" r="2.5" />
    </g>

    <!-- Комиссар: лупа, под стеклом отпечаток -->
    <g v-else-if="name === 'detective'">
      <circle cx="28" cy="27" r="16" />
      <path d="M39 39l13 13" />
      <path d="M20 30c0-5 4-9 9-9" />
      <path d="M24 33c0-3 2-6 5-6" />
    </g>

    <!-- Доктор: щит с крестом — он ночью прикрывает, а не лечит -->
    <g v-else-if="name === 'doctor'">
      <path d="M32 7l21 8v16c0 13-9 22-21 26-12-4-21-13-21-26V15z" />
      <path d="M32 23v16M24 31h16" />
    </g>

    <!-- Маньяк: маска без лица, играет сам за себя -->
    <g v-else-if="name === 'maniac'">
      <path d="M8 21c7-3 41-3 48 0 0 14-7 25-16 25-3 0-5-2-8-2s-5 2-8 2C15 46 8 35 8 21z" />
      <ellipse cx="22" cy="29" rx="5" ry="4" />
      <ellipse cx="42" cy="29" rx="5" ry="4" />
    </g>

    <!-- Мирный житель -->
    <g v-else-if="name === 'civilian'">
      <circle cx="32" cy="22" r="11" />
      <path d="M12 54c0-11 9-19 20-19s20 8 20 19" />
    </g>

    <!-- Число игроков -->
    <g v-else-if="name === 'players'">
      <circle cx="24" cy="24" r="9" />
      <path d="M7 50c0-9 8-15 17-15s17 6 17 15" />
      <circle cx="45" cy="21" r="7" />
      <path d="M42 36c9 0 15 6 15 14" />
    </g>

    <!-- Шпион: шляпа с широкими полями, тёмные очки и поднятый воротник -->
    <g v-else-if="name === 'spy'">
      <path d="M19 25c0-9 6-15 13-15s13 6 13 15" />
      <path d="M19 21c3 2 8 3 13 3s10-1 13-3" />
      <path d="M5 29c7-4 16-5 27-5s20 1 27 5" />
      <path d="M13 36h38" />
      <path d="M15 36c0 6 3 9 7 9s7-3 7-9M35 36c0 6 3 9 7 9s7-3 7-9" />
      <path d="M14 58l6-10 6 6M50 58l-6-10-6 6" />
    </g>

    <!-- Таймер: секундомер с кнопкой сверху -->
    <g v-else-if="name === 'timer'">
      <circle cx="32" cy="37" r="20" />
      <path d="M27 7h10M32 7v10" />
      <path d="M47 22l4-4" />
      <path d="M32 37V25M32 37l8 5" />
    </g>

    <!-- Рубашка карты: ночь -->
    <g v-else>
      <path d="M56 34A24 24 0 1 1 30 8 18.7 18.7 0 0 0 56 34z" />
      <path
        d="M50 11l1.7 4.6 4.6 1.7-4.6 1.7L50 23.6l-1.7-4.6-4.6-1.7 4.6-1.7z"
        fill="currentColor"
        stroke="none"
      />
      <path
        d="M41 5l1.1 3.1L45.2 9.2 42.1 10.3 41 13.4 39.9 10.3 36.8 9.2 39.9 8.1z"
        fill="currentColor"
        stroke="none"
      />
    </g>
  </svg>
</template>

<style scoped>
.icon {
  display: block;
  width: 1em;
  height: 1em;
}
</style>
