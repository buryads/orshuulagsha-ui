// TODO i18n: port hardcoded strings to t(...) using next-intl
'use client';

import { Link } from '@/i18n/navigation';
import { useEffect, useState, type ReactElement } from 'react';
import { Icon } from '@/components/ui/icon';
import type {
  TranslateBucketItem,
  TranslateResponse,
  TranslationType,
} from '@/lib/api/types';
import {
  AI_VARIANTS,
  DIALECT_ENTRIES,
} from './demo-data';
import {
  splitEnumerated,
  splitRemark,
  hasUsefulTranslation,
  isNoTranslation,
} from './translation-text';

type Tab = 'dict' | 'occurrences' | 'similar' | 'ai';

interface TabSpec {
  id: Tab;
  label: string;
  count?: number;
}

export interface TranslationResultsProps {
  response: TranslateResponse | null;
  loading: boolean;
  src: string;
  tgt: string;
  direction: TranslationType;
  error?: string | null;
}

function firstUsefulName(item: TranslateBucketItem): string | undefined {
  for (const t of item.translations ?? []) {
    if (!isNoTranslation(t.name)) return t.name.trim();
  }
  return undefined;
}

// AI/Google buckets sometimes squash multiple variants into a single
// "1) foo; 2) bar; 3) baz" string. Explode such items so the dictionary tab
// shows one card per enumerated variant. Remark (e.g. "(Google translation)")
// is preserved on each piece. Items that don't match the pattern pass through.
function expandEnumerated(item: TranslateBucketItem): TranslateBucketItem[] {
  const ts = item.translations ?? [];
  if (ts.length !== 1) return [item];
  const tr = ts[0]!;
  if (isNoTranslation(tr.name)) return [item];
  const { main, remark } = splitRemark(tr.name);
  const pieces = splitEnumerated(main);
  if (!pieces) return [item];
  return pieces.map((piece) => ({
    ...item,
    translations: [{ id: tr.id, name: remark ? `${piece} (${remark})` : piece }],
  }));
}

function playAudio(url: string) {
  if (typeof window === 'undefined') return;
  try {
    const audio = new Audio(url);
    void audio.play();
  } catch {
    // ignore — autoplay restrictions or transient codec failure
  }
}

function wordHref(item: TranslateBucketItem): string {
  // Detail page lookups use slug when available, otherwise fall back to id.
  const key = item.slug ?? String(item.id);
  return `/words/${encodeURIComponent(key)}`;
}

interface DictCardProps {
  item: TranslateBucketItem;
  compact?: boolean;
}

