import {
  Cell,
  ColorId,
  CountId,
  DimensionType,
  RuleId,
  ShapeId,
  Stage,
  TextureId,
} from '@/types/game';
import {
  ALL_COLORS,
  ALL_SHAPES,
  ALL_COUNTS,
  ALL_TEXTURES,
} from './constants';
import { createPRNG, hashStringToSeed } from './prng';
import { validateConnection } from './ruleEngine';

interface GenerateStageOptions {
  id: number;
  title: string;
  size: number;
  description: string;
  seed: number | string;
  rules: RuleId[];
  shiftType?: 'SHIFTER_NODE' | 'STEP_COUNT';
  minPathLength?: number;
}

/**
 * 4次元トークン自動パズル生成エンジン
 * 【唯一解保証】正解ルートが厳密に1つだけ存在するステージを生成
 */
export function generateStage(options: GenerateStageOptions): Stage {
  const baseNumSeed =
    typeof options.seed === 'string' ? hashStringToSeed(options.seed) : options.seed;

  // 正解ルートが厳密に1つ（Unique Solution）かつ、長い直線（4セル以上）が存在しないステージを自動選定
  for (let attempt = 0; attempt < 50; attempt++) {
    const attemptSeed = baseNumSeed + attempt * 7919;
    const stage = generateSingleStage(options, attemptSeed);
    const solCount = countStageSolutions(stage, 2);

    if (solCount === 1) {
      const solPath = getStageSolutionPath(stage);
      if (solPath) {
        const maxStraight = getMaxStraightSteps(solPath);
        // 最大直進は2歩（3セル）以内！4セル以上の直線（maxStraight >= 3）は排除
        if (maxStraight <= 2) {
          return stage;
        }
      }
    }
  }

  // フォールバック（万が一のセーフティ）
  return generateSingleStage(options, baseNumSeed);
}

