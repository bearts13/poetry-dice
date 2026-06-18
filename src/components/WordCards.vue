<script setup lang="ts">
import { ref, computed } from 'vue';
import { useGameStore } from '../stores/gameStore';

const store = useGameStore();

const lines = computed(() => store.lineGroups);
const unassigned = computed(() => store.unassignedWords);
const draggedWordIndex = ref<number | null>(null);
const dragOverLine = ref<number | null>(null);
const dragOverPos = ref<number | null>(null);

const selectedWordIndex = ref<number | null>(null);

function selectWord(wordIndex: number) {
  if (selectedWordIndex.value === wordIndex) {
    selectedWordIndex.value = null;
  } else {
    selectedWordIndex.value = wordIndex;
  }
}

function clickLine(lineIndex: number) {
  if (selectedWordIndex.value === null) return;
  
  const word = store.diceResults[selectedWordIndex.value];
  
  if (word.lineIndex === -1) {
    store.addWordToLine(selectedWordIndex.value, lineIndex);
  } else {
    store.moveWordInLine(selectedWordIndex.value, lineIndex);
  }
  
  selectedWordIndex.value = null;
}

function clickWordInLine(lineIndex: number, pos: number) {
  const wordIndex = lines.value[lineIndex][pos];
  
  if (selectedWordIndex.value === wordIndex) {
    selectedWordIndex.value = null;
  } else {
    const word = store.diceResults[wordIndex];
    if (word.lineIndex !== -1) {
      store.removeWordFromLine(wordIndex);
    }
  }
}

function addLine() {
  store.addLine();
}

function removeLine(lineIndex: number) {
  store.removeLine(lineIndex);
}

function onDragStart(e: DragEvent, wordIndex: number) {
  draggedWordIndex.value = wordIndex;
  selectedWordIndex.value = null;
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
          :class="{ 
            'dragging': draggedWordIndex === word.order,
            'selected': selectedWordIndex === word.order
          }"
          draggable="true"
          @dragstart="onDragStart($event, word.order)"
          @dragend="onDragEnd"
          @click="selectWord(word.order)"
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
            'can-drop': selectedWordIndex !== null,
            empty: line.length === 0
          }"
          @click="clickLine(lineIndex)"
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
                :class="{ 
                  'dragging': draggedWordIndex === wordIndex,
                  'selected': selectedWordIndex === wordIndex
                }"
                draggable="true"
                @click.stop="clickWordInLine(lineIndex, pos)"
                @dragstart="onDragStart($event, wordIndex)"
                @dragend="onDragEnd"
                @dragover="onDragOverLine($event, lineIndex, pos)"
                @drop="onDropToLine($event, lineIndex, pos)"
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
              {{ selectedWordIndex !== null ? '点击放入此位置' : '点击上方词组后放入' }}
            </div>
          </div>
          
          <button
            v-if="lines.length > 1"
            @click.stop="removeLine(lineIndex)"
            class="action-btn"
            title="删除此行"
          >
            ×
          </button>
        </div>
      </div>
    </div>
    
    <p class="text-center text-xs mt-4 font-serif" style="color: var(--theme-text-muted);">
      {{ selectedWordIndex !== null ? '已选中词组，点击行放入' : '点击词组选中，再点击行放入' }}
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
  cursor: pointer;
  background: linear-gradient(135deg, var(--theme-surface), var(--theme-bg));
  transition: all 0.2s;
}

.word-card.unassigned:hover {
  transform: translateY(-2px);
}

.word-card.unassigned.selected {
  background: var(--theme-accent);
  color: white !important;
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(6, 182, 212, 0.3);
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
  transition: all 0.2s;
}

.poem-line-row:hover,
.poem-line-row.can-drop {
  background: rgba(6, 182, 212, 0.05);
  border-color: var(--theme-accent);
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
  cursor: pointer;
  background: var(--theme-surface);
  position: relative;
  transition: all 0.2s;
}

.word-card.in-line:hover {
  transform: translateY(-1px);
}

.word-card.in-line.selected {
  background: var(--theme-accent);
  color: white !important;
  transform: scale(1.05);
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