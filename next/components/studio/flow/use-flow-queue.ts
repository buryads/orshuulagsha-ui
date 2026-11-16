'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getFlowNext,
  isNotReady,
  skipFlowItem,
  type FlowMode,
  type ReviewItem,
  type VoiceItem,
} from '@/lib/api/studio-flow';

export type QueueStatus = 'loading' | 'ready' | 'empty' | 'error' | 'notReady';

export interface QueueState<T> {
  status: QueueStatus;
  item: T | null;
  remaining: number;
  fromSkipped: boolean;
}

type ItemOf<M extends FlowMode> = M extends 'voice' ? VoiceItem : ReviewItem;

const MAX_GUARD_SKIPS = 3;

export function useFlowQueue<M extends FlowMode>(mode: M, blocked: ReadonlySet<string>) {
  const [state, setState] = useState<QueueState<ItemOf<M>>>({
    status: 'loading',
    item: null,
    remaining: 0,
    fromSkipped: false,
  });
  const seq = useRef(0);
  const blockedRef = useRef(blocked);
  blockedRef.current = blocked;

  const fetchNext = useCallback(async () => {
    const mine = ++seq.current;
    setState((s) => ({ ...s, status: 'loading', item: null }));
    try {
      let res = (await getFlowNext(mode as never)) as { item: ItemOf<M> | null; remaining: number; fromSkipped: boolean };
      for (let i = 0; i < MAX_GUARD_SKIPS && res.item && blockedRef.current.has(res.item.item_key); i++) {
        await skipFlowItem(mode, res.item.item_key).catch(() => undefined);
        res = (await getFlowNext(mode as never)) as typeof res;
      }
      if (mine !== seq.current) return;
      setState({
        status: res.item ? 'ready' : 'empty',
        item: res.item,
        remaining: res.remaining,
        fromSkipped: res.fromSkipped,
      });
    } catch (err) {
      if (mine !== seq.current) return;
      setState({ status: isNotReady(err) ? 'notReady' : 'error', item: null, remaining: 0, fromSkipped: false });
    }
  }, [mode]);

  const advance = useCallback(
    async (before?: () => Promise<unknown>) => {
      if (before) await before().catch(() => undefined);
      await fetchNext();
    },
    [fetchNext],
  );

  const invalidate = useCallback(() => {
    seq.current++;
  }, []);

  useEffect(() => {
    void fetchNext();
    return invalidate;
  }, [fetchNext, invalidate]);

  return { state, advance, reload: fetchNext };
}
