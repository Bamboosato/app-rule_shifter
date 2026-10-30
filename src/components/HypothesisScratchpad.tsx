'use client';

import React from 'react';
import { useGameStore } from '@/store/useGameStore';
import { DimensionType } from '@/types/game';
import { getActiveDimensionsForRule } from '@/lib/ruleEngine';

interface AttributeConfig {
  dim: DimensionType;
  label: string;
  icon: string;
}

const ATTRIBUTES: AttributeConfig[] = [
  { dim: 'color', label: '色', icon: '🎨' },
  { dim: 'shape', label: '形', icon: '🔷' },
  { dim: 'count', label: '数', icon: '🔢' },
  { dim: 'texture', label: '模様', icon: '▦' },
];

/**
 * 正解属性ガイドバー
 * 設定で「正解属性ガイド」がONの時のみ表示され、現在の有効ルール属性を ● で常時点灯ガイド
 */
export const HypothesisScratchpad: React.FC = () => {
  const { activeRule, settings } = useGameStore();

  // 設定でOFFの場合は非表示
  if (!settings.showAttributeGuide) {
    return null;
  }

  const activeDims = getActiveDimensionsForRule(activeRule);

  return (
    <div className="w-full max-w-md mx-auto px-4 select-none animate-fade-in">
      <div className="w-full h-11 px-2.5 flex items-center justify-between gap-1.5 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-md">
        <span className="text-[10px] text-amber-400/90 font-black tracking-wider shrink-0 px-1">
          GUIDE
        </span>
        <div className="flex-1 flex items-center justify-between gap-1">
          {ATTRIBUTES.map((attr) => {
            const isActive = activeDims.includes(attr.dim);

            return (
              <div
                key={attr.dim}
                className={`flex-1 h-8 px-1.5 rounded-xl border flex items-center justify-center gap-1.5 transition-all duration-200 ${
                  isActive
                    ? 'bg-emerald-950/70 border-emerald-500/70 shadow-[0_0_10px_rgba(16,185,129,0.35)]'
                    : 'bg-slate-950/40 border-slate-800/60 opacity-40'
                }`}
                title={`${attr.label}: ${isActive ? '現在の一致ルール属性' : '不一致'}`}
              >
                <span className="text-xs shrink-0">{attr.icon}</span>
                <span
                  className={`text-xs font-black ${
                    isActive ? 'text-emerald-200' : 'text-slate-400'
                  }`}
                >
                  {attr.label}
                </span>
                <span
                  className={`w-3.5 h-3.5 flex items-center justify-center text-xs font-black shrink-0 ${
                    isActive
                      ? 'text-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.9)] animate-pulse'
                      : 'text-slate-600'
                  }`}
                >
                  {isActive ? '●' : '○'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
