'use client';

import React from 'react';
import { useGameStore } from '@/store/useGameStore';
import { HeartCrack, RotateCcw, Layers } from 'lucide-react';

interface GameOverModalProps {
  onOpenStageSelect: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  onOpenStageSelect,
}) => {
  const { isGameOver, reset } = useGameStore();

  if (!isGameOver) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-sm rounded-3xl bg-slate-900 border-2 border-rose-500/80 p-6 shadow-[0_0_30px_rgba(244,63,94,0.4)] flex flex-col items-center text-center">
        {/* アイコン */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-600 to-red-400 flex items-center justify-center text-white shadow-[0_0_20px_rgba(244,63,94,0.5)] mb-3 animate-pulse">
          <HeartCrack className="w-9 h-9" />
        </div>

        <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-red-300 to-orange-400">
          GAME OVER
        </h2>
        <p className="text-xs text-rose-300/80 font-medium mt-1">
          ライフがなくなりました（3回ミス）
        </p>

        <p className="text-xs text-slate-400 mt-4 leading-relaxed">
          潜伏規則（色・形・個数・模様）の<br />
          接続キーを見極めて、再度挑戦しよう！
        </p>

        {/* ボタン一覧 */}
        <div className="flex flex-col gap-2.5 w-full mt-6">
          <button
            onClick={reset}
            className="w-full py-3.5 rounded-2xl font-black text-sm text-white bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 transition shadow-[0_0_15px_rgba(244,63,94,0.4)] flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            もう一度挑戦する
          </button>

          <button
            onClick={() => {
              reset();
              onOpenStageSelect();
            }}
            className="w-full py-3 rounded-2xl font-bold text-xs text-slate-300 bg-slate-800/80 hover:bg-slate-700 hover:text-white border border-slate-700/80 transition flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
          >
            <Layers className="w-4 h-4 text-cyan-400" />
            ステージを選び直す
          </button>
        </div>
      </div>
    </div>
  );
};
