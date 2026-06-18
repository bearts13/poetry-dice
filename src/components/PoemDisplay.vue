<script setup lang="ts">
import { useGameStore } from '../stores/gameStore';
import { computed } from 'vue';

const store = useGameStore();

const poemLines = computed(() => {
  return store.lineGroups.map(line => 
    line.map(idx => store.diceResults[idx]?.word || '').join(' ')
  );
});
</script>

<template>
  <div id="poem-container" class="poem-display poem-container max-w-lg mx-auto">
    <div class="poem-content text-center">
      <p 
        v-for="(line, index) in poemLines" 
        :key="index"
        class="poem-line"
      >
        {{ line || '　' }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.poem-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
</style>