function generateSingleStage(
  options: GenerateStageOptions,
  numSeed: number
): Stage {
  const {
    id,
    title,
    size,
    description,
    rules,
    shiftType = 'SHIFTER_NODE',
    minPathLength,
  } = options;

  const rand = createPRNG(numSeed);

  const startCoord = { r: 0, c: 0 };
  const goalCoord = { r: size - 1, c: size - 1 };

  // 1. 基準パス生成（深さ優先探索 / ランダムウォーク）
  const targetMinLength = minPathLength || Math.floor(size * 1.8);
  const path = findRandomPath(size, startCoord, goalCoord, targetMinLength, rand);

  // 2. セグメント分割と相転移設定
  const numRules = rules.length;
  const shiftRules: { atStep?: number; atShifterIndex?: number; toRule: RuleId }[] = [];
  const shifterIndices: number[] = [];

  if (numRules > 1) {
    const segmentLength = Math.floor(path.length / numRules);
    for (let i = 1; i < numRules; i++) {
      const shiftStep = i * segmentLength;
      if (shiftType === 'SHIFTER_NODE') {
        shifterIndices.push(shiftStep);
        shiftRules.push({
          atShifterIndex: i,
          toRule: rules[i],
        });
      } else {
        // ステップ数によるサイレント転移
        shiftRules.push({
          atStep: shiftStep,
          toRule: rules[i],
        });
      }
    }
  }

  // 3. パスセルへの属性割り当て（各セグメントのルールを満たす）
  const cellsMap = new Map<string, Cell>();
  // 各パスセルから次のセルへ移動する際に有効だったルールを記録
  const ruleFromPathCell = new Map<string, RuleId>();

  // 始点トークン
  const initialColor = pickRandom(ALL_COLORS, rand);
  const initialShape = pickRandom(ALL_SHAPES, rand);
  const initialCount = pickRandom(ALL_COUNTS, rand);
  const initialTexture = pickRandom(ALL_TEXTURES, rand);

  cellsMap.set(`0,0`, {
    r: 0,
    c: 0,
    role: 'START',
    color: initialColor,
    shape: initialShape,
    count: initialCount,
    texture: initialTexture,
  });

  let currentActiveRule = rules[0];
  let shifterCount = 0;
  let stepInSegment = 0;

  for (let i = 1; i < path.length; i++) {
    const prevCoord = path[i - 1];
    const currCoord = path[i];
    const prevCell = cellsMap.get(`${prevCoord.r},${prevCoord.c}`)!;

    ruleFromPathCell.set(`${prevCoord.r},${prevCoord.c}`, currentActiveRule);

    const isGoal = i === path.length - 1;
    const isShifter = shifterIndices.includes(i);
    stepInSegment++;

    // ★重要: シフターマス自身は、直前のルール（旧ルール）を満たすセルとして到達可能にする！
    const nextCell = generateNextValidCell(
      prevCell,
      currentActiveRule,
      currCoord.r,
      currCoord.c,
      isGoal ? 'GOAL' : isShifter ? 'SHIFTER' : 'NORMAL',
      rand,
      stepInSegment
    );

    cellsMap.set(`${currCoord.r},${currCoord.c}`, nextCell);

    // ★重要: シフターマスを配置したら、ここから次の一歩（i+1）のためのルールを新ルールへと更新！
    if (isShifter) {
      const oldRule = currentActiveRule;
      shifterCount++;
      currentActiveRule = rules[shifterCount] || currentActiveRule;
      ruleFromPathCell.set(`${currCoord.r},${currCoord.c}`, currentActiveRule);
      stepInSegment = 0; // 新セグメント開始

      // ★保続トラップ（Perseveration Trap）の論理的配置:
      // シフターの周囲の空きセルに「旧ルールを満たすが、新ルールは満たさない」ダミーマスを1つ仕込む
      const deltas = [[0, 1], [1, 0], [0, -1], [-1, 0]];
      for (const [dr, dc] of deltas) {
        const tr = currCoord.r + dr;
        const tc = currCoord.c + dc;
        if (tr >= 0 && tr < size && tc >= 0 && tc < size) {
          const key = `${tr},${tc}`;
          if (!cellsMap.has(key)) {
            // 旧ルールを満たすセルを生成
            const trapCell = generateNextValidCell(
              nextCell,
              oldRule,
              tr,
              tc,
              'NORMAL',
              rand,
              2 // 曖昧化なし
            );
            cellsMap.set(key, trapCell);
            break; // 1箇所のみ配置
          }
        }
      }
    } else if (shiftType === 'STEP_COUNT') {
      const matchShift = shiftRules.find((sr) => sr.atStep === i);
      if (matchShift) {
        currentActiveRule = matchShift.toRule;
        stepInSegment = 0;
      }
    }
  }

  // 4. 巧みな偽分岐（欺瞞ルート）の生成は、バイパス（意図しない直線ショートカット）の温床になるため、
  // パス自体が十分に蛇行し、空きセルがNear-Missトラップとして機能するようにシンプル化

  // 5. 空きセルの高度充填:
  // (A) パスセルに隣接するマスは近接干渉（Near-Miss Distractor: 片方一致で誘惑するがルール違反で進入不可）
  // (B) さらに、空きセル同士が連鎖して裏の直線ショートカット道路を形成しないよう、
  //     ステージで使用される有効ルールによる接続を厳密に遮断・ブロックする！
  const deltas = [[0, 1], [1, 0], [0, -1], [-1, 0]];

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const key = `${r},${c}`;
      if (cellsMap.has(key)) continue;

      // 隣接する既存セルを収集
      const neighborCells: Cell[] = [];
      const adjacentPathEntries: Array<{ cell: Cell; rule: RuleId }> = [];

      for (const [dr, dc] of deltas) {
        const nr = r + dr;
        const nc = c + dc;
        const pKey = `${nr},${nc}`;
        if (cellsMap.has(pKey)) {
          const adjCell = cellsMap.get(pKey)!;
          neighborCells.push(adjCell);
          const pRule = ruleFromPathCell.get(pKey);
          if (pRule) {
            adjacentPathEntries.push({ cell: adjCell, rule: pRule });
          }
        }
      }

      let chosenCell: Cell | null = null;

      // 候補探索: 裏道ショートカットを絶対に作らないセルを選ぶ
      for (let attempt = 0; attempt < 30; attempt++) {
        let candidate: Cell;
        if (adjacentPathEntries.length > 0) {
          candidate = generateNearMissDistractor(r, c, adjacentPathEntries, rand);
        } else {
          candidate = {
            r,
            c,
            role: 'NORMAL',
            color: pickRandom(ALL_COLORS, rand),
            shape: pickRandom(ALL_SHAPES, rand),
            count: pickRandom(ALL_COUNTS, rand),
            texture: pickRandom(ALL_TEXTURES, rand),
          };
        }

        // 検証: 隣接する非パスセル（既に置かれた空きセル）と、このステージのルールで繋がってはいけない
        const createsShortcutWithEmpty = neighborCells.some((neighbor) => {
          // neighbor がパスセルでない場合、どんなルールでも繋がってはならない
          const isNeighborPath = ruleFromPathCell.has(`${neighbor.r},${neighbor.c}`);
          if (!isNeighborPath) {
            return rules.some((ruleId) => validateConnection(neighbor, candidate, ruleId));
          }
          return false;
        });

        if (!createsShortcutWithEmpty) {
          chosenCell = candidate;
          break;
        }
      }

      if (!chosenCell) {
        const fallbackPrev = neighborCells[0] || cellsMap.get('0,0')!;
        chosenCell = {
          r,
          c,
          role: 'NORMAL',
          color: pickDifferent(ALL_COLORS, fallbackPrev.color, rand),
          shape: pickDifferent(ALL_SHAPES, fallbackPrev.shape, rand),
          count: pickDifferent(ALL_COUNTS, fallbackPrev.count, rand),
          texture: pickDifferent(ALL_TEXTURES, fallbackPrev.texture, rand),
        };
      }

      cellsMap.set(key, chosenCell);
    }
  }

  const allCells: Cell[] = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      allCells.push(cellsMap.get(`${r},${c}`)!);
    }
  }

  return {
    id,
    title,
    size,
    isScrollable: size >= 5,
    viewportSize: 4,
    description,
    start: startCoord,
    goal: goalCoord,
    initialRule: rules[0],
    cells: allCells,
    shiftRules: shiftRules.length > 0 ? shiftRules : undefined,
  };
}

