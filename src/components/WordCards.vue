<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useGameStore } from '../stores/gameStore';

const store = useGameStore();

const lines = computed(() => store.lineGroups);
const unassigned = computed(() => store.unassignedWords);
const draggedWordIndex = ref<number | null>(null);
const dragOverLine = ref<number | null>(null);
const dragOverPos = ref<number | null>(null);

// 移动端触摸拖拽状态
const touchDragWordIndex = ref<number | null>(null);
const touchDragGhost = ref<HTMLElement | null>(null);
const touchStartPos = ref({ x: 0, y: 0 });
const isTouchDragging = ref(false);

function onDragStart(e: DragEvent, wordIndex: number) {
  draggedWordIndex.value = wordIndex;
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(wordIndex));
  }
}

function onDragEnd() {
  draggedWordIndex.value = null;
  dragOverLine.value = null;
  dragOverPos.value = null;
}

function onDragOverLine(e: DragEvent, lineIndex: number, pos?: number) {
  e.preventDefault();
  dragOverLine.value = lineIndex;
  dragOverPos.value = pos ?? null;
}

function onDropToLine(e: DragEvent, lineIndex: number, pos?: number) {
  e.preventDefault();
  
  if (draggedWordIndex.value === null) return;
  
  const word = store.diceResults[draggedWordIndex.value];
  
  if (word.lineIndex === -1) {
    store.addWordToLine(draggedWordIndex.value, lineIndex, pos);
  } else {
    store.moveWordInLine(draggedWordIndex.value, lineIndex, pos);
  }
  
  draggedWordIndex.value = null;
  dragOverLine.value = null;
  dragOverPos.value = null;
}

function onDragOverUnassigned(e: DragEvent) {
  e.preventDefault();
  dragOverLine.value = -1;
}

function onDropToUnassigned(e: DragEvent) {
  e.preventDefault();
  
  if (draggedWordIndex.value === null) return;
  
  store.removeWordFromLine(draggedWordIndex.value);
  
  draggedWordIndex.value = null;
  dragOverLine.value = null;
  dragOverPos.value = null;
}

function clickWordInLine(lineIndex: number, pos: number) {
  const wordIndex = lines.value[lineIndex][pos];
  const word = store.diceResults[wordIndex];
  
  if (word.lineIndex !== -1) {
    store.removeWordFromLine(wordIndex);
  }
}

function addLine() {
  store.addLine();
}

function removeLine(lineIndex: number) {
  store.removeLine(lineIndex);
}

// ========== 移动端触摸拖拽 ==========

function onTouchStart(e: TouchEvent, wordIndex: number) {
  if (e.touches.length !== 1) return;
  
  const touch = e.touches[0];
  touchDragWordIndex.value = wordIndex;
  touchStartPos.value = { x: touch.clientX, y: touch.clientY };
  isTouchDragging.value = false;
  
  // 延迟判断是否开始拖拽（避免误触）
  setTimeout(() => {
    if (touchDragWordIndex.value === wordIndex) {
      isTouchDragging.value = true;
      createTouchGhost(e, wordIndex);
    }
  }, 150);
}

function createTouchGhost(e: TouchEvent, wordIndex: number) {
  const word = store.diceResults[wordIndex];
  
  // 创建幽灵元素
  const ghost = document.createElement('div');
  ghost.className = 'touch-drag-ghost';
  ghost.textContent = word.word;
  ghost.style.cssText = `
    position: fixed;
    z-index: 9999;
    padding: 12px 16px;
    border-radius: 8px;
    background: var(--theme-surface);
    border: 2px solid var(--theme-accent);
    color: var(--theme-text);
    font-size: 18px;
    font-weight: bold;
    font-family: "Noto Serif SC", serif;
    box-shadow: 0 8px 24px rgba(0,0,0,0.2);
    pointer-events: none;
    opacity: 0.9;
    transform: translate(-50%, -50%);
  `;
  
  const touch = e.touches[0];
  ghost.style.left = touch.clientX + 'px';
  ghost.style.top = touch.clientY + 'px';
  
  document.body.appendChild(ghost);
  touchDragGhost.value = ghost;
}

