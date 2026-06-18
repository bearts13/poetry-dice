<script setup lang="ts">
import { useGameStore } from '../stores/gameStore';
import { DICE_DATA } from '../data/diceData';

const store = useGameStore();
</script>

<template>
  <div class="dice-grid grid grid-cols-3 gap-3 max-w-xs mx-auto">
    <div 
      v-for="(dice, index) in DICE_DATA" 
      :key="dice.id"
      class="dice"
      :class="{ 'dice-rolling': store.isRolling }"
      :style="{ animationDelay: `${index * 0.05}s` }"
    >
      <span class="text-base font-serif">
        {{ store.diceResults[dice.id - 1]?.word || '' }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.dice-grid {
  perspective: 1000px;
}

.dice {
  transition: all 0.3s ease;
}
</style>