'use client';

import { useCallback, useEffect, useState } from 'react';
import { getCurrentEvent, type MarathonEvent } from '@/lib/api/events';

export type EventLoad =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; event: MarathonEvent | null };

export function useCurrentEvent(): EventLoad & { reload: () => void } {
  const [load, setLoad] = useState<EventLoad>({ status: 'loading' });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let alive = true;
    getCurrentEvent()
      .then((event) => alive && setLoad({ status: 'ready', event }))
      .catch(() => alive && setLoad((prev) => (prev.status === 'ready' ? prev : { status: 'error' })));
    return () => {
      alive = false;
    };
  }, [tick]);

  const reload = useCallback(() => setTick((n) => n + 1), []);
  return { ...load, reload };
}
