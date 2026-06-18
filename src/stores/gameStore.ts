import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { DiceResult } from '../types';
import { DICE_DATA } from '../data/diceData';

export type ThemeName = 'sky' | 'ocean';

export interface Theme {
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  bg: string;
  surface: string;
  text: string;
  textMuted: string;
  border: string;
}

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
    border: '#bae6fd'
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
    border: '#0369a1'
  }
};

export const useGameStore = defineStore('game', () => {
  const diceResults = ref<DiceResult[]>([]);
  const isRolled = ref(false);
  const isRolling = ref(false);
  const currentTheme = ref<ThemeName>('sky');

  const initialWords = DICE_DATA.map((dice, index) => ({
    diceId: dice.id,
    word: dice.faces[Math.floor(Math.random() * dice.faces.length)],
    order: index,
    lineIndex: -1,
    linePos: -1
  }));
  diceResults.value = initialWords;

  const lineGroups = ref<number[][]>([[], [], []]);

  const orderedWords = computed(() => {
    const result: string[] = [];
    lineGroups.value.forEach(line => {
      line.forEach(idx => {
        result.push(diceResults.value[idx]?.word || '');
      });
    });
    const unassigned = diceResults.value.filter(r => r.lineIndex === -1);
    unassigned.forEach(r => result.push(r.word));
    return result;
  });

  const unassignedWords = computed(() => {
    return diceResults.value.filter(r => r.lineIndex === -1);
  });

  const theme = computed(() => THEMES[currentTheme.value]);

  function rollDice() {
    isRolling.value = true;
    
    setTimeout(() => {
      diceResults.value = DICE_DATA.map((dice, index) => ({
        diceId: dice.id,
        word: dice.faces[Math.floor(Math.random() * dice.faces.length)],
        order: index,
        lineIndex: -1,
        linePos: -1
      }));
      
      isRolled.value = true;
      isRolling.value = false;
      lineGroups.value = [[], [], []];
    }, 600);
  }

  function addWordToLine(wordIndex: number, lineIndex: number, pos?: number) {
    const word = diceResults.value[wordIndex];
    if (!word || word.lineIndex !== -1) return;
    
    const targetLine = lineGroups.value[lineIndex] || [];
    
    if (pos !== undefined && pos <= targetLine.length) {
      targetLine.splice(pos, 0, wordIndex);
    } else {
      targetLine.push(wordIndex);
    }
    
    lineGroups.value[lineIndex] = targetLine;
    word.lineIndex = lineIndex;
    word.linePos = pos !== undefined ? pos : targetLine.length - 1;
  }

  function removeWordFromLine(wordIndex: number) {
    const word = diceResults.value[wordIndex];
    if (!word || word.lineIndex === -1) return;
    
    const line = lineGroups.value[word.lineIndex];
    if (line) {
      const idx = line.indexOf(wordIndex);
      if (idx !== -1) {
        line.splice(idx, 1);
      }
    }
    
    word.lineIndex = -1;
    word.linePos = -1;
  }

  function moveWordInLine(wordIndex: number, newLineIndex: number, newPos?: number) {
    removeWordFromLine(wordIndex);
    addWordToLine(wordIndex, newLineIndex, newPos);
  }

  function addLine() {
    if (lineGroups.value.length < 6) {
      lineGroups.value.push([]);
    }
  }

  function removeLine(lineIndex: number) {
    if (lineGroups.value.length <= 1) return;
    
    const line = lineGroups.value[lineIndex];
    line.forEach(wordIndex => {
      const word = diceResults.value[wordIndex];
      if (word) {
        word.lineIndex = -1;
        word.linePos = -1;
      }
    });
    
    lineGroups.value.splice(lineIndex, 1);
    
    lineGroups.value.forEach((line, idx) => {
      line.forEach(wordIndex => {
        const word = diceResults.value[wordIndex];
        if (word) {
          word.lineIndex = idx;
        }
      });
    });
  }

  function setTheme(themeName: ThemeName) {
    currentTheme.value = themeName;
  }

  function resetGame() {
    diceResults.value = initialWords;
    isRolled.value = false;
    isRolling.value = false;
    lineGroups.value = [[], [], []];
  }

  function getPoemText(): string {
    return lineGroups.value.map(line => 
      line.map(idx => diceResults.value[idx]?.word || '').join(' ')
    ).join('\n');
  }

  return {
    diceResults,
    isRolled,
    isRolling,
    currentTheme,
    lineGroups,
    orderedWords,
    unassignedWords,
    theme,
    rollDice,
    addWordToLine,
    removeWordFromLine,
    moveWordInLine,
    addLine,
    removeLine,
    setTheme,
    resetGame,
    getPoemText
  };
});