function onTouchMove(e: TouchEvent) {
  if (!isTouchDragging.value || !touchDragGhost.value) return;
  
  e.preventDefault();
  
  const touch = e.touches[0];
  touchDragGhost.value.style.left = touch.clientX + 'px';
  touchDragGhost.value.style.top = touch.clientY + 'px';
  
  // 检测当前位置落在哪个区域
  const elements = document.elementsFromPoint(touch.clientX, touch.clientY);
  
  // 查找行区域
  for (const el of elements) {
    if (el.classList.contains('line-content')) {
      const lineEl = el.closest('.poem-line-row');
      if (lineEl) {
        const lineIndex = parseInt(lineEl.getAttribute('data-line-index') || '0');
        dragOverLine.value = lineIndex;
        dragOverPos.value = null;
        
        // 检测是否在某个词组上方
        const wordCards = el.querySelectorAll('.word-card.in-line');
        for (let i = 0; i < wordCards.length; i++) {
          const rect = wordCards[i].getBoundingClientRect();
          if (touch.clientX < rect.left + rect.width / 2) {
            dragOverPos.value = i;
            break;
          }
          dragOverPos.value = i + 1;
        }
        return;
      }
    }
    
    if (el.classList.contains('unassigned-container')) {
      dragOverLine.value = -1;
      dragOverPos.value = null;
      return;
    }
  }
  
  dragOverLine.value = null;
  dragOverPos.value = null;
}

function onTouchEnd(e: TouchEvent) {
  if (!isTouchDragging.value) {
    // 如果没有开始拖拽，当作点击处理
    if (touchDragWordIndex.value !== null) {
      const word = store.diceResults[touchDragWordIndex.value];
      if (word.lineIndex !== -1) {
        store.removeWordFromLine(touchDragWordIndex.value);
      }
    }
  } else if (touchDragWordIndex.value !== null && dragOverLine.value !== null) {
    // 完成拖拽
    if (dragOverLine.value === -1) {
      store.removeWordFromLine(touchDragWordIndex.value);
    } else {
      const word = store.diceResults[touchDragWordIndex.value];
      if (word.lineIndex === -1) {
        store.addWordToLine(touchDragWordIndex.value, dragOverLine.value, dragOverPos.value);
      } else {
        store.moveWordInLine(touchDragWordIndex.value, dragOverLine.value, dragOverPos.value);
      }
    }
  }
  
  // 清理
  if (touchDragGhost.value) {
    touchDragGhost.value.remove();
    touchDragGhost.value = null;
  }
  touchDragWordIndex.value = null;
  isTouchDragging.value = false;
  dragOverLine.value = null;
  dragOverPos.value = null;
}

// 全局监听触摸移动和结束事件
onMounted(() => {
  document.addEventListener('touchmove', onTouchMove, { passive: false });
  document.addEventListener('touchend', onTouchEnd);
  document.addEventListener('touchcancel', onTouchEnd);
});

onUnmounted(() => {
  document.removeEventListener('touchmove', onTouchMove);
  document.removeEventListener('touchend', onTouchEnd);
  document.removeEventListener('touchcancel', onTouchEnd);
});
</script>

