'use client';

import { useCallback, useEffect, useRef, type Dispatch } from 'react';
import { uploadAudio } from '@/lib/api/studio';
import { mimeExtension } from '@/lib/studio/audio';
import type { SessionAction } from '@/lib/studio/flow-session';

export interface PendingUpload {
  id: string;
  text: string;
  blob: Blob;
  mime: string;
  durationMs: number;
}

export function useVoiceUploads(dispatch: Dispatch<SessionAction>, failedIds: string[]) {
  const store = useRef(new Map<string, PendingUpload>());

  const send = useCallback(
    (id: string) => {
      const entry = store.current.get(id);
      if (!entry) return;
      dispatch({ type: 'upload-start', id });
      uploadAudio({
        file: entry.blob,
        filename: `voice.${mimeExtension(entry.mime)}`,
        ownerType: 'text',
        ownerId: 0,
        text: entry.text,
        durationMs: entry.durationMs,
      })
        .then(() => {
          store.current.delete(id);
          dispatch({ type: 'upload-ok', id });
        })
        .catch(() => dispatch({ type: 'upload-fail', id }));
    },
    [dispatch],
  );

  const enqueue = useCallback(
    (entry: PendingUpload) => {
      store.current.set(entry.id, entry);
      send(entry.id);
    },
    [send],
  );

  const failedRef = useRef(failedIds);
  failedRef.current = failedIds;

  const retryFailed = useCallback(() => {
    failedRef.current.forEach(send);
  }, [send]);

  useEffect(() => {
    window.addEventListener('online', retryFailed);
    return () => window.removeEventListener('online', retryFailed);
  }, [retryFailed]);

  return { enqueue, retryFailed };
}
