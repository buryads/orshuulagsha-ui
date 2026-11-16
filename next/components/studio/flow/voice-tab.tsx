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
import { useAudioRecorder, type RecordedClip } from '@/components/audio/use-audio-recorder';
import { skipFlowItem, type VoiceItem } from '@/lib/api/studio-flow';
import { isLetterKey, isSpaceKey } from '@/lib/studio/flow-keys';
import { isPlainShortcut } from '@/lib/studio/shortcuts';
import { QueueState } from './states';
import type { QueueState as QueueData } from './use-flow-queue';

const MIN_CLIP_MS = 300;

export interface VoiceTabProps {
  queue: QueueData<VoiceItem>;
  active: boolean;
  advance: (before?: () => Promise<unknown>) => Promise<void>;
  reload: () => Promise<void>;
  onAccept: (item: VoiceItem, clip: RecordedClip) => void;
  onSkip: () => void;
  onGoReview: () => void;
}

export function VoiceTab({
  queue,
  active,
  advance,
  reload,
  onAccept,
  onSkip,
  onGoReview,
}: VoiceTabProps): ReactElement {
  const t = useTranslations('studio.flow');
  const rec = useAudioRecorder({ keepStream: true });
  const { phase, clip, error, level, start, stop, discard } = rec;
  const holdRef = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [tooShort, setTooShort] = useState(false);
  const [micBlocked, setMicBlocked] = useState(false);
  const item = queue.item;
  const supported =
    typeof navigator === 'undefined' ||
    (Boolean(navigator.mediaDevices?.getUserMedia) && typeof MediaRecorder !== 'undefined');
  const unavailable = micBlocked || !supported || error === 'micDenied' || error === 'unsupported';

  useEffect(() => {
    if (error === 'micDenied') setMicBlocked(true);
  }, [error]);

  useEffect(() => {
    discard();
    setTooShort(false);
  }, [item?.item_key, discard]);

  const stopPlayback = useCallback(() => {
    audioRef.current?.pause();
    audioRef.current = null;
  }, []);

  const play = useCallback(
    (url: string) => {
      stopPlayback();
      const a = new Audio(url);
      audioRef.current = a;
      a.play().catch(() => undefined);
    },
    [stopPlayback],
  );

  useEffect(() => {
    if (!clip) return;
    if (!clip.fromFile && clip.durationMs < MIN_CLIP_MS) {
      discard();
      setTooShort(true);
      return;
    }
    setTooShort(false);
    play(clip.url);
    return stopPlayback;
  }, [clip, play, stopPlayback, discard]);

  const beginHold = useCallback(async () => {
    if (holdRef.current || unavailable) return;
    holdRef.current = true;
    stopPlayback();
    setTooShort(false);
    await start();
    if (!holdRef.current) stop();
  }, [start, stop, stopPlayback, unavailable]);

  const endHold = useCallback(() => {
    if (!holdRef.current) return;
    holdRef.current = false;
    stop();
  }, [stop]);

  const accept = useCallback(() => {
    if (!item || !clip || phase !== 'recorded') return;
    stopPlayback();
    onAccept(item, clip);
  }, [item, clip, phase, onAccept, stopPlayback]);

  const redo = useCallback(() => {
    stopPlayback();
    discard();
  }, [discard, stopPlayback]);

  const skip = useCallback(() => {
    if (!item) return;
    stopPlayback();
    onSkip();
    void advance(() => skipFlowItem('voice', item.item_key));
  }, [item, advance, onSkip, stopPlayback]);

  const ready = queue.status === 'ready' && Boolean(item);

  const latest = useRef({ beginHold, endHold, accept, redo, skip });
  latest.current = { beginHold, endHold, accept, redo, skip };

  useEffect(() => {
    if (!active || !ready) return;
    const down = (e: KeyboardEvent) => {
      if (!isPlainShortcut(e)) return;
      if (isSpaceKey(e)) {
        e.preventDefault();
        if (!e.repeat) void latest.current.beginHold();
        return;
      }
      if (e.key === 'Enter' || e.key === 'ArrowRight') {
        e.preventDefault();
        if (!e.repeat) latest.current.accept();
      } else if (isLetterKey(e, 'r')) {
        e.preventDefault();
        latest.current.redo();
      } else if (isLetterKey(e, 's') || e.key === 'ArrowDown') {
        e.preventDefault();
        if (!e.repeat) latest.current.skip();
      }
    };
    const up = (e: KeyboardEvent) => {
      if (!isSpaceKey(e) || !isPlainShortcut(e)) return;
      e.preventDefault();
      latest.current.endHold();
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
      latest.current.endHold();
    };
  }, [active, ready]);

  if (queue.status !== 'ready' || !item) {
    return (
      <QueueState
        status={queue.status === 'ready' ? 'loading' : queue.status}
        mode="voice"
        onRetry={() => void reload()}
      />
    );
  }

  const recording = phase === 'recording';
  const recorded = phase === 'recorded';
  const onDown = (e: PointerEvent<HTMLButtonElement>) => {
    e.preventDefault();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* pointer already released */
    }
    void beginHold();
  };

  return (
    <div
      className="card"
      style={{
        padding: 'clamp(18px, 4vw, 32px)',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        alignItems: 'center',
        textAlign: 'center',
      }}
      data-testid="voice-card"
    >
      {queue.fromSkipped && (
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t('state.fromSkipped')}</span>
      )}
      <div
        style={{
          fontSize: 'clamp(30px, 7vw, 52px)',
          fontWeight: 800,
          lineHeight: 1.15,
          fontFamily: 'var(--font-display)',
          overflowWrap: 'anywhere',
        }}
        data-testid="voice-text"
      >
        {item.text}
      </div>
      <div style={{ fontSize: 'clamp(16px, 3.5vw, 22px)', color: 'var(--text-muted)' }}>
        {item.ru ?? t('voice.noRu')}
      </div>
      <div style={{ fontSize: 13, color: 'var(--text-soft)' }}>
        {t('voice.usedIn', { n: item.uses })}
      </div>

      {unavailable ? (
        <div
          role="alert"
          style={{
            padding: 14,
            borderRadius: 12,
            background: 'var(--tertiary-soft)',
            color: 'var(--tertiary-700)',
            maxWidth: 420,
          }}
          data-testid="mic-unavailable"
        >
          <p style={{ margin: '0 0 10px' }}>
            {!supported || error === 'unsupported' ? t('voice.unsupported') : t('voice.micDenied')}
          </p>
          <button type="button" className="btn btn-secondary" onClick={onGoReview}>
            {t('voice.goReview')}
          </button>
        </div>
      ) : (
        <>
          <button
            type="button"
            aria-label={t('voice.mic')}
            onPointerDown={onDown}
            onPointerUp={endHold}
            onPointerCancel={endHold}
            onContextMenu={(e) => e.preventDefault()}
            onKeyDown={(e) => e.preventDefault()}
            tabIndex={-1}
            data-testid="mic-button"
            style={{
              width: 112,
              height: 112,
              borderRadius: '50%',
              border: 'none',
              cursor: 'pointer',
              color: '#fff',
              background: recording ? 'var(--tertiary)' : 'var(--primary)',
              boxShadow: `0 0 0 ${Math.round(6 + level * 22)}px ${recording ? 'rgba(232,69,69,0.22)' : 'rgba(0,102,179,0.14)'}`,
              touchAction: 'none',
              userSelect: 'none',
              WebkitTouchCallout: 'none',
              transition: 'background 0.15s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '12px 0',
            }}
          >
            <svg
              width="44"
              height="44"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <rect x="9" y="3" width="6" height="12" rx="3" />
              <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
            </svg>
          </button>
          <div
            style={{
              minHeight: 22,
              fontWeight: 600,
              color: recording ? 'var(--tertiary-700)' : 'var(--text-muted)',
            }}
            aria-live="polite"
            data-testid="voice-status"
          >
            {tooShort ? (
              t('voice.tooShort')
            ) : error === 'tooLarge' ? (
              t('voice.tooLarge')
            ) : error === 'recordFailed' ? (
              t('voice.recordFailed')
            ) : recording ? (
              t('voice.recording')
            ) : recorded ? (
              t('voice.ready')
            ) : phase === 'requesting' ? (
              t('state.loading')
            ) : (
              <>
                <span className="flow-kbd-only">{t('voice.holdKey')}</span>
                <span className="flow-touch-only">{t('voice.holdTouch')}</span>
              </>
            )}
          </div>
        </>
      )}

      <div
        style={{
          display: 'flex',
          gap: 10,
          flexWrap: 'wrap',
          justifyContent: 'center',
          width: '100%',
        }}
      >
        <button
          type="button"
          className="btn btn-primary"
          disabled={!recorded}
          onMouseDown={(e) => e.preventDefault()}
          onClick={accept}
          style={{ minHeight: 52, flex: '1 1 140px', fontSize: 16, opacity: recorded ? 1 : 0.45 }}
          data-testid="voice-accept"
        >
          {t('voice.accept')}
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          disabled={!recorded}
          onMouseDown={(e) => e.preventDefault()}
          onClick={redo}
          style={{ minHeight: 52, flex: '1 1 110px', opacity: recorded ? 1 : 0.45 }}
          data-testid="voice-redo"
        >
          {t('voice.rerecord')}
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          onMouseDown={(e) => e.preventDefault()}
          onClick={skip}
          style={{ minHeight: 52, flex: '1 1 110px' }}
          data-testid="voice-skip"
        >
          {t('voice.skip')}
        </button>
      </div>
      <div className="flow-help flow-kbd-only" style={{ fontSize: 12, color: 'var(--text-soft)' }}>
        {t('voice.help')}
      </div>
    </div>
  );
}
