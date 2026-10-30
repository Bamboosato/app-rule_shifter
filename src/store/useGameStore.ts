import { create } from 'zustand';
import {
  Cell,
  DimensionType,
  GameSettings,
  GameState,
  HypothesisScratchpad,
  HypothesisState,
  RuleId,
  Stage,
} from '@/types/game';
import { PRESET_STAGES } from '@/lib/stages';
import {
  isAdjacent,
  validateConnection,
  isPerseverativeError,
  getEliminatedAttributes,
  isDeadEndState,
} from '@/lib/ruleEngine';
import { soundService } from '@/lib/sound';

interface GameActions {
  initStage: (stageIndex: number) => void;
  loadCustomStage: (stage: Stage) => void;
  stepTo: (cell: Cell) => void;
  rewindTo: (index: number) => void;
  undo: () => void;
  reset: () => void;
  nextStage: () => void;
  prevStage: () => void;
  tickTimer: () => void;
  setCamPos: (r: number, c: number) => void;
  shiftCamera: (dr: number, dc: number) => void;
  toggleHypothesis: (dim: DimensionType) => void;
  updateSettings: (partial: Partial<GameSettings>) => void;
}

const SETTINGS_STORAGE_KEY = 'rule_shifter_settings';

const DEFAULT_SETTINGS: GameSettings = {
  isCudMode: false,
  isAssistMode: true,
  showAttributeGuide: false, // デフォルトOFF（正解属性ガイド）
  soundVolume: 0.5,
  isMuted: false,
};

function loadStoredSettings(): GameSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function saveStoredSettings(settings: GameSettings) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // ignore
  }
}

const DEFAULT_SCRATCHPAD: HypothesisScratchpad = {
  color: 'UNKNOWN',
  shape: 'UNKNOWN',
  count: 'UNKNOWN',
  texture: 'UNKNOWN',
};

function getCellAt(cells: Cell[], r: number, c: number): Cell | undefined {
  return cells.find((cell) => cell.r === r && cell.c === c);
}

function getMaxCamOffset(size: number): number {
  if (size <= 4) return 0;
  return size - 4;
}

