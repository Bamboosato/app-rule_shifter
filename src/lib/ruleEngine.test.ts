import { describe, it, expect } from 'vitest';
import {
  isAdjacent,
  validateConnection,
  isPerseverativeError,
  getEliminatedAttributes,
  calculateFlexibilityIndex,
  getActiveDimensionsForRule,
} from './ruleEngine';
import { AttributeTuple } from '@/types/game';

describe('ruleEngine', () => {
  const cellA: AttributeTuple = {
    color: 'CYAN',
    shape: 'CIRCLE',
    count: 2,
    texture: 'SOLID',
  };

  describe('isAdjacent', () => {
    it('直交隣接を正しく検出する', () => {
      expect(isAdjacent({ r: 0, c: 0 }, { r: 0, c: 1 })).toBe(true);
      expect(isAdjacent({ r: 1, c: 1 }, { r: 2, c: 1 })).toBe(true);
      expect(isAdjacent({ r: 0, c: 0 }, { r: 1, c: 1 })).toBe(false); // 斜め
      expect(isAdjacent({ r: 0, c: 0 }, { r: 0, c: 2 })).toBe(false); // 2マス離れ
    });
  });

  describe('validateConnection', () => {
    it('MATCH_COLOR: 色一致の判定', () => {
      const sameColor: AttributeTuple = {
        color: 'CYAN',
        shape: 'TRIANGLE',
        count: 4,
        texture: 'GRID',
      };
      const diffColor: AttributeTuple = {
        color: 'AMBER',
        shape: 'CIRCLE',
        count: 2,
        texture: 'SOLID',
      };

      expect(validateConnection(cellA, sameColor, 'MATCH_COLOR')).toBe(true);
      expect(validateConnection(cellA, diffColor, 'MATCH_COLOR')).toBe(false);
    });

    it('MATCH_SHAPE: 形状一致の判定', () => {
      const sameShape: AttributeTuple = {
        color: 'MAGENTA',
        shape: 'CIRCLE',
        count: 1,
        texture: 'DOTS',
      };
      expect(validateConnection(cellA, sameShape, 'MATCH_SHAPE')).toBe(true);
    });

    it('MATCH_COUNT: 個数一致の判定', () => {
      const sameCount: AttributeTuple = {
        color: 'EMERALD',
        shape: 'DIAMOND',
        count: 2,
        texture: 'STRIPE',
      };
      expect(validateConnection(cellA, sameCount, 'MATCH_COUNT')).toBe(true);
    });

    it('MATCH_TEXTURE: 模様一致の判定', () => {
      const sameTexture: AttributeTuple = {
        color: 'AMBER',
        shape: 'SQUARE',
        count: 3,
        texture: 'SOLID',
      };
      expect(validateConnection(cellA, sameTexture, 'MATCH_TEXTURE')).toBe(true);
    });

    it('複数属性同時一致（複合マッチ）の判定', () => {
      // cellA = CYAN, CIRCLE, 2, SOLID
      const matchColorShape: AttributeTuple = {
        color: 'CYAN',
        shape: 'CIRCLE',
        count: 4,
        texture: 'GRID',
      };
      const matchOnlyColor: AttributeTuple = {
        color: 'CYAN',
        shape: 'SQUARE',
        count: 2,
        texture: 'SOLID',
      };
      const matchShapeTexture: AttributeTuple = {
        color: 'MAGENTA',
        shape: 'CIRCLE',
        count: 1,
        texture: 'SOLID',
      };

      // MATCH_COLOR_SHAPE: 色と形の両方が一致
      expect(validateConnection(cellA, matchColorShape, 'MATCH_COLOR_SHAPE')).toBe(true);
      expect(validateConnection(cellA, matchOnlyColor, 'MATCH_COLOR_SHAPE')).toBe(false);

      // MATCH_SHAPE_TEXTURE: 形と模様の両方が一致
      expect(validateConnection(cellA, matchShapeTexture, 'MATCH_SHAPE_TEXTURE')).toBe(true);
      expect(validateConnection(cellA, matchColorShape, 'MATCH_SHAPE_TEXTURE')).toBe(false); // textureが不一致
    });

    it('DELTA_COUNT: 個数差分±1の判定', () => {
      const count1: AttributeTuple = { ...cellA, count: 1 };
      const count3: AttributeTuple = { ...cellA, count: 3 };
      const count4: AttributeTuple = { ...cellA, count: 4 };

      expect(validateConnection(cellA, count1, 'DELTA_COUNT')).toBe(true);
      expect(validateConnection(cellA, count3, 'DELTA_COUNT')).toBe(true);
      expect(validateConnection(cellA, count4, 'DELTA_COUNT')).toBe(false);
    });

    it('ALL_DIFF: 全次元不一致の判定', () => {
      const allDiff: AttributeTuple = {
        color: 'AMBER',
        shape: 'SQUARE',
        count: 3,
        texture: 'STRIPE',
      };
      const oneSame: AttributeTuple = {
        color: 'CYAN', // 色だけ同じ
        shape: 'SQUARE',
        count: 3,
        texture: 'STRIPE',
      };

      expect(validateConnection(cellA, allDiff, 'ALL_DIFF')).toBe(true);
      expect(validateConnection(cellA, oneSame, 'ALL_DIFF')).toBe(false);
    });
  });

  describe('isPerseverativeError (保続エラー)', () => {
    it('旧ルールを満たし新ルールを満たさない場合、保続エラーと判定する', () => {
      const prevRule = 'MATCH_COLOR';
      const activeRule = 'MATCH_SHAPE';

      // 直前セルと同じ色だが、形は違う（旧ルールに執着して選んでしまったセル）
      const candidate: AttributeTuple = {
        color: 'CYAN', // 旧ルールに合致
        shape: 'SQUARE', // 新ルールには不一致
        count: 3,
        texture: 'DOTS',
      };

      expect(isPerseverativeError(cellA, candidate, prevRule, activeRule)).toBe(true);
    });

    it('新旧どちらにも一致しない場合は一般エラー（保続ではない）', () => {
      const prevRule = 'MATCH_COLOR';
      const activeRule = 'MATCH_SHAPE';

      const candidate: AttributeTuple = {
        color: 'AMBER', // 旧不一致
        shape: 'SQUARE', // 新不一致
        count: 3,
        texture: 'DOTS',
      };

      expect(isPerseverativeError(cellA, candidate, prevRule, activeRule)).toBe(false);
    });

    it('新ルールに適合する場合はエラーではない', () => {
      const prevRule = 'MATCH_COLOR';
      const activeRule = 'MATCH_SHAPE';

      const candidate: AttributeTuple = {
        color: 'AMBER',
        shape: 'CIRCLE', // 新ルールに適合
        count: 3,
        texture: 'DOTS',
      };

      expect(isPerseverativeError(cellA, candidate, prevRule, activeRule)).toBe(false);
    });
  });

  describe('getEliminatedAttributes (アシスト用)', () => {
    it('Rejectマスと直前マスで一致していた属性を抽出する', () => {
      const rejected: AttributeTuple = {
        color: 'CYAN', // 一致
        shape: 'CIRCLE', // 一致
        count: 4, // 不一致
        texture: 'DOTS', // 不一致
      };

      const elim = getEliminatedAttributes(cellA, rejected);
      expect(elim).toEqual(['color', 'shape']);
    });
  });

  describe('calculateFlexibilityIndex', () => {
    it('ミスなし最短手数で100点満点', () => {
      const score = calculateFlexibilityIndex({
        perseverativeErrors: 0,
        generalErrors: 0,
        moveCount: 10,
        minSteps: 10,
      });
      expect(score).toBe(100);
    });

    it('保続エラーで重い減点（-15点/回）', () => {
      const score = calculateFlexibilityIndex({
        perseverativeErrors: 2,
        generalErrors: 0,
        moveCount: 10,
        minSteps: 10,
      });
      expect(score).toBe(70);
    });
  });

  describe('getActiveDimensionsForRule', () => {
    it('単一ルールから対象属性を正しく抽出', () => {
      expect(getActiveDimensionsForRule('MATCH_COLOR')).toEqual(['color']);
      expect(getActiveDimensionsForRule('MATCH_SHAPE')).toEqual(['shape']);
      expect(getActiveDimensionsForRule('MATCH_COUNT')).toEqual(['count']);
      expect(getActiveDimensionsForRule('MATCH_TEXTURE')).toEqual(['texture']);
    });

    it('複合ルールから複数属性を正しく抽出', () => {
      expect(getActiveDimensionsForRule('MATCH_COLOR_SHAPE')).toEqual(['color', 'shape']);
      expect(getActiveDimensionsForRule('MATCH_SHAPE_TEXTURE')).toEqual(['shape', 'texture']);
    });
  });
});
