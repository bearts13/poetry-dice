<script setup lang="ts">
import { ref, computed } from 'vue';
import { useGameStore } from '../stores/gameStore';

const store = useGameStore();

const lines = computed(() => store.lineGroups);
const unassigned = computed(() => store.unassignedWords);
const draggedWordIndex = ref<number | null>(null);
const dragOverLine = ref<number | null>(null);
const dragOverPos = ref<number | null>(null);

const pointerDownWordIndex = ref<number | null>(null);
const pointerDownPos = ref({ x: 0, y: 0 });
const isDragging = ref(false);
const ghostEl = ref<HTMLElement | null>(null);
let dragTimer: ReturnType<typeof setTimeout> | null = null;

function startDrag(wordIndex: number) {
  draggedWordIndex.value = wordIndex;
  pointerDownWordIndex.value = wordIndex;
  
  isDragging.value = false;
  
  dragTimer = setTimeout(() => {
    if (pointerDownWordIndex.value === wordIndex) {
      isDragging.value = true;
      createGhost(wordIndex);
    }
  }, 100);
}

function createGhost(wordIndex: number) {
  const word = store.diceResults[wordIndex];
  const ghost = document.createElement('div');
  ghost.className = 'drag-ghost';
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
    left: ${pointerDownPos.value.x}px;
    top: ${pointerDownPos.value.y}px;
  `;
  document.body.appendChild(ghost);
  ghostEl.value = ghost;
}

function onPointerDown(e: PointerEvent, wordIndex: number) {
  if (e.pointerType === 'mouse' && e.button !== 0) return;
  
  pointerDownPos.value = { x: e.clientX, y: e.clientY };
  startDrag(wordIndex);
}

function onPointerMove(e: PointerEvent) {
  if (!isDragging.value || !ghostEl.value) return;
  
  ghostEl.value.style.left = e.clientX + 'px';
  ghostEl.value.style.top = e.clientY + 'px';
  
  const elements = document.elementsFromPoint(e.clientX, e.clientY);
  
  for (const el of elements) {
    if (el.classList.contains('line-content')) {
      const lineEl = el.closest('.poem-line-row');
      if (lineEl) {
        const lineIndex = parseInt(lineEl.getAttribute('data-line-index') || '0');
        dragOverLine.value = lineIndex;
        dragOverPos.value = null;
        
        const wordCards = el.querySelectorAll('.word-card.in-line');
        for (let i = 0; i < wordCards.length; i++) {
          const rect = wordCards[i].getBoundingClientRect();
          if (e.clientX < rect.left + rect.width / 2) {
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

function onPointerUp(e: PointerEvent) {
  if (dragTimer) {
    clearTimeout(dragTimer);
    dragTimer = null;
  }
  
  if (!isDragging.value) {
    if (pointerDownWordIndex.value !== null) {
      const word = store.diceResults[pointerDownWordIndex.value];
      if (word.lineIndex !== -1) {
        store.removeWordFromLine(pointerDownWordIndex.value);
      }
    }
  } else if (pointerDownWordIndex.value !== null && dragOverLine.value !== null) {
    if (dragOverLine.value === -1) {
      store.removeWordFromLine(pointerDownWordIndex.value);
    } else {
      const word = store.diceResults[pointerDownWordIndex.value];
      if (word.lineIndex === -1) {
        store.addWordToLine(pointerDownWordIndex.value, dragOverLine.value, dragOverPos.value);
      } else {
        store.moveWordInLine(pointerDownWordIndex.value, dragOverLine.value, dragOverPos.value);
      }
    }
  }
  
  if (ghostEl.value) {
    ghostEl.value.remove();
    ghostEl.value = null;
  }
  
  draggedWordIndex.value = null;
  pointerDownWordIndex.value = null;
  isDragging.value = false;
  dragOverLine.value = null;
  dragOverPos.value = null;
}

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

if (typeof window !== 'undefined') {
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUp);
  window.addEventListener('pointercancel', onPointerUp);
}
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
          @pointerdown="onPointerDown($event, word.order)"
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
                @pointerdown="onPointerDown($event, wordIndex)"
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
      长按词组拖拽 · 点击行内词组移除
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
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
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
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
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

.drag-ghost {
  animation: ghost-pulse 0.5s ease-in-out infinite alternate;
}

@keyframes ghost-pulse {
  from { transform: translate(-50%, -50%) scale(1); }
  to { transform: translate(-50%, -50%) scale(1.05); }
}
</style>