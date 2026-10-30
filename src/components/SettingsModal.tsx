'use client';

import React from 'react';
import { useGameStore } from '@/store/useGameStore';
import { X, Volume2, VolumeX, Eye, Sparkles } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { settings, updateSettings } = useGameStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-sm rounded-3xl bg-slate-900 border-2 border-slate-700 shadow-2xl p-6 flex flex-col gap-5 text-left">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-white">設定</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {/* CUDモード (カラーユニバーサルデザイン) */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center gap-2.5">
              <Eye className="w-5 h-5 text-cyan-400" />
              <div>
                <div className="text-sm font-black text-slate-100">CUDモード</div>
                <div className="text-[11px] text-slate-400">
                  色名略号 (C/A/E/M) をセルに表示
                </div>
              </div>
            </div>
            <button
              onClick={() => updateSettings({ isCudMode: !settings.isCudMode })}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                settings.isCudMode ? 'bg-cyan-500' : 'bg-slate-700'
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  settings.isCudMode ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* 正解属性ガイド (アシスト表示) */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <div>
                <div className="text-sm font-black text-slate-100">正解属性ガイド</div>
                <div className="text-[11px] text-slate-400">
                  現在の正解属性を ● で常時ガイド表示
                </div>
              </div>
            </div>
            <button
              onClick={() =>
                updateSettings({ showAttributeGuide: !settings.showAttributeGuide })
              }
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                settings.showAttributeGuide ? 'bg-amber-500' : 'bg-slate-700'
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  settings.showAttributeGuide ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* サウンドミュート */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center gap-2.5">
              {settings.isMuted ? (
                <VolumeX className="w-5 h-5 text-rose-400" />
              ) : (
                <Volume2 className="w-5 h-5 text-cyan-400" />
              )}
              <div>
                <div className="text-sm font-black text-slate-100">効果音 (Web Audio)</div>
                <div className="text-[11px] text-slate-400">プロシージャルシンセ音</div>
              </div>
            </div>
            <button
              onClick={() => updateSettings({ isMuted: !settings.isMuted })}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                !settings.isMuted ? 'bg-cyan-500' : 'bg-slate-700'
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  !settings.isMuted ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
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
