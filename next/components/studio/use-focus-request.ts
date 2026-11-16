'use client';

import { useCallback, useEffect, useRef } from 'react';

export function useFocusRequest(): (fid: string) => void {
  const pending = useRef<string | null>(null);
  useEffect(() => {
    const fid = pending.current;
    if (!fid) return;
    pending.current = null;
    const el = document.querySelector<HTMLElement>(`[data-fid="${fid}"]`);
    el?.focus();
  });
  return useCallback((fid: string) => {
    pending.current = fid;
  }, []);
}
