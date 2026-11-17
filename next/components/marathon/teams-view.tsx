'use client';

import { useCallback, useEffect, useState, type ReactElement } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { getTeams, type TeamsData } from '@/lib/api/events';
import { sortedTeams } from '@/lib/marathon/days';

type Load = { status: 'idle' } | { status: 'loading' } | { status: 'error' } | { status: 'ready'; data: TeamsData };

export function TeamsView({ slug, signedIn }: { slug: string; signedIn: boolean }): ReactElement {
  const t = useTranslations('marathon.teams');
  const td = useTranslations('marathon.districts');
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [load, setLoad] = useState<Load>({ status: 'idle' });

  const fetchTeams = useCallback(() => {
    setLoad({ status: 'loading' });
    getTeams(slug)
      .then((data) => setLoad({ status: 'ready', data }))
      .catch(() => setLoad({ status: 'error' }));
  }, [slug]);

  useEffect(() => {
    if (open && load.status === 'idle') fetchTeams();
  }, [open, load.status, fetchTeams]);

  const name = (code: string, fallback: string) => (td.has(code) ? td(code) : fallback);

  return (
    <section className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>{t('title')}</h2>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-muted)' }}>{t('hint')}</p>
        </div>
        <button type="button" className="btn btn-secondary" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
          {open ? t('hide') : t('show')}
        </button>
      </div>

      {open && load.status === 'loading' && <p style={{ margin: 0, color: 'var(--text-muted)' }}>{t('loading')}</p>}
      {open && load.status === 'error' && (
        <div role="alert" style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span>{t('failed')}</span>
          <button type="button" className="btn btn-secondary" onClick={fetchTeams}>
            {t('refresh')}
          </button>
        </div>
      )}
      {open && load.status === 'ready' && (
        <>
          {load.data.teams.length === 0 && <p style={{ margin: 0 }}>{t('empty', { min: load.data.min_size })}</p>}
          {load.data.teams.length > 0 && (
            <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {sortedTeams(load.data.teams).map((row, i) => {
                const mine = load.data.mine === row.code;
                return (
                  <li
                    key={row.code}
                    aria-current={mine ? 'true' : undefined}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '10px 14px',
                      borderRadius: 12,
                      border: `${mine ? 2 : 1}px solid ${mine ? 'var(--primary)' : 'var(--border)'}`,
                      background: mine ? 'var(--primary-50)' : 'var(--surface)',
                    }}
                  >
                    <span style={{ width: 22, fontWeight: 800, color: 'var(--text-muted)' }}>{i + 1}</span>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: 'block', fontWeight: 700 }}>
                        {name(row.code, row.name)}
                        {mine && (
                          <span className="chip chip-primary" style={{ marginLeft: 8 }}>
                            ✔ {t('mine')}
                          </span>
                        )}
                      </span>
                      <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                        {t('row', { p: row.participants.toLocaleString(locale), d: row.days.toLocaleString(locale) })}
                      </span>
                    </span>
                  </li>
                );
              })}
            </ol>
          )}
          {load.data.other && (
            <p style={{ margin: 0, fontSize: 14, color: 'var(--text-muted)' }}>
              <strong>{t('other')}:</strong>{' '}
              {t('row', {
                p: load.data.other.participants.toLocaleString(locale),
                d: load.data.other.days.toLocaleString(locale),
              })}
            </p>
          )}
          {load.data.mine_hidden && <p style={{ margin: 0, fontSize: 14 }}>{t('mineHidden', { min: load.data.min_size })}</p>}
          {!signedIn && (
            <div>
              <Link className="btn btn-primary" href={`/signin?next=${encodeURIComponent(`/${locale}/marathon`)}`}>
                {t('joinTeam')}
              </Link>
            </div>
          )}
        </>
      )}
    </section>
  );
}
