import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from './useGameStore';

describe('useGameStore', () => {
  beforeEach(() => {
    useGameStore.getState().initStage(0);
  });

  it('初期状態が正しくセットアップされる', () => {
    const state = useGameStore.getState();
    expect(state.path.length).toBe(1);
    expect(state.path[0].r).toBe(0);
    expect(state.path[0].c).toBe(0);
    expect(state.activeRule).toBe('MATCH_COLOR');
    expect(state.moveCount).toBe(0);
    expect(state.isCleared).toBe(false);
  });

  it('合致セルへの移動でPassし、パスと手数が進む', () => {
    const cell01 = useGameStore.getState().currentStage.cells.find((c) => c.r === 0 && c.c === 1)!;
    useGameStore.getState().stepTo(cell01);

    const state = useGameStore.getState();
    expect(state.path.length).toBe(2);
    expect(state.moveCount).toBe(1);
    expect(state.ruleHistory.length).toBe(2);
  });

  it('不合致セルへの移動でRejectされ、手数は進まずエラーが加算される', () => {
    // (1, 0) は EMERALD で始点 (0,0: CYAN) と色が異なる
    const cell10 = useGameStore.getState().currentStage.cells.find((c) => c.r === 1 && c.c === 0)!;
    useGameStore.getState().stepTo(cell10);

    const state = useGameStore.getState();
    expect(state.path.length).toBe(1);
    expect(state.moveCount).toBe(0);
    expect(state.totalRejects).toBe(1);
    expect(state.generalErrors).toBe(1);
    expect(state.lives).toBe(2);
  });

  it('3回ミスでライフが0になりゲームオーバーになる', () => {
    const cell10 = useGameStore.getState().currentStage.cells.find((c) => c.r === 1 && c.c === 0)!;
    useGameStore.getState().stepTo(cell10);
    expect(useGameStore.getState().lives).toBe(2);
    expect(useGameStore.getState().isGameOver).toBe(false);

    useGameStore.getState().stepTo(cell10);
    expect(useGameStore.getState().lives).toBe(1);
    expect(useGameStore.getState().isGameOver).toBe(false);

    useGameStore.getState().stepTo(cell10);
    expect(useGameStore.getState().lives).toBe(0);
    expect(useGameStore.getState().isGameOver).toBe(true);
  });

  it('途中の訪問済みセルをタップすると、その位置まで一括巻き戻し（rewindTo）される', () => {
    // Stage 1: (0,0) -> (0,1) -> (1,1) -> (1,2)
    const stage = useGameStore.getState().currentStage;
    const c01 = stage.cells.find((c) => c.r === 0 && c.c === 1)!;
    const c11 = stage.cells.find((c) => c.r === 1 && c.c === 1)!;
    const c12 = stage.cells.find((c) => c.r === 1 && c.c === 2)!;

    useGameStore.getState().stepTo(c01);
    useGameStore.getState().stepTo(c11);
    useGameStore.getState().stepTo(c12);
    expect(useGameStore.getState().path.length).toBe(4);

    // 途中の (0,1) をタップして巻き戻す
    useGameStore.getState().stepTo(c01);
    expect(useGameStore.getState().path.length).toBe(2);
    expect(useGameStore.getState().path[1].r).toBe(0);
    expect(useGameStore.getState().path[1].c).toBe(1);

    // 始点 (0,0) をタップして巻き戻す
    const c00 = stage.cells.find((c) => c.r === 0 && c.c === 0)!;
    useGameStore.getState().stepTo(c00);
    expect(useGameStore.getState().path.length).toBe(1);
  });

  it('Undoで1手戻り、ルールスタックも正常に巻き戻る', () => {
    const cell01 = useGameStore.getState().currentStage.cells.find((c) => c.r === 0 && c.c === 1)!;
    useGameStore.getState().stepTo(cell01);
    expect(useGameStore.getState().path.length).toBe(2);

    useGameStore.getState().undo();
    expect(useGameStore.getState().path.length).toBe(1);
    expect(useGameStore.getState().ruleHistory.length).toBe(1);
  });

  it('仮説メモのトグルが正しく3値サイクルする', () => {
    expect(useGameStore.getState().scratchpad.color).toBe('UNKNOWN');
    useGameStore.getState().toggleHypothesis('color');
    expect(useGameStore.getState().scratchpad.color).toBe('CANDIDATE');
    useGameStore.getState().toggleHypothesis('color');
    expect(useGameStore.getState().scratchpad.color).toBe('ELIMINATED');
    useGameStore.getState().toggleHypothesis('color');
    expect(useGameStore.getState().scratchpad.color).toBe('UNKNOWN');
  });

  it('Stage 2 で相転移後の保続エラーを正しく検知する', () => {
    useGameStore.getState().initStage(1); // Stage 2
    const stage = useGameStore.getState().currentStage;

    // (0,0) -> (1,0) -> (1,1) -> (1,2:SHIFTER)
    const c10 = stage.cells.find((c) => c.r === 1 && c.c === 0)!;
    const c11 = stage.cells.find((c) => c.r === 1 && c.c === 1)!;
    const c12 = stage.cells.find((c) => c.r === 1 && c.c === 2)!;

    useGameStore.getState().stepTo(c10);
    useGameStore.getState().stepTo(c11);
    useGameStore.getState().stepTo(c12);

    // シフター踏破によりルールが MATCH_SHAPE に相転移
    expect(useGameStore.getState().activeRule).toBe('MATCH_SHAPE');
    expect(useGameStore.getState().previousRule).toBe('MATCH_COLOR');

    // (1, 3) は AMBER(色一致: 旧ルール合致) だが CIRCLE(形状不一致: 新ルール違反)
    const c13 = stage.cells.find((c) => c.r === 1 && c.c === 3)!;
    useGameStore.getState().stepTo(c13);

    const state = useGameStore.getState();
    expect(state.path.length).toBe(4); // 前進しない
    expect(state.totalRejects).toBe(1);
    expect(state.perseverativeErrors).toBe(1); // 保続エラー加算！
    expect(state.isPerseverativeTrigger).toBe(true);
  });

  it('reset() resets timerSeconds to 0', () => {
    useGameStore.getState().initStage(0);
    useGameStore.getState().tickTimer();
    useGameStore.getState().tickTimer();
    expect(useGameStore.getState().timerSeconds).toBe(2);

    useGameStore.getState().reset();
    expect(useGameStore.getState().timerSeconds).toBe(0);
  });

  it('updateSettings() で showAttributeGuide を切り替えられる', () => {
    expect(useGameStore.getState().settings.showAttributeGuide).toBe(false);
    useGameStore.getState().updateSettings({ showAttributeGuide: true });
    expect(useGameStore.getState().settings.showAttributeGuide).toBe(true);
    useGameStore.getState().updateSettings({ showAttributeGuide: false });
    expect(useGameStore.getState().settings.showAttributeGuide).toBe(false);
  });
});
