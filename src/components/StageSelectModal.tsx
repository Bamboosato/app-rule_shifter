'use client';

import React from 'react';
import { useGameStore } from '@/store/useGameStore';
import { PRESET_STAGES, generateDailyStage } from '@/lib/stages';
import { X, Layers, Check, Calendar } from 'lucide-react';

interface StageSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StageSelectModal: React.FC<StageSelectModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { currentStageIndex, currentStage, initStage, loadCustomStage } = useGameStore();

  if (!isOpen) return null;

  const isDailyActive = currentStage.id === 999;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border-2 border-slate-700 shadow-2xl p-6 flex flex-col gap-4 text-left">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-black text-white">ステージ選択</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* デイリーチャレンジボタン */}
        <button
          onClick={() => {
            loadCustomStage(generateDailyStage());
            onClose();
          }}
          className={`w-full p-3.5 rounded-2xl border text-left flex items-start justify-between transition-all cursor-pointer ${
            isDailyActive
              ? 'bg-gradient-to-r from-amber-950/80 to-yellow-950/80 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
              : 'bg-slate-950/80 border-amber-500/40 hover:border-amber-400'
          }`}
        >
          <div className="flex items-start gap-3 flex-1">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 shrink-0 mt-0.5">
              <Calendar className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-black text-amber-200 flex items-center gap-2 flex-wrap">
                <span>Daily Challenge</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/40">
                  日替わり 7×7
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed break-words">
                全世界共通の日替わりシード迷宮。柔軟な思考力で本日の難関を突破しよう！
              </p>
            </div>
          </div>
          {isDailyActive && <Check className="w-4 h-4 text-amber-400 shrink-0 ml-2 mt-1" />}
        </button>

        <div className="text-[11px] font-bold text-slate-400 px-1">
          通常ステージ
        </div>

        <div className="flex flex-col gap-2 max-h-[55vh] overflow-y-auto pr-1">
          {PRESET_STAGES.map((stg, idx) => {
            const isCurrent = !isDailyActive && idx === currentStageIndex;
            let badgeBg = 'bg-slate-800 text-slate-300';
            let badgeText = `${stg.size}×${stg.size}`;

            if (stg.id <= 2) {
              badgeBg = 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30';
            } else if (stg.id <= 4) {
              badgeBg = 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/30';
            } else if (stg.id <= 6) {
              badgeBg = 'bg-amber-950/80 text-amber-300 border border-amber-500/30';
            } else {
              badgeBg = 'bg-purple-950/80 text-purple-300 border border-purple-500/40 animate-pulse';
            }

            return (
              <button
                key={stg.id}
                onClick={() => {
                  initStage(idx);
                  onClose();
                }}
                className={`w-full p-3 rounded-2xl border text-left flex items-start justify-between transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-cyan-950/80 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                    : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800/80'
                }`}
              >
                <div className="min-w-0 flex-1 pr-2">
                  <div className="text-sm font-black text-white flex items-center gap-2 flex-wrap">
                    <span>{stg.title}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono shrink-0 ${badgeBg}`}>
                      {badgeText}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed break-words">
                    {stg.description}
                  </p>
                </div>

                {isCurrent && (
                  <Check className="w-4 h-4 text-cyan-400 shrink-0 ml-1 mt-1" />
                )}
              </button>
            );
          })}
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-black text-xs transition active:scale-95"
        >
          閉じる
        </button>
      </div>
    </div>
  );
};
