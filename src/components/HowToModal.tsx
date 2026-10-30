'use client';

import React from 'react';
import {
  X,
  HelpCircle,
  Lightbulb,
  RefreshCw,
  Brain,
  Layers,
  MousePointerClick,
  Heart,
} from 'lucide-react';

interface HowToModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowToModal: React.FC<HowToModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-3xl bg-slate-900 border-2 border-slate-700 shadow-2xl p-6 flex flex-col gap-4 text-left max-h-[85vh] overflow-y-auto"
      >
        {/* ヘッダー */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-300">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400">
                Hints & Rules
              </span>
              <h2 className="text-base sm:text-lg font-black text-white leading-tight">
                ヒント・基本ルール
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

        <div className="flex flex-col gap-3 text-xs text-slate-300 leading-relaxed">
          {/* 1. 潜伏ルールの推理 */}
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col gap-1.5">
            <div className="font-black text-cyan-300 flex items-center gap-1.5 text-sm">
              <Lightbulb className="w-4 h-4 text-cyan-400" />
              <span>1. 潜伏ルールを推理せよ</span>
            </div>
            <p className="text-slate-300">
              各ステージの移動規則は画面に表示されません。隣接マスを踏んだときの判定（Pass / Reject）から、現在どの属性が接続キーになっているかを推論してゴールを目指します。
            </p>
          </div>

          {/* 2. 同一性マッチ ＆ 複数属性同時一致 */}
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col gap-1.5">
            <div className="font-black text-emerald-300 flex items-center gap-1.5 text-sm">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>2. 4大属性と複数属性同時一致</span>
            </div>
            <p className="text-slate-300">
              すべての規則は「色」「形」「個数」「模様」の4大属性の**同一性マッチ**で構成されています。
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-400 text-[11px] pl-1">
              <li><strong className="text-slate-200">単一一致</strong>: 「同じ色」や「同じ形状」のマスだけが進路</li>
              <li><strong className="text-slate-200">複数属性同時一致</strong>: 上級ステージ（Stage 6〜8）では「色 ＆ 形状」など、<strong>2つの属性が同時に一致するマスだけが進路</strong>となる複合ルールが登場します</li>
            </ul>
          </div>

          {/* 3. 相転移 */}
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col gap-1.5">
            <div className="font-black text-purple-300 flex items-center gap-1.5 text-sm">
              <RefreshCw className="w-4 h-4 text-purple-400" />
              <span>3. 渦巻きマス（🌀）で相転移！</span>
            </div>
            <p className="text-slate-300">
              盤上の渦巻きマス（🌀）を踏むと、接続ルールが別の属性へと急変（相転移）します。直前まで有効だった旧ルールは通用しなくなるため、即座に思考の枠組みを切り替えて次のルールを見破りましょう。
            </p>
          </div>

          {/* 4. ライフ制と保続エラー */}
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col gap-1.5">
            <div className="font-black text-rose-300 flex items-center gap-1.5 text-sm">
              <Heart className="w-4 h-4 text-rose-400 fill-rose-500" />
              <span>4. ライフ制（3ミスでゲームセット）</span>
            </div>
            <p className="text-slate-300">
              画面上部の <strong className="text-rose-400">❤️ ライフ</strong> は初期値「3」です。ルールに合わないマスを踏むとライフが1つ減少し、0になるとゲームオーバーになります。
            </p>
            <div className="p-2.5 rounded-xl bg-purple-950/50 border border-purple-500/30 text-[11px] text-purple-200">
              <div className="font-bold flex items-center gap-1 mb-0.5 text-purple-300">
                <Brain className="w-3.5 h-3.5" />
                <span>保続エラー（Perseverative Error）とは？</span>
              </div>
              相転移の直後に「直前まで正しかった旧ルール」に囚われて間違えてしまうミスのことです。クリア時の「Flexibility Index（認知的柔軟性スコア）」では、この保続エラーの少なさが最重要で評価されます。
            </div>
          </div>

          {/* 5. 操作方法と補助機能 */}
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col gap-1.5 text-[11px]">
            <div className="font-black text-slate-100 flex items-center gap-1.5 text-xs">
              <MousePointerClick className="w-4 h-4 text-cyan-400" />
              <span>5. 操作方法と便利機能</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-400 pl-1">
              <li><strong className="text-slate-200">移動</strong>: 先端マスから上下左右の隣接マスをタップ（またはドラッグ）</li>
              <li><strong className="text-slate-200">自由な巻き戻し</strong>: 過去の通過セルをタップすると、その地点まで瞬時に巻き戻せます（ミスにはなりません）</li>
              <li><strong className="text-slate-200">視界スクロール</strong>: 5×5以上の広い迷宮は、盤面をドラッグ/スワイプして自由に視界を移動</li>
              <li><strong className="text-slate-200">仮説メモ</strong>: 画面下の属性ボタン（色・形・数・模様）をタップして推理の状況をメモ</li>
              <li><strong className="text-slate-200">ステージ詳細</strong>: 盤面直上の「詳細」ボタンから、各ステージ固有のミッションや攻略ヒントをいつでも確認可能</li>
            </ul>
          </div>
        </div>

        {/* 閉じるボタン */}
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
