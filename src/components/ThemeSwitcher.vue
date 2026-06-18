<script setup lang="ts">
import { useGameStore, THEMES, type ThemeName } from '../stores/gameStore';

const store = useGameStore();

function selectTheme(themeName: ThemeName) {
  store.setTheme(themeName);
}
</script>

<template>
  <div class="theme-switcher flex items-center gap-3">
    <span class="text-xs font-serif" style="color: var(--theme-text-muted);">主题</span>
    <div class="flex gap-2">
      <div
        v-for="(theme, key) in THEMES"
        :key="key"
        class="theme-option relative"
        :title="theme.name"
      >
        <div
          class="theme-dot"
          :class="{ active: store.currentTheme === key }"
          :style="{
            background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`
          }"
          @click="selectTheme(key as ThemeName)"
        ></div>
        <span 
          class="theme-name absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs font-serif whitespace-nowrap opacity-0 transition-opacity"
          style="color: var(--theme-text-muted);"
        >
          {{ theme.name }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.theme-option:hover .theme-name {
  opacity: 1;
}
</style>