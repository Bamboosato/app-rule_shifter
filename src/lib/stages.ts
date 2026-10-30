import { Cell, Stage, RuleId } from '@/types/game';
import { generateStage } from './generator';

/**
 * プリセットステージ一覧 (Stage 1〜5)
 */
export const PRESET_STAGES: Stage[] = [
  // ==========================================
  // Stage 1: 入門 (単一規則推理)
  // 盤面: 4×4
  // ルール: MATCH_COLOR (色一致固定)
  // 始点(0,0) -> 終点(3,3)
  // ==========================================
  {
    id: 1,
    title: 'Stage 1: 単一規則推理 (色)',
    size: 4,
    isScrollable: false,
    viewportSize: 4,
    description: 'まずは潜伏規則の推理に慣れましょう。移動できるマスの共通点を探してください。',
    start: { r: 0, c: 0 },
    goal: { r: 3, c: 3 },
    initialRule: 'MATCH_COLOR',
    cells: [
      { r: 0, c: 0, role: 'START', color: 'CYAN', shape: 'CIRCLE', count: 1, texture: 'SOLID' },
      { r: 0, c: 1, role: 'NORMAL', color: 'CYAN', shape: 'SQUARE', count: 3, texture: 'STRIPE' },
      { r: 0, c: 2, role: 'NORMAL', color: 'AMBER', shape: 'CIRCLE', count: 2, texture: 'SOLID' },
      { r: 0, c: 3, role: 'NORMAL', color: 'MAGENTA', shape: 'TRIANGLE', count: 4, texture: 'DOTS' },
      { r: 1, c: 0, role: 'NORMAL', color: 'EMERALD', shape: 'DIAMOND', count: 1, texture: 'GRID' },
      { r: 1, c: 1, role: 'NORMAL', color: 'CYAN', shape: 'TRIANGLE', count: 2, texture: 'DOTS' },
      { r: 1, c: 2, role: 'NORMAL', color: 'CYAN', shape: 'DIAMOND', count: 4, texture: 'GRID' },
      { r: 1, c: 3, role: 'NORMAL', color: 'AMBER', shape: 'SQUARE', count: 1, texture: 'SOLID' },
      { r: 2, c: 0, role: 'NORMAL', color: 'MAGENTA', shape: 'CIRCLE', count: 3, texture: 'STRIPE' },
      { r: 2, c: 1, role: 'NORMAL', color: 'EMERALD', shape: 'SQUARE', count: 2, texture: 'DOTS' },
      { r: 2, c: 2, role: 'NORMAL', color: 'CYAN', shape: 'CIRCLE', count: 1, texture: 'STRIPE' },
      { r: 2, c: 3, role: 'NORMAL', color: 'CYAN', shape: 'SQUARE', count: 3, texture: 'SOLID' },
      { r: 3, c: 0, role: 'NORMAL', color: 'AMBER', shape: 'TRIANGLE', count: 4, texture: 'GRID' },
      { r: 3, c: 1, role: 'NORMAL', color: 'MAGENTA', shape: 'DIAMOND', count: 1, texture: 'SOLID' },
      { r: 3, c: 2, role: 'NORMAL', color: 'EMERALD', shape: 'CIRCLE', count: 2, texture: 'STRIPE' },
      { r: 3, c: 3, role: 'GOAL', color: 'CYAN', shape: 'DIAMOND', count: 2, texture: 'DOTS' },
    ],
  },

  // ==========================================
  // Stage 2: 初級 (形状へのシフト)
  // 盤面: 4×4
  // ルール: MATCH_COLOR -> MATCH_SHAPE
  // シフター: (1, 2)
  // ==========================================
  {
    id: 2,
    title: 'Stage 2: 形状へのシフト (転移)',
    size: 4,
    isScrollable: false,
    viewportSize: 4,
    description: '途中の渦巻きマスを踏むと次元が相転移します。古い成功体験を即座に破棄してください。',
    start: { r: 0, c: 0 },
    goal: { r: 3, c: 3 },
    initialRule: 'MATCH_COLOR',
    shiftRules: [{ atShifterIndex: 1, toRule: 'MATCH_SHAPE' }],
    cells: [
      { r: 0, c: 0, role: 'START', color: 'AMBER', shape: 'CIRCLE', count: 1, texture: 'SOLID' },
      { r: 0, c: 1, role: 'NORMAL', color: 'CYAN', shape: 'CIRCLE', count: 2, texture: 'DOTS' },
      { r: 0, c: 2, role: 'NORMAL', color: 'EMERALD', shape: 'TRIANGLE', count: 3, texture: 'STRIPE' },
      { r: 0, c: 3, role: 'NORMAL', color: 'MAGENTA', shape: 'SQUARE', count: 4, texture: 'GRID' },
      { r: 1, c: 0, role: 'NORMAL', color: 'AMBER', shape: 'SQUARE', count: 2, texture: 'STRIPE' },
      { r: 1, c: 1, role: 'NORMAL', color: 'AMBER', shape: 'TRIANGLE', count: 3, texture: 'DOTS' },
      { r: 1, c: 2, role: 'SHIFTER', color: 'AMBER', shape: 'DIAMOND', count: 4, texture: 'GRID' },
      { r: 1, c: 3, role: 'NORMAL', color: 'AMBER', shape: 'CIRCLE', count: 1, texture: 'SOLID' },
      { r: 2, c: 0, role: 'NORMAL', color: 'CYAN', shape: 'DIAMOND', count: 1, texture: 'SOLID' },
      { r: 2, c: 1, role: 'NORMAL', color: 'EMERALD', shape: 'CIRCLE', count: 4, texture: 'STRIPE' },
      { r: 2, c: 2, role: 'NORMAL', color: 'CYAN', shape: 'DIAMOND', count: 2, texture: 'SOLID' },
      { r: 2, c: 3, role: 'NORMAL', color: 'MAGENTA', shape: 'DIAMOND', count: 3, texture: 'STRIPE' },
      { r: 3, c: 0, role: 'NORMAL', color: 'MAGENTA', shape: 'TRIANGLE', count: 2, texture: 'DOTS' },
      { r: 3, c: 1, role: 'NORMAL', color: 'AMBER', shape: 'SQUARE', count: 3, texture: 'GRID' },
      { r: 3, c: 2, role: 'NORMAL', color: 'EMERALD', shape: 'SQUARE', count: 1, texture: 'DOTS' },
      { r: 3, c: 3, role: 'GOAL', color: 'EMERALD', shape: 'DIAMOND', count: 4, texture: 'GRID' },
    ],
  },

  // ==========================================
  // Stage 3: 中級 (個数と模様の交差)
  // 盤面: 5×5 (4×4ファインダー スライディング)
  // ルール: MATCH_COUNT -> MATCH_TEXTURE
  // ==========================================
  generateStage({
    id: 3,
    title: 'Stage 3: 個数と模様の交差',
    size: 5,
    description: '5×5の迷宮。個数一致からテクスチャ（模様）一致へと転移します。スワイプで視界を移動できます。',
    seed: 'rule_shifter_stage_3_fixed',
    rules: ['MATCH_COUNT', 'MATCH_TEXTURE'],
    shiftType: 'SHIFTER_NODE',
    minPathLength: 10,
  }),

  // ==========================================
  // Stage 4: 広大迷宮 (形状から色彩へ)
  // 盤面: 7×7 (4区画スワイプ)
  // ルール: MATCH_SHAPE -> MATCH_COLOR
  // ==========================================
  generateStage({
    id: 4,
    title: 'Stage 4: 広大迷宮 (形状から色彩へ)',
    size: 7,
    description: '7×7の広大迷宮。形状一致から渦巻きマスを経て色彩一致へと相転移します。',
    seed: 'rule_shifter_stage_4_fixed',
    rules: ['MATCH_SHAPE', 'MATCH_COLOR'],
    shiftType: 'SHIFTER_NODE',
    minPathLength: 16,
  }),

  // ==========================================
  // Stage 5: 超巨大メガ迷宮 (2段変異)
  // 盤面: 10×10 (9区画スワイプ)
  // ルール: MATCH_COLOR -> MATCH_COUNT -> MATCH_SHAPE (2回相転移)
  // ==========================================
  generateStage({
    id: 5,
    title: 'Stage 5: 超巨大メガ迷宮 (2段変異)',
    size: 10,
    description: '最大10×10のメガ迷宮。ルールが2段階に変異します。過去のルールへの固執を断ち切りましょう。',
    seed: 'rule_shifter_stage_5_fixed',
    rules: ['MATCH_COLOR', 'MATCH_COUNT', 'MATCH_SHAPE'],
    shiftType: 'SHIFTER_NODE',
    minPathLength: 26,
  }),

  // ==========================================
  // Stage 6: 複合転移 (色と形の共鳴)
  // 盤面: 7×7 (4区画スワイプ)
  // ルール: MATCH_COLOR -> MATCH_COLOR_SHAPE (複数属性同時一致)
  // ==========================================
  generateStage({
    id: 6,
    title: 'Stage 6: 複合転移 (色と形の共鳴)',
    size: 7,
    description: '7×7迷宮。単一の色一致から、突如「色 AND 形状」の両方が同時に一致するマスだけが進める複合フェーズへ相転移します。',
    seed: 'rule_shifter_stage_6',
    rules: ['MATCH_COLOR', 'MATCH_COLOR_SHAPE'],
    shiftType: 'SHIFTER_NODE',
    minPathLength: 16,
  }),

  // ==========================================
  // Stage 7: 高密度複合迷宮 (幾何学交差)
  // 盤面: 7×7 (4区画スワイプ)
  // ルール: MATCH_SHAPE -> MATCH_SHAPE_TEXTURE -> MATCH_COUNT_TEXTURE
  // ==========================================
  generateStage({
    id: 7,
    title: 'Stage 7: 高密度複合迷宮 (幾何学交差)',
    size: 7,
    description: '7×7迷宮。「形状」から「形状＆模様」、さらに「個数＆模様」へ2回相転移。2つの属性を同時に頭で照合して進みましょう。',
    seed: 'rule_shifter_stage_7',
    rules: ['MATCH_SHAPE', 'MATCH_SHAPE_TEXTURE', 'MATCH_COUNT_TEXTURE'],
    shiftType: 'SHIFTER_NODE',
    minPathLength: 18,
  }),

  // ==========================================
  // Stage 8: グランドマスター (複合三段変異)
  // 盤面: 10×10 (9区画スワイプ)
  // ルール: MATCH_COLOR_SHAPE -> MATCH_COLOR_COUNT -> MATCH_SHAPE_TEXTURE
  // ==========================================
  generateStage({
    id: 8,
    title: 'Stage 8: グランドマスター (複合三段変異)',
    size: 10,
    description: '10×10の最高峰メガ迷宮。「色＆形 ➔ 色＆数 ➔ 形＆模様」と、終始2属性同時一致で変異し続ける究極の認知的柔軟性パズル！',
    seed: 'rule_shifter_stage_8',
    rules: ['MATCH_COLOR_SHAPE', 'MATCH_COLOR_COUNT', 'MATCH_SHAPE_TEXTURE'],
    shiftType: 'SHIFTER_NODE',
    minPathLength: 28,
  }),
];