function DictCard({ item, compact = false }: DictCardProps): ReactElement {
  const image = item.images?.[0];
  const audio = item.speechs?.[0];
  const parsedTranslations = (item.translations ?? []).map((t) => splitRemark(t.name));
  const mainParts = parsedTranslations.map((p) => p.main).filter(Boolean);
  const remarks = parsedTranslations
    .map((p) => p.remark)
    .filter((r): r is string => Boolean(r));
  const itemNameParsed = splitRemark(item.name);
  return (
    <Link
      href={wordHref(item)}
      className="card"
      style={{
        padding: compact ? 14 : 18,
        cursor: 'pointer',
        transition: 'all 0.15s',
        display: 'block',
        textDecoration: 'none',
        color: 'inherit',
      }}
      onMouseEnter={(ev) => {
        ev.currentTarget.style.borderColor = 'var(--primary)';
        ev.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(ev) => {
        ev.currentTarget.style.borderColor = 'var(--border)';
        ev.currentTarget.style.transform = 'none';
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          marginBottom: 10,
        }}
      >
        {image?.url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image.url}
            alt=""
            width={56}
            height={56}
            loading="lazy"
            style={{
              width: 56,
              height: 56,
              objectFit: 'cover',
              borderRadius: 'var(--r-md)',
              flexShrink: 0,
            }}
          />
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: compact ? 18 : 22,
              fontWeight: 700,
              letterSpacing: '-0.02em',
              color: 'var(--text)',
              fontFamily: 'var(--font-display)',
              lineHeight: 1.2,
              wordBreak: 'break-word',
            }}
          >
            {itemNameParsed.main}
            {itemNameParsed.remark && (
              <span
                style={{
                  marginLeft: 6,
                  fontSize: 12,
                  fontWeight: 400,
                  fontStyle: 'italic',
                  color: 'var(--text-muted)',
                  fontFamily: 'var(--font-body)',
                  letterSpacing: 'normal',
                }}
              >
                ({itemNameParsed.remark})
              </span>
            )}
          </div>
        </div>
        {audio?.url && (
          <button
            type="button"
            className="btn-icon"
            style={{
              width: 30,
              height: 30,
              color: 'var(--primary)',
              flexShrink: 0,
            }}
            onClick={(ev) => {
              ev.preventDefault();
              playAudio(audio.url);
            }}
            aria-label="Озвучить"
          >
            <Icon name="volume" size={14} />
          </button>
        )}
      </div>
      {mainParts.length > 0 && (
        <div
          style={{
            fontSize: 14,
            color: 'var(--text)',
            lineHeight: 1.5,
            wordBreak: 'break-word',
          }}
        >
          {mainParts.join(', ')}
        </div>
      )}
      {remarks.length > 0 && (
        <div
          style={{
            marginTop: 6,
            fontSize: 12,
            color: 'var(--text-muted)',
            lineHeight: 1.4,
            fontStyle: 'italic',
          }}
        >
          {remarks.map((r, i) => (
            <div key={i}>{r}</div>
          ))}
        </div>
      )}
    </Link>
  );
}

interface BucketGridProps {
  items: TranslateBucketItem[];
  emptyHint: string;
  compact?: boolean;
}

function BucketGrid({ items, emptyHint, compact = false }: BucketGridProps): ReactElement {
  if (items.length === 0) {
    return <EmptyHint text={emptyHint} />;
  }
  return (
    <div className="grid-2">
      {items.map((item, idx) => (
        <DictCard key={`${item.id}-${idx}`} item={item} compact={compact} />
      ))}
    </div>
  );
}

function EmptyHint({ text }: { text: string }): ReactElement {
  return (
    <div
      className="card"
      style={{
        padding: 22,
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: 14,
        borderStyle: 'dashed',
      }}
    >
      {text}
    </div>
  );
}

function SkeletonGrid(): ReactElement {
  return (
    <div className="grid-2">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="card"
          style={{
            padding: 18,
            height: 110,
            background:
              'linear-gradient(90deg, var(--surface) 0%, var(--surface-2) 50%, var(--surface) 100%)',
            backgroundSize: '200% 100%',
            animation: 'wave 1.4s ease-in-out infinite',
            opacity: 0.6,
          }}
        />
      ))}
    </div>
  );
}

