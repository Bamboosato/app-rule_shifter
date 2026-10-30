'use client';

import React from 'react';
import { useGameStore } from '@/store/useGameStore';
import { Info, BookOpen } from 'lucide-react';

interface StageInfoBannerProps {
  onOpenStageInfoModal: () => void;
}

export const StageInfoBanner: React.FC<StageInfoBannerProps> = ({
  onOpenStageInfoModal,
}) => {
  const { currentStage } = useGameStore();

  return (
    <div className="w-full max-w-md mx-auto px-4 py-1 select-none">
      <button
        onClick={onOpenStageInfoModal}
        className="w-full min-h-[46px] sm:min-h-[50px] px-4 py-2 rounded-2xl border border-cyan-500/50 bg-gradient-to-r from-slate-900/95 via-cyan-950/80 to-slate-900/95 hover:border-cyan-400 hover:shadow-[0_0_16px_rgba(6,182,212,0.3)] transition-all flex items-center justify-between gap-3 text-left shadow-md active:scale-[0.99] cursor-pointer group"
        title="タップしてステージの特徴・攻略ヒントをポップアップで表示"
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <Info className="w-5 h-5 text-cyan-400 shrink-0 group-hover:scale-110 transition-transform" />
          <span className="text-base sm:text-lg font-black text-white tracking-tight truncate group-hover:text-cyan-200">
            {currentStage.title}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs sm:text-sm font-black text-cyan-300 group-hover:text-cyan-100 bg-cyan-950/90 hover:bg-cyan-900/90 px-3 py-1.5 rounded-xl border border-cyan-400/50 shrink-0 shadow-sm transition-colors">
          <BookOpen className="w-4 h-4 text-cyan-400" />
          <span>詳細</span>
        </div>
      </button>
    </div>
  );
};
