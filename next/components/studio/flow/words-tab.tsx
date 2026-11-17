'use client';

import { useEffect, useRef, useState, type ReactElement } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Field } from '@/components/studio/field';
import {
  agreeWordRequest,
  answerWordRequest,
  isConflict,
  rejectWordRequest,
  skipFlowItem,
  touchWordRequest,
  undoRejectWordRequest,
  type WordItem,
  type WordRejectReason,
} from '@/lib/api/studio-flow';
import {
  clearDraft,
  cleanTranslations,
  readDraft,
  sessionStorageOrNull,
  writeDraft,
  EMPTY_DRAFT,
} from '@/lib/studio/word-draft';
import { enForm, ruForm } from '@/lib/studio/word-plural';
import { QueueState } from './states';
import type { QueueState as QueueData } from './use-flow-queue';

const TOUCH_MS = 60_000;
const MAX_HINT = 60;
const MAX_VALUES = 3;

type Pending = 'answer' | 'agree' | 'reject' | 'undo' | null;
type Failure = 'send' | 'save' | null;

export interface WordsTabProps {
  queue: QueueData<WordItem>;
  advance: (before?: () => Promise<unknown>) => Promise<void>;
  reload: () => Promise<void>;
  onDone: () => void;
  onSkip: () => void;
  onSummaryStale: () => void;
  onToast: (message: string) => void;
  onGoReview: () => void;
}

