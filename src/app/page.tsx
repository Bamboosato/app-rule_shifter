'use client';

import React, { useState, useEffect } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { Header } from '@/components/Header';
import { GameBoard } from '@/components/GameBoard';
import { HypothesisScratchpad } from '@/components/HypothesisScratchpad';
import { MiniDotHud } from '@/components/MiniDotHud';
import { DeadEndToast } from '@/components/DeadEndToast';
import { ClearModal } from '@/components/ClearModal';
import { GameOverModal } from '@/components/GameOverModal';
import { SettingsModal } from '@/components/SettingsModal';
import { StageSelectModal } from '@/components/StageSelectModal';
import { StageInfoModal } from '@/components/StageInfoModal';
import { StageInfoBanner } from '@/components/StageInfoBanner';
import { HowToModal } from '@/components/HowToModal';
import { useKeyboardControls } from '@/hooks/useKeyboardControls';
import { HelpCircle } from 'lucide-react';

export default function Home() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isStageSelectOpen, setIsStageSelectOpen] = useState(false);
  const [isStageInfoOpen, setIsStageInfoOpen] = useState(false);
  const [showHowTo, setShowHowTo] = useState(false);

  const { tickTimer, isCleared, isGameOver, initStage } = useGameStore();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const stg = params.get('stage');
    if (stg !== null) {
      initStage(parseInt(stg, 10));
    }
  }, [initStage]);

  useKeyboardControls();

  useEffect(() => {
    if (isCleared || isGameOver) return;
    const interval = setInterval(() => {
      tickTimer();
    }, 1000);
    return () => clearInterval(interval);
  }, [isCleared, isGameOver, tickTimer]);

  return (
    <main className="w-full min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between py-2 px-2 sm:px-4 max-w-lg mx-auto">
      {/* 上部ヘッダー（盤面上部3段構成: 1段目=Header上段, 2段目=Header中段, 3段目=StageInfoBanner） */}
      <div className="flex flex-col gap-1 w-full">
        <Header
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenStageSelect={() => setIsStageSelectOpen(true)}
        />
        <StageInfoBanner onOpenStageInfoModal={() => setIsStageInfoOpen(true)} />
      </div>

      {/* 中央メイン盤面 ＆ 推理HUD */}
      <div className="flex-1 flex flex-col items-center justify-center my-auto w-full gap-2">
        <GameBoard />
        <HypothesisScratchpad />
        <MiniDotHud />
        <DeadEndToast />
      </div>

      {/* 下部フッター ＆ ヒント案内（stroop-route統一UI） */}
      <footer className="w-full max-w-md mx-auto px-4 py-1 flex flex-col items-center gap-1.5 text-center">
        <button
          onClick={() => setShowHowTo(true)}
          className="text-xs text-slate-400 hover:text-cyan-400 flex items-center gap-1 transition active:scale-95 py-1 px-2.5 rounded-full hover:bg-slate-900 cursor-pointer"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>遊び方・ルールのヒント</span>
        </button>

        <div className="text-[10px] text-slate-600">
          Rule Shifter - Cognitive Flexibility Puzzle
        </div>
      </footer>

      {/* モーダル群 */}
      <ClearModal />
      <GameOverModal onOpenStageSelect={() => setIsStageSelectOpen(true)} />
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
      <StageSelectModal
        isOpen={isStageSelectOpen}
        onClose={() => setIsStageSelectOpen(false)}
      />
      <StageInfoModal
        isOpen={isStageInfoOpen}
        onClose={() => setIsStageInfoOpen(false)}
      />
      <HowToModal
        isOpen={showHowTo}
        onClose={() => setShowHowTo(false)}
      />
    </main>
  );
}
