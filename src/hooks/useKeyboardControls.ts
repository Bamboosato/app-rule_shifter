'use client';

import { useEffect } from 'react';
import { useGameStore } from '@/store/useGameStore';

export const useKeyboardControls = () => {
  const {
    path,
    currentStage,
    undo,
    reset,
    stepTo,
    toggleHypothesis,
  } = useGameStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 入力要素にフォーカスがある場合は無視
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      const tipCell = path[path.length - 1];
      if (!tipCell) return;

      let targetR = tipCell.r;
      let targetC = tipCell.c;

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          targetR -= 1;
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          targetR += 1;
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          targetC -= 1;
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          targetC += 1;
          break;

        case 'z':
        case 'Z':
        case 'Backspace':
          e.preventDefault();
          undo();
          return;

        case 'r':
        case 'R':
          e.preventDefault();
          reset();
          return;

        case '1':
          e.preventDefault();
          toggleHypothesis('color');
          return;
        case '2':
          e.preventDefault();
          toggleHypothesis('shape');
          return;
        case '3':
          e.preventDefault();
          toggleHypothesis('count');
          return;
        case '4':
          e.preventDefault();
          toggleHypothesis('texture');
          return;

        default:
          return;
      }

      // 盤外チェック
      if (
        targetR < 0 ||
        targetR >= currentStage.size ||
        targetC < 0 ||
        targetC >= currentStage.size
      ) {
        return;
      }

      // 該当座標のセルを取得して移動試行
      const targetCell = currentStage.cells.find(
        (c) => c.r === targetR && c.c === targetC
      );
      if (targetCell) {
        e.preventDefault();
        stepTo(targetCell);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [path, currentStage, undo, reset, stepTo, toggleHypothesis]);
};
