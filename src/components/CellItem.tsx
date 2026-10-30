'use client';

import React from 'react';
import { Cell } from '@/types/game';
import { COLOR_DEFS } from '@/lib/constants';
import { TokenSvg } from './TokenSvg';
import { Flag, Star, RefreshCw } from 'lucide-react';

interface CellItemProps {
  cell: Cell;
  isTip: boolean;
  isVisited: boolean;
  isMistake?: boolean;
  isCudMode: boolean;
  onSelect: (cell: Cell) => void;
  gridSize?: number;
}

export const CellItem: React.FC<CellItemProps> = ({
  cell,
  isTip,
  isVisited,
  isMistake = false,
  isCudMode,
  onSelect,
}) => {
  const colorDef = COLOR_DEFS[cell.color];
  const labelSizeClass = 'text-[10px]';

  // セルの背景と枠線スタイル
  let bgStyle = 'bg-slate-900/60';
  let borderStyle = 'border-slate-800';

  if (cell.role === 'SHIFTER') {
    bgStyle =
      'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/50 via-slate-900/70 to-slate-950/80';
    borderStyle =
      'border-4 border-double border-purple-400 shadow-[0_0_12px_rgba(192,132,252,0.4)] animate-pulse';
  } else if (cell.role === 'START') {
    borderStyle = 'border-2 border-emerald-500/80 shadow-[0_0_10px_rgba(16,185,129,0.3)]';
  } else if (cell.role === 'GOAL') {
    borderStyle = 'border-2 border-amber-400/80 shadow-[0_0_12px_rgba(251,191,36,0.35)]';
  }

  // 訪問済み・先端（Tip）・ミス状態
  if (isMistake) {
    bgStyle = 'bg-rose-950/90';
    borderStyle =
      'border-2 border-rose-500 shadow-[0_0_18px_rgba(244,63,94,0.9)] animate-shake z-30 scale-[1.02]';
  } else if (isTip) {
    borderStyle =
      'border-2 border-cyan-400 shadow-[0_0_16px_rgba(34,211,238,0.7)] scale-[1.03] z-20';
  } else if (isVisited) {
    bgStyle = 'bg-slate-800/50';
    borderStyle = 'border-slate-700/80';
  }

  return (
    <div
      onClick={() => onSelect(cell)}
      className={`relative flex flex-col items-center justify-center rounded-2xl cursor-pointer select-none transition-all duration-150 active:scale-95 aspect-square border ${bgStyle} ${borderStyle} ${
        isVisited && !isTip ? 'opacity-85' : 'opacity-100'
      }`}
      style={{
        touchAction: 'none',
      }}
      data-r={cell.r}
      data-c={cell.c}
    >
      {/* セルバッジ（START / GOAL / SHIFTER） - z-10で常に前面 */}
      {cell.role === 'START' && (
        <span
          className={`absolute top-1 left-1.5 flex items-center gap-0.5 font-black uppercase tracking-tighter z-10 ${labelSizeClass}`}
        >
          <Flag className="w-2.5 h-2.5 text-white fill-current" />
          <span className="text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">START</span>
        </span>
      )}
      {cell.role === 'GOAL' && (
        <span
          className={`absolute top-1 right-1.5 flex items-center gap-0.5 font-black uppercase tracking-tighter z-10 ${labelSizeClass}`}
        >
          <Star className="w-2.5 h-2.5 text-white fill-current" />
          <span className="text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">GOAL</span>
        </span>
      )}
      {cell.role === 'SHIFTER' && (
        <span
          className={`absolute top-1 left-1.5 flex items-center gap-0.5 font-black tracking-tighter z-10 ${labelSizeClass}`}
        >
          <RefreshCw className="w-2.5 h-2.5 text-purple-300 animate-spin" style={{ animationDuration: '6s' }} />
          <span className="text-purple-200 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">転移</span>
        </span>
      )}

      {/* 4次元幾何学SVGトークン本体（中央エリアの約75%を占有） */}
      <div className="w-[76%] h-[76%] flex items-center justify-center relative z-0">
        <TokenSvg
          color={cell.color}
          shape={cell.shape}
          count={cell.count}
          texture={cell.texture}
        />
      </div>

      {/* CUDモード時の色識別バッジ */}
      {isCudMode && (
        <div className="absolute bottom-1 right-1.5 flex items-center gap-0.5 bg-black/80 backdrop-blur-sm px-1 py-0.2 rounded text-[8px] font-bold text-slate-200 border border-slate-700/60 z-10">
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: colorDef.hex }}
          />
          <span>{colorDef.cudShort}</span>
        </div>
      )}
    </div>
  );
};