function ResultsAI(): ReactElement {
  return (
    <div className="grid-2">
      {AI_VARIANTS.map((v, i) => (
        <div
          key={i}
          className="card"
          style={{ padding: 20, position: 'relative', overflow: 'hidden' }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 14,
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background:
                  v.kind === 'ai'
                    ? 'linear-gradient(135deg, var(--primary) 0%, var(--accent-warm) 100%)'
                    : 'var(--surface-2)',
                border: v.kind === 'google' ? '1px solid var(--border)' : 'none',
                display: 'grid',
                placeItems: 'center',
                color: v.kind === 'ai' ? 'white' : 'var(--text-muted)',
              }}
            >
              <Icon name={v.kind === 'ai' ? 'sparkles' : 'globe'} size={14} />
            </div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>
              {v.label}
            </div>
            <div
              style={{
                marginLeft: 'auto',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 11,
                color: 'var(--text-soft)',
                fontFamily: 'var(--font-mono)',
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 4,
                  background: 'var(--surface-2)',
                  borderRadius: 2,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${v.confidence}%`,
                    background:
                      v.confidence > 85
                        ? 'var(--accent-green)'
                        : 'var(--accent-warm)',
                  }}
                />
              </div>
              {v.confidence}%
            </div>
          </div>

          <div
            style={{
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: '-0.02em',
              color: 'var(--text)',
              lineHeight: 1.3,
              marginBottom: 10,
              fontFamily: 'var(--font-display)',
            }}
          >
            {v.title}
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 12,
            }}
          >
            <span className="chip" style={{ fontSize: 11, padding: '3px 8px' }}>
              {v.tone}
            </span>
            <button
              type="button"
              className="btn-icon"
              style={{ width: 26, height: 26 }}
              aria-label="Озвучить"
            >
              <Icon name="volume" size={12} />
            </button>
            <button
              type="button"
              className="btn-icon"
              style={{ width: 26, height: 26 }}
              aria-label="Скопировать"
            >
              <Icon name="copy" size={12} />
            </button>
          </div>

          <div
            style={{
              fontSize: 12,
              color: 'var(--text-muted)',
              lineHeight: 1.55,
              paddingTop: 12,
              borderTop: '1px dashed var(--border)',
            }}
          >
            {v.note}
          </div>

          {v.warning && (
            <div
              style={{
                marginTop: 10,
                fontSize: 11,
                color: 'var(--accent-warm)',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontWeight: 600,
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: 'var(--accent-warm)',
                }}
              />{' '}
              {v.warning}
            </div>
          )}
        </div>
      ))}

      <div className="card" style={{ padding: 22, background: 'var(--surface-2)' }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'var(--text-soft)',
            marginBottom: 14,
          }}
        >
          Произношение по диалектам
        </div>
        {DIALECT_ENTRIES.map((d, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '10px 0',
              borderBottom:
                i < DIALECT_ENTRIES.length - 1 ? '1px solid var(--border)' : 'none',
            }}
          >
            <div
              style={{
                width: 6,
                height: 32,
                borderRadius: 3,
                background: d.primary ? 'var(--primary)' : 'var(--border-strong)',
              }}
            />
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: 'var(--text)',
                  fontFamily: 'var(--font-display)',
                }}
              >
                {d.form}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-soft)' }}>
                {d.name} · {d.region}
              </div>
            </div>
            <button
              type="button"
              className="btn-icon"
              style={{ width: 30, height: 30, color: 'var(--primary)' }}
              aria-label="Озвучить"
            >
              <Icon name="volume" size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TranslationResults({
  response,
  loading,
  src,
  tgt,
  error,
}: TranslationResultsProps): ReactElement | null {
  const tgtKey = tgt.trim();
  const isShownInPane = (item: TranslateBucketItem): boolean => {
    if (!tgtKey) return false;
    return firstUsefulName(item) === tgtKey;
  };
  // Drop bucket items whose only translation is a generic remark (e.g. all-
  // parenthetical AI explanations) — those carry no real translation and would
  // be noise both in the right pane and in the tabs. Also drop the item whose
  // first useful translation already appears in the right pane.
  const keep = (item: TranslateBucketItem) =>
    hasUsefulTranslation(item) && !isShownInPane(item);
  // Explode enumerated AI/Google entries into one card per variant before the
  // pane-dedupe filter, so each variant gets its own shot at being kept.
  const expandedResult = (response?.result ?? []).flatMap(expandEnumerated);
  const usefulResult = expandedResult.filter(keep);
  const usefulInclude = (response?.include ?? []).filter(keep);
  const usefulMatch = (response?.match ?? []).filter(keep);
  const usefulFuzzy = (response?.fuzzy ?? []).filter(keep);

  const dictExtraCount = usefulResult.length;
  const includeCount = usefulInclude.length;
  const similarCount = usefulFuzzy.length + usefulMatch.length;
  const totalCount = dictExtraCount + includeCount + similarCount;

  // Tabs only for buckets with content. AI tab is a demo fallback shown only
  // when the backend returned nothing real.
  const tabs: TabSpec[] = [];
  if (dictExtraCount > 0) tabs.push({ id: 'dict', label: 'Словарь', count: dictExtraCount });
  if (includeCount > 0) tabs.push({ id: 'occurrences', label: 'Вхождения', count: includeCount });
  if (similarCount > 0) tabs.push({ id: 'similar', label: 'Похожие', count: similarCount });
  if (totalCount === 0 && response) tabs.push({ id: 'ai', label: 'AI и контекст' });

  const [tab, setTab] = useState<Tab>(tabs[0]?.id ?? 'dict');

  // Reset to the first tab on every new response so the user lands on the
  // most relevant bucket instead of a stale selection from the previous query.
  useEffect(() => {
    if (tabs.length > 0) setTab(tabs[0]!.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: respond
    // only to response identity changes, not derived `tabs` array recomputes.
  }, [response]);

  const trimmedSrc = src.trim();
  const notFoundHint = trimmedSrc
    ? `Ничего не найдено по запросу «${trimmedSrc}»`
    : 'Ничего не найдено';

  // Hide entirely when the right pane already exhausts everything (the picked
  // translation was the only useful item across all buckets).
  if (response && totalCount === 0 && tgtKey) return null;

  // Skeleton state on first request.
  if (loading && !response) {
    return (
      <div className="fade-up" style={{ marginTop: 20 }}>
        <SkeletonGrid />
      </div>
    );
  }

  // No request yet — keep the area minimal (right pane has the demo translation).
  if (!response && !loading) return null;

  // Response present but completely empty.
  if (response && totalCount === 0) {
    return (
      <div className="fade-up" style={{ marginTop: 20 }}>
        <EmptyHint text={notFoundHint} />
      </div>
    );
  }

  function renderBucket(items: TranslateBucketItem[], compact = false): ReactElement {
    return <BucketGrid items={items} emptyHint={notFoundHint} compact={compact} />;
  }

  return (
    <div className="fade-up" style={{ marginTop: 20 }}>
      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          borderBottom: '1px solid var(--border)',
          marginBottom: 20,
          paddingBottom: 0,
          overflowX: 'auto',
          overflowY: 'hidden',
        }}
      >
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            style={{
              padding: '12px 18px',
              fontSize: 14,
              fontWeight: 600,
              color: tab === t.id ? 'var(--text)' : 'var(--text-muted)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              borderBottom:
                tab === t.id ? '2px solid var(--primary)' : '2px solid transparent',
              marginBottom: -1,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              whiteSpace: 'nowrap',
            }}
          >
            {t.label}
            {t.count != null && (
              <span
                style={{
                  fontSize: 11,
                  padding: '2px 7px',
                  borderRadius: 999,
                  background:
                    tab === t.id ? 'var(--primary-50)' : 'var(--surface-2)',
                  color: tab === t.id ? 'var(--primary-700)' : 'var(--text-soft)',
                  fontWeight: 700,
                }}
              >
                {t.count}
              </span>
            )}
          </button>
        ))}
        <div
          style={{
            marginLeft: 'auto',
            fontSize: 12,
            color: 'var(--text-soft)',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            paddingRight: 6,
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: error
                ? 'var(--tertiary)'
                : loading
                  ? 'var(--accent-warm)'
                  : 'var(--accent-green)',
            }}
          />
          {error ? error : loading ? 'Поиск…' : response ? 'Найдено' : 'Готов к переводу'}
        </div>
      </div>

      {tab === 'dict' && dictExtraCount > 0 && renderBucket(usefulResult)}
      {tab === 'occurrences' && includeCount > 0 && renderBucket(usefulInclude, true)}
      {tab === 'similar' && similarCount > 0 &&
        renderBucket([...usefulMatch, ...usefulFuzzy], true)}
      {tab === 'ai' && totalCount === 0 && <ResultsAI />}

      {/* CTA */}
      {response && totalCount > 0 && (
        <div style={{ marginTop: 14, textAlign: 'center' }}>
          <Link
            href="/words"
            className="chip"
            style={{ cursor: 'pointer', textDecoration: 'none' }}
          >
            <Icon name="search" size={12} /> Открыть полный словарь
          </Link>
        </div>
      )}
    </div>
  );
}