<template>
  <div class="poem-editor">
    <div class="unassigned-section mb-6">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-sm font-serif" style="color: var(--theme-text-muted);">待选词组</h3>
        <span class="text-xs" style="color: var(--theme-text-muted);">
          {{ unassigned.length }} 个
        </span>
      </div>
      
      <div 
        class="unassigned-container"
        @dragover="onDragOverUnassigned"
        @drop="onDropToUnassigned"
      >
        <span
          v-for="word in unassigned"
          :key="word.order"
          class="word-card unassigned"
          :class="{ 'dragging': draggedWordIndex === word.order }"
          draggable="true"
          @dragstart="onDragStart($event, word.order)"
          @dragend="onDragEnd"
          @touchstart="onTouchStart($event, word.order)"
        >
          {{ word.word }}
        </span>
        
        <div 
          v-if="unassigned.length === 0"
          class="empty-tip"
        >
          所有词组已放入诗歌中
        </div>
      </div>
    </div>
    
    <div class="lines-section">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-sm font-serif" style="color: var(--theme-text-muted);">诗歌行</h3>
        <button 
          v-if="lines.length < 6"
          @click="addLine"
          class="btn-secondary text-xs"
        >
          + 添加行
        </button>
      </div>
      
      <div class="lines-container">
        <div 
          v-for="(line, lineIndex) in lines" 
          :key="lineIndex"
          class="poem-line-row"
          :data-line-index="lineIndex"
          :class="{ 
            'drag-over-line': dragOverLine === lineIndex,
            empty: line.length === 0
          }"
        >
          <span class="line-number">{{ lineIndex + 1 }}</span>
          
          <div 
            class="line-content"
            @dragover="onDragOverLine($event, lineIndex)"
            @drop="onDropToLine($event, lineIndex)"
          >
            <template v-for="(wordIndex, pos) in line" :key="wordIndex">
              <div 
                v-if="dragOverLine === lineIndex && dragOverPos === pos"
                class="drop-indicator"
              ></div>
              <span
                class="word-card in-line"
                :class="{ 'dragging': draggedWordIndex === wordIndex }"
                draggable="true"
                @click="clickWordInLine(lineIndex, pos)"
                @dragstart="onDragStart($event, wordIndex)"
                @dragend="onDragEnd"
                @dragover="onDragOverLine($event, lineIndex, pos)"
                @drop="onDropToLine($event, lineIndex, pos)"
                @touchstart="onTouchStart($event, wordIndex)"
              >
                {{ store.diceResults[wordIndex]?.word }}
                <span class="remove-icon">×</span>
              </span>
            </template>
            
            <div 
              v-if="dragOverLine === lineIndex && dragOverPos === null && line.length > 0"
              class="drop-indicator"
            ></div>
            
            <div v-if="line.length === 0" class="empty-line-tip">
              拖拽词组到这里
            </div>
          </div>
          
          <button
            v-if="lines.length > 1"
            @click="removeLine(lineIndex)"
            class="action-btn"
            title="删除此行"
          >
            ×
          </button>
        </div>
      </div>
    </div>
    
    <p class="text-center text-xs mt-4 font-serif" style="color: var(--theme-text-muted);">
      从上方拖拽词组到下方行内 · 点击行内词组可移除回待选区
    </p>
  </div>
</template>

<style scoped>
.poem-editor {
  width: 100%;
}

.unassigned-section {
  padding: 16px;
  border-radius: 12px;
  background: rgba(0,0,0,0.05);
  border: 1px dashed var(--theme-border);
}

.unassigned-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  min-height: 60px;
}

.word-card.unassigned {
  cursor: grab;
  background: linear-gradient(135deg, var(--theme-surface), var(--theme-bg));
}

.word-card.unassigned:hover {
  transform: translateY(-2px);
}

.word-card.unassigned:active {
  cursor: grabbing;
}

.word-card.unassigned.dragging {
  opacity: 0.5;
}

.empty-tip {
  color: var(--theme-text-muted);
  opacity: 0.5;
  font-size: 14px;
  margin: auto;
}

.lines-section {
  padding-top: 8px;
}

.lines-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.poem-line-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  background: rgba(0,0,0,0.03);
  border: 1px solid var(--theme-border);
}

.poem-line-row.drag-over-line {
  background: rgba(6, 182, 212, 0.1);
  border-color: var(--theme-accent);
}

.line-number {
  font-size: 12px;
  color: var(--theme-text-muted);
  width: 24px;
  flex-shrink: 0;
  text-align: center;
}

.line-content {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  min-height: 40px;
}

.word-card.in-line {
  cursor: grab;
  background: var(--theme-surface);
  position: relative;
}

.word-card.in-line:hover {
  transform: translateY(-1px);
  border-color: var(--theme-accent);
}

.word-card.in-line:active {
  cursor: grabbing;
}

.word-card.in-line.dragging {
  opacity: 0.5;
}

.remove-icon {
  position: absolute;
  right: 4px;
  top: 4px;
  font-size: 12px;
  color: var(--theme-text-muted);
  opacity: 0;
  transition: opacity 0.2s;
  cursor: pointer;
}

.word-card.in-line:hover .remove-icon {
  opacity: 1;
}

.empty-line-tip {
  color: var(--theme-text-muted);
  opacity: 0.4;
  font-size: 13px;
}

.drop-indicator {
  width: 3px;
  height: 32px;
  background: var(--theme-accent);
  border-radius: 2px;
  animation: pulse 1s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}

.action-btn {
  font-size: 16px;
  padding: 2px 8px;
  background: transparent;
  border: none;
  color: var(--theme-text-muted);
  cursor: pointer;
}

.action-btn:hover {
  color: #ef4444;
}
</style>