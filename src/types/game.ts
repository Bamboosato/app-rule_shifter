// 1. 4次元属性定義
export type ColorId = 'CYAN' | 'AMBER' | 'EMERALD' | 'MAGENTA';
export type ShapeId = 'CIRCLE' | 'SQUARE' | 'TRIANGLE' | 'DIAMOND';
export type CountId = 1 | 2 | 3 | 4;
export type TextureId = 'SOLID' | 'STRIPE' | 'DOTS' | 'GRID';

export interface AttributeTuple {
  color: ColorId;
  shape: ShapeId;
  count: CountId;
  texture: TextureId;
}

export type DimensionType = 'color' | 'shape' | 'count' | 'texture';

// 2. 潜伏ルール定義（単一一致 ＆ 複数属性同時一致）
export type RuleId =
  | 'MATCH_COLOR'
  | 'MATCH_SHAPE'
  | 'MATCH_COUNT'
  | 'MATCH_TEXTURE'
  | 'MATCH_COLOR_SHAPE'
  | 'MATCH_COLOR_COUNT'
  | 'MATCH_COLOR_TEXTURE'
  | 'MATCH_SHAPE_COUNT'
  | 'MATCH_SHAPE_TEXTURE'
  | 'MATCH_COUNT_TEXTURE'
  | 'DELTA_COUNT'
  | 'ALL_DIFF';

// 3. セル役割
export type CellRole = 'NORMAL' | 'START' | 'GOAL' | 'SHIFTER';

// 4. セル定義
export interface Cell extends AttributeTuple {
  r: number;
  c: number;
  role: CellRole;
}

// 5. ステージ定義
export interface ShiftRuleDef {
  atStep?: number;
  atShifterIndex?: number;
  toRule: RuleId;
}

export interface Stage {
  id: number;
  title: string;
  size: number;
  isScrollable?: boolean;
  viewportSize?: number;
  description: string;
  start: { r: number; c: number };
  goal: { r: number; c: number };
  initialRule: RuleId;
  cells: Cell[];
  shiftRules?: ShiftRuleDef[];
}

// 6. 仮説メモステート
export type HypothesisState = 'UNKNOWN' | 'CANDIDATE' | 'ELIMINATED';

export interface HypothesisScratchpad {
  color: HypothesisState;
  shape: HypothesisState;
  count: HypothesisState;
  texture: HypothesisState;
}

// 7. ゲーム設定
export interface GameSettings {
  isCudMode: boolean;
  isAssistMode: boolean;
  showAttributeGuide: boolean; // 正解属性ガイド（●でルールを表示）
  soundVolume: number;
  isMuted: boolean;
}

// 8. ゲーム実行時状態
export interface GameState {
  currentStageIndex: number;
  currentStage: Stage;
  path: Cell[];
  ruleHistory: RuleId[];
  activeRule: RuleId;
  previousRule?: RuleId;
  perseverativeErrors: number;
  generalErrors: number;
  totalRejects: number;
  lives: number;
  moveCount: number;
  timerSeconds: number;
  isCleared: boolean;
  isGameOver: boolean;
  isDeadEnd: boolean;
  camR: number;
  camC: number;
  scratchpad: HypothesisScratchpad;
  settings: GameSettings;
  lastMistakeCell: Cell | null;
  mistakeTrigger: number;
  isPerseverativeTrigger: boolean;
}
