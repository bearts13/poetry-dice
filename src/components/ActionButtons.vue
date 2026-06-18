<script setup lang="ts">
import { useGameStore } from '../stores/gameStore';

const store = useGameStore();

function handleRoll() {
  if (!store.isRolling) {
    store.rollDice();
  }
}

function handleReset() {
  store.resetGame();
}
</script>

<template>
  <div class="action-buttons flex justify-center gap-4 mt-8">
    <button 
      @click="handleRoll"
      :disabled="store.isRolling"
      class="btn-primary"
      :class="store.isRolling ? 'opacity-50 cursor-not-allowed' : ''"
    >
      {{ store.isRolling ? '投掷中...' : '投掷骰子' }}
    </button>
    
    <button 
      v-if="store.isRolled"
      @click="handleReset"
      class="btn-secondary"
    >
      重置
    </button>
  </div>
</template>