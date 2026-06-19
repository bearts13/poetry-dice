<script setup lang="ts">
import { useGameStore, THEMES } from '../store'
import { DICE_SETS, type DiceSetName } from '../data/dice'

const store = useGameStore()
const themeEntries = (Object.entries(THEMES) as [string, typeof THEMES.sky][])
const diceSetEntries = (Object.entries(DICE_SETS) as [DiceSetName, typeof DICE_SETS.butterfly][])

function selectTheme(name: 'sky' | 'ocean') {
  store.setTheme(name)
}

function selectDiceSet(name: DiceSetName) {
  store.setDiceSet(name)
}
</script>

<template>
  <div class="flex items-center gap-4 flex-wrap">
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
    <div class="flex items-center gap-2">
      <span class="text-xs font-serif" style="color: var(--theme-text-muted);">词组</span>
      <div class="flex gap-2">
        <button
          v-for="[key, d] in diceSetEntries"
          :key="key"
          class="dice-set-btn"
          :class="{ active: store.currentDiceSet === key }"
          @click="selectDiceSet(key)"
        >
          {{ d.name }}
        </button>
      </div>
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

.dice-set-btn {
  padding: 4px 12px;
  border-radius: 14px;
  border: 1.5px solid var(--theme-border);
  background: var(--theme-surface);
  color: var(--theme-text-muted);
  font-family: serif;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}
.dice-set-btn:hover {
  color: var(--theme-text);
  border-color: var(--theme-text-muted);
}
.dice-set-btn.active {
  background: var(--theme-primary);
  color: white;
  border-color: var(--theme-primary);
}
</style>
