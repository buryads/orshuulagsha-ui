import type { CSSProperties } from 'react';

export interface SoyomboProps {
  size?: number;
  color?: string;
  className?: string;
}

export function Soyombo({ size = 28, color = 'currentColor', className }: SoyomboProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={className}
    >
      <g
        stroke={color}
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* пламя */}
        <path d="M32 4 c-2 4 -2 8 0 12 c2 -4 2 -8 0 -12 z" fill={color} />
        <path d="M28 6 c-1 3 -1 7 0 10" />
        <path d="M36 6 c1 3 1 7 0 10" />
        {/* солнце */}
        <circle cx="32" cy="22" r="3" fill={color} />
        {/* луна */}
        <path d="M22 22 a4 4 0 1 0 4 4 a3 3 0 0 1 -4 -4 z" fill={color} />
        {/* стрелки */}
        <path d="M14 30 l4 4 l-4 4 z" fill={color} />
        <path d="M50 30 l-4 4 l4 4 z" fill={color} />
        {/* инь-ян */}
        <circle cx="32" cy="38" r="6" />
        <path d="M32 32 a3 3 0 0 1 0 6 a3 3 0 0 0 0 6 a6 6 0 0 1 0 -12 z" fill={color} />
        {/* столбцы */}
        <rect x="10" y="48" width="3" height="12" fill={color} />
        <rect x="51" y="48" width="3" height="12" fill={color} />
        {/* ромбы */}
        <path d="M32 50 l4 4 l-4 4 l-4 -4 z" fill={color} />
      </g>
    </svg>
  );
}

export interface SoyomboBorderProps {
  className?: string;
  style?: CSSProperties;
}

export function SoyomboBorder({ className = '', style }: SoyomboBorderProps) {
  return (
    <svg
      className={className}
      style={style}
      viewBox="0 0 200 40"
      fill="none"
      preserveAspectRatio="xMidYMid meet"
    >
      <g stroke="currentColor" strokeWidth="1.4" fill="none">
        {/* меандр */}
        <path d="M2 20 h10 v-10 h10 v10 h10 v-10 h10 v10 h10 v-10 h10 v10 h10 v-10 h10 v10 h10 v-10 h10 v10 h10 v-10 h10 v10 h10 v-10 h10 v10 h10 v-10 h10 v10 h6" />
      </g>
    </svg>
  );
}
