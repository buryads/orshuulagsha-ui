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
    </>
  );
}
