'use client';

import React from 'react';
import { useGameStore } from '@/store/useGameStore';
import { soundService } from '@/lib/sound';

export const MiniDotHud: React.FC = () => {
  const { currentStage, camR, camC, setCamPos } = useGameStore();

  const isScrollable = !!currentStage.isScrollable;
  const is10x10 = currentStage.size === 10;
  const is5x5 = currentStage.size === 5;

  let numDivisions = 2;
  let offsets = [0, 3];
  let dotSizeClass = 'w-2 h-2';

  if (!isScrollable) {
    numDivisions = 1;
    offsets = [0];
    dotSizeClass = 'w-2.5 h-2.5';
  } else if (is10x10) {
    numDivisions = 3;
    offsets = [0, 3, 6];
    dotSizeClass = 'w-1.5 h-1.5';
  } else if (is5x5) {
    numDivisions = 2;
    offsets = [0, 1];
    dotSizeClass = 'w-2 h-2';
  }

  const activeRowIdx = offsets.indexOf(camR);
  const activeColIdx = offsets.indexOf(camC);

  const handleDotClick = (rOffset: number, cOffset: number) => {
    if (!isScrollable) return;
    if (rOffset !== camR || cOffset !== camC) {
      soundService.playSlide();
      setCamPos(rOffset, cOffset);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 select-none">
      <div className="w-full h-11 px-4 flex items-center justify-between bg-slate-900/80 border border-slate-800/80 rounded-2xl text-xs shadow-md">
        {/* 凡例アイコン（全ステージで統一表示） */}
        <div className="flex items-center gap-2.5 text-[11px] font-bold text-slate-300">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.7)]" />
            <span className="text-white">START</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_6px_rgba(168,85,247,0.7)]" />
            <span className="text-white">🌀</span>
            <span className="text-white">転移</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.7)]" />
            <span className="text-white">GOAL</span>
          </span>
        </div>

        {/* ミニドットピクト (固定寸法 w-9 h-9 で全ステージ縦幅44px完全統一) */}
        <div className="w-9 h-9 flex items-center justify-center">
          <div
            className="grid gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800"
            style={{
              gridTemplateColumns: `repeat(${numDivisions}, minmax(0, 1fr))`,
            }}
            title={isScrollable ? '区画選択' : '全体表示'}
          >
            {offsets.map((rOff, rIdx) =>
              offsets.map((cOff, cIdx) => {
                const isActive =
                  !isScrollable ||
                  (rIdx === activeRowIdx && cIdx === activeColIdx);
                return (
                  <button
                    key={`${rOff}-${cOff}`}
                    onClick={() => handleDotClick(rOff, cOff)}
                    disabled={!isScrollable}
                    className={`${dotSizeClass} rounded-full transition-all shrink-0 ${
                      isActive
                        ? 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.9)] scale-110'
                        : 'bg-slate-700 hover:bg-slate-500'
                    } ${!isScrollable ? 'cursor-default pointer-events-none' : ''}`}
                    aria-label={
                      isScrollable
                        ? `区画 (${rOff}, ${cOff}) へ移動`
                        : '全体'
                    }
                  />
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
