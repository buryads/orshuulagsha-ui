'use client';

import { useState, type ReactElement } from 'react';
import { useTranslations } from 'next-intl';
import { Icon } from '@/components/ui/icon';
import { Link } from '@/i18n/navigation';
import type { AiTranslateResponse } from '@/lib/api/types';

export interface AiTranslateResultProps {
  data: AiTranslateResponse;
  onFeedback: (helpful: boolean, suggestion?: string) => Promise<void>;
}

type FeedbackStep = 'idle' | 'declining' | 'sent';

const CONFIDENCE_CHIP_CLASS: Record<AiTranslateResponse['confidence'], string> = {
  low: '',
  medium: 'chip-warm',
  high: 'chip-green',
};

// Backend passes the LLM's `confidence` through with only a string cast (see
// final-fe-report.md must-fix #2) — no whitelist. Validate at the render
// boundary so an unexpected value can't produce a broken chip class or a
// missing i18n key.
function normalizeConfidence(
  confidence: AiTranslateResponse['confidence'],
): AiTranslateResponse['confidence'] {
  return (['low', 'medium', 'high'] as const).includes(confidence)
    ? confidence
    : 'low';
}

/**
 * Compact confidence chip + degraded badge + remaining-today count, rendered
 * next to the AI translation text in the form's right output panel. The rest
 * of the AI result (gloss, examples, Google variant, feedback) renders below
 * the form via `AiTranslateResult`.
 */
export function AiInlineMeta({ data }: { data: AiTranslateResponse }): ReactElement {
  const t = useTranslations('aiTranslate');
  const confidence = normalizeConfidence(data.confidence);
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        flexWrap: 'wrap',
        marginTop: 10,
      }}
    >
      <span className={`chip ${CONFIDENCE_CHIP_CLASS[confidence]}`.trim()}>
        {t(`confidence.${confidence}`)}
      </span>
      {data.degraded && <span className="chip chip-rose">{t('degradedBadge')}</span>}
      <span style={{ fontSize: 12, color: 'var(--text-soft)' }}>
        {t('remainingToday', { count: data.remaining_today })}
      </span>
      <span style={{ fontSize: 11, color: 'var(--text-soft)', flexBasis: '100%' }}>
        {t('disclaimer')}
      </span>
    </div>
  );
}

/** Staged "thinking" label shown in the right panel while an AI request is in flight. */
export function AiStageText({ stage }: { stage: 0 | 1 | 2 }): ReactElement {
  const t = useTranslations('aiTranslate');
  const AI_STAGE_KEYS = ['stageGlossary', 'stageExamples', 'stageLlm'] as const;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        color: 'var(--text-muted)',
        fontSize: 16,
        fontWeight: 600,
      }}
    >
      <span style={{ display: 'inline-flex', animation: 'pulse-soft 1.2s ease-in-out infinite' }}>
        <Icon name="sparkles" size={16} />
      </span>
      {t(AI_STAGE_KEYS[stage])}
    </span>
  );
}

/** Inline error text shown in the right panel in place of the translation. */
export function AiInlineError({ messageKey }: { messageKey: string }): ReactElement {
  const t = useTranslations('aiTranslate');
  return (
    <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-muted)' }}>
      {t(messageKey)}
    </span>
  );
}

/**
 * The "kitchen" — пословный разбор, примеры, Google-вариант, фидбек. Renders
 * BELOW the form as collapsible sections. The main translation + confidence
 * chip render separately in the right output panel via `AiInlineMeta`
 * (see `translator-panel.tsx`).
 */