/**
 * 前のセルの属性と現在ルールを満たしつつ、他の属性を最大干渉（ランダム変化）させたセルを生成
 * stepInSegment === 1 の時は意図的に「もう1つの属性」を一致させ、仮説を2択に絞る（アブダクションの論理的深度）
 */
function generateNextValidCell(
  prev: Cell,
  rule: RuleId,
  r: number,
  c: number,
  role: Cell['role'],
  rand: () => number,
  stepInSegment: number = 2
): Cell {
  let color = pickRandom(ALL_COLORS, rand);
  let shape = pickRandom(ALL_SHAPES, rand);
  let count = pickRandom(ALL_COUNTS, rand);
  let texture = pickRandom(ALL_TEXTURES, rand);

  const isFirstStep = stepInSegment === 1;

  switch (rule) {
    case 'MATCH_COLOR':
      color = prev.color;
      // 1歩目は形も一致させて「色か形か？」の2択アブダクションを促す
      shape = isFirstStep ? prev.shape : pickDifferent(ALL_SHAPES, prev.shape, rand);
      count = pickDifferent(ALL_COUNTS, prev.count, rand);
      texture = pickDifferent(ALL_TEXTURES, prev.texture, rand);
      break;

    case 'MATCH_SHAPE':
      shape = prev.shape;
      // 1歩目は色も一致させて2択アブダクション
      color = isFirstStep ? prev.color : pickDifferent(ALL_COLORS, prev.color, rand);
      count = pickDifferent(ALL_COUNTS, prev.count, rand);
      texture = pickDifferent(ALL_TEXTURES, prev.texture, rand);
      break;

    case 'MATCH_COUNT':
      count = prev.count;
      // 1歩目は模様も一致させて2択アブダクション
      texture = isFirstStep ? prev.texture : pickDifferent(ALL_TEXTURES, prev.texture, rand);
      color = pickDifferent(ALL_COLORS, prev.color, rand);
      shape = pickDifferent(ALL_SHAPES, prev.shape, rand);
      break;

    case 'MATCH_TEXTURE':
      texture = prev.texture;
      // 1歩目は個数も一致させて2択アブダクション
      count = isFirstStep ? prev.count : pickDifferent(ALL_COUNTS, prev.count, rand);
      color = pickDifferent(ALL_COLORS, prev.color, rand);
      shape = pickDifferent(ALL_SHAPES, prev.shape, rand);
      break;

    // === 複数属性同時一致（複合マッチ） ===
    case 'MATCH_COLOR_SHAPE':
      color = prev.color;
      shape = prev.shape;
      count = pickDifferent(ALL_COUNTS, prev.count, rand);
      texture = pickDifferent(ALL_TEXTURES, prev.texture, rand);
      break;

    case 'MATCH_COLOR_COUNT':
      color = prev.color;
      count = prev.count;
      shape = pickDifferent(ALL_SHAPES, prev.shape, rand);
      texture = pickDifferent(ALL_TEXTURES, prev.texture, rand);
      break;

    case 'MATCH_COLOR_TEXTURE':
      color = prev.color;
      texture = prev.texture;
      shape = pickDifferent(ALL_SHAPES, prev.shape, rand);
      count = pickDifferent(ALL_COUNTS, prev.count, rand);
      break;

    case 'MATCH_SHAPE_COUNT':
      shape = prev.shape;
      count = prev.count;
      color = pickDifferent(ALL_COLORS, prev.color, rand);
      texture = pickDifferent(ALL_TEXTURES, prev.texture, rand);
      break;

    case 'MATCH_SHAPE_TEXTURE':
      shape = prev.shape;
      texture = prev.texture;
      color = pickDifferent(ALL_COLORS, prev.color, rand);
      count = pickDifferent(ALL_COUNTS, prev.count, rand);
      break;

    case 'MATCH_COUNT_TEXTURE':
      count = prev.count;
      texture = prev.texture;
      color = pickDifferent(ALL_COLORS, prev.color, rand);
      shape = pickDifferent(ALL_SHAPES, prev.shape, rand);
      break;

    case 'DELTA_COUNT': {
      const deltas = [-1, 1].filter(
        (d) => prev.count + d >= 1 && prev.count + d <= 4
      );
      const chosenDelta = pickRandom(deltas, rand);
      count = (prev.count + chosenDelta) as CountId;
      color = pickDifferent(ALL_COLORS, prev.color, rand);
      shape = pickDifferent(ALL_SHAPES, prev.shape, rand);
      texture = pickDifferent(ALL_TEXTURES, prev.texture, rand);
      break;
    }

    case 'ALL_DIFF':
      color = pickDifferent(ALL_COLORS, prev.color, rand);
      shape = pickDifferent(ALL_SHAPES, prev.shape, rand);
      count = pickDifferent(ALL_COUNTS, prev.count, rand);
      texture = pickDifferent(ALL_TEXTURES, prev.texture, rand);
      break;
  }

  return { r, c, role, color, shape, count, texture };
}

