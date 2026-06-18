<script setup lang="ts">
import { computed, onMounted, watch } from 'vue';
import DiceGrid from './components/DiceGrid.vue';
import WordCards from './components/WordCards.vue';
import PoemDisplay from './components/PoemDisplay.vue';
import ActionButtons from './components/ActionButtons.vue';
import ThemeSwitcher from './components/ThemeSwitcher.vue';
import PoemActions from './components/PoemActions.vue';
import { useGameStore } from './stores/gameStore';

const store = useGameStore();

// 应用主题到 CSS 变量
function applyTheme() {
  const theme = store.theme;
  const root = document.documentElement;
  root.style.setProperty('--theme-primary', theme.primary);
  root.style.setProperty('--theme-secondary', theme.secondary);
  root.style.setProperty('--theme-accent', theme.accent);
  root.style.setProperty('--theme-bg', theme.bg);
  root.style.setProperty('--theme-surface', theme.surface);
  root.style.setProperty('--theme-text', theme.text);
  root.style.setProperty('--theme-text-muted', theme.textMuted);
  root.style.setProperty('--theme-border', theme.border);
}

watch(() => store.currentTheme, applyTheme, { immediate: true });
onMounted(applyTheme);
</script>

<template>
  <div class="min-h-screen paper-texture flex flex-col items-center justify-center p-8 relative overflow-hidden">
    <!-- 波纹背景 -->
    <div class="ripple-bg">
      <div class="ripple"></div>
      <div class="ripple"></div>
      <div class="ripple"></div>
      <div class="ripple"></div>
      <div class="ripple"></div>
    </div>
    
    <!-- 主题切换 -->
    <div class="absolute top-6 right-6 z-20">
      <ThemeSwitcher />
    </div>
    
    <!-- 内容层 -->
    <div class="relative z-10 w-full max-w-xl">
      <!-- 标题 -->
      <header class="mb-10 text-center">
        <h1 class="text-3xl font-serif mb-2" style="color: var(--theme-text);">诗歌骰子</h1>
        <p class="text-sm font-serif" style="color: var(--theme-text-muted);">投掷九骰，排列词组，创作属于你的现代诗</p>
      </header>
      
      <!-- 骰子区域 -->
      <main>
        <section class="dice-section">
          <DiceGrid />
        </section>
        
        <!-- 操作按钮 -->
        <ActionButtons />
        
        <!-- 词组编辑区 -->
        <section class="words-section mt-8">
          <WordCards />
        </section>
        
        <!-- 诗歌展示 -->
        <PoemDisplay />
        
        <!-- 诗歌操作按钮 -->
        <PoemActions />
      </main>
      
      <!-- 底部装饰 -->
      <footer class="mt-12 text-center text-xs font-serif" style="color: var(--theme-text-muted); opacity: 0.6;">
        <p>九个骰子 · 六面词组 · 无限诗意</p>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.ripple-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
  z-index: 0;
}

.ripple {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle, var(--theme-accent) 0%, transparent 70%);
  opacity: 0.1;
  animation: ripple 6s ease-out infinite;
}

.ripple:nth-child(1) { 
  left: 10%; top: 20%; 
  width: 200px; height: 200px;
  animation-delay: 0s; 
}
.ripple:nth-child(2) { 
  left: 70%; top: 60%; 
  width: 160px; height: 160px;
  animation-delay: 1.2s; 
}
.ripple:nth-child(3) { 
  left: 40%; top: 80%; 
  width: 240px; height: 240px;
  animation-delay: 2.4s; 
}
.ripple:nth-child(4) { 
  left: 85%; top: 10%; 
  width: 180px; height: 180px;
  animation-delay: 3.6s; 
}
.ripple:nth-child(5) { 
  left: 20%; top: 70%; 
  width: 220px; height: 220px;
  animation-delay: 4.8s; 
}

@keyframes ripple {
  0% {
    transform: scale(0.8);
    opacity: 0.15;
  }
  100% {
    transform: scale(2.5);
    opacity: 0;
  }
}
</style>