export function AiTranslateResult({
  data,
  onFeedback,
}: AiTranslateResultProps): ReactElement {
  const t = useTranslations('aiTranslate');
  const [step, setStep] = useState<FeedbackStep>('idle');
  const [suggestion, setSuggestion] = useState('');
  const [sending, setSending] = useState(false);

  // word_gloss comes from an LLM response the backend only checks is an
  // array (see final-fe-report.md must-fix #1) — individual entries may be
  // malformed (string instead of object, `meanings` not an array). Normalize
  // at the render boundary so a bad entry can't crash the whole route.
  const validGloss = data.word_gloss.filter(
    (g) => typeof g?.word === 'string' && Array.isArray(g?.meanings),
  );
  const hasGloss = validGloss.length > 0;
  const hasExamples = data.examples.length > 0;
  const hasGoogle = Boolean(data.google_candidate && data.google_candidate.trim());

  const sendFeedback = async (helpful: boolean, text?: string) => {
    setSending(true);
    try {
      await onFeedback(helpful, text);
      setStep('sent');
    } catch {
      // Leave the widget interactive so the user can retry.
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="card fade-up" style={{ marginTop: 20, padding: 24 }}>
      {hasGloss && (
        <details style={{ marginTop: 0 }}>
          <summary
            style={{
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 700,
              color: 'var(--text)',
            }}
          >
            {t('sections.gloss')}
          </summary>
          <table style={{ width: '100%', marginTop: 10, borderCollapse: 'collapse' }}>
            <tbody>
              {validGloss.map((g, i) => (
                <tr
                  key={`${g.word}-${i}`}
                  style={{
                    borderTop: i > 0 ? '1px solid var(--border)' : undefined,
                  }}
                >
                  <td
                    style={{
                      padding: '8px 10px 8px 0',
                      fontWeight: 700,
                      color: 'var(--text)',
                      fontSize: 14,
                      whiteSpace: 'nowrap',
                      verticalAlign: 'top',
                    }}
                  >
                    <Link
                      href={
                        g.burword_id
                          ? `/words/${g.burword_id}`
                          : `/corpus?q=${encodeURIComponent(g.word)}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="gloss-word-link"
                      style={{ color: 'inherit' }}
                    >
                      {g.word}
                    </Link>
                  </td>
                  <td
                    style={{
                      padding: '8px 0',
                      color: 'var(--text-muted)',
                      fontSize: 14,
                    }}
                  >
                    {g.meanings.map((m) => String(m)).join(', ')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </details>
      )}

      {hasExamples && (
        <details style={{ marginTop: 14 }}>
          <summary
            style={{
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 700,
              color: 'var(--text)',
            }}
          >
            {t('sections.examples')}
          </summary>
          <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {data.examples.map((ex, i) => {
              const target = ex.target?.trim();
              return (
                <div
                  key={i}
                  style={{
                    fontSize: 14,
                    color: 'var(--text)',
                    lineHeight: 1.5,
                    paddingBottom: i < data.examples.length - 1 ? 10 : 0,
                    borderBottom:
                      i < data.examples.length - 1 ? '1px solid var(--border)' : undefined,
                  }}
                >
                  <div>
                    {ex.source}
                    {target ? ` → ${target}` : ''}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-soft)', marginTop: 2 }}>
                    {t(ex.origin === 'corpus' ? 'origin.corpus' : 'origin.tm')}
                  </div>
                </div>
              );
            })}
          </div>
        </details>
      )}

      {hasGoogle && (
        <details style={{ marginTop: 14 }}>
          <summary
            style={{
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 700,
              color: 'var(--text)',
            }}
          >
            {t('sections.google')}
          </summary>
          <div style={{ marginTop: 10, fontSize: 14, color: 'var(--text)', lineHeight: 1.5 }}>
            {data.google_candidate}
          </div>
        </details>
      )}

      <div
        style={{
          marginTop: 18,
          paddingTop: 16,
          borderTop: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          flexWrap: 'wrap',
        }}
      >
        {step === 'sent' ? (
          <span style={{ fontSize: 13, color: 'var(--accent-green)', fontWeight: 600 }}>
            {t('feedback.thanks')}
          </span>
        ) : (
          <>
            <button
              type="button"
              className="btn-icon"
              disabled={sending}
              onClick={() => void sendFeedback(true)}
              aria-label={t('feedback.helpful')}
              title={t('feedback.helpful')}
              style={{ width: 34, height: 34, fontSize: 16 }}
            >
              👍
            </button>
            <button
              type="button"
              className="btn-icon"
              disabled={sending}
              onClick={() => setStep('declining')}
              aria-label={t('feedback.notHelpful')}
              title={t('feedback.notHelpful')}
              style={{ width: 34, height: 34, fontSize: 16 }}
            >
              👎
            </button>
            {step === 'declining' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
                <textarea
                  value={suggestion}
                  onChange={(e) => setSuggestion(e.target.value)}
                  placeholder={t('feedback.suggestPlaceholder')}
                  style={{
                    width: '100%',
                    minHeight: 70,
                    resize: 'vertical',
                    padding: 10,
                    fontSize: 13,
                    fontFamily: 'inherit',
                    borderRadius: 'var(--r-md)',
                    border: '1px solid var(--border)',
                    background: 'var(--surface)',
                    color: 'var(--text)',
                  }}
                />
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={sending}
                  onClick={() => void sendFeedback(false, suggestion.trim() || undefined)}
                  style={{ alignSelf: 'flex-start' }}
                >
                  {t('feedback.send')}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
