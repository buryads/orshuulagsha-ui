import type { ReactElement, ReactNode } from 'react';
import { LearnSubnav } from '@/components/learn/learn-subnav';

interface LearnLayoutProps {
  children: ReactNode;
}

export default function LearnLayout({ children }: LearnLayoutProps): ReactElement {
  return (
    <>
      <LearnSubnav />
      {children}
      {/* Резервирует место под fixed bottom tab-bar на мобайле.
          show-sm-flex активен только на ≤720px (там же где bottom-tab-bar).
          Рендерится ПОСЛЕ контента, поэтому добавляет отступ снизу, а не сверху. */}
      <div
        className="show-sm-flex"
        style={{ height: 'calc(56px + env(safe-area-inset-bottom))', flexShrink: 0 }}
        aria-hidden
      />
    </>
  );
}
