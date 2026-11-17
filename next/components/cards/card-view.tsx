'use client';

import { useCallback, useEffect, useState, type ReactElement } from 'react';
import { useTranslations } from 'next-intl';
import axios from 'axios';
import { Link } from '@/i18n/navigation';
import { AudioButton } from '@/components/marathon/audio-button';
import { useCurrentEvent } from '@/components/marathon/use-current-event';
import { getGreeting, recordListen, type GreetingDetail } from '@/lib/api/greetings';
import { LEARN_ENABLED } from '@/lib/learn-enabled';

type Load = { status: 'loading' } | { status: 'error' } | { status: 'notFound' } | { status: 'ready'; card: GreetingDetail };

const wrap = { paddingTop: 32, paddingBottom: 48, display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 680 } as const;

export function CardView({ id }: { id: string }): ReactElement {
  const t = useTranslations('cards.card');
  const [load, setLoad] = useState<Load>({ status: 'loading' });
  const event = useCurrentEvent();

  const fetchCard = useCallback(() => {
    setLoad({ status: 'loading' });
    getGreeting(id)
      .then((card) => setLoad({ status: 'ready', card }))
      .catch((err: unknown) =>
        setLoad({ status: axios.isAxiosError(err) && err.response?.status === 404 ? 'notFound' : 'error' }),
      );
  }, [id]);

  useEffect(fetchCard, [fetchCard]);

  const make = (
    <Link className="btn btn-primary" href="/cards">
      {t('make')}
    </Link>
  );

  if (load.status === 'loading') {
    return (
      <div className="container" style={wrap}>
        <p style={{ color: 'var(--text-muted)' }}>…</p>
      </div>
    );
  }
  if (load.status === 'error') {
    return (
      <div className="container" style={wrap}>
        <div>
          <button type="button" className="btn btn-secondary" onClick={fetchCard}>
            {t('loadFailed')}
          </button>
        </div>
      </div>
    );
  }
  if (load.status === 'notFound') {
    return (
      <div className="container" style={wrap}>
        <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0 }}>{t('notFound')}</h1>
        <div>{make}</div>
      </div>
    );
  }

  const { card } = load;
  if (!card.live || !card.bur) {
    return (
      <div className="container fade-up" style={wrap}>
        <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0 }}>{t('updated')}</h1>
        {card.alternatives.length > 0 && <p style={{ margin: 0, color: 'var(--text-muted)' }}>{t('updatedText')}</p>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {card.alternatives.map((alt) => (
            <Link
              key={alt.id}
              href={`/card/${alt.id}`}
              className="card"
              style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 4 }}
            >
              <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--primary-900)' }}>{alt.bur}</span>
              <span>{alt.ru}</span>
            </Link>
          ))}
        </div>
        <div>{make}</div>
      </div>
    );
  }

  const marathonRunning = event.status === 'ready' && event.event?.state === 'running';

  return (
    <div className="container fade-up" style={wrap}>
      <article
        className="card"
        style={{ padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: 14, borderTop: '6px solid var(--primary)' }}
      >
        <h1 style={{ margin: 0, fontSize: 32, fontWeight: 800, lineHeight: 1.25, color: 'var(--primary-900)' }}>{card.bur}</h1>
        <p style={{ margin: 0, fontSize: 20 }}>{card.ru}</p>
        <div>
          <AudioButton url={card.audio_url} onFirstPlay={() => void recordListen(id).catch(() => undefined)} />
        </div>
        <p style={{ margin: 0, fontSize: 14, color: 'var(--text-muted)' }}>
          {card.credit ? t('voice', { name: card.credit }) : t('voiceDefault')}
        </p>
      </article>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {make}
        <Link className="btn btn-secondary" href={LEARN_ENABLED ? '/learn/path' : '/explore'}>
          {t('learn')}
        </Link>
      </div>

      {marathonRunning && (
        <p style={{ margin: 0 }}>
          <Link href="/marathon" style={{ color: 'var(--primary)', fontWeight: 700 }}>
            {t('marathon')}
          </Link>
        </p>
      )}
    </div>
  );
}
