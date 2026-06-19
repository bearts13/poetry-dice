<script setup lang="ts">
import { useGameStore } from '../store'

const store = useGameStore()
</script>

<template>
  <div class="flex justify-center gap-4 mt-8">
    <button
      @click="store.rollDice()"
      :disabled="store.rolling"
      class="btn-roll"
      :class="{ 'btn-disabled': store.rolling }"
    >
      {{ store.rolling ? '投掷中…' : '🎲 投掷骰子' }}
    </button>
    <button @click="store.reset()" class="btn-reset">重置</button>
  </div>
</template>

<style scoped>
.btn-roll {
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
  font-size: 1rem;
  font-weight: 600;
  background: linear-gradient(135deg, var(--theme-primary), var(--theme-secondary));
  color: var(--theme-text);
  border: 1px solid var(--theme-border);
  box-shadow: 2px 2px 8px rgba(0,0,0,0.3);
  cursor: pointer;
  transition: all 0.2s ease;
}
.btn-roll:hover { transform: translateY(-2px); box-shadow: 4px 4px 12px rgba(0,0,0,0.4); }
.btn-disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

.btn-reset {
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  font-size: 0.9rem;
  background: transparent;
  color: var(--theme-text-muted);
  border: 1px solid var(--theme-border);
  cursor: pointer;
  transition: all 0.2s ease;
}
.btn-reset:hover { background: var(--theme-surface); color: var(--theme-text); }
</style>
