'use client';

import { useEffect, useState, type FormEvent, type ReactElement } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';
import { createEvent, getEvents, type StudioEvent } from '@/lib/api/studio-events';
import { inputStyle } from '../field';
import { LessonSelect } from './lesson-select';

const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const labelStyle = { display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13 } as const;

export function EventsList(): ReactElement {
  const t = useTranslations('studioEvents');
  const router = useRouter();
  const [events, setEvents] = useState<StudioEvent[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [lessonId, setLessonId] = useState<number | null>(null);
  const [startsOn, setStartsOn] = useState('');
  const [daysCount, setDaysCount] = useState('21');
  const [teamMin, setTeamMin] = useState('10');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  const load = () => {
    setFailed(false);
    getEvents()
      .then(setEvents)
      .catch(() => setFailed(true));
  };
  useEffect(load, []);

  const valid = title.trim() !== '' && SLUG_RE.test(slug) && lessonId !== null && startsOn !== '';

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!valid || lessonId === null) return;
    setBusy(true);
    setError(false);
    try {
      const created = await createEvent({
        title: title.trim(),
        slug,
        lesson_id: lessonId,
        starts_on: startsOn,
        days_count: Number(daysCount) || 21,
        team_min_size: Number(teamMin) || 10,
      });
      router.push(`/studio/events/${created.id}`);
    } catch {
      setError(true);
      setBusy(false);
    }
  };

  return (
    <div className="container" style={{ paddingTop: 20, paddingBottom: 48, maxWidth: 820 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }} data-testid="events-list">
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <Link
            href="/studio"
            style={{ fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none' }}
          >
            ← {t('common.back')}
          </Link>
          <h1 style={{ fontSize: 'clamp(22px, 4vw, 30px)' }}>{t('list.title')}</h1>
          <button
            type="button"
            className="btn btn-primary"
            style={{ marginLeft: 'auto' }}
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            data-testid="event-create-toggle"
          >
            {t('list.create')}
          </button>
        </div>

        {open && (
          <form
            className="card"
            style={{
              padding: 16,
              display: 'grid',
              gap: 12,
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            }}
            onSubmit={(e) => void submit(e)}
            data-testid="event-create-form"
          >
            <label style={labelStyle}>
              {t('form.title')}
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={inputStyle}
                data-testid="event-title"
              />
            </label>
            <label style={labelStyle}>
              {t('form.slug')}
              <input
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase())}
                style={inputStyle}
                data-testid="event-slug"
              />
            </label>
            <LessonSelect
              value={lessonId}
              onChange={setLessonId}
              label={t('form.lesson')}
              testId="event-lesson"
            />
            <label style={labelStyle}>
              {t('form.startsOn')}
              <input
                type="date"
                value={startsOn}
                onChange={(e) => setStartsOn(e.target.value)}
                style={inputStyle}
                data-testid="event-starts"
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
            {error && (
              <p
                role="alert"
                style={{ margin: 0, color: 'var(--tertiary-700)', gridColumn: '1 / -1' }}
              >
                {t('list.createFailed')}
              </p>
            )}
            <div style={{ gridColumn: '1 / -1' }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={!valid || busy}
                data-testid="event-create-submit"
              >
                {t('list.createSubmit')}
              </button>
            </div>
          </form>
        )}

        {failed && (
          <div className="card" style={{ padding: 16 }} role="alert">
            {t('common.loadFailed')}{' '}
            <button type="button" className="btn btn-secondary" onClick={load}>
              {t('common.retry')}
            </button>
          </div>
        )}
        {events && events.length === 0 && (
          <div
            className="card"
            style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}
            data-testid="events-empty"
          >
            {t('list.empty')}
          </div>
        )}
        {events?.map((ev) => (
          <Link
            key={ev.id}
            href={`/studio/events/${ev.id}`}
            className="card"
            style={{
              padding: '14px 16px',
              display: 'flex',
              gap: 10,
              alignItems: 'center',
              flexWrap: 'wrap',
              textDecoration: 'none',
              color: 'inherit',
            }}
            data-testid="event-row"
          >
            <strong>{ev.title}</strong>
            <span className={`chip ${ev.status === 'published' ? 'chip-green' : ''}`}>
              {t(`status.${ev.status}`)}
            </span>
            <span style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--text-muted)' }}>
              {t('list.meta', { date: ev.starts_on, days: ev.days_count })}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
