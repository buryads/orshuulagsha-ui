'use client';

import { useRef, useState } from 'react';
import axios from 'axios';
import { useLocale, useTranslations } from 'next-intl';
import { explainText } from '@/lib/api/explain';
import type { ExplainFrom, ExplainResponse } from '@/lib/api/types';
import { BurKeyboard } from '@/components/home/bur-keyboard';
import { useBurKeyboard } from '@/components/home/use-bur-keyboard';
import { Icon } from '@/components/ui/icon';
import { ShareBar } from './share-bar';
import { WordCard } from './word-card';

const MAX_LEN = 300;
const FROMS: readonly ExplainFrom[] = ['bur', 'ru', 'en'];

function AiLabel({ children }: { children: string }) {
  return <span className="chip chip-primary">{children}</span>;
}

export function ExplainView() {
  const t = useTranslations('explain');
  const locale = useLocale();
  const [text, setText] = useState('');
  const [from, setFrom] = useState<ExplainFrom>('bur');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ExplainResponse | null>(null);
  const [submitted, setSubmitted] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const kb = useBurKeyboard(
    textareaRef,
    text,
    (next) => setText(next.slice(0, MAX_LEN)),
    { multiline: true },
  );

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = text.trim();
    if (!value || loading) return;
    setLoading(true);
    setError(null);
    try {
      setResult(await explainText(value, from, locale));
      setSubmitted(value);
    } catch (err) {
      setResult(null);
      setError(
        axios.isAxiosError(err) && err.response?.status === 429
          ? t('limitError')
          : t('error'),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="container fade-up"
      style={{ paddingTop: 32, paddingBottom: 32, display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 800 }}
    >
      <div>
        <h1 style={{ fontSize: 36, fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.02em' }}>
          {t('title')}
        </h1>
        <p style={{ color: 'var(--text-muted)', marginTop: 6, fontSize: 15 }}>{t('subtitle')}</p>
      </div>

      <form onSubmit={submit} className="card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div role="group" aria-label={t('from')} style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {FROMS.map((f) => (
            <button
              key={f}
              type="button"
              className={from === f ? 'btn btn-primary' : 'btn btn-secondary'}
              aria-pressed={from === f}
              disabled={loading}
              onClick={() => setFrom(f)}
              style={{ padding: '6px 14px', fontSize: 14 }}
            >
              {t(f)}
            </button>
          ))}
        </div>
        <textarea
          ref={textareaRef}
          {...kb.fieldProps}
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={MAX_LEN}
          rows={4}
          placeholder={t('placeholder')}
          aria-label={t('placeholder')}
          disabled={loading}
          style={{
            width: '100%',
            padding: 12,
            fontSize: 16,
            resize: 'vertical',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r-md)',
          }}
        />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              className="btn-icon"
              {...kb.toggleProps}
              style={{ color: kb.open ? 'var(--primary)' : 'var(--text-muted)' }}
            >
              <Icon name="keyboard" size={16} />
            </button>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              {text.length}/{MAX_LEN}
            </span>
          </span>
          <button type="submit" className="btn btn-primary" disabled={loading || !text.trim()}>
            {loading ? t('loading') : t('submit')}
          </button>
        </div>
      </form>

      {kb.open && <BurKeyboard {...kb.panelProps} />}

      {error && (
        <div role="alert" className="card" style={{ padding: 14, color: 'var(--tertiary-700)' }}>
          {error}
        </div>
      )}

      {result && <ExplainResult result={result} />}
      {result && <ShareBar result={result} source={submitted} />}
    </div>
  );
}

function ExplainResult({ result }: { result: ExplainResponse }) {
  const t = useTranslations('explain');
  const aiBuilt = result.from !== 'bur';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {aiBuilt && result.reliability === 'low' && (
        <div role="alert" className="card" style={{ padding: 14, fontSize: 15, fontWeight: 600, color: 'var(--tertiary-700)', borderColor: 'var(--tertiary)', background: 'var(--tertiary-soft)' }}>
          {t('lowReliability')}
        </div>
      )}

      {aiBuilt && (
        <section className="card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
            <h2 style={{ fontSize: 16, fontWeight: 700 }}>{t('phrase')}</h2>
            <AiLabel>{t('aiBeta')}</AiLabel>
          </div>
          <p style={{ fontSize: 20, fontWeight: 600, overflowWrap: 'anywhere' }}>
            {result.phrase ?? t('phraseFailed')}
          </p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{t('phraseNote')}</p>
        </section>
      )}

      {result.morph_status === 'unavailable' && (
        <div className="card" style={{ padding: 14, fontSize: 14 }}>
          {t('morphUnavailable')}
        </div>
      )}

      {result.words.length > 0 && (
        <section style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700 }}>{t('words')}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))', gap: 10 }}>
            {result.words.map((w, i) => (
              <WordCard key={`${w.surface}-${i}`} word={w} />
            ))}
          </div>
          {result.omitted > 0 && (
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{t('omitted', { n: result.omitted })}</p>
          )}
        </section>
      )}

      <section className="card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
          <h2 style={{ fontSize: 16, fontWeight: 700 }}>{t('explanation')}</h2>
          <AiLabel>{t('aiBeta')}</AiLabel>
        </div>
        {result.ai_status === 'limit' && <p style={{ fontSize: 14 }}>{t('aiLimit')}</p>}
        {result.ai_status === 'unavailable' && <p style={{ fontSize: 14 }}>{t('aiUnavailable')}</p>}
        {result.ai_status === 'ok' && (result.explanation_meaning ?? result.explanation) && (
          <>
            <p style={{ fontSize: 16, fontWeight: 600, overflowWrap: 'anywhere' }}>
              {result.explanation_meaning ?? result.explanation}
            </p>
            {!!result.explanation_points?.length && (
              <ul style={{ margin: 0, paddingLeft: 20, listStyle: 'disc', display: 'flex', flexDirection: 'column', gap: 6, fontSize: 15 }}>
                {result.explanation_points.map((point, i) => (
                  <li key={i} style={{ overflowWrap: 'anywhere' }}>
                    {point}
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </section>

      <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
        {t('source')}: {result.source}
      </p>
    </div>
  );
}
