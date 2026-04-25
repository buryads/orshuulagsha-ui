import type { ReactNode } from 'react';

export interface AuthCardProps {
  children: ReactNode;
}

export function AuthCard({ children }: AuthCardProps) {
  return (
    <div
      style={{
        minHeight: 'calc(100vh - 64px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 16px',
        background:
          'radial-gradient(ellipse 70% 60% at 30% 0%, var(--primary-50) 0%, transparent 60%), radial-gradient(ellipse 50% 50% at 100% 100%, var(--accent-warm-soft) 0%, transparent 60%), var(--bg)',
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: 420,
          padding: 32,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          borderRadius: 'var(--r-xl)',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--border)',
          background: 'var(--surface)',
        }}
      >
        {children}
      </div>
    </div>
  );
}