function pickRandom<T>(arr: T[], rand: () => number): T {
  return arr[Math.floor(rand() * arr.length)];
}

function pickDifferent<T>(arr: T[], current: T, rand: () => number): T {
  const filtered = arr.filter((x) => x !== current);
  if (filtered.length === 0) return current;
  return filtered[Math.floor(rand() * filtered.length)];
}

function getTwoDimensionKeys(rule: RuleId): [DimensionType, DimensionType] | null {
  switch (rule) {
    case 'MATCH_COLOR_SHAPE': return ['color', 'shape'];
    case 'MATCH_COLOR_COUNT': return ['color', 'count'];
    case 'MATCH_COLOR_TEXTURE': return ['color', 'texture'];
    case 'MATCH_SHAPE_COUNT': return ['shape', 'count'];
    case 'MATCH_SHAPE_TEXTURE': return ['shape', 'texture'];
    case 'MATCH_COUNT_TEXTURE': return ['count', 'texture'];
    default: return null;
  }
}

/**
 * パス隣接マス用の近接干渉セル（Near-Miss Distractor）を生成
 * 【重要】2要素一致ルールの場合は「片方の要素だけ一致させ、もう片方は不一致」にして
 * 1要素の確認だけでは見破れない高難度な誘惑マスを構築する
 */
