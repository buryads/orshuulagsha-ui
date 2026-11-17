'use client';

import { useCallback, type Dispatch } from 'react';
import { useTranslations } from 'next-intl';
import type { RecordedClip } from '@/components/audio/use-audio-recorder';
import { uploadAudio } from '@/lib/api/studio';
import {
  keepRecording,
  skipFlowItem,
  type KeepReason,
  type VoiceItem,
} from '@/lib/api/studio-flow';
import { mimeExtension } from '@/lib/studio/audio';
import type { SessionAction } from '@/lib/studio/flow-session';

export function useRerecord(
  dispatch: Dispatch<SessionAction>,
  advance: (before?: () => Promise<unknown>) => Promise<void>,
  onToast: (message: string) => void,
) {
  const t = useTranslations('studio.flow');

  const send = useCallback(
    async (item: VoiceItem, clip: RecordedClip) => {
      const saved = await uploadAudio({
        file: clip.blob,
        filename: `voice.${mimeExtension(clip.mime)}`,
        ownerType: 'text',
        ownerId: 0,
        text: item.text,
        durationMs: clip.durationMs,
      });
      dispatch({ type: 'accept' });
      onToast(t('rerecord.saved', { points: saved.points ?? 0 }));
      await advance(() => skipFlowItem('voice', item.item_key));
    },
    [advance, dispatch, onToast, t],
  );

  const keep = useCallback(
    async (item: VoiceItem, reason: KeepReason, note?: string) => {
      let points: number;
      try {
        points = await keepRecording(item.item_key, reason, note);
      } catch {
        onToast(t('review.submitFailed'));
        return;
      }
      dispatch({ type: 'accept' });
      onToast(points > 0 ? t('keep.points', { points }) : t('keep.saved'));
      await advance();
    },
    [advance, dispatch, onToast, t],
  );

  return { send, keep };
}