export function WordsTab({
  queue,
  advance,
  reload,
  onDone,
  onSkip,
  onSummaryStale,
  onToast,
  onGoReview,
}: WordsTabProps): ReactElement {
  const t = useTranslations('studio.flow');
  const locale = useLocale();
  const [restored, setRestored] = useState<WordItem | null>(null);
  const [undo, setUndo] = useState<WordItem | null>(null);
  const [undoFailed, setUndoFailed] = useState(false);
  const item = restored ?? queue.item;
  const key = item?.item_key ?? null;
  const id = item?.id ?? null;

  const [values, setValues] = useState<string[]>(EMPTY_DRAFT.translations);
  const [example, setExample] = useState('');
  const [alt, setAlt] = useState(false);
  const [menu, setMenu] = useState(false);
  const [typo, setTypo] = useState(false);
  const [hint, setHint] = useState('');
  const [pending, setPending] = useState<Pending>(null);
  const [failure, setFailure] = useState<Failure>(null);
  const typed = useRef(false);

  useEffect(() => {
    if (!key) return;
    const draft = readDraft(sessionStorageOrNull(), key);
    setValues(draft.translations);
    setExample(draft.example);
    setAlt(false);
    setMenu(false);
    setTypo(false);
    setHint('');
    setPending(null);
    setFailure(null);
    typed.current = false;
  }, [key]);

  useEffect(() => {
    if (id === null) return;
    const timer = window.setInterval(() => {
      if (!typed.current) return;
      typed.current = false;
      void touchWordRequest(id).catch(() => undefined);
    }, TOUCH_MS);
    return () => window.clearInterval(timer);
  }, [id]);

  const save = (nextValues: string[], nextExample: string): void => {
    if (!key) return;
    typed.current = true;
    writeDraft(sessionStorageOrNull(), key, { translations: nextValues, example: nextExample });
  };
  const setValueAt = (i: number, v: string): void => {
    const next = values.map((x, j) => (j === i ? v : x));
    setValues(next);
    save(next, example);
  };
  const addValue = (): void => {
    const next = [...values, ''];
    setValues(next);
    save(next, example);
  };
  const setExampleText = (v: string): void => {
    setExample(v);
    save(values, v);
  };

  const translations = cleanTranslations(values);
  const busy = pending !== null;

  const answer = async (): Promise<void> => {
    if (!item || busy || translations.length === 0) return;
    const ex = example.trim();
    setPending('answer');
    setFailure(null);
    setUndo(null);
    try {
      await answerWordRequest(item.id, { translations, ...(ex ? { example: ex } : {}) });
    } catch {
      setPending(null);
      setFailure('send');
      return;
    }
    clearDraft(sessionStorageOrNull(), item.item_key);
    setRestored(null);
    setPending(null);
    onToast(t('words.sent'));
    onDone();
    await advance();
  };

  const agree = async (): Promise<void> => {
    if (!item?.suggestion || busy) return;
    const suggestionId = item.suggestion.id;
    setPending('agree');
    setFailure(null);
    setUndo(null);
    try {
      await agreeWordRequest(item.id, suggestionId);
    } catch (err) {
      setPending(null);
      if (isConflict(err)) {
        setRestored(null);
        onToast(t('words.conflict'));
        await advance();
      } else {
        setFailure('send');
      }
      return;
    }
    clearDraft(sessionStorageOrNull(), item.item_key);
    setRestored(null);
    setPending(null);
    onToast(t('words.agreed'));
    onDone();
    await advance();
  };

  const reject = async (reason: WordRejectReason, hintText?: string): Promise<void> => {
    if (!item || busy) return;
    const rejected = item;
    setPending('reject');
    setFailure(null);
    setUndo(null);
    setUndoFailed(false);
    try {
      await rejectWordRequest(rejected.id, { reason, ...(hintText ? { hint: hintText } : {}) });
    } catch {
      setPending(null);
      setFailure('save');
      return;
    }
    setRestored(null);
    setPending(null);
    setMenu(false);
    setTypo(false);
    setHint('');
    setUndo(rejected);
    onDone();
    await advance();
  };

  const skip = (): void => {
    if (!item || busy) return;
    setUndo(null);
    onSkip();
    void advance(async () => {
      await skipFlowItem('words', item.item_key).catch(() => undefined);
      setRestored(null);
    });
  };

  const undoReject = async (): Promise<void> => {
    if (!undo || busy) return;
    setPending('undo');
    setUndoFailed(false);
    try {
      await undoRejectWordRequest(undo.id);
    } catch {
      setPending(null);
      setUndoFailed(true);
      return;
    }
    setPending(null);
    setRestored(undo);
    setUndo(null);
    onSummaryStale();
  };

  const undoBanner = undo ? (
    <div
      className="card"
      role="status"
      data-testid="words-rejected"
      style={{
        padding: 14,
        display: 'flex',
        gap: 10,
        alignItems: 'center',
        flexWrap: 'wrap',
        fontSize: 14,
      }}
    >
      <span style={{ flex: '1 1 220px' }}>{t('words.rejected')}</span>
      <button
        type="button"
        className="btn btn-ghost"
        disabled={busy}
        onClick={() => void undoReject()}
        data-testid="words-undo"
      >
        {t('words.undo')}
      </button>
      {undoFailed && (
        <span role="alert" style={{ color: 'var(--tertiary-700)' }}>
          {t('words.saveFailed')}
        </span>
      )}
    </div>
  ) : null;

  if (!item) {
    if (queue.status === 'empty') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {undoBanner}
          <div
            className="card"
            data-testid="words-empty"
            style={{
              padding: 28,
              textAlign: 'center',
              minHeight: 220,
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div style={{ fontSize: 22, fontWeight: 800, fontFamily: 'var(--font-display)' }}>
              {t('words.emptyTitle')}
            </div>
            <button
              type="button"
              className="btn btn-primary"
              onClick={onGoReview}
              data-testid="words-go-review"
            >
              {t('words.checkPhrases')}
            </button>
          </div>
        </div>
      );
    }
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {undoBanner}
        <QueueState
          status={queue.status === 'ready' ? 'loading' : queue.status}
          mode="words"
          onRetry={() => void reload()}
        />
      </div>
    );
  }

  const bur = item.direction === 'ru2bur';
  const formOpen = !item.suggestion || alt;
  const askedForm = locale === 'en' ? enForm(item.demand) : ruForm(item.demand);
  const btn = { minHeight: 52, fontSize: 16 } as const;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {undoBanner}
      <div
        className="card"
        data-testid="words-card"
        style={{
          padding: 'clamp(18px, 4vw, 28px)',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
          opacity: busy ? 0.7 : 1,
        }}
      >
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'baseline' }}>
          <div
            style={{
              fontSize: 'clamp(22px, 5vw, 30px)',
              fontWeight: 800,
              fontFamily: 'var(--font-display)',
              overflowWrap: 'anywhere',
            }}
            data-testid="words-asked"
          >
            {t(`words.asked.${askedForm}`, { n: item.demand, query: item.query })}
          </div>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }} data-testid="words-direction">
            {t(`words.direction.${item.direction}`)}
          </span>
        </div>
        {item.contexts.length > 0 && (
          <div style={{ fontSize: 14, color: 'var(--text-muted)' }} data-testid="words-contexts">
            {t('words.contexts', { list: item.contexts.map((c) => `«${c}»`).join(', ') })}
          </div>
        )}
        {item.moderator_note && (
          <div
            style={{ fontSize: 14, color: 'var(--tertiary-700)', fontWeight: 600 }}
            data-testid="words-moderator"
          >
            {t('words.moderator', { note: item.moderator_note })}
          </div>
        )}

        {item.suggestion && (
          <div
            data-testid="words-suggestion"
            style={{
              padding: 12,
              borderRadius: 12,
              background: 'var(--surface-2)',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            <div>{t('words.suggestion', { translation: item.suggestion.translation })}</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn btn-primary"
                style={btn}
                disabled={busy}
                onClick={() => void agree()}
                data-testid="words-agree"
              >
                {t('words.agree')}
              </button>
              {!alt && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={btn}
                  disabled={busy}
                  onClick={() => setAlt(true)}
                  data-testid="words-alt"
                >
                  {t('words.alt')}
                </button>
              )}
            </div>
          </div>
        )}

        {formOpen && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {values.map((v, i) => (
              <Field
                key={i}
                value={v}
                onChange={(x) => setValueAt(i, x)}
                fid={`flow-word-${i}`}
                bur={bur}
                label={t('words.translation')}
                placeholder={t('words.translation')}
                testId={`words-translation-${i}`}
              />
            ))}
            {values.length < MAX_VALUES && (
              <button
                type="button"
                className="btn btn-ghost"
                style={{ alignSelf: 'flex-start' }}
                disabled={busy}
                onClick={addValue}
                data-testid="words-add-value"
              >
                {t('words.addValue')}
              </button>
            )}
            <Field
              value={example}
              onChange={setExampleText}
              fid="flow-word-example"
              bur={bur}
              label={t('words.example')}
              placeholder={t('words.example')}
              testId="words-example"
            />
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            type="button"
            className="btn btn-ghost"
            style={btn}
            disabled={busy}
            onClick={skip}
            data-testid="words-skip"
          >
            {t('words.skip')}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            style={{ ...btn, color: 'var(--tertiary-700)' }}
            disabled={busy}
            aria-expanded={menu}
            onClick={() => setMenu((open) => !open)}
            data-testid="words-reject-toggle"
          >
            {t('words.reject')} ▼
          </button>
          {formOpen && (
            <button
              type="button"
              className="btn btn-primary"
              style={{ ...btn, marginLeft: 'auto', flex: '1 1 180px' }}
              disabled={busy || translations.length === 0}
              onClick={() => void answer()}
              data-testid="words-send"
            >
              {t('words.send')}
            </button>
          )}
        </div>

        {menu && (
          <div
            role="group"
            aria-label={t('words.reject')}
            data-testid="words-reject-menu"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              padding: 12,
              borderRadius: 12,
              border: '1px solid var(--border)',
            }}
          >
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn btn-secondary"
                disabled={busy}
                onClick={() => setTypo(true)}
                data-testid="words-reject-typo"
              >
                {t('words.rejectTypo')}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                disabled={busy}
                onClick={() => void reject('not_buryat')}
                data-testid="words-reject-not-buryat"
              >
                {t('words.rejectNotBur')}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                disabled={busy}
                onClick={() => void reject('other')}
                data-testid="words-reject-other"
              >
                {t('words.rejectOther')}
              </button>
            </div>
            {typo && (
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 200px' }}>
                  <Field
                    value={hint}
                    onChange={(v) => setHint(v.slice(0, MAX_HINT))}
                    fid="flow-word-hint"
                    bur={bur}
                    label={t('words.correct')}
                    placeholder={t('words.correct')}
                    testId="words-hint"
                  />
                </div>
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={busy}
                  onClick={() => void reject('typo', hint.trim() || undefined)}
                  data-testid="words-reject-typo-send"
                >
                  {t('words.rejectConfirm')}
                </button>
              </div>
            )}
          </div>
        )}

        {failure === 'send' && (
          <p role="alert" style={{ margin: 0, color: 'var(--tertiary-700)', fontWeight: 600 }}>
            {t('words.sendFailed')}
          </p>
        )}
        {failure === 'save' && (
          <p role="alert" style={{ margin: 0, color: 'var(--tertiary-700)', fontWeight: 600 }}>
            {t('words.saveFailed')}
          </p>
        )}
      </div>
    </div>
  );
}
