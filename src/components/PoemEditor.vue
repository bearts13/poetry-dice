<script setup lang="ts">
import { ref } from 'vue'
import { useGameStore } from '../store'

const store = useGameStore()

// Drag state
const dragDiceId = ref<number | null>(null)
const dragSourceLine = ref<number | null>(null) // -1 = from unassigned

function onDragStart(e: DragEvent, diceId: number) {
  dragDiceId.value = diceId
  const item = store.dice.find(d => d.diceId === diceId)
  dragSourceLine.value = item?.lineIndex ?? -1
  store.selectedId = null // clear click-select
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', String(diceId))
  }
}

function onDragEnd() {
  dragDiceId.value = null
  dragSourceLine.value = null
  dragOverLine.value = null
  dragOverPos.value = null
}

// Drop target tracking
const dragOverLine = ref<number | null>(null)
const dragOverPos = ref<number | null>(null)

function onDragOverUnassigned(e: DragEvent) {
  e.preventDefault()
  if (e.dataTransfer) e.dataTransfer.dropEffect = 'move'
}

function onDropToUnassigned(e: DragEvent) {
  e.preventDefault()
  if (dragDiceId.value === null) return
  store.removeFromLine(dragDiceId.value)
  onDragEnd()
}

function onDragOverLine(e: DragEvent, lineIdx: number, pos?: number) {
  e.preventDefault()
  if (e.dataTransfer) e.dataTransfer.dropEffect = 'move'
  dragOverLine.value = lineIdx
  dragOverPos.value = pos ?? null
}

function onDropToLine(e: DragEvent, lineIdx: number, pos?: number) {
  e.preventDefault()
  if (dragDiceId.value === null) return

  const item = store.dice.find(d => d.diceId === dragDiceId.value)
  if (!item) { onDragEnd(); return }

  if (item.lineIndex === -1) {
    // from unassigned
    store.selectedId = dragDiceId.value
    store.placeOnLine(lineIdx, pos)
  } else {
    // from another line or same line
    store.moveInLine(dragDiceId.value, lineIdx, pos)
  }
  onDragEnd()
}
</script>

<template>
  <div class="poem-editor">
    <!-- 待选区 -->
    <div
      class="unassigned-box"
      @dragover="onDragOverUnassigned"
      @drop="onDropToUnassigned"
    >
      <div class="flex items-center justify-between mb-2">
        <h3 class="text-sm font-serif" style="color: var(--theme-text-muted);">待选词组</h3>
        <span class="text-xs" style="color: var(--theme-text-muted); opacity: 0.6;">
          {{ store.unassigned.length }} 个
        </span>
      </div>
      <div class="flex flex-wrap gap-2 min-h-[52px] items-center">
        <div
          v-for="item in store.unassigned"
          :key="item.diceId"
          class="word-card"
          :class="{
            'word-selected': store.selectedId === item.diceId,
            'word-dragging': dragDiceId === item.diceId,
          }"
          draggable="true"
          @dragstart="onDragStart($event, item.diceId)"
          @dragend="onDragEnd"
          @click="store.toggleSelect(item.diceId)"
        >
          {{ item.word }}
        </div>
        <span v-if="store.unassigned.length === 0" class="empty-hint">
          所有词组已放入
        </span>
      </div>
    </div>

    <!-- 诗歌行 -->
    <div class="lines-box">
      <div class="flex items-center justify-between mb-2">
        <h3 class="text-sm font-serif" style="color: var(--theme-text-muted);">诗歌行</h3>
        <button
          v-if="store.lines.length < 8"
          @click="store.addLine()"
          class="btn-add-line"
        >
          + 行
        </button>
      </div>

      <div class="flex flex-col gap-3">
        <div
          v-for="(line, li) in store.lines"
          :key="li"
          class="poem-line"
          :class="{
            'line-active': store.selectedId !== null,
            'line-empty': line.length === 0,
            'line-drag-over': dragOverLine === li,
          }"
          @click="store.selectedId !== null && store.placeOnLine(li)"
          @dragover="onDragOverLine($event, li)"
          @drop="onDropToLine($event, li)"
        >
          <span class="line-num">{{ li + 1 }}</span>

          <div class="line-body flex flex-wrap gap-2 items-center flex-1">
            <template v-for="(diceIdx, pos) in line" :key="diceIdx">
              <!-- Drop indicator before this card -->
              <div
                v-if="dragOverLine === li && dragOverPos === pos"
                class="drop-indicator"
              ></div>

              <div
                class="word-card word-in-line"
                :class="{
                  'word-selected': store.selectedId === store.dice[diceIdx].diceId,
                  'word-dragging': dragDiceId === store.dice[diceIdx].diceId,
                }"
                draggable="true"
                @click.stop="store.removeFromLine(store.dice[diceIdx].diceId)"
                @dragstart="onDragStart($event, store.dice[diceIdx].diceId)"
                @dragend="onDragEnd"
                @dragover.stop="onDragOverLine($event, li, pos)"
                @drop.stop="onDropToLine($event, li, pos)"
              >
                {{ store.dice[diceIdx].word }}
              </div>
            </template>

            <!-- Drop indicator at end of line -->
            <div
              v-if="dragOverLine === li && line.length > 0 && dragOverPos === null"
              class="drop-indicator"
            ></div>

            <span v-if="line.length === 0" class="empty-hint">
              {{ store.selectedId !== null ? '点击放入' : '拖拽或选中词组后放入' }}
            </span>
          </div>

          <button
            v-if="store.lines.length > 1"
            class="btn-del-line"
            @click.stop="store.removeLine(li)"
            title="删除此行"
          >×</button>
        </div>
      </div>
    </div>

    <p class="text-center text-xs mt-4 font-serif" style="color: var(--theme-text-muted); opacity: 0.6;">
      {{ store.selectedId !== null ? '✦ 已选中词组，点击行放入' : '点击或拖拽词组放入行中' }}
    </p>
  </div>
