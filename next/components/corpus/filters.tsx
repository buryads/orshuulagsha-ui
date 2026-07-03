'use client';

import { type ReactElement, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Icon } from '@/components/ui/icon';
import type { CorpusFacets, CorpusEntryType } from '@/lib/api/corpus-types';

interface FiltersProps {
  facets: CorpusFacets | null;
  selectedTypes: CorpusEntryType[];
  selectedSources: string[];
  selectedLicenses: string[];
  hasTranslation: boolean;
  onTypeToggle: (type: CorpusEntryType) => void;
  onSourceToggle: (source: string) => void;
  onLicenseToggle: (license: string) => void;
  onHasTranslationToggle: () => void;
  onReset: () => void;
}

const ENTRY_TYPES: CorpusEntryType[] = ['mono', 'parallel', 'lexicon', 'toponym'];

export function Filters({
  facets,
  selectedTypes,
  selectedSources,
  selectedLicenses,
  hasTranslation,
  onTypeToggle,
  onSourceToggle,
  onLicenseToggle,
  onHasTranslationToggle,
  onReset,
}: FiltersProps): ReactElement {
  const t = useTranslations('corpus');
  const [open, setOpen] = useState(false);

  const hasActiveFilters =
    selectedTypes.length > 0 ||
    selectedSources.length > 0 ||
    selectedLicenses.length > 0 ||
    hasTranslation;

  const content = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Type facet — static list, count from FacetBucket[] via .find() */}
      <div>
        <p
          style={{
            margin: '0 0 8px',
            fontSize: 11,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: 'var(--text-soft)',
          }}
        >
          {t('filterType')}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {ENTRY_TYPES.map((type) => {
            const count = facets?.type.find((b) => b.key === type)?.count ?? 0;
            const checked = selectedTypes.includes(type);
            return (
              <label
                key={type}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  cursor: 'pointer',
                  padding: '5px 6px',
                  borderRadius: 6,
                  minHeight: 36,
                  background: checked ? 'var(--primary-50)' : 'transparent',
                  color: checked ? 'var(--primary-700)' : 'var(--text)',
                  fontSize: 13,
                }}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onTypeToggle(type)}
                  style={{ accentColor: 'var(--primary)', width: 14, height: 14, flexShrink: 0 }}
                  aria-label={t(`type.${type}`)}
                />
                <span style={{ flex: 1 }}>{t(`type.${type}`)}</span>
                {count > 0 && (
                  <span style={{ fontSize: 11, color: 'var(--text-soft)', fontVariantNumeric: 'tabular-nums' }}>
                    {count.toLocaleString()}
                  </span>
                )}
              </label>
            );
          })}
        </div>
      </div>

      {/* Has translation */}
      <div>
        <p
          style={{
            margin: '0 0 8px',
            fontSize: 11,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: 'var(--text-soft)',
          }}
        >
          {t('filterOther')}
        </p>
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            cursor: 'pointer',
            padding: '5px 6px',
            borderRadius: 6,
            minHeight: 36,
            background: hasTranslation ? 'var(--primary-50)' : 'transparent',
            color: hasTranslation ? 'var(--primary-700)' : 'var(--text)',
            fontSize: 13,
          }}
        >
          <input
            type="checkbox"
            checked={hasTranslation}
            onChange={onHasTranslationToggle}
            style={{ accentColor: 'var(--primary)', width: 14, height: 14, flexShrink: 0 }}
            aria-label={t('filterHasTranslation')}
          />
          {t('filterHasTranslation')}
        </label>
      </div>

      {/* Source facet — FacetBucket[], top 8 by count */}
      {facets && facets.source.length > 0 && (
        <div>
          <p
            style={{
              margin: '0 0 8px',
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--text-soft)',
            }}
          >
            {t('filterSource')}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {[...facets.source]
              .sort((a, b) => b.count - a.count)
              .slice(0, 8)
              .map((bucket) => {
                const checked = selectedSources.includes(bucket.key);
                return (
                  <label
                    key={bucket.key}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      cursor: 'pointer',
                      padding: '5px 6px',
                      borderRadius: 6,
                      minHeight: 36,
                      background: checked ? 'var(--primary-50)' : 'transparent',
                      color: checked ? 'var(--primary-700)' : 'var(--text)',
                      fontSize: 13,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => onSourceToggle(bucket.key)}
                      style={{ accentColor: 'var(--primary)', width: 14, height: 14, flexShrink: 0 }}
                      aria-label={bucket.key}
                    />
                    <span style={{ flex: 1, wordBreak: 'break-all' }}>{bucket.key}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-soft)', fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>
                      {bucket.count.toLocaleString()}
                    </span>
                  </label>
                );
              })}
          </div>
        </div>
      )}

      {/* License facet — FacetBucket[], sorted by count */}
      {facets && facets.license.length > 0 && (
        <div>
          <p
            style={{
              margin: '0 0 8px',
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--text-soft)',
            }}
          >
            {t('filterLicense')}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {[...facets.license]
              .sort((a, b) => b.count - a.count)
              .map((bucket) => {
                const checked = selectedLicenses.includes(bucket.key);
                return (
                  <label
                    key={bucket.key}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      cursor: 'pointer',
                      padding: '5px 6px',
                      borderRadius: 6,
                      minHeight: 36,
                      background: checked ? 'var(--primary-50)' : 'transparent',
                      color: checked ? 'var(--primary-700)' : 'var(--text)',
                      fontSize: 13,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => onLicenseToggle(bucket.key)}
                      style={{ accentColor: 'var(--primary)', width: 14, height: 14, flexShrink: 0 }}
                      aria-label={bucket.key}
                    />
                    <span style={{ flex: 1 }}>{bucket.key}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-soft)', fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>
                      {bucket.count.toLocaleString()}
                    </span>
                  </label>
                );
              })}
          </div>
        </div>
      )}

      {hasActiveFilters && (
        <button
          type="button"
          onClick={onReset}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 12px',
            minHeight: 36,
            background: 'var(--surface-2)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            fontSize: 13,
            color: 'var(--text)',
            cursor: 'pointer',
            width: '100%',
            justifyContent: 'center',
          }}
        >
          <Icon name="x" size={14} />
          {t('filterReset')}
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop: sidebar */}
      <div className="corpus-filters-desktop">
        <div
          className="card"
          style={{ padding: '16px 14px', position: 'sticky', top: 80 }}
        >
          <p
            style={{
              margin: '0 0 16px',
              fontWeight: 700,
              fontSize: 14,
              color: 'var(--text)',
            }}
          >
            {t('filters')}
          </p>
          {content}
        </div>
      </div>

      {/* Mobile: collapsible drawer */}
      <div className="corpus-filters-mobile">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={t('filters')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 14px',
            minHeight: 44,
            background: hasActiveFilters ? 'var(--primary-50)' : 'var(--surface-2)',
            border: '1px solid var(--border)',
            borderRadius: 10,
            fontWeight: 600,
            fontSize: 14,
            color: hasActiveFilters ? 'var(--primary-700)' : 'var(--text)',
            cursor: 'pointer',
            width: '100%',
          }}
        >
          <Icon name="sliders-horizontal" size={16} />
          {t('filters')}
          {hasActiveFilters && (
            <span
              style={{
                marginLeft: 'auto',
                background: 'var(--primary)',
                color: 'white',
                borderRadius: '50%',
                width: 18,
                height: 18,
                fontSize: 11,
                fontWeight: 700,
                display: 'grid',
                placeItems: 'center',
              }}
            >
              {selectedTypes.length + selectedSources.length + selectedLicenses.length + (hasTranslation ? 1 : 0)}
            </span>
          )}
          <Icon
            name={open ? 'chevron-up' : 'chevron-down'}
            size={14}
            style={{ marginLeft: hasActiveFilters ? 0 : 'auto' }}
          />
        </button>
        {open && (
          <div
            className="card"
            style={{ padding: '16px 14px', marginTop: 8 }}
          >
            {content}
          </div>
        )}
      </div>
    </>
  );
}
