import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { DICE_SETS, type DiceSetName } from './data/dice'
import type { DiceResult, ThemeName, Theme } from './types'

export const THEMES: Record<ThemeName, Theme> = {
  sky: {
    name: '晴空',
    primary: '#0ea5e9',
    secondary: '#7dd3fc',
    accent: '#06b6d4',
    bg: '#f0f9ff',
    surface: '#e0f2fe',
    text: '#0c4a6e',
    textMuted: '#0369a1',
    border: '#bae6fd',
  },
  ocean: {
    name: '深海',
    primary: '#1e40af',
    secondary: '#0ea5e9',
    accent: '#06b6d4',
    bg: '#0c4a6e',
    surface: '#0e7490',
    text: '#f0f9ff',
    textMuted: '#7dd3fc',
    border: '#0369a1',
  },
}

function rollAll(setName: DiceSetName): DiceResult[] {
  return DICE_SETS[setName].dice.map(dice => ({
    diceId: dice.id,
    word: dice.faces[Math.floor(Math.random() * dice.faces.length)],
    lineIndex: -1,
  }))
}

export const useGameStore = defineStore('game', () => {
  const dice = ref<DiceResult[]>(rollAll('butterfly'))
  const lines = ref<number[][]>([[], [], []])
  const rolling = ref(false)
  const themeName = ref<ThemeName>('sky')
  const author = ref('')
  const selectedId = ref<number | null>(null)
  const currentDiceSet = ref<DiceSetName>('butterfly')

  const currentTheme = computed(() => THEMES[themeName.value])
  const diceSetInfo = computed(() => DICE_SETS[currentDiceSet.value])

  const unassigned = computed(() => dice.value.filter(d => d.lineIndex === -1))

  function rollDice() {
    rolling.value = true
    setTimeout(() => {
      dice.value = rollAll(currentDiceSet.value)
      lines.value = [[], [], []]
      rolling.value = false
      selectedId.value = null
    }, 500)
  }

  function toggleSelect(diceId: number) {
    selectedId.value = selectedId.value === diceId ? null : diceId
  }

  function placeOnLine(lineIdx: number, insertPos?: number) {
    if (selectedId.value === null) return
    const diceIdx = dice.value.findIndex(d => d.diceId === selectedId.value)
    if (diceIdx === -1) return
    const item = dice.value[diceIdx]

    // remove from old line if any
    if (item.lineIndex !== -1) {
      const oldLine = lines.value[item.lineIndex]
      const p = oldLine.indexOf(diceIdx)
      if (p !== -1) oldLine.splice(p, 1)
    }

    const line = lines.value[lineIdx]
    if (insertPos !== undefined && insertPos <= line.length) {
      line.splice(insertPos, 0, diceIdx)
    } else {
      line.push(diceIdx)
    }
    item.lineIndex = lineIdx
    selectedId.value = null
  }

  function moveInLine(diceId: number, targetLineIdx: number, targetPos?: number) {
    const diceIdx = dice.value.findIndex(d => d.diceId === diceId)
    if (diceIdx === -1) return
    const item = dice.value[diceIdx]
    if (item.lineIndex === -1) return

    const oldLine = lines.value[item.lineIndex]
    const p = oldLine.indexOf(diceIdx)
    if (p !== -1) oldLine.splice(p, 1)

    const targetLine = lines.value[targetLineIdx]
    if (targetPos !== undefined && targetPos <= targetLine.length) {
      targetLine.splice(targetPos, 0, diceIdx)
    } else {
      targetLine.push(diceIdx)
    }
    item.lineIndex = targetLineIdx
  }

  function removeFromLine(diceId: number) {
    const diceIdx = dice.value.findIndex(d => d.diceId === diceId)
    if (diceIdx === -1) return
    const item = dice.value[diceIdx]
    if (item.lineIndex === -1) return
    const line = lines.value[item.lineIndex]
    const p = line.indexOf(diceIdx)
    if (p !== -1) line.splice(p, 1)
    item.lineIndex = -1
    if (selectedId.value === diceId) selectedId.value = null
  }

  function addLine() {
    if (lines.value.length < 8) lines.value.push([])
  }

  function removeLine(lineIdx: number) {
    if (lines.value.length <= 1) return
    for (const di of lines.value[lineIdx]) dice.value[di].lineIndex = -1
    lines.value.splice(lineIdx, 1)
    lines.value.forEach((l, i) => l.forEach(di => { dice.value[di].lineIndex = i }))
  }

  function setTheme(name: ThemeName) { themeName.value = name }
  function setAuthor(v: string) { author.value = v.trim() }

  function setDiceSet(setName: DiceSetName) {
    currentDiceSet.value = setName
    dice.value = rollAll(setName)
    lines.value = [[], [], []]
    rolling.value = false
    selectedId.value = null
  }

  function reset() {
    dice.value = rollAll(currentDiceSet.value)
    lines.value = [[], [], []]
    rolling.value = false
    selectedId.value = null
  }

  function getPoemText(): string {
    const result = lines.value.map(line =>
      line.map(di => dice.value[di].word).join(' ')
    )
    if (author.value) {
      result.push('')
      result.push(`—— ${author.value}`)
    }
    return result.join('\n')
  }

  return {
    dice, lines, rolling, themeName, author, selectedId,
    currentDiceSet, diceSetInfo,
    currentTheme, unassigned,
    rollDice, toggleSelect, placeOnLine, moveInLine, removeFromLine,
    addLine, removeLine, setTheme, setAuthor, setDiceSet, reset, getPoemText,
  }
})
