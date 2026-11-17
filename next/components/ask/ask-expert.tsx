'use client';

import { useEffect, useRef, useState, type MouseEvent, type ReactElement } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { AskSheet } from '@/components/ask/ask-sheet';
import { getEmailPreferences } from '@/lib/api/email-preferences';
import {
  createWordRequest,
  lookupWordRequest,
  type WordRequestCreated,
  type WordRequestLookup,
} from '@/lib/api/word-requests';
import { useCurrentUser } from '@/lib/use-current-user';
import {
  pluralPeople,
  rejectTextKey,
  takeReopen,
  type WordRequestDirection,
} from '@/lib/word-requests';

export interface AskExpertProps {
  query: string;
  direction: WordRequestDirection;
}

type Notice = 'joined' | 'created' | 'joinFailed' | 'sendFailed';

const EMPTY_LOOKUP = (query: string): WordRequestLookup => ({
  normalized: query,
  in_dictionary: null,
  request: null,
});

export function AskExpert({ query, direction }: AskExpertProps): ReactElement {
  const t = useTranslations('ask');
  const locale = useLocale();
  const { signedIn, ready } = useCurrentUser();
  const [lookup, setLookup] = useState<WordRequestLookup | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [newsOn, setNewsOn] = useState(false);
  const lastTrigger = useRef<HTMLElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLookup(null);
    setNotice(null);
    lookupWordRequest(direction, query)
      .then((value) => {
        if (!cancelled) setLookup(value);
      })
      .catch(() => {
        if (!cancelled) setLookup(EMPTY_LOOKUP(query));
      });
    return () => {
      cancelled = true;
    };
  }, [direction, query]);

  useEffect(() => {
    if (!ready || !signedIn) return;
    if (takeReopen(query)) setSheetOpen(true);
    getEmailPreferences()
      .then((prefs) => setNewsOn(prefs.product_news))
      .catch(() => undefined);
  }, [ready, signedIn, query]);

  function openSheet(event: MouseEvent<HTMLElement>): void {
    lastTrigger.current = event.currentTarget;
    setSheetOpen(true);
  }

  function closeSheet(): void {
    setSheetOpen(false);
    const trigger = lastTrigger.current;
    if (trigger?.isConnected) trigger.focus();
  }

  function applyCreated(created: WordRequestCreated): void {
    setLookup((prev) => {
      const base = prev ?? EMPTY_LOOKUP(query);
      return {
        ...base,
        request: {
          id: created.id,
          status: created.status,
          demand: created.demand,
          reject_reason: null,
          reject_hint: null,
          hint_slug: null,
          word_slug: base.request?.word_slug ?? null,
          following: true,
        },
      };
    });
  }

  async function quickRequest(event: MouseEvent<HTMLButtonElement>, retry: boolean): Promise<void> {
    if (!signedIn) {
      openSheet(event);
      return;
    }
    setBusy(true);
    setNotice(null);
    try {
      const created = await createWordRequest({ direction, query: query.trim(), notify: newsOn });
      applyCreated(created);
      setNotice(!retry && created.joined ? 'joined' : 'created');
    } catch {
      setNotice(retry ? 'sendFailed' : 'joinFailed');
    } finally {
      setBusy(false);
    }
  }

  const request = lookup?.request ?? null;
  const wordSlug = lookup?.in_dictionary?.slug ?? (request?.status === 'added' ? request.word_slug : null);
  const people = request ? pluralPeople(request.demand, locale) : '';

  function rejectText(): string {
    if (request?.reject_reason === 'typo' && request.reject_hint) {
      return t('reject.typoHint', { hint: request.reject_hint });
    }
    return t(rejectTextKey(request?.reject_reason ?? null));
  }

  function renderAction(): ReactElement | null {
    if (!lookup) return null;
    if (wordSlug) {
      return (
        <>
          <p style={{ margin: 0, fontSize: 14 }}>{t('inDictionary')}</p>
          <Link href={`/words/${encodeURIComponent(wordSlug)}`} className="btn btn-primary" style={{ textDecoration: 'none' }}>
            {t('openWord')}
          </Link>
        </>
      );
    }
    if (!request) {
      return (
        <button type="button" className="btn btn-primary" onClick={openSheet}>
          {t('askButton')}
        </button>
      );
    }
    if (request.status === 'rejected') {
      return (
        <>
          <p style={{ margin: 0, fontSize: 14, color: 'var(--text-muted)' }}>{rejectText()}</p>
          <button type="button" className="btn btn-primary" disabled={busy} onClick={(e) => void quickRequest(e, true)}>
            {t('retryButton')}
          </button>
        </>
      );
    }
    const answered = request.status === 'answered';
    return (
      <>
        <p style={{ margin: 0, fontSize: 14, color: 'var(--text-muted)' }}>
          {answered ? t('answered') : t('requestedBy', { people })}
        </p>
        {request.following ? (
          <button type="button" className="btn btn-secondary" disabled>
            {t('following')}
          </button>
        ) : (
          <button type="button" className="btn btn-primary" disabled={busy} onClick={(e) => void quickRequest(e, false)}>
            {answered ? t('followButton') : t('joinButton')}
          </button>
        )}
      </>
    );
  }

  function noticeText(value: Notice): string {
    if (value === 'joined') return t('joined');
    if (value === 'created') return t('sheet.doneCreated');
    if (value === 'joinFailed') return t('joinFailed');
    return t('sheet.failed');
  }

  return (
    <div className="fade-up" style={{ marginTop: 20 }}>
      <div
        className="card"
        data-testid="ask-expert"
        style={{
          padding: 22,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 10,
          textAlign: 'center',
          borderStyle: 'dashed',
        }}
      >
        <p style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>{t('emptyTitle', { query })}</p>
        <p style={{ margin: 0, fontSize: 14, color: 'var(--text-muted)' }}>{t('emptyHint')}</p>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          {renderAction()}
        </div>
        {notice && (
          <p
            role="status"
            style={{ margin: 0, fontSize: 14, color: notice.endsWith('Failed') ? 'var(--tertiary-700)' : 'var(--text)' }}
          >
            {noticeText(notice)}
          </p>
        )}
        {notice === 'joined' || notice === 'created' ? (
          <Link href="/profile/requests" style={{ fontSize: 14, color: 'var(--primary)' }}>
            {t('myRequests')}
          </Link>
        ) : null}
      </div>
      {sheetOpen && (
        <AskSheet
          query={query}
          direction={direction}
          signedIn={signedIn}
          onClose={closeSheet}
          onSubmitted={applyCreated}
        />
      )}
    </div>
  );
}
