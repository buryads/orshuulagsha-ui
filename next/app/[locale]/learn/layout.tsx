import { notFound } from 'next/navigation';
import type { ReactElement, ReactNode } from 'react';
import { LearnSubnav } from '@/components/learn/learn-subnav';
import { LEARN_ENABLED } from '@/lib/learn-enabled';

interface LearnLayoutProps {
  children: ReactNode;
}

export default function LearnLayout({ children }: LearnLayoutProps): ReactElement {
  if (!LEARN_ENABLED) notFound();

  return (
    <>
      <LearnSubnav />
      {children}
      <div
        className="show-sm-flex"
        style={{ height: 'calc(56px + env(safe-area-inset-bottom))', flexShrink: 0 }}
        aria-hidden
      />
    </>
  );
}
