<script setup lang="ts">
import { useGameStore, THEMES } from '../store'

const store = useGameStore()
const themeEntries = (Object.entries(THEMES) as [string, typeof THEMES.sky][])

function selectTheme(name: 'sky' | 'ocean') {
  store.setTheme(name)
}
</script>

<template>
  <div class="flex items-center gap-2">
    <span class="text-xs font-serif" style="color: var(--theme-text-muted);">主题</span>
    <div class="flex gap-2">
      <button
        v-for="[key, t] in themeEntries"
        :key="key"
        class="theme-dot"
        :class="{ active: store.themeName === key }"
        :style="{ background: `linear-gradient(135deg, ${t.primary}, ${t.secondary})` }"
        :title="t.name"
        @click="selectTheme(key as 'sky' | 'ocean')"
      ></button>
    </div>
  </div>
</template>

<style scoped>
.theme-dot {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
}
.theme-dot:hover { transform: scale(1.15); }
.theme-dot.active { border-color: var(--theme-text); box-shadow: 0 0 0 2px var(--theme-accent); }
</style>
