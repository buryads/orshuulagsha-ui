'use client';

import { useCallback, useEffect, useState, type ReactElement } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { postAnswers, type MarathonEvent } from '@/lib/api/events';
import { defaultDay, formatDate, selectableDay } from '@/lib/marathon/days';
import { pendingGuestDays, replayGuestDays } from '@/lib/marathon/guest-progress';
import { useCurrentUser } from '@/lib/use-current-user';
import { AudioButton } from './audio-button';
import { DayQuiz } from './day-quiz';
import { FinalDictation } from './final-dictation';
import { JoinForm } from './join-form';
import { StreakStrip } from './streak-strip';
import { TeamsView } from './teams-view';
import { useCurrentEvent } from './use-current-event';

const wrap = { paddingTop: 32, paddingBottom: 48, display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 760 } as const;

export function MarathonView(): ReactElement {
  const t = useTranslations('marathon');
  const load = useCurrentEvent();

  if (load.status === 'loading') {
    return (
      <div className="container" style={wrap}>
        <p style={{ color: 'var(--text-muted)' }}>{t('loading')}</p>
      </div>
    );
  }
  if (load.status === 'error') {
    return (
      <div className="container" style={wrap}>
        <p>{t('offline')}</p>
        <div>
          <button type="button" className="btn btn-secondary" onClick={load.reload}>
            {t('retry')}
          </button>
        </div>
      </div>
    );
  }
  if (!load.event) {
    return (
      <div className="container" style={wrap}>
        <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0 }}>{t('empty.title')}</h1>
        <p style={{ margin: 0, color: 'var(--text-muted)' }}>{t('empty.text')}</p>
        <div>
          <Link className="btn btn-secondary" href="/">
            {t('empty.home')}
          </Link>
        </div>
      </div>
    );
  }
  return <EventScreen event={load.event} reload={load.reload} />;
}

function EventScreen({ event, reload }: { event: MarathonEvent; reload: () => void }): ReactElement {
  const t = useTranslations('marathon');
  const locale = useLocale();
  const { signedIn, ready } = useCurrentUser();
  const [selected, setSelected] = useState<number | null>(() => defaultDay(event));
  const [justJoined, setJustJoined] = useState(false);
  const me = event.me;
  const joined = !!me?.joined;

  const replay = useCallback(async () => {
    if (pendingGuestDays(event.slug).length === 0) return;
    const count = await replayGuestDays(event.slug, (day, answers) => postAnswers(event.slug, day, answers));
    if (count > 0) reload();
  }, [event.slug, reload]);

  useEffect(() => {
    if (ready && signedIn && joined) void replay();
  }, [ready, signedIn, joined, replay]);

  const onJoined = () => {
    setJustJoined(true);
    void replay().finally(reload);
  };

  const day = event.days.find((d) => d.n === selected) ?? null;
  const completed = me?.completed ?? [];
  const loginHref = `/signin?next=${encodeURIComponent(`/${locale}/marathon`)}`;
  const stateLine =
    event.state === 'upcoming'
      ? t('state.upcoming', { date: formatDate(event.starts_on, locale) })
      : event.state === 'finished'
        ? t('state.finished')
        : t('state.running', { today: event.today ?? 1, total: event.days_count });

  return (
    <div className="container fade-up" style={wrap}>
      <header style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <h1 style={{ fontSize: 30, fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>{t('title')}</h1>
        <p style={{ margin: 0, color: 'var(--text-muted)', fontWeight: 600 }}>
          {stateLine}
          {event.state !== 'upcoming' && ` · ${t('total', { n: event.total_days_completed.toLocaleString(locale) })}`}
        </p>
        {joined && me && event.state !== 'upcoming' && (
          <p style={{ margin: 0, fontWeight: 700 }}>{t('streak', { n: me.streak })}</p>
        )}
        {ready && !signedIn && event.state === 'running' && (
          <div style={{ marginTop: 8 }}>
            <Link className="btn btn-secondary" href={loginHref}>
              {t('banner.join')}
            </Link>
          </div>
        )}
      </header>

      {me?.notice && (
        <p role="status" className="card" style={{ margin: 0, padding: '12px 16px' }}>
          {t(`notice.${me.notice}`)}
        </p>
      )}

      {justJoined && joined && me && (
        <p role="status" className="card" style={{ margin: 0, padding: '12px 16px', fontWeight: 700 }}>
          {event.state === 'upcoming'
            ? t('join.joinedUpcoming', { date: formatDate(event.starts_on, locale) })
            : t('join.joinedStreak', { n: me.streak })}
        </p>
      )}

      {event.state === 'upcoming' && !joined && (
        <section className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {!signedIn ? (
            <>
              <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>{t('join.remindTitle')}</h2>
              <p style={{ margin: 0 }}>{t('join.remindText')}</p>
              <div>
                <Link className="btn btn-primary" href={loginHref}>
                  {t('join.remind')}
                </Link>
              </div>
            </>
          ) : (
            ready && <JoinForm event={event} onJoined={onJoined} />
          )}
        </section>
      )}

      {event.state !== 'upcoming' && (
        <>
          <StreakStrip days={event.days} completed={completed} selected={selected} onSelect={setSelected} />

          {day && (
            <section className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
              {selectableDay(day) && day.phrase ? (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: 'var(--text-muted)' }}>
                      {t('strip.day', { n: day.n })}
                    </p>
                    <p style={{ margin: 0, fontSize: 28, fontWeight: 800, lineHeight: 1.25, color: 'var(--primary-900)' }}>
                      {day.phrase.bur}
                    </p>
                    <p style={{ margin: 0, fontSize: 18 }}>{day.phrase.ru}</p>
                  </div>
                  <div>
                    <AudioButton url={day.phrase.audio_url} />
                  </div>
                  {day.phrase.custom_ru && (
                    <p style={{ margin: 0, padding: '10px 14px', borderRadius: 12, background: 'var(--surface-2)' }}>
                      <strong>{t('day.custom')}:</strong> {day.phrase.custom_ru}
                    </p>
                  )}
                  {event.state === 'finished' && (
                    <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>{t('day.archive')}</p>
                  )}
                  <QuizToggle
                    key={`${event.slug}-${day.n}`}
                    slug={event.slug}
                    day={day.n}
                    signedIn={signedIn}
                    onSaved={reload}
                  />
                </>
              ) : day.status === 'locked' ? (
                <p style={{ margin: 0, fontWeight: 600 }}>{t('day.locked', { date: formatDate(day.date, locale) })}</p>
              ) : (
                <p style={{ margin: 0, fontWeight: 600 }}>{t('day.updating')}</p>
              )}
            </section>
          )}

          {ready && signedIn && !joined && event.state === 'running' && <JoinForm event={event} onJoined={onJoined} />}
          <TeamsView slug={event.slug} signedIn={signedIn} />
          <FinalDictation event={event} signedIn={signedIn} />
        </>
      )}

      {event.greetings_available && (
        <div>
          <Link className="btn btn-secondary" href="/cards">
            {t('cardLink')}
          </Link>
        </div>
      )}
    </div>
  );
}

function QuizToggle({
  slug,
  day,
  signedIn,
  onSaved,
}: {
  slug: string;
  day: number;
  signedIn: boolean;
  onSaved: () => void;
}): ReactElement {
  const t = useTranslations('marathon.day');
  const [open, setOpen] = useState(false);
  if (!open) {
    return (
      <div>
        <button type="button" className="btn btn-primary" onClick={() => setOpen(true)}>
          {t('check')}
        </button>
      </div>
    );
  }
  return <DayQuiz slug={slug} day={day} signedIn={signedIn} onSaved={onSaved} />;
}
