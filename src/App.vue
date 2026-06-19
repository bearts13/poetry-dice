<script setup lang="ts">
import { watch, onMounted } from 'vue'
import { useGameStore } from './store'
import DiceGrid from './components/DiceGrid.vue'
import ActionBar from './components/ActionBar.vue'
import ThemeSwitcher from './components/ThemeSwitcher.vue'
import PoemEditor from './components/PoemEditor.vue'
import PoemPreview from './components/PoemPreview.vue'
import PoemActions from './components/PoemActions.vue'

const store = useGameStore()

function applyTheme() {
  const t = store.currentTheme
  const r = document.documentElement.style
  r.setProperty('--theme-primary', t.primary)
  r.setProperty('--theme-secondary', t.secondary)
  r.setProperty('--theme-accent', t.accent)
  r.setProperty('--theme-bg', t.bg)
  r.setProperty('--theme-surface', t.surface)
  r.setProperty('--theme-text', t.text)
  r.setProperty('--theme-text-muted', t.textMuted)
  r.setProperty('--theme-border', t.border)
}

watch(() => store.themeName, applyTheme, { immediate: true })
onMounted(applyTheme)
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center p-6 sm:p-8 relative overflow-hidden">
    <!-- 波纹背景 -->
    <div class="ripple-bg">
      <div class="ripple" v-for="i in 5" :key="i"></div>
    </div>

    <!-- 主题切换 -->
    <div class="absolute top-5 right-5 z-20">
      <ThemeSwitcher />
    </div>

    <!-- 主内容 -->
    <div class="relative z-10 w-full max-w-xl">
      <header class="mb-10 text-center">
        <h1 class="text-3xl font-serif mb-2" style="color: var(--theme-text);">诗歌骰子</h1>
        <p class="text-sm font-serif" style="color: var(--theme-text-muted);">
          投掷九骰，排列词组，创作属于你的现代诗
        </p>
      </header>

      <main>
        <DiceGrid />
        <ActionBar />
        <section class="mt-8">
          <PoemEditor />
        </section>
        <PoemPreview />
        <PoemActions />
      </main>

      <footer class="mt-12 text-center text-xs font-serif" style="color: var(--theme-text-muted); opacity: 0.5;">
        九个骰子 · 六面词组 · 无限诗意
      </footer>
    </div>
  </div>
</template>

<style scoped>
.ripple-bg {
  position: fixed;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: 0;
}

.ripple {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle, var(--theme-accent) 0%, transparent 70%);
  opacity: 0.12;
  animation: ripple 8s ease-out infinite;
}

.ripple:nth-child(1) { left: 10%; top: 20%; width: 200px; height: 200px; animation-delay: 0s; }
.ripple:nth-child(2) { left: 70%; top: 60%; width: 160px; height: 160px; animation-delay: 1.6s; }
.ripple:nth-child(3) { left: 40%; top: 80%; width: 240px; height: 240px; animation-delay: 3.2s; }
.ripple:nth-child(4) { left: 85%; top: 10%; width: 180px; height: 180px; animation-delay: 4.8s; }
.ripple:nth-child(5) { left: 20%; top: 50%; width: 220px; height: 220px; animation-delay: 6.4s; }

@keyframes ripple {
  0% { transform: scale(0.8); opacity: 0.15; }
  100% { transform: scale(2.5); opacity: 0; }
}

@keyframes shake {
  0%, 100% { transform: translate(0, 0) rotate(0); }
  10% { transform: translate(-3px, -2px) rotate(-3deg); }
  20% { transform: translate(3px, 2px) rotate(3deg); }
  30% { transform: translate(-2px, 2px) rotate(-2deg); }
  40% { transform: translate(2px, -2px) rotate(2deg); }
  50% { transform: translate(-2px, -2px) rotate(-1deg); }
  60% { transform: translate(2px, 2px) rotate(1deg); }
  70% { transform: translate(-1px, 1px) rotate(-1deg); }
  80% { transform: translate(1px, -1px) rotate(1deg); }
  90% { transform: translate(0, 0) rotate(0); }
}
</style>

<style>
/* 全局 dice-rolling 类 */
.dice-rolling {
  animation: shake 0.5s linear !important;
}
</style>
