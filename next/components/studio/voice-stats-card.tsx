'use client';

import { useEffect, useState, type ReactElement } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { getVoiceStats, type FlaggedRecording, type VoiceStats } from '@/lib/api/studio-flow';

const CARD_STYLE = {
  padding: '12px 16px',
  display: 'flex',
  flexDirection: 'column' as const,
  gap: 10,
};

export function VoiceStatsCard(): ReactElement | null {
  const t = useTranslations('studio.flow');
  const ts = useTranslations('studio.flow.stats');
  const [stats, setStats] = useState<VoiceStats | null>(null);
  const [failed, setFailed] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    getVoiceStats()
      .then(setStats)
      .catch(() => setFailed(true));
  }, []);

  if (failed || !stats) return null;

  const reasonLine = (r: FlaggedRecording) =>
    r.reason === 'cant_hear'
      ? t('rerecord.statCantHear', { notRecognized: r.not_recognized, heard: r.heard })
      : t('rerecord.statMisheard', { notRecognized: r.not_recognized, heard: r.heard });

  return (
    <>
      <div className="card" style={CARD_STYLE} data-testid="voice-stats">
        <div style={{ fontWeight: 700 }} data-testid="voice-stats-recognized">
          {stats.heard === 0 ? ts('empty') : ts('recognized', { n: stats.recognized })}
        </div>
        {stats.heard > 0 && (
          <div>
            <button
              type="button"
              className="btn btn-ghost"
              aria-expanded={open}
              onClick={() => setOpen((o) => !o)}
              style={{ fontSize: 14 }}
              data-testid="voice-stats-toggle"
            >
              {open ? ts('hide') : ts('details')}
            </button>
          </div>
        )}
        {open && stats.heard > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {stats.top.length > 0 && (
              <section>
                <h3 style={{ margin: '0 0 6px', fontSize: 14 }}>{ts('top')}</h3>
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
                  {stats.top.map((r) => (
                    <li key={r.uuid} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <span>
                        {r.text} ·{' '}
                        <span style={{ color: 'var(--text-muted)' }}>
                          {ts('timesRecognized', { n: r.recognized })}
                        </span>
                      </span>
                      <audio
                        controls
                        preload="none"
                        src={r.audio_url}
                        aria-label={r.text}
                        style={{ width: '100%' }}
                      />
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {stats.flagged.length > 0 && (
              <section>
                <h3 style={{ margin: '0 0 6px', fontSize: 14 }}>{ts('flagged')}</h3>
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
                  {stats.flagged.map((r) => (
                    <li key={r.uuid} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <span>
                        {r.text} ·{' '}
                        <span style={{ color: 'var(--text-muted)' }}>{reasonLine(r)}</span>
                      </span>
                      <audio
                        controls
                        preload="none"
                        src={r.audio_url}
                        aria-label={r.text}
                        style={{ width: '100%' }}
                      />
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        )}
      </div>
      {stats.needs_rerecord > 0 && (
        <div
          className="card"
          style={{ ...CARD_STYLE, flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}
          data-testid="voice-stats-rerecord"
        >
          <div style={{ flex: '1 1 200px' }}>
            <div style={{ fontWeight: 700 }}>{ts('needs', { n: stats.needs_rerecord })}</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{ts('needsHint')}</div>
          </div>
          <Link
            href="/studio/flow?mode=voice"
            className="btn btn-primary"
            style={{ textDecoration: 'none' }}
          >
            {ts('rerecordCta')}
          </Link>
        </div>
      )}
    </>
  );
}
