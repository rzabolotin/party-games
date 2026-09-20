<template>
  <main class="screen">
    <div class="logo" aria-hidden="true">🔥</div>
    <h1 class="title">Костёр</h1>
    <p class="hint">Карточки с вопросами появятся здесь</p>
  </main>
</template>

<style scoped>
.screen {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);
  text-align: center;
}

.logo {
  font-size: 96px;
  line-height: 1;
}

.title {
  margin: 0;
  font-size: 40px;
  font-weight: 700;
}

.hint {
  margin: 0;
  color: var(--muted);
}
</style>
