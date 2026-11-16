'use client';

import { useEffect, useRef, useState, type ReactElement } from 'react';
import { confettiPalette, type ConfettiPalette } from '@/lib/studio/flow-easter';

export interface Burst {
  id: number;
  palette: ConfettiPalette;
  big: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rot: number;
  vr: number;
  color: string;
}

const DURATION_MS = 1100;

function runConfetti(canvas: HTMLCanvasElement, burst: Burst): () => void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return () => undefined;
  const dpr = window.devicePixelRatio || 1;
  const w = window.innerWidth;
  const h = window.innerHeight;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  ctx.scale(dpr, dpr);
  const colors = confettiPalette(burst.palette);
  const count = burst.big ? 180 : 36;
  const particles: Particle[] = Array.from({ length: count }, (_, i) => {
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * (burst.big ? 2.8 : 1.6);
    const speed = (burst.big ? 11 : 8) * (0.5 + Math.random());
    return {
      x: w / 2,
      y: h * 0.55,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: 5 + Math.random() * 6,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.4,
      color: colors[i % colors.length] ?? '#0066B3',
    };
  });
  const begin = performance.now();
  let raf = 0;
  const frame = (now: number) => {
    const t = now - begin;
    ctx.clearRect(0, 0, w, h);
    if (t >= DURATION_MS) return;
    ctx.globalAlpha = Math.min(1, (DURATION_MS - t) / 400);
    for (const p of particles) {
      p.vy += 0.32;
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.99;
      p.rot += p.vr;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.strokeStyle = 'rgba(0,46,84,0.25)';
      ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      ctx.strokeRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      ctx.restore();
    }
    raf = requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);
  return () => {
    cancelAnimationFrame(raf);
    ctx.clearRect(0, 0, w, h);
  };
}

export function Celebration({
  burst,
  reducedMotion,
}: {
  burst: Burst | null;
  reducedMotion: boolean;
}): ReactElement | null {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [checkId, setCheckId] = useState<number | null>(null);

  useEffect(() => {
    if (!burst) return;
    setCheckId(burst.id);
    const hide = window.setTimeout(() => setCheckId(null), 700);
    const stop =
      !reducedMotion && canvasRef.current ? runConfetti(canvasRef.current, burst) : undefined;
    return () => {
      window.clearTimeout(hide);
      stop?.();
    };
  }, [burst, reducedMotion]);

  return (
    <div
      aria-hidden
      style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 60 }}
      data-testid="celebration"
    >
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
      {checkId !== null && (
        <div
          key={checkId}
          className="flow-check"
          style={{
            position: 'absolute',
            left: '50%',
            top: '42%',
            width: 96,
            height: 96,
            marginLeft: -48,
            borderRadius: '50%',
            background: 'var(--accent-green)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          <svg
            width="56"
            height="56"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
        </div>
      )}
    </div>
  );
}

export function Banner({ text, big }: { text: string; big?: boolean }): ReactElement {
  return (
    <div
      aria-live="polite"
      className={big ? 'flow-big' : 'flow-banner'}
      data-testid={big ? 'flow-banner-108' : 'flow-banner'}
      style={{
        position: 'fixed',
        left: '50%',
        top: '30%',
        transform: 'translateX(-50%)',
        zIndex: 61,
        pointerEvents: 'none',
        padding: big ? '18px 32px' : '14px 26px',
        borderRadius: 20,
        background: 'var(--surface)',
        boxShadow: 'var(--shadow-lg)',
        fontFamily: 'var(--font-display)',
        fontWeight: 800,
        fontSize: big ? 'clamp(26px, 6vw, 44px)' : 'clamp(24px, 5vw, 34px)',
        color: 'var(--primary-700)',
        textAlign: 'center',
        maxWidth: '90vw',
      }}
    >
      {text}
    </div>
  );
}
