'use client';

import { useEffect, useState, type FormEvent, type ReactElement } from 'react';
import { useTranslations } from 'next-intl';
import { browserTimezone, joinEvent, type EventMe, type Goal, type MarathonEvent } from '@/lib/api/events';
import { getEmailPreferences } from '@/lib/api/email-preferences';
import { DISTRICT_CODES } from '@/lib/marathon/districts';

interface JoinFormProps {
  event: MarathonEvent;
  onJoined: (me: EventMe) => void;
}

const field = { display: 'flex', flexDirection: 'column', gap: 6 } as const;
const hint = { fontSize: 13, color: 'var(--text-muted)' } as const;

export function JoinForm({ event, onJoined }: JoinFormProps): ReactElement {
  const t = useTranslations('marathon.join');
  const td = useTranslations('marathon.districts');
  const [goal, setGoal] = useState<Goal>('daily');
  const [district, setDistrict] = useState('');
  const [news, setNews] = useState(false);
  const [alreadyNews, setAlreadyNews] = useState(event.me?.email_product_news ?? false);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const timezone = browserTimezone();

  useEffect(() => {
    getEmailPreferences()
      .then((p) => setAlreadyNews(p.product_news))
      .catch(() => undefined);
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setFailed(false);
    try {
      const me = await joinEvent(event.slug, {
        goal,
        timezone,
        ...(district ? { district } : {}),
        ...(news && !alreadyNews ? { product_news: true } : {}),
      });
      onJoined(me);
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="card" onSubmit={submit} style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 18 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>{t('title')}</h2>

      <fieldset style={{ ...field, border: 0, padding: 0, margin: 0 }}>
        <legend style={{ fontWeight: 600, marginBottom: 6, padding: 0 }}>{t('goal')}</legend>
        {(['daily', 'final'] as const).map((g) => (
          <label key={g} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <input type="radio" name="goal" checked={goal === g} onChange={() => setGoal(g)} />
            {g === 'daily' ? t('goalDaily') : t('goalFinal')}
          </label>
        ))}
      </fieldset>

      <div style={field}>
        <span style={{ fontWeight: 600 }}>{t('tz', { tz: timezone })}</span>
        <span style={hint}>{t('tzHint')}</span>
      </div>

      <div style={field}>
        <label htmlFor="marathon-district" style={{ fontWeight: 600 }}>
          {t('district')}
        </label>
        <select
          id="marathon-district"
          value={district}
          onChange={(e) => setDistrict(e.target.value)}
          style={{
            padding: '10px 12px',
            borderRadius: 12,
            border: '1px solid var(--border-strong)',
            background: 'var(--surface)',
            color: 'var(--text)',
            maxWidth: 360,
          }}
        >
          <option value="">{t('districtNone')}</option>
          {DISTRICT_CODES.map((code) => (
            <option key={code} value={code}>
              {td(code)}
            </option>
          ))}
        </select>
        <span style={hint}>{t('districtHint')}</span>
      </div>

      <div style={field}>
        <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontWeight: 600 }}>
          <input
            type="checkbox"
            checked={alreadyNews || news}
            disabled={alreadyNews}
            onChange={(e) => setNews(e.target.checked)}
            style={{ marginTop: 4 }}
          />
          <span>{alreadyNews ? t('newsAlready') : t('news')}</span>
        </label>
        {!alreadyNews && <span style={{ ...hint, paddingLeft: 26 }}>{t('newsHint')}</span>}
      </div>

      {failed && (
        <p role="alert" style={{ margin: 0, color: 'var(--tertiary-700)', fontSize: 14 }}>
          {t('failed')}
        </p>
      )}
      <div>
        <button type="submit" className="btn btn-primary" disabled={busy}>
          {busy ? t('submitting') : t('submit')}
        </button>
      </div>
    </form>
  );
}