/**
 * デイリーチャレンジ問題生成
 */
export function generateDailyStage(dateStr?: string): Stage {
  const d = dateStr || new Date().toISOString().slice(0, 10).replace(/-/g, '');
  
  // 単一・複合を組み合わせた多彩な同一性マッチ組み合わせ
  const dailyRulePool: RuleId[][] = [
    ['MATCH_COLOR', 'MATCH_COUNT'],
    ['MATCH_SHAPE', 'MATCH_COLOR_SHAPE'],
    ['MATCH_COUNT', 'MATCH_SHAPE_TEXTURE'],
    ['MATCH_TEXTURE', 'MATCH_COLOR_TEXTURE'],
    ['MATCH_COLOR_SHAPE', 'MATCH_COUNT_TEXTURE'],
    ['MATCH_SHAPE', 'MATCH_COLOR', 'MATCH_COUNT'],
    ['MATCH_COLOR', 'MATCH_SHAPE_TEXTURE'],
  ];
  const dayIndex = parseInt(d.slice(-2), 10) % dailyRulePool.length;
  const chosenRules = dailyRulePool[dayIndex];

  return generateStage({
    id: 999,
    title: `Daily: ${d}`,
    size: 7,
    description: `全世界共通の日替わりパズル (${d})。純粋な同一性推理で保続エラー最少クリアを目指しましょう！`,
    seed: `daily_${d}`,
    rules: chosenRules,
    shiftType: 'SHIFTER_NODE',
    minPathLength: 16,
  });
}
