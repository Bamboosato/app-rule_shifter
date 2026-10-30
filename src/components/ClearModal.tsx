'use client';

import React, { useEffect, useState } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { calculateFlexibilityIndex } from '@/lib/ruleEngine';
import confetti from 'canvas-confetti';
import { Trophy, Share2, Check, ArrowRight, RotateCcw, X, Brain, Heart } from 'lucide-react';

export const ClearModal: React.FC = () => {
  const {
    isCleared,
    currentStageIndex,
    currentStage,
    perseverativeErrors,
    generalErrors,
    totalRejects,
    lives,
    moveCount,
    timerSeconds,
    reset,
    nextStage,
  } = useGameStore();

  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isCleared) {
      setIsOpen(true);
      // 紙吹雪エフェクト
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // ignore
      }
    } else {
      setIsOpen(false);
    }
  }, [isCleared]);

  if (!isOpen || !isCleared) return null;

  const minSteps = currentStage.size * 2 - 1;
  const flexibilityScore = calculateFlexibilityIndex({
    perseverativeErrors,
    generalErrors,
    moveCount,
    minSteps,
  });

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const getEvaluation = (score: number) => {
    if (score >= 90) return { title: '極めて柔軟な前頭葉', desc: '過去の成功体験に囚われず、即座に思考の枠組みを切り替えました！', color: 'text-emerald-400' };
    if (score >= 75) return { title: '優れた適応力', desc: '相転移に迅速に適応し、高い認知的柔軟性を発揮しました。', color: 'text-cyan-400' };
    if (score >= 50) return { title: '粘り強い推理力', desc: '試行錯誤を重ねて潜伏ルールを看破しました。', color: 'text-amber-400' };
    return { title: '固執傾向あり（要トレーニング）', desc: '直前のルールに引っ張られる傾向が見られました。柔軟な脱却を意識しましょう！', color: 'text-rose-400' };
  };

  const evaluation = getEvaluation(flexibilityScore);

  const handleShare = () => {
    const text = `Rule Shifter (潜伏規則迷路)\n${currentStage.title}\nFlexibility Index: ${flexibilityScore}/100 (${evaluation.title})\n残りライフ: ❤️${lives}/3 (ミス: ${totalRejects}回) | 手数: ${moveCount}歩 (${formatTime(timerSeconds)})\n🟩🟩🌀🟧🟧★\n#RuleShifter #潜伏規則迷路 #脳トレ #WCST`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-sm rounded-3xl bg-slate-900 border-2 border-cyan-500/80 shadow-[0_0_32px_rgba(6,182,212,0.4)] p-6 flex flex-col items-center gap-4 text-center">
        {/* 閉じるボタン */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* トロフィーアイコン */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-emerald-400 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.6)]">
          <Trophy className="w-9 h-9 text-slate-950 fill-current" />
        </div>

        <div>
          <h2 className="text-xl font-black text-white">迷路脱出クリア！</h2>
          <p className="text-xs text-slate-400 mt-0.5">{currentStage.title}</p>
        </div>

        {/* 認知的柔軟性スコア (Flexibility Index) */}
        <div className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex flex-col items-center gap-1 shadow-inner">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold">
            <Brain className="w-4 h-4 text-purple-400" />
            <span>認知的柔軟性スコア (Flexibility Index)</span>
          </div>
          <div className="text-4xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400 tabular-nums my-1">
            {flexibilityScore}<span className="text-lg text-slate-400 font-normal"> / 100</span>
          </div>
          <div className={`text-sm font-black ${evaluation.color}`}>
            {evaluation.title}
          </div>
          <p className="text-[11px] text-slate-400 mt-1 leading-snug">
            {evaluation.desc}
          </p>
        </div>

        {/* 統計パラメータ */}
        <div className="grid grid-cols-3 gap-2 w-full text-left font-mono">
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
            <div className="text-[10px] text-slate-400">残りライフ</div>
            <div className="text-lg font-black text-rose-400 tabular-nums flex items-center gap-1">
              <Heart className="w-4 h-4 fill-rose-500 text-rose-500 shrink-0" />
              <span>{lives}/3</span>
            </div>
            {totalRejects > 0 && (
              <div className="text-[9px] text-slate-400 font-sans leading-none mt-0.5">
                (ミス: {totalRejects}回)
              </div>
            )}
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
            <div className="text-[10px] text-slate-400">移動歩数</div>
            <div className="text-lg font-black text-emerald-400 tabular-nums">
              {moveCount}
            </div>
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
            <div className="text-[10px] text-slate-400">所要時間</div>
            <div className="text-lg font-black text-cyan-400 tabular-nums">
              {formatTime(timerSeconds)}
            </div>
          </div>
        </div>

        {/* アクションボタン */}
        <div className="flex flex-col gap-2 w-full mt-1">
          <button
            onClick={handleShare}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-black text-xs flex items-center justify-center gap-2 border border-slate-700 transition active:scale-95 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>結果をクリップボードにコピーしました！</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" />
                <span>結果をSNSでシェアする</span>
              </>
            )}
          </button>

          <div className="flex gap-2 w-full">
            <button
              onClick={() => {
                reset();
                setIsOpen(false);
              }}
              className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-black text-xs flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>もう一度</span>
            </button>
            <button
              onClick={() => {
                nextStage();
                setIsOpen(false);
              }}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-cyan-500/30 transition active:scale-95 cursor-pointer"
            >
              <span>次のステージ</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
