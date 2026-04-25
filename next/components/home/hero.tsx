import type { ReactElement, ReactNode } from 'react';
import { getTranslations } from 'next-intl/server';

export interface HeroProps {
  children?: ReactNode;
}

export async function Hero({ children }: HeroProps): Promise<ReactElement> {
  const t = await getTranslations('home.hero');

  return (
    <section
      style={{
        padding: '60px clamp(16px, 4vw, 28px) 40px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* decorative gradients */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse 60% 50% at 50% 0%, var(--primary-50) 0%, transparent 60%)',
          pointerEvents: 'none',
        }}
      />
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: 80,
          left: -40,
          width: 240,
          height: 240,
          borderRadius: '50%',
          background: 'var(--accent-warm-soft)',
          filter: 'blur(60px)',
          opacity: 0.5,
          pointerEvents: 'none',
        }}
      />
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: 40,
          right: -40,
          width: 280,
          height: 280,
          borderRadius: '50%',
          background: 'var(--primary-100)',
          filter: 'blur(70px)',
          opacity: 0.7,
          pointerEvents: 'none',
        }}
      />

      <div className="container" style={{ position: 'relative' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div className="chip" style={{ marginBottom: 18 }}>
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: 'var(--accent-green)',
              }}
            />
            {t('statusChip')}
          </div>
          <div className="fade-up">
            <h1
              className="font-display"
              style={{
                fontWeight: 800,
                lineHeight: 0.95,
                marginBottom: 16,
                letterSpacing: '-0.045em',
                color: 'var(--text)',
                fontSize: 'clamp(48px, 9vw, 92px)',
              }}
            >
              {t('titleBur')}
              <br />
              <span style={{ color: 'var(--primary)' }}>{t('titleForAll')}</span>
              <span style={{ color: 'var(--accent-warm)' }}> {t('titleForever')}</span>
            </h1>
          </div>
          <p
            style={{
              fontSize: 18,
              color: 'var(--text-muted)',
              maxWidth: 600,
              margin: '0 auto',
              lineHeight: 1.5,
            }}
          >
            {t('subtitle')}
          </p>
        </div>
        {children}
      </div>
    </section>
  );
}
