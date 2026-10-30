import { describe, it, expect } from 'vitest';
import { PRESET_STAGES, generateDailyStage } from './stages';
import {
  countStageSolutions,
  getStageSolutionPath,
  getMaxStraightSteps,
} from './generator';
import { validateConnection } from './ruleEngine';
import { Cell } from '@/types/game';

describe('PRESET_STAGES 到達性検証', () => {
  PRESET_STAGES.forEach((stage) => {
    it(`Stage ${stage.id} (${stage.title}) に解が存在し、始点・終点が正しく定義されている`, () => {
      expect(stage.cells.length).toBe(stage.size * stage.size);
      const startCell = stage.cells.find(
        (c) => c.r === stage.start.r && c.c === stage.start.c
      );
      const goalCell = stage.cells.find(
        (c) => c.r === stage.goal.r && c.c === stage.goal.c
      );
      expect(startCell).toBeDefined();
      expect(goalCell).toBeDefined();
      expect(startCell?.role).toBe('START');
      expect(goalCell?.role).toBe('GOAL');

      // DFSでゴールまでの経路が存在することを検証
      const cellMap = new Map<string, Cell>();
      stage.cells.forEach((c) => cellMap.set(`${c.r},${c.c}`, c));

      const path: Cell[] = [startCell!];
      let currentRule = stage.initialRule;
      let shifterCount = 0;

      function dfs(curr: Cell, depth = 0): boolean {
        if (curr.r === stage.goal.r && curr.c === stage.goal.c) {
          return true;
        }
        if (depth > 120) return false;
        const deltas = [
          [0, 1],
          [1, 0],
          [0, -1],
          [-1, 0],
        ];
        for (const [dr, dc] of deltas) {
          const nr = curr.r + dr;
          const nc = curr.c + dc;
          const next = cellMap.get(`${nr},${nc}`);
          if (!next) continue;
          if (path.some((p) => p.r === next.r && p.c === next.c)) continue;

          const isValid = validateConnection(curr, next, currentRule);
          if (isValid) {
            path.push(next);
            const prevRule = currentRule;
            const prevShifterCount = shifterCount;
            if (next.role === 'SHIFTER') {
              shifterCount++;
              const shift = stage.shiftRules?.find(
                (s) => s.atShifterIndex === shifterCount
              );
              if (shift) currentRule = shift.toRule;
            } else if (stage.shiftRules) {
              const stepShift = stage.shiftRules.find(
                (s) => s.atStep === path.length - 1
              );
              if (stepShift) currentRule = stepShift.toRule;
            }
            if (dfs(next, depth + 1)) return true;
            path.pop();
            currentRule = prevRule;
            shifterCount = prevShifterCount;
          }
        }
        return false;
      }

      const reachesGoal = dfs(startCell!);
      expect(reachesGoal).toBe(true);
    });
  });

  it('デイリーチャレンジがシード値に基づき決定論的に生成される', () => {
    const daily1 = generateDailyStage('20261028');
    const daily2 = generateDailyStage('20261028');
    expect(daily1.cells.length).toBe(49);
    expect(daily1.cells[0].color).toBe(daily2.cells[0].color);
    expect(daily1.cells[0].shape).toBe(daily2.cells[0].shape);
  });

  it('2要素一致ステージにおいて、近接ダミーセルが「片方の要素だけ一致」している', () => {
    // Stage 6 (MATCH_COLOR -> MATCH_COLOR_SHAPE)
    const stage6 = PRESET_STAGES.find((s) => s.id === 6)!;
    const cellMap = new Map<string, Cell>();
    stage6.cells.forEach((c) => cellMap.set(`${c.r},${c.c}`, c));

    // シフターを探す
    const shifter = stage6.cells.find((c) => c.role === 'SHIFTER')!;
    expect(shifter).toBeDefined();

    // シフター以降（MATCH_COLOR_SHAPE区間）の近接通常セルを調べる
    const deltas = [[0, 1], [1, 0], [0, -1], [-1, 0]];
    let nearMissCount = 0;

    for (const [dr, dc] of deltas) {
      const nr = shifter.r + dr;
      const nc = shifter.c + dc;
      const neighbor = cellMap.get(`${nr},${nc}`);
      if (neighbor && neighbor.role === 'NORMAL') {
        const colorMatches = neighbor.color === shifter.color;
        const shapeMatches = neighbor.shape === shifter.shape;
        // 近接ダミーは両方一致（正解）ではなく、片方のみ一致しているか
        if ((colorMatches && !shapeMatches) || (!colorMatches && shapeMatches)) {
          nearMissCount++;
        }
      }
    }

    // 少なくとも1つは「片方のみ一致」の近接干渉セルが存在する
    expect(nearMissCount).toBeGreaterThan(0);
  });

  it('Stage 4 の正解パスに3歩以上の長い直線（4マス直線）が存在しないこと', () => {
    const stage4 = PRESET_STAGES.find((s) => s.id === 4)!;
    const cMap = new Map<string, Cell>();
    stage4.cells.forEach(c => cMap.set(`${c.r},${c.c}`, c));
    const sCell = stage4.cells.find(c => c.role === 'START')!;
    let foundPath: Cell[] | null = null;
    const curP: Cell[] = [sCell];
    let cRule = stage4.initialRule;
    let shC = 0;

    function solve(curr: Cell): boolean {
      if (curr.r === stage4.goal.r && curr.c === stage4.goal.c) {
        foundPath = [...curP];
        return true;
      }
      const deltas = [[0, 1], [1, 0], [0, -1], [-1, 0]];
      for (const [dr, dc] of deltas) {
        const nr = curr.r + dr;
        const nc = curr.c + dc;
        const next = cMap.get(`${nr},${nc}`);
        if (!next || curP.some(p => p.r === next.r && p.c === next.c)) continue;
        if (validateConnection(curr, next, cRule)) {
          curP.push(next);
          const pRule = cRule;
          const pSh = shC;
          if (next.role === 'SHIFTER') {
            shC++;
            const shift = stage4.shiftRules?.find(sr => sr.atShifterIndex === shC);
            if (shift) cRule = shift.toRule;
          }
          if (solve(next)) return true;
          curP.pop();
          cRule = pRule;
          shC = pSh;
        }
      }
      return false;
    }
    solve(sCell);

    expect(foundPath).toBeDefined();
    const fp: Cell[] = foundPath!;
    let mStr = 1;
    let curStr = 1;
    let lDr = 0;
    let lDc = 0;
    for (let i = 1; i < fp.length; i++) {
      const dr = fp[i].r - fp[i - 1].r;
      const dc = fp[i].c - fp[i - 1].c;
      if (dr === lDr && dc === lDc) {
        curStr++;
        if (curStr > mStr) mStr = curStr;
      } else {
        curStr = 1;
        lDr = dr;
        lDc = dc;
      }
    }

    // 正解ルートの連続直線は最大2歩（セル3つ）以内！
    expect(mStr).toBeLessThanOrEqual(2);
    // パス長も迷宮として十分な長さ（15歩以上）
    expect(fp.length).toBeGreaterThanOrEqual(15);
  });

  it('全ステージ（Stage 1〜8）で4セル以上の直線（3歩以上の直進）が存在しないこと', () => {
    PRESET_STAGES.forEach((stage) => {
      const solPath = getStageSolutionPath(stage);
      expect(solPath).toBeDefined();
      const maxStraight = getMaxStraightSteps(solPath!);
      console.log(`Stage ${stage.id} maxStraight = ${maxStraight}, len = ${solPath!.length}`);
      expect(maxStraight).toBeLessThanOrEqual(2);
    });
  });

  it('全ステージ（Stage 1〜8）およびデイリーチャレンジの解が厳密に1つ（唯一解）であること', () => {
    // プリセット全ステージ
    PRESET_STAGES.forEach((stage) => {
      const solutionsCount = countStageSolutions(stage, 2);
      expect(solutionsCount).toBe(1);
    });

    // デイリーチャレンジ（複数日分サンプリング）
    const testDates = ['20261028', '20261029', '20261030', '20261031', '20261101'];
    testDates.forEach((dateKey) => {
      const dailyStage = generateDailyStage(dateKey);
      const solutionsCount = countStageSolutions(dailyStage, 2);
      expect(solutionsCount).toBe(1);
    });
  });
});
