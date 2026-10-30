'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { CellItem } from './CellItem';
import { ConnectionLines } from './ConnectionLines';
import { Cell } from '@/types/game';
import { AlertCircle, Brain, ChevronRight, ChevronDown, ChevronLeft, ChevronUp } from 'lucide-react';

export const GameBoard: React.FC = () => {
  const {
    currentStage,
    path,
    activeRule,
    isDeadEnd,
    camR,
    camC,
    settings,
    lastMistakeCell,
    mistakeTrigger,
    isPerseverativeTrigger,
    stepTo,
    shiftCamera,
  } = useGameStore();

  const boardWrapperRef = useRef<HTMLDivElement>(null);
  const [isDrawingPath, setIsDrawingPath] = useState(false);
  const [activeMistake, setActiveMistake] = useState<{ r: number; c: number } | null>(null);
  const [showMistakeToast, setShowMistakeToast] = useState(false);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  // ミス発生時のアニメーショントリガー
  useEffect(() => {
    if (mistakeTrigger > 0 && lastMistakeCell) {
      setActiveMistake({ r: lastMistakeCell.r, c: lastMistakeCell.c });
      setShowMistakeToast(true);

      const cellTimer = setTimeout(() => {
        setActiveMistake(null);
      }, 700);

      const toastTimer = setTimeout(() => {
        setShowMistakeToast(false);
      }, 950);

      return () => {
        clearTimeout(cellTimer);
        clearTimeout(toastTimer);
      };
    }
  }, [mistakeTrigger, lastMistakeCell]);

  const tipCell = path[path.length - 1];
  const isScrollable = !!currentStage.isScrollable;

  const isVisited = useCallback(
    (cell: Cell) => {
      return path.some((c) => c.r === cell.r && c.c === cell.c);
    },
    [path]
  );

  // ポインター操作（スワイプとドラッグの排他制御）
  const handlePointerDown = (e: React.PointerEvent) => {
    touchStartRef.current = { x: e.clientX, y: e.clientY };

    const targetEl = (e.target as HTMLElement).closest('[data-r]');
    if (!targetEl) {
      setIsDrawingPath(false);
      return;
    }

    const r = parseInt(targetEl.getAttribute('data-r') || '-1', 10);
    const c = parseInt(targetEl.getAttribute('data-c') || '-1', 10);

    // 先端セルから始まった場合のみドラッグ描画モードをON
    if (tipCell && tipCell.r === r && tipCell.c === c) {
      setIsDrawingPath(true);
    } else {
      setIsDrawingPath(false);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDrawingPath) return;

    const el = document.elementFromPoint(e.clientX, e.clientY)?.closest('[data-r]');
    if (!el) return;

    const r = parseInt(el.getAttribute('data-r') || '-1', 10);
    const c = parseInt(el.getAttribute('data-c') || '-1', 10);
    if (r === -1 || c === -1) return;

    const targetCell = currentStage.cells.find((cell) => cell.r === r && cell.c === c);
    if (!targetCell) return;

    if (!tipCell || targetCell.r !== tipCell.r || targetCell.c !== tipCell.c) {
      stepTo(targetCell);
    }
  };

  const handlePointerUp = useCallback(
    (e: MouseEvent | TouchEvent | PointerEvent) => {
      if (isDrawingPath) {
        setIsDrawingPath(false);
        touchStartRef.current = null;
        return;
      }

      // 高感度スワイプ移動判定（閾値20px）
      if (touchStartRef.current && isScrollable) {
        const clientX =
          'clientX' in e ? e.clientX : (e as TouchEvent).changedTouches?.[0]?.clientX ?? 0;
        const clientY =
          'clientY' in e ? e.clientY : (e as TouchEvent).changedTouches?.[0]?.clientY ?? 0;

        const dx = clientX - touchStartRef.current.x;
        const dy = clientY - touchStartRef.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist >= 20) {
          if (Math.abs(dx) > Math.abs(dy)) {
            // 水平スワイプ
            if (dx < -20) {
              shiftCamera(0, 1);
            } else if (dx > 20) {
              shiftCamera(0, -1);
            }
          } else {
            // 垂直スワイプ
            if (dy < -20) {
              shiftCamera(1, 0);
            } else if (dy > 20) {
              shiftCamera(-1, 0);
            }
          }
        }
      }

      touchStartRef.current = null;
      setIsDrawingPath(false);
    },
    [isDrawingPath, isScrollable, shiftCamera]
  );

  useEffect(() => {
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [handlePointerUp]);

  // 現在のカメラ外にまだ迷宮が広がっているか
  const maxOffset = currentStage.size > 4 ? currentStage.size - 4 : 0;
  const hasMoreRight = isScrollable && camC < maxOffset;
  const hasMoreLeft = isScrollable && camC > 0;
  const hasMoreDown = isScrollable && camR < maxOffset;
  const hasMoreUp = isScrollable && camR > 0;

  return (
    <div className="w-full max-w-md mx-auto px-4 py-1 select-none flex flex-col items-center justify-center">
      {/* 4x4 ファインダービューポート */}
      <div
        id="gridWrapper"
        ref={boardWrapperRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        className={`relative w-full aspect-square rounded-3xl overflow-hidden bg-slate-950/90 backdrop-blur-md border-[4px] transition-all duration-200 ${
          showMistakeToast
            ? 'border-rose-500 shadow-[0_0_28px_rgba(244,63,94,0.6)] animate-shake'
            : isDeadEnd
            ? 'border-purple-500 shadow-[0_0_24px_rgba(168,85,247,0.5)] animate-shake'
            : 'border-cyan-500/80 shadow-[0_0_24px_rgba(6,182,212,0.35)]'
        }`}
        style={
          {
            touchAction: 'none',
            containerType: 'inline-size',
            '--gap': '8px',
            '--pad': '8px',
            '--cell-size': 'calc((100cqw - 16px - 24px) / 4)',
          } as React.CSSProperties
        }
      >
        {/* 画面外に迷宮が広がっている方向のスクロールガイド矢印 */}
        {hasMoreRight && (
          <button
            onClick={() => shiftCamera(0, 1)}
            className="absolute right-1 top-1/2 -translate-y-1/2 z-30 p-1.5 rounded-full bg-slate-900/80 border border-cyan-500/50 text-cyan-300 shadow-md backdrop-blur-sm animate-pulse cursor-pointer"
            title="右の区画へスライド"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
        {hasMoreLeft && (
          <button
            onClick={() => shiftCamera(0, -1)}
            className="absolute left-1 top-1/2 -translate-y-1/2 z-30 p-1.5 rounded-full bg-slate-900/80 border border-cyan-500/50 text-cyan-300 shadow-md backdrop-blur-sm animate-pulse cursor-pointer"
            title="左の区画へスライド"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
        {hasMoreDown && (
          <button
            onClick={() => shiftCamera(1, 0)}
            className="absolute bottom-1 left-1/2 -translate-x-1/2 z-30 p-1.5 rounded-full bg-slate-900/80 border border-cyan-500/50 text-cyan-300 shadow-md backdrop-blur-sm animate-pulse cursor-pointer"
            title="下の区画へスライド"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        )}
        {hasMoreUp && (
          <button
            onClick={() => shiftCamera(-1, 0)}
            className="absolute top-1 left-1/2 -translate-x-1/2 z-30 p-1.5 rounded-full bg-slate-900/80 border border-cyan-500/50 text-cyan-300 shadow-md backdrop-blur-sm animate-pulse cursor-pointer"
            title="上の区画へスライド"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
        )}

        {/* 盤面上部: MISS / 保続エラー瞬間トースト */}
        {showMistakeToast && (
          <div
            className={`absolute top-3 left-1/2 -translate-x-1/2 z-40 px-3.5 py-1.5 rounded-full border text-xs font-black backdrop-blur-md animate-fade-in flex items-center gap-1.5 pointer-events-none whitespace-nowrap shadow-lg ${
              isPerseverativeTrigger
                ? 'bg-purple-950/95 border-purple-400 text-purple-200 shadow-[0_0_20px_rgba(168,85,247,0.7)]'
                : 'bg-rose-950/95 border-rose-500 text-rose-200 shadow-[0_0_20px_rgba(244,63,94,0.7)]'
            }`}
          >
            {isPerseverativeTrigger ? (
              <>
                <Brain className="w-4 h-4 text-purple-300 shrink-0 animate-pulse" />
                <span>⚠️ 旧ルールへの固執！（保続エラー）</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 animate-pulse" />
                <span>❌ ルール不合致！（Reject）</span>
              </>
            )}
          </div>
        )}

        {/* スライディング迷宮フレーム (.labyrinth-frame) */}
        <div
          className="relative transition-transform duration-300 ease-out"
          style={{
            width: isScrollable
              ? `calc(var(--cell-size) * ${currentStage.size} + var(--gap) * ${currentStage.size - 1} + var(--pad) * 2)`
              : '100%',
            height: isScrollable
              ? `calc(var(--cell-size) * ${currentStage.size} + var(--gap) * ${currentStage.size - 1} + var(--pad) * 2)`
              : '100%',
            transform: isScrollable
              ? `translate3d(calc(-1 * ${camC} * (var(--cell-size) + var(--gap))), calc(-1 * ${camR} * (var(--cell-size) + var(--gap))), 0)`
              : 'none',
          }}
        >
          {/* 動的SVGコネクションライン */}
          <ConnectionLines path={path} size={currentStage.size} />

          {/* 全マスグリッド */}
          <div
            className="grid w-full h-full p-2"
            style={{
              gridTemplateColumns: `repeat(${currentStage.size}, var(--cell-size))`,
              gridTemplateRows: `repeat(${currentStage.size}, var(--cell-size))`,
              gap: 'var(--gap)',
            }}
          >
            {currentStage.cells.map((cell) => {
              const isTip = tipCell?.r === cell.r && tipCell?.c === cell.c;
              const isMistake =
                activeMistake?.r === cell.r && activeMistake?.c === cell.c;
              return (
                <CellItem
                  key={`${cell.r}-${cell.c}`}
                  cell={cell}
                  isTip={isTip}
                  isVisited={isVisited(cell)}
                  isMistake={isMistake}
                  isCudMode={settings.isCudMode}
                  onSelect={(selectedCell) => stepTo(selectedCell)}
                  gridSize={currentStage.size}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
