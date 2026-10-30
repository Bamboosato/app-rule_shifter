'use client';

import React from 'react';
import { useGameStore } from '@/store/useGameStore';
import { Compass, Undo2 } from 'lucide-react';

export const DeadEndToast: React.FC = () => {
  const { isDeadEnd, undo } = useGameStore();

  if (!isDeadEnd) return null;

  return (
    <div className="w-full max-w-md mx-auto px-4 my-1 animate-bounce select-none">
      <div className="bg-amber-950/80 border-2 border-amber-500/90 text-amber-100 px-3.5 py-2 rounded-2xl shadow-[0_0_20px_rgba(245,158,11,0.4)] backdrop-blur-md flex items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <Compass className="w-5 h-5 text-amber-400 shrink-0 animate-spin" style={{ animationDuration: '4s' }} />
          <div className="min-w-0">
            <div className="text-xs font-black tracking-wide text-amber-200 truncate">
              🚫 行き止まりです（別ルートへ）
            </div>
            <div className="text-[11px] text-amber-300/80 truncate">
              1手戻して別の分岐マスを探索しましょう
            </div>
          </div>
        </div>

        <button
          onClick={undo}
          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 active:scale-95 text-slate-950 font-black text-xs shadow-md transition flex items-center gap-1 shrink-0 cursor-pointer"
        >
          <Undo2 className="w-3.5 h-3.5 stroke-[3]" />
          <span>1手戻す</span>
        </button>
      </div>
    </div>
  );
};
