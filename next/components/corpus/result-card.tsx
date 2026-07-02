'use client';

import type { ReactElement } from 'react';
import { useTranslations } from 'next-intl';
import type { CorpusHit } from '@/lib/api/corpus-types';

interface ResultCardProps {
  hit: CorpusHit;
}

const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  mono: { bg: 'var(--primary-50)', text: 'var(--primary-700)' },
  parallel: { bg: '#e8f5e9', text: '#2e7d32' },
  lexicon: { bg: '#fff3e0', text: '#e65100' },
  toponym: { bg: '#f3e5f5', text: '#6a1b9a' },
};

function Badge({ label, bg, color }: { label: string; bg: string; color: string }) {
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 8px',
        borderRadius: 99,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: '0.03em',
        background: bg,
        color,
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </span>
  );
}

/** Render a highlight snippet with <em> tags as bold spans. */
function Highlighted({ snippets, fallback }: { snippets?: string[]; fallback: string }) {
  if (!snippets || snippets.length === 0) {
    return <>{fallback}</>;
  }
  const html = snippets.join(' … ');
  return (
    <span
      // The server controls the highlight <em> tags; we trust our own API.
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{
        __html: html.replace(/<em>/g, '<mark style="background:var(--primary-50);color:var(--primary-700);border-radius:2px;padding:0 2px">').replace(/<\/em>/g, '</mark>'),
      }}
    />
  );
}

export function ResultCard({ hit }: ResultCardProps): ReactElement {
  const t = useTranslations('corpus');
  const typeColor = TYPE_COLORS[hit.type] ?? { bg: 'var(--surface-2)', text: 'var(--text)' };

  return (
    <article
      className="card"
      style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 10 }}
    >
      {/* Badges row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
        <Badge label={t(`type.${hit.type}`)} bg={typeColor.bg} color={typeColor.text} />
        <Badge
          label={hit.source}
          bg="var(--surface-2)"
          color="var(--text-soft)"
        />
        <Badge
          label={hit.license}
          bg="var(--surface-2)"
          color="var(--text-soft)"
        />
      </div>

      {/* Main text */}
      <p
        style={{
          margin: 0,
          fontSize: 15,
          color: 'var(--text)',
          lineHeight: 1.6,
          fontWeight: 500,
        }}
      >
        <Highlighted
          snippets={hit.highlight?.text_bxr}
          fallback={hit.text_bxr}
        />
      </p>

      {/* Translation */}
      {hit.text_ru && (
        <p
          style={{
            margin: 0,
            fontSize: 14,
            color: 'var(--text-muted)',
            lineHeight: 1.5,
          }}
        >
          <Highlighted
            snippets={hit.highlight?.text_ru}
            fallback={hit.text_ru}
          />
        </p>
      )}

      {/* Attribution */}
      <div style={{ marginTop: 'auto', paddingTop: 6, borderTop: '1px solid var(--border)' }}>
        <a
          href={hit.attribution.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${t('attribution')}: ${hit.attribution.name}`}
          style={{
            fontSize: 11,
            color: 'var(--text-soft)',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          {t('attribution')}: {hit.attribution.name}
          {hit.attribution.note && ` (${hit.attribution.note})`}
        </a>
      </div>
    </article>
  );
}
