export interface Dice {
  id: number
  faces: string[]
}

export interface DiceResult {
  diceId: number
  word: string
  lineIndex: number  // -1 = unassigned
}

export type ThemeName = 'sky' | 'ocean' | 'cyberpunk'

export interface Theme {
  name: string
  primary: string
  secondary: string
  accent: string
  bg: string
  surface: string
  text: string
  textMuted: string
  border: string
}
