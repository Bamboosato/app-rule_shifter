import { ColorId, ShapeId, CountId, TextureId, RuleId, DimensionType } from '@/types/game';

export interface ColorDef {
  id: ColorId;
  hex: string;
  glow: string;
  label: string;
  cudShort: string; // C, A, E, M
  cudLabel: string;
}

export const COLOR_DEFS: Record<ColorId, ColorDef> = {
  CYAN: {
    id: 'CYAN',
    hex: '#06b6d4',
    glow: 'rgba(6, 182, 212, 0.7)',
    label: 'シアン',
    cudShort: 'C',
    cudLabel: 'シアン(水)',
  },
  AMBER: {
    id: 'AMBER',
    hex: '#f59e0b',
    glow: 'rgba(245, 158, 11, 0.7)',
    label: 'アンバー',
    cudShort: 'A',
    cudLabel: 'アンバー(黄)',
  },
  EMERALD: {
    id: 'EMERALD',
    hex: '#10b981',
    glow: 'rgba(16, 185, 129, 0.7)',
    label: 'エメラルド',
    cudShort: 'E',
    cudLabel: 'エメラルド(緑)',
  },
  MAGENTA: {
    id: 'MAGENTA',
    hex: '#d946ef',
    glow: 'rgba(217, 70, 239, 0.7)',
    label: 'マゼンタ',
    cudShort: 'M',
    cudLabel: 'マゼンタ(紫赤)',
  },
};

export const ALL_COLORS: ColorId[] = ['CYAN', 'AMBER', 'EMERALD', 'MAGENTA'];

export interface ShapeDef {
  id: ShapeId;
  label: string;
  symbol: string;
}

export const SHAPE_DEFS: Record<ShapeId, ShapeDef> = {
  CIRCLE: { id: 'CIRCLE', label: '円', symbol: '●' },
  SQUARE: { id: 'SQUARE', label: '正方形', symbol: '■' },
  TRIANGLE: { id: 'TRIANGLE', label: '三角', symbol: '▲' },
  DIAMOND: { id: 'DIAMOND', label: '菱形', symbol: '◆' },
};

export const ALL_SHAPES: ShapeId[] = ['CIRCLE', 'SQUARE', 'TRIANGLE', 'DIAMOND'];
export const ALL_COUNTS: CountId[] = [1, 2, 3, 4];

export interface TextureDef {
  id: TextureId;
  label: string;
  icon: string;
}

export const TEXTURE_DEFS: Record<TextureId, TextureDef> = {
  SOLID: { id: 'SOLID', label: 'べた塗り', icon: '■' },
  STRIPE: { id: 'STRIPE', label: '斜め縞', icon: '▨' },
  DOTS: { id: 'DOTS', label: '水玉', icon: '⁖' },
  GRID: { id: 'GRID', label: '格子', icon: '▦' },
};

export const ALL_TEXTURES: TextureId[] = ['SOLID', 'STRIPE', 'DOTS', 'GRID'];

export interface RuleDef {
  id: RuleId;
  targetDimension?: DimensionType;
  title: string;
  description: string;
}

export const RULE_DEFS: Record<RuleId, RuleDef> = {
  MATCH_COLOR: {
    id: 'MATCH_COLOR',
    targetDimension: 'color',
    title: '色一致',
    description: '同じ色のマス同士だけが進路',
  },
  MATCH_SHAPE: {
    id: 'MATCH_SHAPE',
    targetDimension: 'shape',
    title: '形状一致',
    description: '同じ図形のマス同士だけが進路',
  },
  MATCH_COUNT: {
    id: 'MATCH_COUNT',
    targetDimension: 'count',
    title: '個数一致',
    description: 'シンボルの個数が同じマス同士だけが進路',
  },
  MATCH_TEXTURE: {
    id: 'MATCH_TEXTURE',
    targetDimension: 'texture',
    title: '模様一致',
    description: '同じテクスチャ（縞・ドット等）同士だけが進路',
  },
  MATCH_COLOR_SHAPE: {
    id: 'MATCH_COLOR_SHAPE',
    title: '色＆形状一致',
    description: '「色」と「形」の両方が一致するマスだけが進路',
  },
  MATCH_COLOR_COUNT: {
    id: 'MATCH_COLOR_COUNT',
    title: '色＆個数一致',
    description: '「色」と「個数」の両方が一致するマスだけが進路',
  },
  MATCH_COLOR_TEXTURE: {
    id: 'MATCH_COLOR_TEXTURE',
    title: '色＆模様一致',
    description: '「色」と「模様」の両方が一致するマスだけが進路',
  },
  MATCH_SHAPE_COUNT: {
    id: 'MATCH_SHAPE_COUNT',
    title: '形状＆個数一致',
    description: '「形」と「個数」の両方が一致するマスだけが進路',
  },
  MATCH_SHAPE_TEXTURE: {
    id: 'MATCH_SHAPE_TEXTURE',
    title: '形状＆模様一致',
    description: '「形」と「模様」の両方が一致するマスだけが進路',
  },
  MATCH_COUNT_TEXTURE: {
    id: 'MATCH_COUNT_TEXTURE',
    title: '個数＆模様一致',
    description: '「個数」と「模様」の両方が一致するマスだけが進路',
  },
  DELTA_COUNT: {
    id: 'DELTA_COUNT',
    targetDimension: 'count',
    title: '個数差分±1',
    description: '個数が1つ多いか少ないマスへステップ',
  },
  ALL_DIFF: {
    id: 'ALL_DIFF',
    title: '全次元相異',
    description: '色・形・数・模様のすべてが不一致のマスだけが進路',
  },
};
