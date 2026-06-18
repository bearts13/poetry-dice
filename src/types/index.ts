// 骰子定义
export interface Dice {
  id: number;
  faces: string[];
}

// 骰子投掷结果
export interface DiceResult {
  diceId: number;
  word: string;
  order: number;
  lineIndex: number;
  linePos: number;
}

// 游戏状态
export interface GameState {
  diceResults: DiceResult[];
  isRolled: boolean;
  isRolling: boolean;
}