<script setup lang="ts">
import { useGameStore } from '../store'

const store = useGameStore()
</script>

<template>
  <div class="grid grid-cols-3 gap-3 max-w-[280px] mx-auto">
    <div
      v-for="item in store.dice"
      :key="item.diceId"
      class="dice-cell"
      :class="{ 'dice-rolling': store.rolling }"
      :style="{ animationDelay: `${(item.diceId - 1) * 40}ms` }"
    >
      {{ item.word }}
    </div>
  </div>
</template>

<style scoped>
.dice-cell {
  width: 80px;
  height: 80px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.1rem;
  background: linear-gradient(145deg, var(--theme-surface), var(--theme-bg));
  box-shadow: 4px 4px 8px rgba(0,0,0,0.25), -2px -2px 4px rgba(255,255,255,0.1),
    inset 0 1px 0 rgba(255,255,255,0.15);
  border: 1px solid var(--theme-border);
  color: var(--theme-text);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.dice-cell::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transform: translateX(-100%);
  transition: transform 0.5s ease;
}

.dice-cell:hover::before {
  transform: translateX(100%);
}
</style>
