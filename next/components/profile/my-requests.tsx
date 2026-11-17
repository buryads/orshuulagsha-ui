'use client';

import { useEffect, useState, type ReactElement } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import {
  listMyWordRequests,
  markWordRequestsSeen,
  unfollowWordRequest,
  type MyWordRequest,
} from '@/lib/api/word-requests';
import { useCurrentUser } from '@/lib/use-current-user';
import {
  WORD_REQUESTS_SEEN_EVENT,
  pluralPeople,
  statusTextKey,
  type WordRequestStatus,
} from '@/lib/word-requests';

const MY_REQUESTS_CSS = `
.wr-table { display: none; }
.wr-cards { display: flex; flex-direction: column; gap: 12px; }
@media (min-width: 721px) {
  .wr-table { display: block; }
  .wr-cards { display: none; }
}
`;

const STATUS_DOT: Record<WordRequestStatus, string> = {
  open: 'var(--accent-warm)',
  answered: 'var(--primary)',
  added: 'var(--accent-green)',
  rejected: 'var(--tertiary)',
};

const COLUMNS = ['word', 'direction', 'status', 'action'] as const;

function Skeleton(): ReactElement {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            height: 40,
            borderRadius: 10,
            background: 'linear-gradient(90deg, var(--surface) 0%, var(--surface-2) 50%, var(--surface) 100%)',
            backgroundSize: '200% 100%',
            animation: 'wave 1.4s ease-in-out infinite',
          }}
        />
      ))}
    </div>
  );
}

export function MyRequests(): ReactElement {
  const t = useTranslations('ask');
  const locale = useLocale();
  const { ready, signedIn } = useCurrentUser();
  const [items, setItems] = useState<MyWordRequest[] | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [actionFailed, setActionFailed] = useState(false);
  const [pendingId, setPendingId] = useState<number | null>(null);

  useEffect(() => {
    if (!ready || !signedIn) return;
    let cancelled = false;
    setLoadFailed(false);
    listMyWordRequests()
      .then((list) => {
        if (cancelled) return;
        setItems(list);
        markWordRequestsSeen()
          .then(() => window.dispatchEvent(new Event(WORD_REQUESTS_SEEN_EVENT)))
          .catch(() => undefined);
      })
      .catch(() => {
        if (!cancelled) setLoadFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [ready, signedIn, reloadKey]);

  async function stopFollowing(id: number): Promise<void> {
    setPendingId(id);
    setActionFailed(false);
    try {
      await unfollowWordRequest(id);
      setItems((prev) => prev?.filter((item) => item.id !== id) ?? prev);
    } catch {
      setActionFailed(true);
    } finally {
      setPendingId(null);
    }
  }

  function statusText(item: MyWordRequest): string {
    if (item.status === 'rejected' && item.reject_reason === 'typo' && item.reject_hint) {
      return t('reject.typoHint', { hint: item.reject_hint });
    }
    const key = statusTextKey(item.status, item.reject_reason);
    if (item.status === 'open') return t(key, { people: pluralPeople(item.demand, locale) });
    return t(key);
  }

  function directionText(item: MyWordRequest): string {
    return item.direction === 'ru2bur' ? t('page.directionRuBur') : t('page.directionBurRu');
  }

  function renderStatus(item: MyWordRequest): ReactElement {
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: STATUS_DOT[item.status], flexShrink: 0 }} />
        <span style={{ fontSize: 14 }}>{statusText(item)}</span>
        {!item.notify && (
          <span className="chip" style={{ fontSize: 11, padding: '2px 8px' }}>
            {t('page.noMail')}
          </span>
        )}
      </span>
    );
  }

  function renderActions(item: MyWordRequest): ReactElement {
    return (
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {item.status === 'added' && item.word_slug && (
          <Link
            href={`/words/${encodeURIComponent(item.word_slug)}`}
            className="btn btn-primary"
            style={{ textDecoration: 'none', padding: '6px 12px', fontSize: 13 }}
          >
            {t('openWord')}
          </Link>
        )}
        <button
          type="button"
          className="btn btn-ghost"
          disabled={pendingId === item.id}
          onClick={() => void stopFollowing(item.id)}
          style={{ padding: '6px 12px', fontSize: 13 }}
        >
          {t('page.stopFollowing')}
        </button>
      </div>
    );
  }

  function renderBody(): ReactElement {
    if (ready && !signedIn) {
      return (
        <div className="card" style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start' }}>
          <p style={{ margin: 0 }}>{t('page.guest')}</p>
          <Link href={`/signin?next=${encodeURIComponent(`/${locale}/profile/requests`)}`} className="btn btn-primary" style={{ textDecoration: 'none' }}>
            {t('sheet.signIn')}
          </Link>
        </div>
      );
    }
    if (loadFailed) {
      return (
        <div className="card" role="alert" style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start' }}>
          <p style={{ margin: 0, color: 'var(--tertiary-700)' }}>{t('page.loadFailed')}</p>
          <button type="button" className="btn btn-secondary" onClick={() => setReloadKey((k) => k + 1)}>
            {t('page.retry')}
          </button>
        </div>
      );
    }
    if (items === null) return <Skeleton />;
    if (items.length === 0) {
      return (
        <div className="card" style={{ padding: 22, color: 'var(--text-muted)', fontSize: 14, borderStyle: 'dashed', textAlign: 'center' }}>
          {t('page.empty')}
        </div>
      );
    }
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: MY_REQUESTS_CSS }} />
        {actionFailed && (
          <p role="alert" style={{ margin: '0 0 12px', fontSize: 14, color: 'var(--tertiary-700)' }}>
            {t('page.actionFailed')}
          </p>
        )}
        <div className="wr-table card" style={{ padding: 0, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ textAlign: 'left', color: 'var(--text-soft)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {COLUMNS.map((column) => (
                  <th key={column} style={{ padding: '14px 16px', fontWeight: 700 }}>
                    {t(`page.column.${column}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} style={{ borderTop: '1px solid var(--border)' }}>
                  <td style={{ padding: '14px 16px', fontWeight: 700, fontFamily: 'var(--font-display)' }}>{item.query}</td>
                  <td style={{ padding: '14px 16px', color: 'var(--text-muted)' }}>{directionText(item)}</td>
                  <td style={{ padding: '14px 16px' }}>{renderStatus(item)}</td>
                  <td style={{ padding: '14px 16px' }}>{renderActions(item)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="wr-cards">
          {items.map((item) => (
            <article key={item.id} className="card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 20, fontWeight: 700, fontFamily: 'var(--font-display)' }}>{item.query}</span>
                <span style={{ fontSize: 12, color: 'var(--text-soft)' }}>{directionText(item)}</span>
              </div>
              {renderStatus(item)}
              {renderActions(item)}
            </article>
          ))}
        </div>
      </>
    );
  }

  return (
    <div className="container fade-up" style={{ paddingTop: 32, paddingBottom: 40, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <h1 style={{ margin: 0, fontSize: 28, fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>
        {t('page.title')}
      </h1>
      {renderBody()}
    </div>
  );
}
