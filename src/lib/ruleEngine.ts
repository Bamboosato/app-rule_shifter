import { AttributeTuple, Cell, DimensionType, RuleId } from '@/types/game';

/**
 * マンハッタン距離が1（上下左右に直交隣接）かどうか判定
 */
export function isAdjacent(a: { r: number; c: number }, b: { r: number; c: number }): boolean {
  const dr = Math.abs(a.r - b.r);
  const dc = Math.abs(a.c - b.c);
  return (dr === 1 && dc === 0) || (dr === 0 && dc === 1);
}

/**
 * 2つのセル属性が指定ルールを満たしているか検証
 */
export function validateConnection(
  prev: AttributeTuple,
  target: AttributeTuple,
  rule: RuleId
): boolean {
  switch (rule) {
    case 'MATCH_COLOR':
      return prev.color === target.color;

    case 'MATCH_SHAPE':
      return prev.shape === target.shape;

    case 'MATCH_COUNT':
      return prev.count === target.count;

    case 'MATCH_TEXTURE':
      return prev.texture === target.texture;

    case 'MATCH_COLOR_SHAPE':
      return prev.color === target.color && prev.shape === target.shape;

    case 'MATCH_COLOR_COUNT':
      return prev.color === target.color && prev.count === target.count;

    case 'MATCH_COLOR_TEXTURE':
      return prev.color === target.color && prev.texture === target.texture;

    case 'MATCH_SHAPE_COUNT':
      return prev.shape === target.shape && prev.count === target.count;

    case 'MATCH_SHAPE_TEXTURE':
      return prev.shape === target.shape && prev.texture === target.texture;

    case 'MATCH_COUNT_TEXTURE':
      return prev.count === target.count && prev.texture === target.texture;

    case 'DELTA_COUNT':
      return Math.abs(prev.count - target.count) === 1;

    case 'ALL_DIFF':
      return (
        prev.color !== target.color &&
        prev.shape !== target.shape &&
        prev.count !== target.count &&
        prev.texture !== target.texture
      );

    default:
      return false;
  }
}

/**
 * 保続エラー（Perseverative Error）判定:
 * 「相転移後の直前の旧ルールを満たしているが、現在の新ルールには適合しないマス」を選択してRejectされた場合
 */
export function isPerseverativeError(
  prev: AttributeTuple,
  target: AttributeTuple,
  previousRule: RuleId | undefined,
  activeRule: RuleId
): boolean {
  if (!previousRule) return false;
  // 新ルールでPassならエラーではない
  if (validateConnection(prev, target, activeRule)) return false;
  // 旧ルールに適合しているなら、過去の成功体験に固執した「保続エラー」
  return validateConnection(prev, target, previousRule);
}

/**
 * 初心者アシスト用: Rejectされたターゲットセルと直前セルで一致していた属性を取得
 * （＝現在のルールではあり得ないため棄却候補となる属性）
 */
export function getEliminatedAttributes(
  prev: AttributeTuple,
  rejected: AttributeTuple
): DimensionType[] {
  const eliminated: DimensionType[] = [];
  if (prev.color === rejected.color) eliminated.push('color');
  if (prev.shape === rejected.shape) eliminated.push('shape');
  if (prev.count === rejected.count) eliminated.push('count');
  if (prev.texture === rejected.texture) eliminated.push('texture');
  return eliminated;
}

/**
 * 現在の先端マスから次に合法的に進める隣接マス一覧を取得
 */
export function getValidNextMoves(
  tipCell: Cell,
  activeRule: RuleId,
  path: Cell[],
  allCells: Cell[]
): Cell[] {
  const visitedSet = new Set(path.map((c) => `${c.r},${c.c}`));

  return allCells.filter((cell) => {
    // 訪問済みは除外
    if (visitedSet.has(`${cell.r},${cell.c}`)) return false;
    // 上下左右に隣接していなければ除外
    if (!isAdjacent(tipCell, cell)) return false;
    // 現在の潜伏ルールを満たすか
    return validateConnection(tipCell, cell, activeRule);
  });
}

/**
 * 手詰まり（行き止まり）判定
 */
export function isDeadEndState(
  tipCell: Cell,
  activeRule: RuleId,
  path: Cell[],
  allCells: Cell[]
): boolean {
  const validMoves = getValidNextMoves(tipCell, activeRule, path, allCells);
  return validMoves.length === 0;
}

/**
 * Flexibility Index（認知的柔軟性スコア / 100点満点）計算
 */
export function calculateFlexibilityIndex(params: {
  perseverativeErrors: number;
  generalErrors: number;
  moveCount: number;
  minSteps: number;
}): number {
  const { perseverativeErrors, generalErrors, moveCount, minSteps } = params;
  const errorPenalty = perseverativeErrors * 15 + generalErrors * 3;
  const extraMoves = Math.max(0, moveCount - minSteps);
  const stepPenalty = extraMoves * 2;

  const score = 100 - errorPenalty - stepPenalty;
  return Math.max(0, Math.min(100, score));
}

/**
 * ルールIDに対応する正解属性（次元）の配列を返す
 */
export function getActiveDimensionsForRule(rule: RuleId): DimensionType[] {
  switch (rule) {
    case 'MATCH_COLOR':
      return ['color'];
    case 'MATCH_SHAPE':
      return ['shape'];
    case 'MATCH_COUNT':
    case 'DELTA_COUNT':
      return ['count'];
    case 'MATCH_TEXTURE':
      return ['texture'];
    case 'MATCH_COLOR_SHAPE':
      return ['color', 'shape'];
    case 'MATCH_COLOR_COUNT':
      return ['color', 'count'];
    case 'MATCH_COLOR_TEXTURE':
      return ['color', 'texture'];
    case 'MATCH_SHAPE_COUNT':
      return ['shape', 'count'];
    case 'MATCH_SHAPE_TEXTURE':
      return ['shape', 'texture'];
    case 'MATCH_COUNT_TEXTURE':
      return ['count', 'texture'];
    case 'ALL_DIFF':
      return ['color', 'shape', 'count', 'texture'];
    default:
      return [];
  }
}
