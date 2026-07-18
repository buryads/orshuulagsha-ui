'use client';

import { useState, type ReactElement } from 'react';
import { useTranslations } from 'next-intl';
import { Icon } from '@/components/ui/icon';
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

function formatOrigin(origin: 'corpus' | 'translation_memory'): string {
  return origin === 'corpus' ? 'corpus' : 'translation memory';
}

export function AiTranslateResult({
  data,
  onFeedback,
}: AiTranslateResultProps): ReactElement {
  const t = useTranslations('aiTranslate');
  const [step, setStep] = useState<FeedbackStep>('idle');
  const [suggestion, setSuggestion] = useState('');
  const [sending, setSending] = useState(false);

  const hasGloss = data.word_gloss.length > 0;
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
      <div
        style={{
          fontSize: 28,
          fontWeight: 700,
          letterSpacing: '-0.02em',
          color: 'var(--text)',
          fontFamily: 'var(--font-display)',
          lineHeight: 1.3,
          wordBreak: 'break-word',
        }}
      >
        {data.translation}
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          flexWrap: 'wrap',
          marginTop: 12,
        }}
      >
        <span className={`chip ${CONFIDENCE_CHIP_CLASS[data.confidence]}`.trim()}>
          {t(`confidence.${data.confidence}`)}
        </span>
        {data.degraded && (
          <span className="chip chip-rose">{t('degradedBadge')}</span>
        )}
        <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-soft)' }}>
          {t('remainingToday', { count: data.remaining_today })}
        </span>
      </div>

      {hasGloss && (
        <details style={{ marginTop: 18 }}>
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
              {data.word_gloss.map((g, i) => (
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
                    {g.word}
                  </td>
                  <td
                    style={{
                      padding: '8px 0',
                      color: 'var(--text-muted)',
                      fontSize: 14,
                    }}
                  >
                    {g.meanings.join(', ')}
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
                    {formatOrigin(ex.origin)}
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
