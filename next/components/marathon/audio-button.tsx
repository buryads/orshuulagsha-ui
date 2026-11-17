'use client';

import { useEffect, useRef, useState, type ReactElement } from 'react';
import { useTranslations } from 'next-intl';
import { resolveApiUrl } from '@/lib/api/client';

interface AudioButtonProps {
  url: string | null;
  onFirstPlay?: () => void;
  compact?: boolean;
}

export function AudioButton({ url, onFirstPlay, compact = false }: AudioButtonProps): ReactElement | null {
  const t = useTranslations('marathon.audio');
  const ref = useRef<HTMLAudioElement | null>(null);
  const played = useRef(false);
  const [heard, setHeard] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    ref.current?.pause();
    ref.current = null;
    played.current = false;
    setHeard(false);
    setFailed(false);
  }, [url]);

  useEffect(
    () => () => {
      ref.current?.pause();
    },
    [],
  );

  if (!url) return null;

  const play = () => {
    setFailed(false);
    if (!played.current) {
      played.current = true;
      onFirstPlay?.();
    }
    let audio = ref.current;
    if (!audio) {
      audio = new Audio(resolveApiUrl(url));
      audio.onerror = () => {
        setFailed(true);
        ref.current = null;
      };
      ref.current = audio;
    }
    audio.currentTime = 0;
    setHeard(true);
    audio.play().catch(() => {
      setFailed(true);
      ref.current = null;
    });
  };

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
      <button
        type="button"
        className={compact ? 'btn btn-secondary' : 'btn btn-primary'}
        onClick={play}
        style={compact ? { padding: '8px 14px' } : undefined}
      >
        <span aria-hidden>▶</span>
        {heard ? t('again') : t('listen')}
      </button>
      {failed && (
        <span role="alert" style={{ fontSize: 13, color: 'var(--tertiary-700)' }}>
          {t('failed')}{' '}
          <button type="button" onClick={play} style={{ textDecoration: 'underline', fontWeight: 600 }}>
            {t('retry')}
          </button>
        </span>
      )}
    </span>
  );
}
