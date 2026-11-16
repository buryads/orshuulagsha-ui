import type { Metadata } from 'next';
import type { ReactElement, ReactNode } from 'react';
import { LearnSubnav } from '@/components/learn/learn-subnav';
import { LearnGate } from '@/components/learn/learn-gate';

export const metadata: Metadata = { robots: { index: false, follow: false } };

interface LearnLayoutProps {
  children: ReactNode;
}

export default function LearnLayout({ children }: LearnLayoutProps): ReactElement {
  return (
    <LearnGate>
      <LearnSubnav />
      {children}
      <div
        className="show-sm-flex"
        style={{ height: 'calc(56px + env(safe-area-inset-bottom))', flexShrink: 0 }}
        aria-hidden
      />
    </LearnGate>
  );
}