function generateNearMissDistractor(
  r: number,
  c: number,
  adjacentPathEntries: Array<{ cell: Cell; rule: RuleId }>,
  rand: () => number
): Cell {
  const primary = adjacentPathEntries[0];
  const { cell: prev, rule } = primary;
  const twoDims = getTwoDimensionKeys(rule);

  for (let attempt = 0; attempt < 20; attempt++) {
    let color = pickRandom(ALL_COLORS, rand);
    let shape = pickRandom(ALL_SHAPES, rand);
    let count = pickRandom(ALL_COUNTS, rand);
    let texture = pickRandom(ALL_TEXTURES, rand);

    if (twoDims) {
      const [dimA, dimB] = twoDims;
      // 2要素ルールの核心: 片方の一致 ＆ もう片方の不一致
      const matchFirst = rand() < 0.5;
      if (matchFirst) {
        // dimAを一致、dimBを不一致
        if (dimA === 'color') color = prev.color;
        if (dimA === 'shape') shape = prev.shape;
        if (dimA === 'count') count = prev.count;
        if (dimA === 'texture') texture = prev.texture;

        if (dimB === 'color') color = pickDifferent(ALL_COLORS, prev.color, rand);
        if (dimB === 'shape') shape = pickDifferent(ALL_SHAPES, prev.shape, rand);
        if (dimB === 'count') count = pickDifferent(ALL_COUNTS, prev.count, rand);
        if (dimB === 'texture') texture = pickDifferent(ALL_TEXTURES, prev.texture, rand);
      } else {
        // dimBを一致、dimAを不一致
        if (dimB === 'color') color = prev.color;
        if (dimB === 'shape') shape = prev.shape;
        if (dimB === 'count') count = prev.count;
        if (dimB === 'texture') texture = prev.texture;

        if (dimA === 'color') color = pickDifferent(ALL_COLORS, prev.color, rand);
        if (dimA === 'shape') shape = pickDifferent(ALL_SHAPES, prev.shape, rand);
        if (dimA === 'count') count = pickDifferent(ALL_COUNTS, prev.count, rand);
        if (dimA === 'texture') texture = pickDifferent(ALL_TEXTURES, prev.texture, rand);
      }
    } else {
      // 単一要素ルール（例: MATCH_COLOR）
      // ルール属性は不一致にし、他の関係ない属性（形や数など）を一致させて誘惑する
      switch (rule) {
        case 'MATCH_COLOR':
          color = pickDifferent(ALL_COLORS, prev.color, rand);
          if (rand() < 0.6) shape = prev.shape;
          break;
        case 'MATCH_SHAPE':
          shape = pickDifferent(ALL_SHAPES, prev.shape, rand);
          if (rand() < 0.6) color = prev.color;
          break;
        case 'MATCH_COUNT':
          count = pickDifferent(ALL_COUNTS, prev.count, rand);
          if (rand() < 0.6) texture = prev.texture;
          break;
        case 'MATCH_TEXTURE':
          texture = pickDifferent(ALL_TEXTURES, prev.texture, rand);
          if (rand() < 0.6) count = prev.count;
          break;
      }
    }

    const candidate: Cell = { r, c, role: 'NORMAL', color, shape, count, texture };

    // 安全性検証: 隣接するどのパスセルからも、その時点のルールで到達可能になってはいけない（近道・別解防止）
    const createsIllegalShortcut = adjacentPathEntries.some((entry) =>
      validateConnection(entry.cell, candidate, entry.rule)
    );

    if (!createsIllegalShortcut) {
      return candidate;
    }
  }

  // フォールバック: 全属性異なる安全なセル
  return {
    r,
    c,
    role: 'NORMAL',
    color: pickDifferent(ALL_COLORS, prev.color, rand),
    shape: pickDifferent(ALL_SHAPES, prev.shape, rand),
    count: pickDifferent(ALL_COUNTS, prev.count, rand),
    texture: pickDifferent(ALL_TEXTURES, prev.texture, rand),
  };
}

/**
 * 自己交差しないランダムパスを深さ優先探索
 * 長い直線（3マス以上の連続直進）を抑制し、ジグザグ・屈曲を優先して迷宮らしい蛇行経路を生成
 */
