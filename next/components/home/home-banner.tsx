'use client';

import type { ReactElement } from 'react';
import { PomochBanner } from './pomoch-banner';
import { MarathonBanner } from './marathon-banner';
import { useCurrentEvent } from '@/components/marathon/use-current-event';

export function HomeBanner(): ReactElement | null {
  const load = useCurrentEvent();
  if (load.status === 'loading') return null;
  if (load.status === 'ready' && load.event) return <MarathonBanner event={load.event} />;
  return <PomochBanner />;
}
