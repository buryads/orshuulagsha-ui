'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Icon } from '@/components/ui/icon';

interface XpToastProps {
  /** Amount of XP to display. Pass null/0 to hide. */
  amount: number | null;
  /** Called after the toast finishes its animation so parent can clear state. */
  onDone: () => void;
}

/**
 * Micro-toast that floats up and fades out when XP is awarded.
 * Rendered inline — parent controls visibility via `amount`.
 */
export function XpToast({ amount, onDone }: XpToastProps) {
  const t = useTranslations('learn.hud');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!amount) return;
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
      // Give the CSS fade-out time to play before notifying parent.
      setTimeout(onDone, 300);
    }, 1500);
    return () => clearTimeout(timer);
  }, [amount, onDone]);

  if (!amount) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      style={{
        position: 'fixed',
        bottom: 88,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 200,
        pointerEvents: 'none',
        animation: visible
          ? 'fadeUp 0.3s ease both'
          : 'fadeDown 0.3s ease both forwards',
      }}
    >
      <span
        className="chip chip-warm"
        style={{
          fontSize: 15,
          fontWeight: 800,
          padding: '8px 18px',
          boxShadow: 'var(--shadow-md)',
          gap: 6,
        }}
      >
        <Icon name="zap" size={15} />
        {t('xpAwarded', { xp: amount })}
      </span>
    </div>
  );
}
