import React, { useId } from 'react';
import { ColorId, CountId, ShapeId, TextureId } from '@/types/game';
import { COLOR_DEFS } from '@/lib/constants';

interface TokenSvgProps {
  color: ColorId;
  shape: ShapeId;
  count: CountId;
  texture: TextureId;
  className?: string;
}

export const TokenSvg: React.FC<TokenSvgProps> = ({
  color,
  shape,
  count,
  texture,
  className = '',
}) => {
  const uniqueId = useId().replace(/:/g, '');
  const colorDef = COLOR_DEFS[color];
  const strokeColor = colorDef.hex;

  // 個数に応じたシンボル位置・半径・パターンスケール（LOD）
  let positions: Array<{ cx: number; cy: number; r: number }> = [];
  let patternScale = 6;
  let strokeWidth = 2.5;

  switch (count) {
    case 1:
      positions = [{ cx: 50, cy: 50, r: 24 }];
      patternScale = 6;
      strokeWidth = 3;
      break;
    case 2:
      positions = [
        { cx: 27, cy: 50, r: 16 },
        { cx: 73, cy: 50, r: 16 },
      ];
      patternScale = 7;
      strokeWidth = 2.5;
      break;
    case 3:
      positions = [
        { cx: 50, cy: 28, r: 14 },
        { cx: 28, cy: 72, r: 14 },
        { cx: 72, cy: 72, r: 14 },
      ];
      patternScale = 8;
      strokeWidth = 2.5;
      break;
    case 4:
      positions = [
        { cx: 30, cy: 30, r: 12 },
        { cx: 70, cy: 30, r: 12 },
        { cx: 30, cy: 70, r: 12 },
        { cx: 70, cy: 70, r: 12 },
      ];
      patternScale = 9;
      strokeWidth = 2.2;
      break;
  }

  const patternId = `pat-${texture}-${uniqueId}`;

  // 各形状に応じたSVGパス生成
  const renderShape = (cx: number, cy: number, r: number, key: number) => {
    const fillUrl = texture === 'SOLID' ? strokeColor : `url(#${patternId})`;

    switch (shape) {
      case 'CIRCLE':
        return (
          <circle
            key={key}
            cx={cx}
            cy={cy}
            r={r}
            fill={fillUrl}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
        );

      case 'SQUARE': {
        const side = r * 1.7;
        const half = side / 2;
        return (
          <rect
            key={key}
            x={cx - half}
            y={cy - half}
            width={side}
            height={side}
            rx={side * 0.15}
            fill={fillUrl}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
        );
      }

      case 'TRIANGLE': {
        // 正三角形
        const h = r * 1.8;
        const topY = cy - (h * 2) / 3;
        const botY = cy + h / 3;
        const halfW = (h / Math.sqrt(3)) * 1.1;
        const points = `${cx},${topY} ${cx - halfW},${botY} ${cx + halfW},${botY}`;
        return (
          <polygon
            key={key}
            points={points}
            strokeLinejoin="round"
            fill={fillUrl}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
        );
      }

      case 'DIAMOND': {
        const w = r * 1.4;
        const h = r * 1.8;
        const points = `${cx},${cy - h} ${cx + w},${cy} ${cx},${cy + h} ${cx - w},${cy}`;
        return (
          <polygon
            key={key}
            points={points}
            strokeLinejoin="round"
            fill={fillUrl}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
        );
      }
    }
  };

  return (
    <svg
      viewBox="0 0 100 100"
      className={`w-full h-full pointer-events-none select-none drop-shadow-[0_0_8px_${colorDef.glow}] ${className}`}
    >
      <defs>
        {texture === 'STRIPE' && (
          <pattern
            id={patternId}
            width={patternScale}
            height={patternScale}
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            <line
              x1="0"
              y1="0"
              x2="0"
              y2={patternScale}
              stroke={strokeColor}
              strokeWidth={count === 4 ? 3 : 2}
            />
          </pattern>
        )}

        {texture === 'DOTS' && (
          <pattern
            id={patternId}
            width={patternScale}
            height={patternScale}
            patternUnits="userSpaceOnUse"
          >
            <circle
              cx={patternScale / 2}
              cy={patternScale / 2}
              r={patternScale * 0.22}
              fill={strokeColor}
            />
          </pattern>
        )}

        {texture === 'GRID' && (
          <pattern
            id={patternId}
            width={patternScale}
            height={patternScale}
            patternUnits="userSpaceOnUse"
          >
            <path
              d={`M ${patternScale} 0 L 0 0 0 ${patternScale}`}
              fill="none"
              stroke={strokeColor}
              strokeWidth="1.2"
            />
          </pattern>
        )}
      </defs>

      {positions.map((pos, idx) => renderShape(pos.cx, pos.cy, pos.r, idx))}
    </svg>
  );
};
