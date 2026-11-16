'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent,
  type ReactElement,
} from 'react';
import { useTranslations } from 'next-intl';
import { Field } from '@/components/studio/field';
import {
  isConflict,
  skipFlowItem,
  submitReview,
  type ReviewInput,
  type ReviewItem,
} from '@/lib/api/studio-flow';
import { classifySwipe, swipeVisual, type SwipeDir } from '@/lib/studio/flow-swipe';
import { isPlainShortcut } from '@/lib/studio/shortcuts';
import { ExerciseView } from './exercise-view';
import { QueueState } from './states';
import type { QueueState as QueueData } from './use-flow-queue';

export interface ReviewTabProps {
  queue: QueueData<ReviewItem>;
  active: boolean;
  advance: (before?: () => Promise<unknown>) => Promise<void>;
  reload: () => Promise<void>;
  onDone: () => void;
  onSkip: () => void;
  onToast: (message: string) => void;
}

const HINT_RGB: Record<SwipeDir, string> = {
  right: '45,134,89',
  left: '232,69,69',
  up: '110,116,125',
};

export function ReviewTab({
  queue,
  active,
  advance,
  reload,
  onDone,
  onSkip,
  onToast,
}: ReviewTabProps): ReactElement {
  const t = useTranslations('studio.flow');
  const item = queue.item;
  const [panel, setPanel] = useState(false);
  const [fix, setFix] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState<{ dx: number; dy: number } | null>(null);
  const start = useRef<{ x: number; y: number; id: number } | null>(null);

  useEffect(() => {
    setPanel(false);
    setFix(item?.bur ?? '');
    setNote('');
    setBusy(false);
    setDrag(null);
  }, [item?.item_key, item?.bur]);

  useEffect(() => {
    if (panel)
      document.querySelector<HTMLElement>('[data-fid="flow-fix"], [data-fid="flow-note"]')?.focus();
  }, [panel]);

  const send = useCallback(
    async (input: ReviewInput) => {
      setBusy(true);
      try {
        await submitReview(input);
        onDone();
      } catch (err) {
        if (isConflict(err)) {
          onToast(t('review.conflict'));
        } else {
          setBusy(false);
          onToast(t('review.submitFailed'));
          return;
        }
      }
      await advance();
    },
    [advance, onDone, onToast, t],
  );

  const approve = useCallback(() => {
    if (!item || busy) return;
    void send({ item_key: item.item_key, verdict: 'ok' });
  }, [item, busy, send]);

  const skip = useCallback(() => {
    if (!item || busy) return;
    onSkip();
    void advance(() => skipFlowItem('review', item.item_key));
  }, [item, busy, advance, onSkip]);

  const submitPanel = useCallback(() => {
    if (!item || busy) return;
    const noteText = note.trim();
    const changed = item.fixable && fix.trim() !== '' && fix.trim() !== (item.bur ?? '').trim();
    const input: ReviewInput = changed
      ? {
          item_key: item.item_key,
          verdict: 'fix',
          bur: fix.trim(),
          ...(noteText ? { note: noteText } : {}),
        }
      : { item_key: item.item_key, verdict: 'issue', ...(noteText ? { note: noteText } : {}) };
    void send(input);
  }, [item, busy, fix, note, send]);

  const latest = useRef({ approve, skip, submitPanel });
  latest.current = { approve, skip, submitPanel };
  const panelRef = useRef(panel);
  panelRef.current = panel;

  const ready = queue.status === 'ready' && Boolean(item);

  useEffect(() => {
    if (!active || !ready) return;
    const down = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && panelRef.current) {
        e.preventDefault();
        setPanel(false);
        return;
      }
      if (!isPlainShortcut(e) || panelRef.current) return;
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (!e.repeat) latest.current.approve();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setPanel(true);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (!e.repeat) latest.current.skip();
      }
    };
    window.addEventListener('keydown', down);
    return () => window.removeEventListener('keydown', down);
  }, [active, ready]);

  if (queue.status !== 'ready' || !item) {
    return (
      <QueueState
        status={queue.status === 'ready' ? 'loading' : queue.status}
        mode="review"
        onRetry={() => void reload()}
      />
    );
  }

  const onDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse' || panel || busy) return;
    start.current = { x: e.clientX, y: e.clientY, id: e.pointerId };
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  };
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const s = start.current;
    if (!s || s.id !== e.pointerId) return;
    setDrag({ dx: e.clientX - s.x, dy: e.clientY - s.y });
  };
  const onUp = (e: PointerEvent<HTMLDivElement>) => {
    const s = start.current;
    if (!s || s.id !== e.pointerId) return;
    start.current = null;
    const dir = classifySwipe(e.clientX - s.x, e.clientY - s.y);
    setDrag(null);
    if (dir === 'right') approve();
    else if (dir === 'left') setPanel(true);
    else if (dir === 'up') skip();
  };
  const onCancel = () => {
    start.current = null;
    setDrag(null);
  };

  const visual = drag ? swipeVisual(drag.dx, drag.dy) : null;
  const btn = { minHeight: 52, fontSize: 16 } as const;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div
        className="card"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onCancel}
        data-testid="review-card"
        style={{
          position: 'relative',
          padding: 'clamp(18px, 4vw, 32px)',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          alignItems: 'center',
          textAlign: 'center',
          touchAction: 'none',
          transform: visual?.transform,
          transition: drag ? 'none' : 'transform 0.2s ease',
          opacity: busy ? 0.6 : 1,
          boxShadow: visual?.hint
            ? `inset 0 0 0 3px rgba(${HINT_RGB[visual.hint]},${(0.7 * visual.strength).toFixed(2)}), var(--shadow-md)`
            : undefined,
          background: visual?.hint
            ? `linear-gradient(rgba(${HINT_RGB[visual.hint]},${(0.28 * visual.strength).toFixed(2)}),rgba(${HINT_RGB[visual.hint]},${(0.28 * visual.strength).toFixed(2)})), var(--surface)`
            : undefined,
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: 8,
            flexWrap: 'wrap',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: 13,
            color: 'var(--text-muted)',
          }}
        >
          <span style={{ fontWeight: 700 }} data-testid="review-kind">
            {t(`review.kind.${item.kind}`)}
            {item.exercise ? ` · ${t(`review.exerciseType.${item.exercise.type}`)}` : ''}
          </span>
          {item.source === 'ai' && (
            <span
              style={{
                padding: '2px 8px',
                borderRadius: 999,
                background: 'var(--primary-50)',
                color: 'var(--primary-700)',
                fontWeight: 700,
              }}
              data-testid="review-ai"
            >
              {t('review.sourceAi')}
            </span>
          )}
          <span>
            {t('review.lesson')}: {item.lesson.title}
          </span>
        </div>
        {item.exercise ? (
          <ExerciseView
            type={item.exercise.type}
            prompt={item.exercise.prompt}
            payload={item.exercise.payload}
          />
        ) : (
          <>
            <div
              style={{
                fontSize: 'clamp(28px, 6.5vw, 46px)',
                fontWeight: 800,
                lineHeight: 1.15,
                fontFamily: 'var(--font-display)',
                overflowWrap: 'anywhere',
              }}
              data-testid="review-bur"
            >
              {item.bur}
            </div>
            <div style={{ fontSize: 'clamp(16px, 3.5vw, 22px)', color: 'var(--text-muted)' }}>
              {item.ru}
            </div>
          </>
        )}
      </div>

      {panel ? (
        <div
          className="card"
          style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}
          data-testid="review-panel"
        >
          {item.fixable && (
            <label
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
                fontSize: 13,
                color: 'var(--text-muted)',
              }}
            >
              {t('review.fixLabel')}
              <Field
                value={fix}
                onChange={setFix}
                fid="flow-fix"
                bur
                label={t('review.fixLabel')}
                testId="review-fix"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    submitPanel();
                  } else if (e.key === 'Escape') setPanel(false);
                }}
              />
            </label>
          )}
          <Field
            value={note}
            onChange={setNote}
            fid="flow-note"
            label={item.fixable ? t('review.notePlaceholder') : t('review.exerciseNote')}
            placeholder={item.fixable ? t('review.notePlaceholder') : t('review.exerciseNote')}
            testId="review-note"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                submitPanel();
              } else if (e.key === 'Escape') setPanel(false);
            }}
          />
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="button"
              className="btn btn-primary"
              style={{ ...btn, flex: 1 }}
              disabled={busy}
              onClick={submitPanel}
              data-testid="review-submit"
            >
              {t('review.submit')}
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              style={btn}
              onClick={() => setPanel(false)}
            >
              {t('review.cancel')}
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-secondary"
            style={{ ...btn, flex: '1 1 130px', color: 'var(--tertiary-700)' }}
            disabled={busy}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setPanel(true)}
            data-testid="review-wrong"
          >
            {t('review.wrong')}
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            style={{ ...btn, flex: '0 1 110px' }}
            disabled={busy}
            onMouseDown={(e) => e.preventDefault()}
            onClick={skip}
            data-testid="review-skip"
          >
            {t('review.skip')}
          </button>
          <button
            type="button"
            className="btn btn-primary"
            style={{ ...btn, flex: '1 1 130px' }}
            disabled={busy}
            onMouseDown={(e) => e.preventDefault()}
            onClick={approve}
            data-testid="review-ok"
          >
            {t('review.ok')}
          </button>
        </div>
      )}
      <div
        className="flow-help"
        style={{ fontSize: 12, color: 'var(--text-soft)', textAlign: 'center' }}
      >
        <span className="flow-kbd-only">{t('review.help')}</span>
        <span className="flow-touch-only">{t('review.swipeHint')}</span>
      </div>
    </div>
  );
}