function findRandomPath(
  size: number,
  start: { r: number; c: number },
  goal: { r: number; c: number },
  minLen: number,
  rand: () => number
): Array<{ r: number; c: number }> {
  const dirs = [
    { dr: -1, dc: 0 },
    { dr: 1, dc: 0 },
    { dr: 0, dc: -1 },
    { dr: 0, dc: 1 },
  ];

  const visited = new Set<string>();
  const path: Array<{ r: number; c: number }> = [];
  let searchSteps = 0;
  const MAX_STEPS = 20000;

  function dfs(
    curr: { r: number; c: number },
    lastDir: { dr: number; dc: number } | null,
    consecutiveStraight: number
  ): boolean {
    searchSteps++;
    if (searchSteps > MAX_STEPS) return false;

    path.push(curr);
    visited.add(`${curr.r},${curr.c}`);

    if (curr.r === goal.r && curr.c === goal.c) {
      if (path.length >= minLen) return true;
      path.pop();
      visited.delete(`${curr.r},${curr.c}`);
      return false;
    }

    // 方向の選択順序（長い直線を抑制し、ジグザグ・屈曲を優先）
    let candidateDirs: Array<{ dr: number; dc: number }>;

    if (!lastDir) {
      candidateDirs = [...dirs].sort(() => rand() - 0.5);
    } else {
      // 垂直方向（直角に曲がる候補）
      const perpDirs = dirs
        .filter((d) => (lastDir.dr === 0 ? d.dr !== 0 : d.dc !== 0))
        .sort(() => rand() - 0.5);

      // 直進方向
      const straightDir = dirs.filter(
        (d) => d.dr === lastDir.dr && d.dc === lastDir.dc
      );

      if (consecutiveStraight >= 2) {
        // 2歩直進（セル3個連続）したら次は絶対に曲がる！直進は候補から完全に除外！
        // これにより「4セル直線（3歩直進）」は物理的に100%発生不可能
        candidateDirs = perpDirs;
      } else {
        // 1歩進んだ後も、85%の確率で曲がることを優先
        if (rand() < 0.85) {
          candidateDirs = [...perpDirs, ...straightDir];
        } else {
          candidateDirs = [...straightDir, ...perpDirs];
        }
      }
    }

    for (const dir of candidateDirs) {
      const nr = curr.r + dir.dr;
      const nc = curr.c + dir.dc;

      if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
        if (!visited.has(`${nr},${nc}`)) {
          // 自己隣接（ショートカット・直線バイパスを生む過去パスとの密着）を防止
          let adjacentVisitedCount = 0;
          for (const d of dirs) {
            if (visited.has(`${nr + d.dr},${nc + d.dc}`)) {
              adjacentVisitedCount++;
            }
          }
          // 現在地 (curr) 以外の visited セルと接触してはならない（ゴールマス到達時を除く）
          const isGoal = nr === goal.r && nc === goal.c;
          if (!isGoal && adjacentVisitedCount > 1) {
            continue;
          }

          const isSameDir =
            lastDir !== null &&
            lastDir.dr === dir.dr &&
            lastDir.dc === dir.dc;
          const nextConsecutive = isSameDir ? consecutiveStraight + 1 : 1;

          if (dfs({ r: nr, c: nc }, dir, nextConsecutive)) return true;
        }
      }
    }

    path.pop();
    visited.delete(`${curr.r},${curr.c}`);
    return false;
  }

  let len = minLen;
  while (len >= size) {
    visited.clear();
    path.length = 0;
    searchSteps = 0;
    if (dfs(start, null, 0)) {
      return path;
    }
    len -= 2;
  }

  // フォールバック（蛇行付きの階段パス）
  const simplePath: Array<{ r: number; c: number }> = [{ ...start }];
  let cr = start.r;
  let cc = start.c;
  while (cr < goal.r || cc < goal.c) {
    if (cr < goal.r && (cc === goal.c || rand() > 0.5)) {
      cr++;
    } else if (cc < goal.c) {
      cc++;
    } else {
      cr++;
    }
    simplePath.push({ r: cr, c: cc });
  }
  return simplePath;
}

/**
 * ステージの正解ルートの個数を高速カウントするソルバー
 * maxLimit（デフォルト2）個見つかった時点で早期リターン
 */