export const useGameStore = create<GameState & GameActions>((set, get) => {
  const initialStage = PRESET_STAGES[0];
  const startCell =
    getCellAt(initialStage.cells, initialStage.start.r, initialStage.start.c) ||
    initialStage.cells[0];

  return {
    currentStageIndex: 0,
    currentStage: initialStage,
    path: [startCell],
    ruleHistory: [initialStage.initialRule],
    activeRule: initialStage.initialRule,
    previousRule: undefined,
    perseverativeErrors: 0,
    generalErrors: 0,
    totalRejects: 0,
    lives: 3,
    moveCount: 0,
    timerSeconds: 0,
    isCleared: false,
    isGameOver: false,
    isDeadEnd: false,
    camR: 0,
    camC: 0,
    scratchpad: { ...DEFAULT_SCRATCHPAD },
    settings: loadStoredSettings(),
    lastMistakeCell: null,
    mistakeTrigger: 0,
    isPerseverativeTrigger: false,

    initStage: (stageIndex: number) => {
      const stage = PRESET_STAGES[stageIndex] || PRESET_STAGES[0];
      const start =
        getCellAt(stage.cells, stage.start.r, stage.start.c) || stage.cells[0];

      soundService.setMuted(get().settings.isMuted);
      soundService.setVolume(get().settings.soundVolume);

      set({
        currentStageIndex: stageIndex,
        currentStage: stage,
        path: [start],
        ruleHistory: [stage.initialRule],
        activeRule: stage.initialRule,
        previousRule: undefined,
        perseverativeErrors: 0,
        generalErrors: 0,
        totalRejects: 0,
        lives: 3,
        moveCount: 0,
        timerSeconds: 0,
        isCleared: false,
        isGameOver: false,
        isDeadEnd: false,
        camR: 0,
        camC: 0,
        scratchpad: { ...DEFAULT_SCRATCHPAD },
        lastMistakeCell: null,
        mistakeTrigger: 0,
        isPerseverativeTrigger: false,
      });
    },

    loadCustomStage: (stage: Stage) => {
      const start =
        getCellAt(stage.cells, stage.start.r, stage.start.c) || stage.cells[0];

      set({
        currentStageIndex: -1,
        currentStage: stage,
        path: [start],
        ruleHistory: [stage.initialRule],
        activeRule: stage.initialRule,
        previousRule: undefined,
        perseverativeErrors: 0,
        generalErrors: 0,
        totalRejects: 0,
        lives: 3,
        moveCount: 0,
        timerSeconds: 0,
        isCleared: false,
        isGameOver: false,
        isDeadEnd: false,
        camR: 0,
        camC: 0,
        scratchpad: { ...DEFAULT_SCRATCHPAD },
        lastMistakeCell: null,
        mistakeTrigger: 0,
        isPerseverativeTrigger: false,
      });
    },

    stepTo: (targetCell: Cell) => {
      const state = get();
      if (state.isCleared || state.isGameOver) return;

      const path = state.path;
      const tipCell = path[path.length - 1];

      // すでに訪問済みのパス内マスをクリックした場合はその位置まで一括巻き戻し
      const visitedIndex = path.findIndex(
        (c) => c.r === targetCell.r && c.c === targetCell.c
      );

      if (visitedIndex !== -1) {
        if (visitedIndex === path.length - 1) {
          // 現在の先端マス（今いるマス）をクリックした場合は何もしない
          return;
        }
        // 過去の通過マスをクリックした場合はその地点まで一括巻き戻し（ミスとはみなさない）
        get().rewindTo(visitedIndex);
        return;
      }

      // 直交隣接チェック
      if (!isAdjacent(tipCell, targetCell)) return;

      // ブラックボックスルール判定
      const isValid = validateConnection(tipCell, targetCell, state.activeRule);

      if (!isValid) {
        // --- Reject (不合致) ---
        soundService.playReject();

        const isPerseverative = isPerseverativeError(
          tipCell,
          targetCell,
          state.previousRule,
          state.activeRule
        );

        // 初心者アシスト: Rejectセルと一致していた属性を自動棄却
        let updatedScratchpad = { ...state.scratchpad };
        if (state.settings.isAssistMode) {
          const eliminatedDims = getEliminatedAttributes(tipCell, targetCell);
          eliminatedDims.forEach((dim) => {
            updatedScratchpad[dim] = 'ELIMINATED';
          });
        }

        const nextLives = Math.max(0, state.lives - 1);
        const isGameOver = nextLives <= 0;

        if (isGameOver) {
          soundService.playDeadEnd();
        }

        set({
          totalRejects: state.totalRejects + 1,
          lives: nextLives,
          isGameOver,
          perseverativeErrors: isPerseverative
            ? state.perseverativeErrors + 1
            : state.perseverativeErrors,
          generalErrors: !isPerseverative
            ? state.generalErrors + 1
            : state.generalErrors,
          lastMistakeCell: targetCell,
          mistakeTrigger: state.mistakeTrigger + 1,
          isPerseverativeTrigger: isPerseverative,
          scratchpad: updatedScratchpad,
        });
        return;
      }

      // --- Pass (合致) ---
      const newPath = [...path, targetCell];
      const newMoveCount = state.moveCount + 1;
      let nextRule = state.activeRule;
      let newPrevRule = state.previousRule;
      let isPhaseShifted = false;

      // 相転移チェック
      // 1) シフターマス踏破（正確なインデックス判定）
      if (targetCell.role === 'SHIFTER' && state.currentStage.shiftRules) {
        const shifterIndex = newPath.filter((c) => c.role === 'SHIFTER').length;
        const shiftDef = state.currentStage.shiftRules.find(
          (sr) => sr.atShifterIndex === shifterIndex
        );
        if (shiftDef && shiftDef.toRule !== state.activeRule) {
          newPrevRule = state.activeRule;
          nextRule = shiftDef.toRule;
          isPhaseShifted = true;
        }
      }

      // 2) 歩数トリガー（サイレント転移）
      if (state.currentStage.shiftRules) {
        const stepShiftDef = state.currentStage.shiftRules.find(
          (sr) => sr.atStep !== undefined && sr.atStep === newPath.length - 1
        );
        if (stepShiftDef && stepShiftDef.toRule !== state.activeRule) {
          newPrevRule = state.activeRule;
          nextRule = stepShiftDef.toRule;
          isPhaseShifted = true;
        }
      }

      if (isPhaseShifted) {
        soundService.playPhaseShift();
      } else {
        soundService.playPass(newPath.length);
      }

      const newRuleHistory = [...state.ruleHistory, nextRule];

      // ゴール判定
      const isGoal =
        targetCell.r === state.currentStage.goal.r &&
        targetCell.c === state.currentStage.goal.c;

      if (isGoal) {
        soundService.playClear();
      }

      // 手詰まり判定
      const isDead = isDeadEndState(
        targetCell,
        nextRule,
        newPath,
        state.currentStage.cells
      );
      if (isDead && !isGoal) {
        soundService.playDeadEnd();
      }

      // カメラ自動追従 (4x4ファインダー)
      let nextCamR = state.camR;
      let nextCamC = state.camC;
      if (state.currentStage.isScrollable) {
        const maxOffset = getMaxCamOffset(state.currentStage.size);
        const step = state.currentStage.size === 5 ? 1 : 3;

        // 行方向
        if (targetCell.r < state.camR) {
          nextCamR = Math.max(0, state.camR - step);
        } else if (targetCell.r >= state.camR + 3 && targetCell.r < state.currentStage.size - 1) {
          nextCamR = Math.min(maxOffset, state.camR + step);
        } else if (targetCell.r >= state.camR + 4) {
          nextCamR = Math.min(maxOffset, state.camR + step);
        }

        // 列方向
        if (targetCell.c < state.camC) {
          nextCamC = Math.max(0, state.camC - step);
        } else if (targetCell.c >= state.camC + 3 && targetCell.c < state.currentStage.size - 1) {
          nextCamC = Math.min(maxOffset, state.camC + step);
        } else if (targetCell.c >= state.camC + 4) {
          nextCamC = Math.min(maxOffset, state.camC + step);
        }

        if (nextCamR !== state.camR || nextCamC !== state.camC) {
          soundService.playSlide();
        }
      }

      set({
        path: newPath,
        ruleHistory: newRuleHistory,
        activeRule: nextRule,
        previousRule: newPrevRule,
        moveCount: newMoveCount,
        isCleared: isGoal,
        isDeadEnd: isDead && !isGoal,
        camR: nextCamR,
        camC: nextCamC,
        lastMistakeCell: null,
      });
    },

    rewindTo: (targetIndex: number) => {
      const state = get();
      if (
        state.isCleared ||
        state.isGameOver ||
        targetIndex < 0 ||
        targetIndex >= state.path.length - 1
      ) {
        return;
      }

      soundService.playUndo();

      const newPath = state.path.slice(0, targetIndex + 1);
      const newRuleHistory = state.ruleHistory.slice(0, targetIndex + 1);
      const restoredRule = newRuleHistory[newRuleHistory.length - 1];

      const tipCell = newPath[newPath.length - 1];
      const isDead = isDeadEndState(
        tipCell,
        restoredRule,
        newPath,
        state.currentStage.cells
      );

      // 巻き戻し時もカメラを先端セルへ合わせる
      let nextCamR = state.camR;
      let nextCamC = state.camC;
      if (state.currentStage.isScrollable) {
        if (tipCell.r < state.camR) nextCamR = Math.max(0, tipCell.r);
        else if (tipCell.r >= state.camR + 4) nextCamR = tipCell.r - 3;

        if (tipCell.c < state.camC) nextCamC = Math.max(0, tipCell.c);
        else if (tipCell.c >= state.camC + 4) nextCamC = tipCell.c - 3;
      }

      set({
        path: newPath,
        ruleHistory: newRuleHistory,
        activeRule: restoredRule,
        isCleared: false,
        isDeadEnd: isDead,
        camR: nextCamR,
        camC: nextCamC,
      });
    },

    undo: () => {
      const state = get();
      if (state.path.length <= 1) return;
      get().rewindTo(state.path.length - 2);
    },

    reset: () => {
      const state = get();
      const stage = state.currentStage;
      const start =
        getCellAt(stage.cells, stage.start.r, stage.start.c) || stage.cells[0];

      soundService.playUndo();

      set({
        path: [start],
        ruleHistory: [stage.initialRule],
        activeRule: stage.initialRule,
        previousRule: undefined,
        perseverativeErrors: 0,
        generalErrors: 0,
        totalRejects: 0,
        lives: 3,
        moveCount: 0,
        timerSeconds: 0,
        isCleared: false,
        isGameOver: false,
        isDeadEnd: false,
        camR: 0,
        camC: 0,
        scratchpad: { ...DEFAULT_SCRATCHPAD },
        lastMistakeCell: null,
        mistakeTrigger: 0,
        isPerseverativeTrigger: false,
      });
    },

    nextStage: () => {
      const state = get();
      if (state.currentStageIndex < PRESET_STAGES.length - 1) {
        get().initStage(state.currentStageIndex + 1);
      }
    },

    prevStage: () => {
      const state = get();
      if (state.currentStageIndex > 0) {
        get().initStage(state.currentStageIndex - 1);
      }
    },

    tickTimer: () => {
      const state = get();
      if (!state.isCleared && !state.isGameOver) {
        set({ timerSeconds: state.timerSeconds + 1 });
      }
    },

    setCamPos: (r: number, c: number) => {
      const state = get();
      const maxOff = getMaxCamOffset(state.currentStage.size);
      set({
        camR: Math.max(0, Math.min(maxOff, r)),
        camC: Math.max(0, Math.min(maxOff, c)),
      });
    },

    shiftCamera: (dr: number, dc: number) => {
      const state = get();
      const maxOff = getMaxCamOffset(state.currentStage.size);
      const step = state.currentStage.size === 5 ? 1 : 3;

      let nextR = state.camR + dr * step;
      let nextC = state.camC + dc * step;

      nextR = Math.max(0, Math.min(maxOff, nextR));
      nextC = Math.max(0, Math.min(maxOff, nextC));

      if (nextR !== state.camR || nextC !== state.camC) {
        soundService.playSlide();
        set({ camR: nextR, camC: nextC });
      }
    },

    toggleHypothesis: (dim: DimensionType) => {
      const state = get();
      const current = state.scratchpad[dim];
      const cycle: Record<HypothesisState, HypothesisState> = {
        UNKNOWN: 'CANDIDATE',
        CANDIDATE: 'ELIMINATED',
        ELIMINATED: 'UNKNOWN',
      };
      set({
        scratchpad: {
          ...state.scratchpad,
          [dim]: cycle[current],
        },
      });
    },

    updateSettings: (partial: Partial<GameSettings>) => {
      const nextSettings = { ...get().settings, ...partial };
      if (partial.isMuted !== undefined) {
        soundService.setMuted(partial.isMuted);
      }
      if (partial.soundVolume !== undefined) {
        soundService.setVolume(partial.soundVolume);
      }
      saveStoredSettings(nextSettings);
      set({ settings: nextSettings });
    },
  };
});
