import type { ReactElement } from 'react';
import type { LessonStatus } from '@/lib/api/studio';

const CLS: Record<LessonStatus, string> = {
  draft: 'chip',
  text_ready: 'chip chip-warm',
  audio_ready: 'chip chip-primary',
  review: 'chip chip-rose',
  published: 'chip chip-green',
};

export function StatusPill({ status, label }: { status: LessonStatus; label: string }): ReactElement {
  return (
    <span className={CLS[status]} data-testid="status-pill" data-status={status} style={{ padding: '3px 9px' }}>
      {label}
    </span>
  );
}
