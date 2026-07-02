'use client';

import type { ReactElement, ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { safeHref } from '@/lib/api/client';
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

/**
 * Split one ES highlight snippet (contains <em>…</em> markers) into React
 * nodes: plain text segments auto-escape via JSX, matched segments go into
 * <mark>. No dangerouslySetInnerHTML — corpus text is untrusted HTML.
 */
function renderSnippet(snippet: string): ReactNode[] {
  // Split on <em> and </em>, keeping the delimiters so we can track state.
  const parts = snippet.split(/(<em>|<\/em>)/);
  const nodes: ReactNode[] = [];
  let inMark = false;
  let key = 0;
  for (const part of parts) {
    if (part === '<em>') {
      inMark = true;
    } else if (part === '</em>') {
      inMark = false;
    } else if (part) {
      if (inMark) {
        nodes.push(
          <mark
            key={key++}
            style={{
              background: 'var(--primary-50)',
              color: 'var(--primary-700)',
              borderRadius: 2,
              padding: '0 2px',
            }}
          >
            {part}
          </mark>,
        );
      } else {
        nodes.push(<span key={key++}>{part}</span>);
      }
    }
  }
  return nodes;
}

/** Render ES highlight snippets safely — no innerHTML, corpus text is untrusted. */
function Highlighted({ snippets, fallback }: { snippets?: string[]; fallback: string }) {
  if (!snippets || snippets.length === 0) {
    return <>{fallback}</>;
  }
  return (
    <>
      {snippets.map((snippet, i) => (
        <span key={i}>
          {i > 0 && <span style={{ color: 'var(--text-soft)' }}> … </span>}
          {renderSnippet(snippet)}
        </span>
      ))}
    </>
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

      {/* Attribution — safeHref blocks javascript:/data:/vbscript: URLs */}
      <div style={{ marginTop: 'auto', paddingTop: 6, borderTop: '1px solid var(--border)' }}>
        {(() => {
          const href = safeHref(hit.attribution.url);
          const label = `${t('attribution')}: ${hit.attribution.name}${hit.attribution.note ? ` (${hit.attribution.note})` : ''}`;
          const sharedStyle: React.CSSProperties = {
            fontSize: 11,
            color: 'var(--text-soft)',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
          };
          return href ? (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              style={sharedStyle}
            >
              {label}
            </a>
          ) : (
            <span style={sharedStyle}>{label}</span>
          );
        })()}
      </div>
    </article>
  );
}