export function countStageSolutions(stage: Stage, maxLimit = 2): number {
  const cMap = new Map<string, Cell>();
  stage.cells.forEach((c) => cMap.set(`${c.r},${c.c}`, c));
  const startCell = stage.cells.find(
    (c) => c.r === stage.start.r && c.c === stage.start.c
  );
  if (!startCell) return 0;

  let solutionCount = 0;
  const path: Cell[] = [startCell];
  const visited = new Set<string>([`${startCell.r},${startCell.c}`]);

  const deltas = [
    [0, 1],
    [1, 0],
    [0, -1],
    [-1, 0],
  ];

  function dfs(curr: Cell, cRule: RuleId, shCount: number) {
    if (curr.r === stage.goal.r && curr.c === stage.goal.c) {
      solutionCount++;
      return;
    }
    if (solutionCount >= maxLimit) return;

    for (const [dr, dc] of deltas) {
      const nr = curr.r + dr;
      const nc = curr.c + dc;
      const key = `${nr},${nc}`;
      if (visited.has(key)) continue;

      const next = cMap.get(key);
      if (!next) continue;

      if (validateConnection(curr, next, cRule)) {
        visited.add(key);
        path.push(next);

        let nextRule = cRule;
        let nextSh = shCount;
        if (next.role === 'SHIFTER') {
          nextSh++;
          const shift = stage.shiftRules?.find((sr) => sr.atShifterIndex === nextSh);
          if (shift) nextRule = shift.toRule;
        } else if (stage.shiftRules) {
          const stepShift = stage.shiftRules.find((sr) => sr.atStep === path.length - 1);
          if (stepShift) nextRule = stepShift.toRule;
        }

        dfs(next, nextRule, nextSh);

        path.pop();
        visited.delete(key);

        if (solutionCount >= maxLimit) return;
      }
    }
  }

  dfs(startCell, stage.initialRule, 0);
  return solutionCount;
}

/**
 * ステージの正解ルートのセル配列を探索して返す
 */
export function getStageSolutionPath(stage: Stage): Cell[] | null {
  const cMap = new Map<string, Cell>();
  stage.cells.forEach((c) => cMap.set(`${c.r},${c.c}`, c));
  const startCell = stage.cells.find(
    (c) => c.r === stage.start.r && c.c === stage.start.c
  );
  if (!startCell) return null;

  const path: Cell[] = [startCell];
  const visited = new Set<string>([`${startCell.r},${startCell.c}`]);

  const deltas = [
    [0, 1],
    [1, 0],
    [0, -1],
    [-1, 0],
  ];

  function dfs(curr: Cell, cRule: RuleId, shCount: number): Cell[] | null {
    if (curr.r === stage.goal.r && curr.c === stage.goal.c) {
      return [...path];
    }

    for (const [dr, dc] of deltas) {
      const nr = curr.r + dr;
      const nc = curr.c + dc;
      const key = `${nr},${nc}`;
      if (visited.has(key)) continue;

      const next = cMap.get(key);
      if (!next) continue;

      if (validateConnection(curr, next, cRule)) {
        visited.add(key);
        path.push(next);

        let nextRule = cRule;
        let nextSh = shCount;
        if (next.role === 'SHIFTER') {
          nextSh++;
          const shift = stage.shiftRules?.find((sr) => sr.atShifterIndex === nextSh);
          if (shift) nextRule = shift.toRule;
        } else if (stage.shiftRules) {
          const stepShift = stage.shiftRules.find((sr) => sr.atStep === path.length - 1);
          if (stepShift) nextRule = stepShift.toRule;
        }

        const res = dfs(next, nextRule, nextSh);
        if (res) return res;

        path.pop();
        visited.delete(key);
      }
    }
    return null;
  }

  return dfs(startCell, stage.initialRule, 0);
}

/**
 * 正解パス内の最大連続直進ステップ数を計算
 * 例: 1歩直進=1 (2セル), 2歩直進=2 (3セル), 3歩直進=3 (4セル)
 */
export function getMaxStraightSteps(path: Cell[]): number {
  let maxStraight = 1;
  let currentStraight = 1;
  let lastDr = 0;
  let lastDc = 0;
  for (let i = 1; i < path.length; i++) {
    const dr = path[i].r - path[i - 1].r;
    const dc = path[i].c - path[i - 1].c;
    if (dr === lastDr && dc === lastDc) {
      currentStraight++;
      if (currentStraight > maxStraight) maxStraight = currentStraight;
    } else {
      currentStraight = 1;
      lastDr = dr;
      lastDc = dc;
    }
  }
  return maxStraight;
}
