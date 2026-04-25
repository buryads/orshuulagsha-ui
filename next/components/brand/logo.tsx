'use client';

export interface LogoProps {
  size?: number;
  onClick?: () => void;
}

export function Logo({ size = 56, onClick }: LogoProps) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        cursor: onClick ? 'pointer' : 'inherit',
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/logo-256.png"
        srcSet="/images/logo-128.png 1x, /images/logo-256.png 2x, /images/logo-512.png 4x"
        alt="Buryads"
        width={size}
        height={size}
        style={{
          width: size,
          height: size,
          display: 'block',
          objectFit: 'cover',
          borderRadius: Math.round(size * 0.22),
        }}
      />
    </div>
  );
}
