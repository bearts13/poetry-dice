<script setup lang="ts">
import { ref, watch } from 'vue';
import { useGameStore } from '../stores/gameStore';

const store = useGameStore();
const copiedText = ref(false);
const copiedImage = ref(false);
const isGenerating = ref(false);
const authorInput = ref(store.author);

watch(authorInput, (newVal) => {
  store.setAuthor(newVal);
});

async function copyPoemText() {
  const text = store.getPoemText();
  await navigator.clipboard.writeText(text);
  copiedText.value = true;
  setTimeout(() => copiedText.value = false, 2000);
}

async function copyPoemImage() {
  isGenerating.value = true;
  
  try {
    const container = document.getElementById('poem-container');
    if (!container) return;
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const theme = store.theme;
    
    const padding = 60;
    const lineHeight = 48;
    const fontSize = 24;
    const lineGap = 12;
    
    const lines = store.lineGroups.map(line => 
      line.map(idx => store.diceResults[idx]?.word || '').join(' ')
    );
    
    let allLines = [...lines];
    if (store.author) {
      allLines.push('');
      allLines.push(`—— ${store.author}`);
    }
    
    let maxWidth = 0;
    for (const line of allLines) {
      const width = line.length * fontSize * 1.1;
      maxWidth = Math.max(maxWidth, width);
    }
    
    canvas.width = Math.max(maxWidth + padding * 2, 400);
    canvas.height = allLines.length * (lineHeight + lineGap) + padding * 2;
    
    ctx.fillStyle = theme.bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = theme.surface;
    const rectWidth = canvas.width - padding * 2;
    const rectHeight = canvas.height - padding * 2;
    ctx.fillRect(padding, padding, rectWidth, rectHeight);
    
    ctx.strokeStyle = theme.border;
    ctx.lineWidth = 2;
    ctx.strokeRect(padding, padding, rectWidth, rectHeight);
    
    ctx.font = `${fontSize}px "Noto Serif SC", "LXGW WenKai", serif`;
    ctx.fillStyle = theme.text;
    ctx.textAlign = 'center';
    
    let y = padding + 80;
    for (const line of lines) {
      ctx.fillText(line || '　', canvas.width / 2, y);
      y += lineHeight + lineGap;
    }
    
    if (store.author) {
      y += lineGap;
      ctx.font = `18px "Noto Serif SC", serif`;
      ctx.fillStyle = theme.textMuted;
      ctx.textAlign = 'right';
      ctx.fillText(`—— ${store.author}`, canvas.width - padding, y);
    }
    
    const dataUrl = canvas.toDataURL('image/png');
    
    const link = document.createElement('a');
    link.download = `诗歌骰子_${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
    
    copiedImage.value = true;
    setTimeout(() => copiedImage.value = false, 2000);
  } catch (error) {
    console.error('生成图片失败:', error);
  } finally {
    isGenerating.value = false;
  }
}
</script>

<template>
  <div class="poem-actions-container max-w-lg mx-auto mt-6">
    <div class="author-input-wrapper mb-4 flex items-center justify-center gap-3">
      <label 
        for="author-input"
        class="font-serif text-sm whitespace-nowrap"
        style="color: var(--theme-text-muted);"
      >
        作者：
      </label>
      <input 
        id="author-input"
        v-model="authorInput"
        type="text"
        placeholder="可留空"
        class="author-input font-serif text-sm px-3 py-2 rounded-lg outline-none transition-all"
        style="background: var(--theme-surface); border: 1px solid var(--theme-border); color: var(--theme-text);"
      />
    </div>
    
    <div class="flex justify-center gap-4">
      <button 
        @click="copyPoemText"
        class="btn-secondary flex items-center gap-2"
      >
        <span>📋</span>
        <span>{{ copiedText ? '已复制 ✓' : '复制诗歌' }}</span>
      </button>
      
      <button 
        @click="copyPoemImage"
        :disabled="isGenerating"
        class="btn-primary flex items-center gap-2"
        :class="isGenerating ? 'opacity-50 cursor-not-allowed' : ''"
      >
        <span>🖼️</span>
        <span>{{ isGenerating ? '生成中...' : copiedImage ? '已保存 ✓' : '复制图片' }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.author-input:focus {
  border-color: var(--theme-accent) !important;
  box-shadow: 0 0 0 2px var(--theme-accent);
}
</style>