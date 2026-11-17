'use client';

import {
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
  type ReactElement,
} from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Icon } from '@/components/ui/icon';
import { inputStyle } from '@/components/studio/field';
import { getEmailPreferences } from '@/lib/api/email-preferences';
import {
  createWordRequest,
  readWordRequestError,
  type WordRequestCreated,
} from '@/lib/api/word-requests';
import {
  CONTEXT_MAX_LENGTH,
  WORD_MAX_LENGTH,
  clearDraft,
  isWordLengthValid,
  loadDraft,
  markReopen,
  saveDraft,
  type WordRequestDirection,
  type WordRequestDraft,
} from '@/lib/word-requests';

const SHEET_CSS = `
.ask-sheet-overlay { position: fixed; inset: 0; z-index: 100; background: rgba(14,16,19,0.5); display: flex; align-items: flex-end; justify-content: center; }
.ask-sheet { width: 100%; max-height: 90vh; overflow-y: auto; box-sizing: border-box; background: var(--surface-elev); border-radius: 20px 20px 0 0; padding: 12px 18px 22px; display: flex; flex-direction: column; gap: 14px; }
.ask-sheet:focus { outline: none; }
.ask-sheet-grip { width: 40px; height: 4px; border-radius: 2px; background: var(--border-strong); align-self: center; }
.ask-sheet-field { display: flex; flex-direction: column; gap: 6px; font-size: 13px; color: var(--text-muted); }
.ask-sheet-counter { align-self: flex-end; font-size: 12px; color: var(--text-soft); }
.ask-sheet-error { margin: 0; font-size: 13px; font-weight: 500; color: var(--tertiary-700); }
.ask-sheet-check { display: flex; gap: 12px; align-items: flex-start; cursor: pointer; }
.ask-sheet-check input { margin-top: 3px; width: 18px; height: 18px; flex-shrink: 0; accent-color: var(--primary); }
.ask-sheet-radios { display: flex; gap: 8px; flex-wrap: wrap; border: none; margin: 0; padding: 0; }
.ask-sheet-radios label { display: inline-flex; align-items: center; gap: 6px; padding: 8px 12px; border-radius: 999px; border: 1px solid var(--border-strong); font-size: 14px; cursor: pointer; }
.ask-sheet-actions { display: flex; gap: 8px; justify-content: flex-end; flex-wrap: wrap; }
.ask-spin { display: inline-block; width: 12px; height: 12px; margin-right: 6px; border: 2px solid currentColor; border-right-color: transparent; border-radius: 50%; animation: ask-spin 0.7s linear infinite; vertical-align: -2px; }
@keyframes ask-spin { to { transform: rotate(360deg); } }
@media (min-width: 721px) {
  .ask-sheet-overlay { align-items: center; padding: 16px; }
  .ask-sheet { max-width: 480px; border-radius: 20px; padding: 22px 24px 24px; }
  .ask-sheet-grip { display: none; }
}
`;

const FOCUSABLE = 'button:not([disabled]), a[href], input:not([disabled]), textarea:not([disabled])';

function buildReturnPath(): string {
  return `${window.location.pathname}${window.location.search}`;
}

function initialDraft(query: string, direction: WordRequestDirection): WordRequestDraft {
  const saved = loadDraft();
  if (saved && saved.query === query) return saved;
  return { query, direction, context: '', notify: false };
}

export interface AskSheetProps {
  query: string;
  direction: WordRequestDirection;
  signedIn: boolean;
  onClose: () => void;
  onSubmitted: (created: WordRequestCreated) => void;
}

