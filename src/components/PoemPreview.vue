<script setup lang="ts">
import { computed } from 'vue'
import { useGameStore } from '../store'

const store = useGameStore()

const poemLines = computed(() =>
  store.lines.map(line =>
    line.map(di => store.dice[di].word).join(' ')
  )
)
</script>

<template>
  <div id="poem-container" class="poem-box mx-auto max-w-lg mt-6">
    <div class="flex flex-col gap-2 text-center">
      <p v-for="(text, i) in poemLines" :key="i" class="poem-line-text">
        {{ text || '\u3000' }}
      </p>
    </div>
    <div v-if="store.author" class="text-right mt-4 pr-4">
      <span class="font-serif text-sm" style="color: var(--theme-text-muted);">
        —— {{ store.author }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.poem-box {
  padding: 2rem;
  border-radius: 1rem;
  background: linear-gradient(180deg, var(--theme-surface), var(--theme-bg));
  border: 1px solid var(--theme-border);
  box-shadow: 0 4px 20px rgba(0,0,0,0.2);
}
.poem-line-text {
  font-size: 1.4rem;
  line-height: 2;
  letter-spacing: 0.08em;
  text-shadow: 0 1px 2px rgba(0,0,0,0.15);
}
</style>
