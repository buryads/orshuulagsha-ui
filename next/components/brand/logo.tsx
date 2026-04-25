'use client';

export interface LogoProps {
  size?: number;
  onClick?: () => void;
}

export function Logo({ size = 28, onClick }: LogoProps) {
  return (
    <div
      onClick={onClick}
      style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: onClick ? 'pointer' : 'inherit' }}
    >
      <div
        style={{
          width: size + 8,
          height: size + 8,
          background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-soft) 100%)',
          borderRadius: 10,
          display: 'grid',
          placeItems: 'center',
          boxShadow: 'var(--shadow-glow)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <svg width={size - 4} height={size - 4} viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="16" r="14" stroke="white" strokeWidth="1.5" opacity="0.3" />
          <path d="M16 6 L18 14 L26 16 L18 18 L16 26 L14 18 L6 16 L14 14 Z" fill="white" />
          <circle cx="16" cy="16" r="2.5" fill="var(--primary)" />
        </svg>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: 17,
            letterSpacing: '-0.02em',
            color: 'var(--text)',
          }}
        >
          Буряад
        </span>
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 500,
            fontSize: 11,
            color: 'var(--text-muted)',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
          }}
        >
          Portal
        </span>
      </div>
    </div>
  );
}