export function AskSheet({ query, direction, signedIn, onClose, onSubmitted }: AskSheetProps): ReactElement {
  const t = useTranslations('ask');
  const titleId = useId();
  const wordId = useId();
  const contextId = useId();
  const newsId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const wordRef = useRef<HTMLInputElement>(null);
  const contextRef = useRef<HTMLInputElement>(null);
  const successRef = useRef<HTMLParagraphElement>(null);

  const [initial] = useState(() => initialDraft(query, direction));
  const [word, setWord] = useState(initial.query);
  const [dir, setDir] = useState<WordRequestDirection>(initial.direction);
  const [context, setContext] = useState(initial.context);
  const [news, setNews] = useState(initial.notify);
  const [newsOn, setNewsOn] = useState(false);
  const [returnPath] = useState(buildReturnPath);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<WordRequestCreated | null>(null);
  const [wordError, setWordError] = useState<string | null>(null);
  const [contextError, setContextError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [dictSlug, setDictSlug] = useState<string | null>(null);

  useEffect(() => {
    (wordRef.current ?? dialogRef.current)?.focus();
  }, []);

  useEffect(() => {
    if (done) successRef.current?.focus();
  }, [done]);

  useEffect(() => {
    if (!signedIn) return;
    getEmailPreferences()
      .then((prefs) => {
        setNewsOn(prefs.product_news);
        if (prefs.product_news) setNews(true);
      })
      .catch(() => undefined);
  }, [signedIn]);

  useEffect(() => {
    if (!done) saveDraft({ query: word, direction: dir, context, notify: news });
  }, [word, dir, context, news, done]);

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>): void {
    if (e.key === 'Escape') {
      e.stopPropagation();
      onClose();
      return;
    }
    if (e.key !== 'Tab' || !dialogRef.current) return;
    const items = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
    const first = items[0];
    const last = items[items.length - 1];
    if (!first || !last) return;
    const active = document.activeElement;
    if (e.shiftKey && (active === first || active === dialogRef.current)) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && active === last) {
      e.preventDefault();
      first.focus();
    }
  }

  async function submit(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    if (busy) return;
    setWordError(null);
    setContextError(null);
    setFormError(null);
    setDictSlug(null);
    if (!isWordLengthValid(word)) {
      setWordError(t('sheet.wordError'));
      wordRef.current?.focus();
      return;
    }
    setBusy(true);
    try {
      const created = await createWordRequest({
        direction: dir,
        query: word.trim(),
        context: context.trim() || undefined,
        notify: news || newsOn,
      });
      clearDraft();
      setDone(created);
      onSubmitted(created);
    } catch (error) {
      setBusy(false);
      const info = readWordRequestError(error);
      switch (info.code) {
        case 'length':
          setWordError(t('sheet.wordError'));
          wordRef.current?.focus();
          break;
        case 'filter':
          setFormError(t('sheet.filter'));
          break;
        case 'context_contacts':
          setContextError(t('sheet.contextError'));
          contextRef.current?.focus();
          break;
        case 'in_dictionary':
          setDictSlug(info.slug ?? null);
          setFormError(t('inDictionary'));
          break;
        case 'daily_limit':
          setFormError(t('sheet.dailyLimit'));
          break;
        default:
          setFormError(t('sheet.failed'));
      }
    }
  }

  function renderBody(): ReactElement {
    if (!signedIn) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <p style={{ margin: 0, fontSize: 15 }}>{t('sheet.guestTitle')}</p>
          <div className="ask-sheet-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              {t('sheet.cancel')}
            </button>
            <Link
              href={`/signin?next=${encodeURIComponent(returnPath)}`}
              onClick={() => markReopen(query)}
              className="btn btn-primary"
              style={{ textDecoration: 'none' }}
            >
              {t('sheet.signIn')}
            </Link>
          </div>
        </div>
      );
    }

    if (done) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <p ref={successRef} tabIndex={-1} role="status" style={{ margin: 0, fontSize: 15, outline: 'none' }}>
            {done.joined ? t('sheet.doneJoined') : t('sheet.doneCreated')}
          </p>
          <div className="ask-sheet-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              {t('sheet.close')}
            </button>
            <Link href="/profile/requests" className="btn btn-primary" style={{ textDecoration: 'none' }}>
              {t('sheet.goToRequests')}
            </Link>
          </div>
        </div>
      );
    }

    const wordErrorId = `${wordId}-error`;
    const contextErrorId = `${contextId}-error`;
    return (
      <form onSubmit={(e) => void submit(e)} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="ask-sheet-field">
          <label htmlFor={wordId}>{t('sheet.wordLabel')}</label>
          <input
            id={wordId}
            ref={wordRef}
            value={word}
            onChange={(e) => setWord(e.target.value)}
            aria-invalid={wordError ? true : undefined}
            aria-describedby={wordError ? wordErrorId : undefined}
            autoComplete="off"
            style={inputStyle}
          />
          <span className="ask-sheet-counter">
            {t('sheet.counter', { count: word.length, max: WORD_MAX_LENGTH })}
          </span>
          {wordError && (
            <p id={wordErrorId} role="alert" className="ask-sheet-error">
              {wordError}
            </p>
          )}
        </div>

        <fieldset className="ask-sheet-radios">
          <legend style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 6 }}>
            {t('sheet.directionLabel')}
          </legend>
          {(['ru2bur', 'bur2ru'] as const).map((value) => (
            <label key={value} style={{ background: dir === value ? 'var(--primary-50)' : 'transparent' }}>
              <input
                type="radio"
                name={`${titleId}-direction`}
                value={value}
                checked={dir === value}
                onChange={() => setDir(value)}
                style={{ accentColor: 'var(--primary)' }}
              />
              {t(`sheet.${value}`)}
            </label>
          ))}
        </fieldset>

        <div className="ask-sheet-field">
          <label htmlFor={contextId}>{t('sheet.contextLabel')}</label>
          <span style={{ fontSize: 12, color: 'var(--text-soft)' }}>{t('sheet.contextHint')}</span>
          <input
            id={contextId}
            ref={contextRef}
            value={context}
            maxLength={CONTEXT_MAX_LENGTH}
            onChange={(e) => setContext(e.target.value)}
            aria-invalid={contextError ? true : undefined}
            aria-describedby={contextError ? contextErrorId : undefined}
            style={inputStyle}
          />
          <span className="ask-sheet-counter">
            {t('sheet.counter', { count: context.length, max: CONTEXT_MAX_LENGTH })}
          </span>
          {contextError && (
            <p id={contextErrorId} role="alert" className="ask-sheet-error">
              {contextError}
            </p>
          )}
        </div>

        <label htmlFor={newsId} className="ask-sheet-check">
          <input
            id={newsId}
            type="checkbox"
            checked={newsOn || news}
            disabled={newsOn}
            onChange={(e) => setNews(e.target.checked)}
          />
          <span style={{ minWidth: 0 }}>
            <span style={{ display: 'block', fontWeight: 600 }}>{t('sheet.newsLabel')}</span>
            <span style={{ display: 'block', fontSize: 13, color: 'var(--text-muted)' }}>
              {newsOn ? t('sheet.newsAlreadyOn') : t('sheet.newsHint')}
            </span>
          </span>
        </label>

        {formError && (
          <p role="alert" className="ask-sheet-error">
            {formError}
            {dictSlug && (
              <>
                {' '}
                <Link href={`/words/${encodeURIComponent(dictSlug)}`} style={{ color: 'var(--primary)' }}>
                  {t('openWord')}
                </Link>
              </>
            )}
          </p>
        )}

        <div className="ask-sheet-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            {t('sheet.cancel')}
          </button>
          <button type="submit" className="btn btn-primary" aria-disabled={busy || undefined} aria-busy={busy || undefined}>
            {busy && <span className="ask-spin" aria-hidden="true" />}
            {busy ? t('sheet.sending') : t('sheet.submit')}
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="ask-sheet-overlay" onClick={onClose}>
      <style dangerouslySetInnerHTML={{ __html: SHEET_CSS }} />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="ask-sheet"
        tabIndex={-1}
        onKeyDown={onKeyDown}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="ask-sheet-grip" aria-hidden="true" />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <h2 id={titleId} style={{ margin: 0, fontSize: 18, flex: 1 }}>
            {t('sheet.title')}
          </h2>
          <button type="button" className="btn-icon" onClick={onClose} aria-label={t('sheet.close')} style={{ width: 32, height: 32 }}>
            <Icon name="x" size={16} />
          </button>
        </div>
        {renderBody()}
      </div>
    </div>
  );
}
