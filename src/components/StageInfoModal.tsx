'use client';

import React from 'react';
import { useGameStore } from '@/store/useGameStore';
import { X, Info, Compass, Sparkles } from 'lucide-react';

interface StageInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StageInfoModal: React.FC<StageInfoModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { currentStage } = useGameStore();

  if (!isOpen) return null;

  const hasShifters = currentStage.shiftRules && currentStage.shiftRules.length > 0;
  const isDaily = currentStage.id >= 1000;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-3xl bg-slate-900 border-2 border-cyan-500/50 shadow-[0_0_30px_rgba(6,182,212,0.25)] p-6 flex flex-col gap-4 text-left max-h-[85vh] overflow-y-auto"
      >
        {/* ヘッダー */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-300">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400">
                {isDaily ? 'Daily Challenge' : 'ステージ詳細'}
              </span>
              <h2 className="text-base sm:text-lg font-black text-white leading-tight">
                {currentStage.title}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition shrink-0"
            aria-label="閉じる"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* メタ情報バッジ */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs px-2.5 py-1 rounded-lg font-mono font-bold bg-slate-800 text-slate-200 border border-slate-700">
            盤面: {currentStage.size}×{currentStage.size}
          </span>
          {currentStage.isScrollable && (
            <span className="text-xs px-2.5 py-1 rounded-lg font-bold bg-amber-950/80 text-amber-300 border border-amber-500/30">
              ファインダー探索
            </span>
          )}
          {hasShifters && (
            <span className="text-xs px-2.5 py-1 rounded-lg font-bold bg-purple-950/80 text-purple-300 border border-purple-500/40 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>🌀 相転移シフターあり</span>
            </span>
          )}
        </div>

        {/* ステージ特徴・説明文 */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-cyan-500/30 flex flex-col gap-2">
          <div className="flex items-center gap-1.5 text-xs font-black text-cyan-300">
            <Info className="w-4 h-4" />
            <span>ステージの特徴・ミッション</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed break-words font-medium">
            {currentStage.description}
          </p>
        </div>

        {/* プレイのヒント */}
        <div className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700/60 text-xs text-slate-300 flex flex-col gap-1.5 leading-relaxed">
          <div className="font-bold text-slate-200">💡 攻略のポイント</div>
          <ul className="list-disc list-inside space-y-1 text-slate-400">
            <li>色・形状・個数・模様のいずれか、または2つの組み合わせが一致する道を探してください。</li>
            {hasShifters && (
              <li>盤上の「🌀 渦巻きマス」を踏むと接続ルールが別の属性へと相転移します。</li>
            )}
            <li>手詰まりになったときは「1手戻す」で分岐点まで戻って別のルートを試せます。</li>
          </ul>
        </div>

        {/* 閉じるボタン */}
        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-black text-xs sm:text-sm transition shadow-lg active:scale-95"
        >
          閉じてプレイに戻る
        </button>
      </div>
    </div>
  );
};