</template>

<style scoped>
.unassigned-box {
  padding: 14px;
  border-radius: 12px;
  background: rgba(0,0,0,0.04);
  border: 1px dashed var(--theme-border);
}

.word-card {
  width: 80px;
  height: 40px;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.95rem;
  background: linear-gradient(145deg, var(--theme-surface), var(--theme-bg));
  color: var(--theme-text);
  border: 1px solid var(--theme-border);
  cursor: grab;
  transition: all 0.2s ease;
  user-select: none;
  box-shadow: 2px 2px 4px rgba(0,0,0,0.2);
  flex-shrink: 0;
}
.word-card:hover { transform: translateY(-2px); box-shadow: 3px 4px 8px rgba(0,0,0,0.3); }
.word-card.word-selected {
  background: var(--theme-accent);
  color: white;
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(6, 182, 212, 0.4);
  border-color: var(--theme-accent);
  cursor: pointer;
}
.word-card.word-dragging {
  opacity: 0.4;
  cursor: grabbing;
}

.word-in-line { width: auto; min-width: 40px; height: 36px; font-size: 0.9rem; }

.lines-box { padding-top: 6px; }

.poem-line {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  background: rgba(0,0,0,0.02);
  border: 1px solid var(--theme-border);
  transition: all 0.2s ease;
}
.poem-line:hover { background: rgba(6, 182, 212, 0.04); }
.poem-line.line-active { border-color: var(--theme-accent); cursor: pointer; }
.poem-line.line-active:hover { background: rgba(6, 182, 212, 0.08); }
.poem-line.line-drag-over {
  border-color: var(--theme-accent);
  background: rgba(6, 182, 212, 0.1);
}

.line-num {
  font-size: 12px;
  color: var(--theme-text-muted);
  width: 20px;
  flex-shrink: 0;
  text-align: center;
  padding-top: 8px;
}

.drop-indicator {
  width: 3px;
  height: 32px;
  background: var(--theme-accent);
  border-radius: 2px;
  animation: pulse 1s ease-in-out infinite;
  flex-shrink: 0;
}

@keyframes pulse {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}

.btn-add-line {
  font-size: 12px;
  padding: 2px 10px;
  border-radius: 6px;
  background: transparent;
  border: 1px solid var(--theme-border);
  color: var(--theme-text-muted);
  cursor: pointer;
  transition: all 0.2s;
}
.btn-add-line:hover { background: var(--theme-surface); color: var(--theme-text); }

.btn-del-line {
  font-size: 14px;
  padding: 0 6px;
  background: transparent;
  border: none;
  color: var(--theme-text-muted);
  cursor: pointer;
  transition: color 0.2s;
}
.btn-del-line:hover { color: #ef4444; }

.empty-hint {
  color: var(--theme-text-muted);
  opacity: 0.4;
  font-size: 13px;
}
</style>
