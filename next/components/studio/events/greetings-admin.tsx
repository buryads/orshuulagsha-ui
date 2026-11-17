'use client';

import { useCallback, useEffect, useState, type ReactElement } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import {
  errorCode,
  getGreetings,
  publishGreeting,
  republishGreeting,
  unpublishGreeting,
  type GreetingsList,
} from '@/lib/api/studio-events';
import { missingKey } from '@/lib/studio/events';
import { inputStyle } from '../field';
import { LessonSelect } from './lesson-select';

const OCCASIONS = ['sagaalgan', 'birthday', 'wedding'] as const;

export function GreetingsAdmin(): ReactElement {
  const t = useTranslations('studioEvents');
  const [lessonId, setLessonId] = useState<number | null>(null);
  const [occasion, setOccasion] = useState<string>(OCCASIONS[0]);
  const [data, setData] = useState<GreetingsList | null>(null);
  const [failed, setFailed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);

  const load = useCallback(async () => {
    setFailed(false);
    try {
      setData(await getGreetings(lessonId ?? undefined));
    } catch {
      setFailed(true);
    }
  }, [lessonId]);

  useEffect(() => {
    void load();
  }, [load]);

  const run = async (job: () => Promise<void>, okText: string) => {
    setBusy(true);
    setNotice(null);
    try {
      await job();
      setNotice({ kind: 'ok', text: okText });
      await load();
    } catch (err) {
      const code = errorCode(err);
      setNotice({
        kind: 'error',
        text:
          code === 'voice_consent_missing'
            ? t('greetings.consentMissing')
            : code === 'not_ready'
              ? t('greetings.notReady')
              : t('common.actionFailed'),
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container" style={{ paddingTop: 20, paddingBottom: 48, maxWidth: 900 }}>
      <div
        style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
        data-testid="greetings-admin"
      >
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <Link
            href="/studio"
            style={{ fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none' }}
          >
            ← {t('common.back')}
          </Link>
          <h1 style={{ fontSize: 'clamp(22px, 4vw, 30px)' }}>{t('greetings.title')}</h1>
        </div>

        {notice && (
          <div
            role={notice.kind === 'error' ? 'alert' : 'status'}
            className="card"
            style={{
              padding: '12px 14px',
              fontWeight: 600,
              borderColor: notice.kind === 'error' ? 'var(--tertiary)' : 'var(--accent-green)',
            }}
            data-testid="greetings-notice"
          >
            {notice.text}
          </div>
        )}
        {failed && (
          <div className="card" style={{ padding: 16 }} role="alert">
            {t('common.loadFailed')}{' '}
            <button type="button" className="btn btn-secondary" onClick={() => void load()}>
              {t('common.retry')}
            </button>
          </div>
        )}

        <section style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <h2 style={{ fontSize: 18 }}>{t('greetings.published')}</h2>
          {data && data.published.length === 0 && (
            <div
              className="card"
              style={{ padding: 20, color: 'var(--text-muted)' }}
              data-testid="greetings-empty"
            >
              {t('greetings.empty')}
            </div>
          )}
          {data?.published.map((g) => (
            <div
              key={g.id}
              className="card"
              style={{
                padding: '10px 14px',
                display: 'flex',
                gap: 10,
                alignItems: 'center',
                flexWrap: 'wrap',
              }}
              data-testid="greeting-row"
            >
              <span className="chip chip-primary">{t(`occasion.${g.occasion}`)}</span>
              <span style={{ fontWeight: 600, overflowWrap: 'anywhere' }}>{g.bur}</span>
              <span style={{ color: 'var(--text-muted)', fontSize: 14, overflowWrap: 'anywhere' }}>
                {g.ru}
              </span>
              {g.stale && (
                <span className="chip chip-rose" data-testid="greeting-stale">
                  {t('greetings.stale')}
                </span>
              )}
              {g.status === 'unpublished' && (
                <span className="chip">{t('status.unpublished')}</span>
              )}
              <span
                style={{
                  marginLeft: 'auto',
                  display: 'flex',
                  gap: 8,
                  alignItems: 'center',
                  flexWrap: 'wrap',
                }}
              >
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                  {t('greetings.opens', { n: g.opens })}
                </span>
                {g.status === 'published' && !g.stale && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    disabled={busy}
                    onClick={() =>
                      void run(() => unpublishGreeting(g.id), t('greetings.unpublished'))
                    }
                  >
                    {t('greetings.unpublish')}
                  </button>
                )}
                {(g.stale || g.status === 'unpublished') && (
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={busy}
                    onClick={() =>
                      void run(() => republishGreeting(g.id), t('greetings.republished'))
                    }
                    data-testid="greeting-republish"
                  >
                    {t('greetings.republish')}
                  </button>
                )}
              </span>
            </div>
          ))}
        </section>

        <section style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <h2 style={{ fontSize: 18 }}>{t('greetings.add')}</h2>
          <div
            style={{
              display: 'grid',
              gap: 12,
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            }}
          >
            <LessonSelect
              value={lessonId}
              onChange={setLessonId}
              label={t('form.lesson')}
              testId="greetings-lesson"
            />
            <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13 }}>
              {t('greetings.occasion')}
              <select
                value={occasion}
                onChange={(e) => setOccasion(e.target.value)}
                style={inputStyle}
                data-testid="greetings-occasion"
              >
                {OCCASIONS.map((o) => (
                  <option key={o} value={o}>
                    {t(`occasion.${o}`)}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {lessonId === null && (
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>{t('greetings.pickLesson')}</p>
          )}
          {lessonId !== null && data && data.candidates.length === 0 && (
            <div
              className="card"
              style={{ padding: 20, color: 'var(--text-muted)' }}
              data-testid="candidates-empty"
            >
              {t('greetings.noCandidates')}
            </div>
          )}
          {lessonId !== null &&
            data?.candidates.map((c) => {
              const reason = missingKey(c);
              const can = c.ready && c.voice_consent;
              return (
                <div
                  key={c.item_key}
                  className="card"
                  style={{
                    padding: '10px 14px',
                    display: 'flex',
                    gap: 10,
                    alignItems: 'center',
                    flexWrap: 'wrap',
                  }}
                  data-testid="greeting-candidate"
                >
                  <span style={{ fontWeight: 600, overflowWrap: 'anywhere' }}>{c.bur}</span>
                  <span
                    style={{ color: 'var(--text-muted)', fontSize: 14, overflowWrap: 'anywhere' }}
                  >
                    {c.ru}
                  </span>
                  <span
                    style={{
                      marginLeft: 'auto',
                      display: 'flex',
                      gap: 8,
                      alignItems: 'center',
                      flexWrap: 'wrap',
                    }}
                  >
                    {reason && <span className="chip chip-warm">{t(`missing.${reason}`)}</span>}
                    {c.ready && !c.voice_consent && (
                      <span className="chip chip-rose" data-testid="candidate-no-consent">
                        {t('greetings.consentMissing')}
                      </span>
                    )}
                    <button
                      type="button"
                      className="btn btn-primary"
                      disabled={busy || !can}
                      style={can ? undefined : { opacity: 0.5 }}
                      onClick={() =>
                        void run(
                          () =>
                            publishGreeting({
                              occasion,
                              lesson_id: lessonId,
                              item_key: c.item_key,
                            }),
                          t('greetings.publishedOk'),
                        )
                      }
                      data-testid="candidate-publish"
                    >
                      {t('greetings.publish')}
                    </button>
                  </span>
                </div>
              );
            })}
        </section>
      </div>
    </div>
  );
}
