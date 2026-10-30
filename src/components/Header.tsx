'use client';

import React, { useState, useEffect } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { PRESET_STAGES } from '@/lib/stages';
import {
  RotateCcw,
  Settings,
  ChevronLeft,
  ChevronRight,
  Clock,
  Footprints,
  Layers,
  Heart,
} from 'lucide-react';

interface HeaderProps {
  onOpenSettings: () => void;
  onOpenStageSelect: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSettings,
  onOpenStageSelect,
}) => {
  const {
    currentStageIndex,
    currentStage,
    timerSeconds,
    moveCount,
    lives,
    mistakeTrigger,
    reset,
    nextStage,
    prevStage,
  } = useGameStore();

  const [showDamage, setShowDamage] = useState(false);

  useEffect(() => {
    if (mistakeTrigger > 0) {
      setShowDamage(true);
      const timer = setTimeout(() => setShowDamage(false), 850);
      return () => clearTimeout(timer);
    }
  }, [mistakeTrigger]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const canPrev = currentStageIndex > 0;
  const canNext =
    currentStageIndex >= 0 && currentStageIndex < PRESET_STAGES.length - 1;

  const displayTitle =
    currentStage.id >= 1000
      ? 'Daily'
      : currentStage.title.split(':')[0];

  return (
    <header className="w-full max-w-md mx-auto px-4 py-2 flex flex-col gap-2 select-none">
      {/* 上段: タイトル ＆ ステージ選択・切り替え / 設定ボタン */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div>
            <h1 className="text-xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]">
              Rule Shifter
            </h1>
            <p className="text-[10px] text-slate-400 font-medium">潜伏規則迷路</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* ステージ名 ＆ 前後送り（統合セレクター） */}
          <div className="flex items-center bg-cyan-950/60 border border-cyan-500/40 rounded-xl p-0.5 shadow-md">
            <button
              onClick={prevStage}
              disabled={!canPrev}
              className="p-1 rounded-lg text-cyan-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition"
              title="前のステージ"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenStageSelect}
              className="flex items-center gap-1 px-1.5 py-1 text-xs sm:text-sm font-black text-cyan-200 hover:text-white transition whitespace-nowrap"
              title="ステージ選択"
            >
              <Layers className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>{displayTitle}</span>
            </button>
            <button
              onClick={nextStage}
              disabled={!canNext}
              className="p-1 rounded-lg text-cyan-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition"
              title="次のステージ"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-all shadow-md active:scale-95 border border-slate-700/60"
            title="設定"
            aria-label="設定"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 中段: 3大ステータス（タイマー ＆ 手数 ＆ 保続エラー） ＆ 操作（Undo/Reset） */}
      <div className="flex items-center justify-between bg-slate-900/90 border border-slate-800 rounded-2xl px-4 py-2 sm:py-2.5 shadow-inner">
        {/* 3大ステータス: 経過時間 ＆ 手数 ＆ 残りライフ */}
        <div className="flex items-center gap-4 sm:gap-6 font-mono">
          {/* タイマー */}
          <div className="flex items-center gap-2 text-cyan-300 font-black" title="経過時間">
            <Clock className="w-6 h-6 text-cyan-400 shrink-0" />
            <span className="text-2xl sm:text-3xl tracking-tight tabular-nums leading-none">
              {formatTime(timerSeconds)}
            </span>
          </div>

          {/* 手数 */}
          <div className="flex items-center gap-2 text-emerald-300 font-black" title="手数">
            <Footprints className="w-6 h-6 text-emerald-400 shrink-0" />
            <span className="text-2xl sm:text-3xl tracking-tight tabular-nums leading-none">
              {moveCount.toString().padStart(3, '0')}
            </span>
          </div>

          {/* ライフ */}
          <div
            className={`relative flex items-center gap-2 font-black transition-all duration-200 ${
              showDamage
                ? 'scale-110 text-rose-500'
                : lives <= 1
                ? 'text-rose-400 animate-pulse'
                : 'text-rose-300'
            }`}
            title="残りライフ"
          >
            {/* -1 フローティングアニメーション */}
            {showDamage && (
              <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-sm sm:text-base font-black text-rose-400 font-mono drop-shadow-[0_0_8px_rgba(244,63,94,0.9)] animate-float-up pointer-events-none select-none z-30">
                -1
              </span>
            )}
            <Heart
              className={`w-6 h-6 shrink-0 transition-transform duration-150 ${
                showDamage
                  ? 'scale-125 text-rose-500 fill-rose-500'
                  : lives <= 1
                  ? 'text-rose-400 fill-rose-400'
                  : 'text-rose-400 fill-rose-500/80'
              }`}
            />
            <span className="text-2xl sm:text-3xl tracking-tight tabular-nums leading-none">
              {lives}
            </span>
          </div>
        </div>

        {/* コントロール: リセットボタン（1手戻るは経路タップへ移行のため廃止） */}
        <div className="flex items-center">
          <button
            onClick={reset}
            className="p-2 sm:p-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-rose-400 transition active:scale-90 border border-slate-700/60 shadow-sm shrink-0"
            title="リセット (R)"
            aria-label="リセット"
          >
            <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
