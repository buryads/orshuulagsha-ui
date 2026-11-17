'use client';

import { useCallback, useEffect, useMemo, useState, type ReactElement } from 'react';
import { useTranslations } from 'next-intl';
import axios from 'axios';
import { Link } from '@/i18n/navigation';
import {
  autofillEvent,
  errorCode,
  getEvent,
  publishEvent,
  publishProblem,
  setEventDay,
  unpublishEvent,
  updateEvent,
  type EventDay,
  type PhraseReadiness,
  type StudioEventDetail,
} from '@/lib/api/studio-events';
import { bannerDate, dayChoices, formatDayRanges, missingKey } from '@/lib/studio/events';
import { inputStyle } from '../field';

type Notice = { kind: 'ok' | 'error'; text: string; lines?: string[] };

const labelStyle = { display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13 } as const;

export function EventEditor({ id }: { id: number }): ReactElement {
  const t = useTranslations('studioEvents');
  const [event, setEvent] = useState<StudioEventDetail | null>(null);
  const [failed, setFailed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [preview, setPreview] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [startsOn, setStartsOn] = useState('');
  const [daysCount, setDaysCount] = useState('');
  const [teamMin, setTeamMin] = useState('');

  const apply = useCallback((ev: StudioEventDetail) => {
    setEvent(ev);
    setTitle(ev.title);
    setStartsOn(ev.starts_on.slice(0, 10));
    setDaysCount(String(ev.days_count));
    setTeamMin(String(ev.team_min_size));
  }, []);

  const load = useCallback(async () => {
    setFailed(false);
    try {
      apply(await getEvent(id));
    } catch {
      setFailed(true);
    }
  }, [id, apply]);

  useEffect(() => {
    void load();
  }, [load]);

  const phraseByKey = useMemo(
    () => new Map((event?.phrases ?? []).map((p) => [p.item_key, p])),
    [event],
  );
  const days = useMemo<EventDay[]>(() => {
    if (!event) return [];
    const byNumber = new Map(event.days.map((d) => [d.day_number, d]));
    return Array.from({ length: event.days_count }, (_, i) => {
      const n = i + 1;
      return byNumber.get(n) ?? { day_number: n, item_key: null, custom_ru: null };
    });
  }, [event]);
  const used = useMemo(
    () => new Set(days.map((d) => d.item_key).filter((k): k is string => Boolean(k))),
    [days],
  );

  const reasonText = (p: Pick<PhraseReadiness, 'ready' | 'missing' | 'issue'>): string | null => {
    const key = missingKey(p);
    return key ? t(`missing.${key}`) : null;
  };

  const run = async (job: () => Promise<Notice | void>) => {
    setBusy(true);
    setNotice(null);
    try {
      const done = await job();
      if (done) setNotice(done);
    } catch {
      setNotice({ kind: 'error', text: t('common.actionFailed') });
    } finally {
      setBusy(false);
    }
  };

  const saveMeta = () =>
    run(async () => {
      await updateEvent(id, {
        title: title.trim(),
        starts_on: startsOn,
        days_count: Number(daysCount) || undefined,
        team_min_size: Number(teamMin) || undefined,
      });
      await load();
      return { kind: 'ok', text: t('editor.saved') };
    });

  const saveDay = (n: number, item_key: string | null, custom_ru: string | null) =>
    run(async () => {
      try {
        await setEventDay(id, n, { item_key, custom_ru });
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status === 422) {
          const code = errorCode(err);
          const phrase = item_key ? phraseByKey.get(item_key) : undefined;
          const reason = phrase ? reasonText(phrase) : null;
          return {
            kind: 'error',
            text: code === 'frozen' ? t('editor.frozen') : (reason ?? t('common.actionFailed')),
          };
        }
        throw err;
      } finally {
        await load();
      }
    });

  const autofill = () =>
    run(async () => {
      await autofillEvent(id);
      await load();
      return { kind: 'ok', text: t('editor.autofilled') };
    });

  const check = () =>
    run(async () => {
      const fresh = await getEvent(id);
      apply(fresh);
      return {
        kind:
          fresh.check.empty_days.length === 0 && fresh.check.changed_days.length === 0
            ? 'ok'
            : 'error',
        text: t('editor.checkResult', { ready: fresh.check.ready_days, total: fresh.days_count }),
        lines: problemLines(fresh.check.empty_days, fresh.check.changed_days),
      };
    });

  const problemLines = (empty: number[], changed: number[]): string[] => [
    ...(empty.length ? [t('editor.emptyDays', { days: formatDayRanges(empty) })] : []),
    ...(changed.length ? [t('editor.changedDays', { days: formatDayRanges(changed) })] : []),
  ];

  const publish = () =>
    run(async () => {
      try {
        await publishEvent(id);
      } catch (err) {
        const problem = publishProblem(err);
        if (!problem) throw err;
        await load();
        const lines = problemLines(problem.empty_days, problem.changed_days);
        return {
          kind: 'error',
          text: lines.length
            ? t('editor.publishBlocked')
            : (problem.message ?? t('editor.publishBlocked')),
          lines,
        };
      }
      const fresh = await getEvent(id);
      apply(fresh);
      const banner = bannerDate(fresh.starts_on, fresh.banner_days_before);
      return { kind: 'ok', text: t('editor.published', { date: banner ?? fresh.starts_on }) };
    });

  const unpublish = () =>
    run(async () => {
      await unpublishEvent(id);
      await load();
      return { kind: 'ok', text: t('editor.unpublished') };
    });

  if (failed)
    return (
      <div className="container" style={{ paddingTop: 32 }}>
        <div className="card" style={{ padding: 16 }} role="alert">
          {t('common.loadFailed')}{' '}
          <button type="button" className="btn btn-secondary" onClick={() => void load()}>
            {t('common.retry')}
          </button>
        </div>
      </div>
    );
  if (!event)
    return (
      <div className="container" style={{ paddingTop: 32, color: 'var(--text-muted)' }}>
        {t('common.loading')}
      </div>
    );

  const published = event.status === 'published';
  const changed = new Set(event.check.changed_days);
  const previewDay = preview ? days.find((d) => d.day_number === preview) : undefined;
  const previewPhrase = previewDay?.item_key ? phraseByKey.get(previewDay.item_key) : undefined;

  return (
    <div className="container" style={{ paddingTop: 20, paddingBottom: 48, maxWidth: 900 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }} data-testid="event-editor">
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <Link
            href="/studio/events"
            style={{ fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none' }}
          >
            ← {t('list.title')}
          </Link>
          <h1 style={{ fontSize: 'clamp(22px, 4vw, 30px)' }}>{event.title}</h1>
          <span className={`chip ${published ? 'chip-green' : ''}`} data-testid="event-status">
            {t(`status.${event.status}`)}
          </span>
        </div>

        <details className="card" style={{ padding: '10px 14px' }}>
          <summary style={{ cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>
            {t('editor.settings')}
          </summary>
          <div
            style={{
              display: 'grid',
              gap: 12,
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              marginTop: 12,
            }}
          >
            <label style={labelStyle}>
              {t('form.title')}
              <input value={title} onChange={(e) => setTitle(e.target.value)} style={inputStyle} />
            </label>
            <label style={labelStyle}>
              {t('form.startsOn')}
              <input
                type="date"
                value={startsOn}
                onChange={(e) => setStartsOn(e.target.value)}
                style={inputStyle}
              />
            </label>
            <label style={labelStyle}>
              {t('form.daysCount')}
              <input
                type="number"
                min={1}
                value={daysCount}
                onChange={(e) => setDaysCount(e.target.value)}
                style={inputStyle}
              />
            </label>
            <label style={labelStyle}>
              {t('form.teamMin')}
              <input
                type="number"
                min={1}
                value={teamMin}
                onChange={(e) => setTeamMin(e.target.value)}
                style={inputStyle}
              />
            </label>
          </div>
          <button
            type="button"
            className="btn btn-secondary"
            style={{ marginTop: 12 }}
            disabled={busy}
            onClick={() => void saveMeta()}
          >
            {t('editor.save')}
          </button>
        </details>

        <div
          className="card"
          style={{ padding: 14, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}
        >
          <strong data-testid="event-check">
            {t('editor.checkResult', { ready: event.check.ready_days, total: event.days_count })}
          </strong>
          <span style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginLeft: 'auto' }}>
            <button
              type="button"
              className="btn btn-secondary"
              disabled={busy || published}
              onClick={() => void autofill()}
              data-testid="event-autofill"
            >
              {t('editor.autofill')}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              disabled={busy}
              onClick={() => void check()}
              data-testid="event-check-btn"
            >
              {t('editor.check')}
            </button>
            {published ? (
              <button
                type="button"
                className="btn btn-secondary"
                disabled={busy}
                onClick={() => void unpublish()}
                data-testid="event-unpublish"
              >
                {t('editor.unpublish')}
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-primary"
                disabled={busy}
                onClick={() => void publish()}
                data-testid="event-publish"
              >
                {t('editor.publish')}
              </button>
            )}
          </span>
        </div>

        {notice && (
          <div
            role={notice.kind === 'error' ? 'alert' : 'status'}
            className="card"
            style={{
              padding: '12px 14px',
              borderColor: notice.kind === 'error' ? 'var(--tertiary)' : 'var(--accent-green)',
            }}
            data-testid="event-notice"
          >
            <div style={{ fontWeight: 600 }}>{notice.text}</div>
            {notice.lines && notice.lines.length > 0 && (
              <ul style={{ margin: '6px 0 0', paddingLeft: 18, fontSize: 14 }}>
                {notice.lines.map((l) => (
                  <li key={l}>{l}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        <section style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <h2 style={{ fontSize: 18 }}>{t('editor.phrases')}</h2>
          {event.phrases.length === 0 ? (
            <div
              className="card"
              style={{ padding: 20, color: 'var(--text-muted)' }}
              data-testid="event-no-phrases"
            >
              {t('editor.noPhrases')}
            </div>
          ) : (
            <ul
              style={{
                listStyle: 'none',
                margin: 0,
                padding: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
              }}
            >
              {event.phrases.map((p) => {
                const reason = reasonText(p);
                const mode = p.missing === 'voice' ? 'voice' : 'review';
                return (
                  <li
                    key={p.item_key}
                    className="card"
                    style={{
                      padding: '8px 12px',
                      display: 'flex',
                      gap: 10,
                      alignItems: 'center',
                      flexWrap: 'wrap',
                    }}
                    data-testid="event-phrase"
                  >
                    <span style={{ fontWeight: 600, overflowWrap: 'anywhere' }}>{p.bur}</span>
                    <span
                      style={{ color: 'var(--text-muted)', fontSize: 14, overflowWrap: 'anywhere' }}
                    >
                      {p.ru}
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
                      <span
                        className={`chip ${p.ready ? 'chip-green' : p.issue ? 'chip-rose' : 'chip-warm'}`}
                      >
                        {reason ?? t('editor.ready')}
                      </span>
                      {!p.ready && (
                        <Link
                          href={`/studio/flow?mode=${mode}`}
                          className="btn btn-ghost"
                          style={{ textDecoration: 'none', padding: '4px 10px', fontSize: 13 }}
                        >
                          {t('editor.sendToStudio')}
                        </Link>
                      )}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <h2 style={{ fontSize: 18 }}>{t('editor.days')}</h2>
          <ul
            style={{
              listStyle: 'none',
              margin: 0,
              padding: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            {days.map((d) => {
              const phrase = d.item_key ? phraseByKey.get(d.item_key) : undefined;
              return (
                <li
                  key={d.day_number}
                  className="card"
                  style={{
                    padding: 12,
                    display: 'grid',
                    gap: 8,
                    gridTemplateColumns: 'minmax(0, 1fr)',
                  }}
                  data-testid="event-day"
                >
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                    <label style={{ ...labelStyle, flex: '1 1 260px' }}>
                      {t('editor.inDay', { n: d.day_number })}
                      <select
                        value={d.item_key ?? ''}
                        disabled={busy}
                        onChange={(e) =>
                          void saveDay(d.day_number, e.target.value || null, d.custom_ru)
                        }
                        style={inputStyle}
                        data-testid={`event-day-${d.day_number}`}
                      >
                        <option value="">{t('editor.emptyDay')}</option>
                        {dayChoices(event.phrases, used, d.item_key).map((p) => {
                          const reason = reasonText(p);
                          return (
                            <option key={p.item_key} value={p.item_key} disabled={!p.ready}>
                              {p.bur}
                              {reason ? ` — ${reason}` : ''}
                            </option>
                          );
                        })}
                      </select>
                    </label>
                    <button
                      type="button"
                      className="btn btn-ghost"
                      style={{ alignSelf: 'flex-end' }}
                      disabled={!d.item_key}
                      onClick={() => setPreview(d.day_number)}
                      data-testid={`event-preview-${d.day_number}`}
                    >
                      {t('editor.preview')}
                    </button>
                  </div>
                  {changed.has(d.day_number) && (
                    <span
                      className="chip chip-rose"
                      style={{ justifySelf: 'start' }}
                      data-testid="event-day-changed"
                    >
                      {t('editor.changedBadge')}
                    </span>
                  )}
                  {phrase && !phrase.ready && !changed.has(d.day_number) && (
                    <span className="chip chip-warm" style={{ justifySelf: 'start' }}>
                      {reasonText(phrase)}
                    </span>
                  )}
                  <label style={labelStyle}>
                    {t('editor.custom')}
                    <input
                      key={`${d.day_number}-${d.custom_ru ?? ''}`}
                      defaultValue={d.custom_ru ?? ''}
                      disabled={busy || !d.item_key}
                      onBlur={(e) => {
                        const v = e.target.value.trim();
                        if (v !== (d.custom_ru ?? ''))
                          void saveDay(d.day_number, d.item_key, v || null);
                      }}
                      style={inputStyle}
                    />
                  </label>
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      {previewDay && previewPhrase && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t('editor.previewTitle', { n: previewDay.day_number })}
          onClick={() => setPreview(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 90,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
          data-testid="event-preview"
        >
          <div
            className="card"
            onClick={(e) => e.stopPropagation()}
            style={{
              padding: 24,
              maxWidth: 480,
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              textAlign: 'center',
            }}
          >
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              {t('editor.previewTitle', { n: previewDay.day_number })}
            </span>
            <div
              style={{
                fontSize: 'clamp(26px, 6vw, 38px)',
                fontWeight: 800,
                fontFamily: 'var(--font-display)',
                overflowWrap: 'anywhere',
              }}
            >
              {previewPhrase.bur}
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: 18 }}>{previewPhrase.ru}</div>
            {previewDay.custom_ru && (
              <div
                style={{
                  fontSize: 14,
                  padding: 10,
                  borderRadius: 10,
                  background: 'var(--surface-2)',
                }}
              >
                {t('editor.customPrefix')}: {previewDay.custom_ru}
              </div>
            )}
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setPreview(null)}
              autoFocus
            >
              {t('editor.close')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
