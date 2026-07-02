'use client';

import { type ReactElement, useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { SearchBar } from './search-bar';
import { Filters } from './filters';
import { ResultCard } from './result-card';
import { Pagination } from './pagination';
import { DownloadPanel } from './download-panel';
import { searchCorpus } from '@/lib/api/corpus';
import type {
  CorpusEntryType,
  CorpusFacets,
  CorpusHit,
} from '@/lib/api/corpus-types';

const PER_PAGE = 20;

export function CorpusExplorer(): ReactElement {
  const t = useTranslations('corpus');

  // Search state
  const [query, setQuery] = useState('');
  const [committedQuery, setCommittedQuery] = useState('');

  // Filter state
  const [selectedTypes, setSelectedTypes] = useState<CorpusEntryType[]>([]);
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [selectedLicenses, setSelectedLicenses] = useState<string[]>([]);
  const [hasTranslation, setHasTranslation] = useState(false);

  // Results state
  const [page, setPage] = useState(1);
  const [hits, setHits] = useState<CorpusHit[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [facets, setFacets] = useState<CorpusFacets | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  // Monotonic counter — incremented on every search initiation.
  // After awaiting, stale responses (counter mismatch) are silently dropped,
  // preventing out-of-order state updates when the user changes filters quickly.
  const reqRef = useRef(0);

  const doSearch = useCallback(
    async (p: number, q: string) => {
      const reqId = ++reqRef.current;

      setLoading(true);
      setError(null);
      setSearched(true);

      try {
        const result = await searchCorpus({
          q: q || undefined,
          type: selectedTypes.length > 0 ? selectedTypes : undefined,
          source: selectedSources.length > 0 ? selectedSources : undefined,
          license: selectedLicenses.length > 0 ? selectedLicenses : undefined,
          has_translation: hasTranslation || undefined,
          page: p,
          per_page: PER_PAGE,
          sort: 'relevance',
        });
        // Drop stale response — a newer request has already been issued.
        if (reqId !== reqRef.current) return;
        setHits(result.hits);
        setTotal(result.total);
        setFacets(result.facets);
        setPage(result.page);
      } catch (err: unknown) {
        if (reqId !== reqRef.current) return;
        setError(t('errorSearch'));
        setHits([]);
        setTotal(null);
      } finally {
        // Only clear loading flag for the latest request.
        if (reqId === reqRef.current) setLoading(false);
      }
    },
    [selectedTypes, selectedSources, selectedLicenses, hasTranslation, t],
  );

  // Re-run when filters change (only if already searched)
  useEffect(() => {
    if (!searched) return;
    setPage(1);
    doSearch(1, committedQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTypes, selectedSources, selectedLicenses, hasTranslation]);

  function handleSubmit() {
    setCommittedQuery(query);
    setPage(1);
    doSearch(1, query);
  }

  function handlePageChange(p: number) {
    setPage(p);
    doSearch(p, committedQuery);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleTypeToggle(type: CorpusEntryType) {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  }

  function handleSourceToggle(source: string) {
    setSelectedSources((prev) =>
      prev.includes(source) ? prev.filter((s) => s !== source) : [...prev, source],
    );
  }

  function handleLicenseToggle(license: string) {
    setSelectedLicenses((prev) =>
      prev.includes(license) ? prev.filter((l) => l !== license) : [...prev, license],
    );
  }

  function handleReset() {
    setSelectedTypes([]);
    setSelectedSources([]);
    setSelectedLicenses([]);
    setHasTranslation(false);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {/* Page header */}
      <div>
        <h1
          style={{
            margin: 0,
            fontSize: 'clamp(24px, 4vw, 36px)',
            fontWeight: 800,
            color: 'var(--text)',
            letterSpacing: '-0.02em',
            fontFamily: 'var(--font-display)',
          }}
        >
          {t('title')}
        </h1>
        <p
          style={{
            margin: '8px 0 0',
            fontSize: 15,
            color: 'var(--text-soft)',
            lineHeight: 1.5,
          }}
        >
          {t('subtitle')}
        </p>
      </div>

      {/* Search bar */}
      <SearchBar
        value={query}
        onChange={setQuery}
        onSubmit={handleSubmit}
        loading={loading}
      />

      {/* Main layout: filters sidebar + results.
          Grid columns and display:grid are set exclusively by .corpus-layout
          in globals.css (240px sidebar on desktop, 1fr on mobile). No inline
          gridTemplateColumns — it would override the class and break the sidebar. */}
      <div style={{ gap: 24 }} className="corpus-layout">
        {/* Filters — always rendered, visibility controlled via CSS classes in globals */}
        <Filters
          facets={facets}
          selectedTypes={selectedTypes}
          selectedSources={selectedSources}
          selectedLicenses={selectedLicenses}
          hasTranslation={hasTranslation}
          onTypeToggle={handleTypeToggle}
          onSourceToggle={handleSourceToggle}
          onLicenseToggle={handleLicenseToggle}
          onHasTranslationToggle={() => setHasTranslation((v) => !v)}
          onReset={handleReset}
        />

        {/* Results column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Result count */}
          {searched && total !== null && !loading && (
            <p
              style={{
                margin: 0,
                fontSize: 13,
                color: 'var(--text-soft)',
              }}
            >
              {t('resultCount', { count: total.toLocaleString() })}
            </p>
          )}

          {/* Loading skeleton */}
          {loading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="card"
                  style={{
                    padding: 18,
                    height: 120,
                    background: 'var(--surface-2)',
                    border: '1px solid var(--border)',
                    animation: 'pulse 1.4s ease-in-out infinite',
                  }}
                />
              ))}
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div
              className="card"
              style={{
                padding: 28,
                textAlign: 'center',
                color: 'var(--text-muted)',
                borderStyle: 'dashed',
                borderColor: 'var(--error, #ef4444)',
              }}
            >
              <p style={{ margin: 0 }}>{error}</p>
              <button
                type="button"
                onClick={handleSubmit}
                style={{
                  marginTop: 12,
                  padding: '8px 16px',
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontSize: 13,
                  color: 'var(--text)',
                }}
              >
                {t('retry')}
              </button>
            </div>
          )}

          {/* Empty state */}
          {searched && !loading && !error && hits.length === 0 && (
            <div
              className="card"
              style={{
                padding: 28,
                textAlign: 'center',
                color: 'var(--text-muted)',
                borderStyle: 'dashed',
              }}
            >
              {t('empty')}
            </div>
          )}

          {/* Not searched yet */}
          {!searched && !loading && (
            <div
              className="card"
              style={{
                padding: 28,
                textAlign: 'center',
                color: 'var(--text-soft)',
                borderStyle: 'dashed',
              }}
            >
              {t('searchPrompt')}
            </div>
          )}

          {/* Results */}
          {!loading && hits.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {hits.map((hit) => (
                <ResultCard key={hit.id} hit={hit} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && total !== null && total > PER_PAGE && (
            <div style={{ marginTop: 8 }}>
              <Pagination
                page={page}
                total={total}
                perPage={PER_PAGE}
                onChange={handlePageChange}
              />
            </div>
          )}
        </div>
      </div>

      {/* Download section */}
      <div style={{ paddingTop: 16, borderTop: '1px solid var(--border)' }}>
        <DownloadPanel />
      </div>
    </div>
  );
}
