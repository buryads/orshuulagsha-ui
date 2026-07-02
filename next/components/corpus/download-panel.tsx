'use client';

import { type ReactElement, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Icon } from '@/components/ui/icon';
import { getCorpusReleases } from '@/lib/api/corpus';
import { resolveApiUrl } from '@/lib/api/client';
import type { CorpusRelease } from '@/lib/api/corpus-types';

function formatBytes(bytes: number): string {
  if (bytes >= 1_000_000_000) return `${(bytes / 1_000_000_000).toFixed(1)} GB`;
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(0)} MB`;
  return `${(bytes / 1_000).toFixed(0)} KB`;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch {
    return iso;
  }
}

function formatCount(n: number): string {
  return n.toLocaleString('ru-RU');
}

export function DownloadPanel(): ReactElement {
  const t = useTranslations('corpus');
  const [release, setRelease] = useState<CorpusRelease | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    getCorpusReleases()
      .then((r) => setRelease(r.latest))
      .catch(() => setError(true));
  }, []);

  return (
    <section
      className="card"
      style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}
      aria-labelledby="download-heading"
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Icon name="download" size={22} style={{ color: 'var(--primary)' }} />
        <h2
          id="download-heading"
          style={{ margin: 0, fontSize: 20, fontWeight: 700, color: 'var(--text)' }}
        >
          {t('downloadTitle')}
        </h2>
      </div>

      {/* Release metadata */}
      {release && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
            gap: 12,
          }}
        >
          {[
            { label: t('downloadVersion'), value: release.version },
            { label: t('downloadDate'), value: formatDate(release.date) },
            { label: t('downloadRecords'), value: formatCount(release.record_count) },
            {
              label: t('downloadSize'),
              value: formatBytes(release.formats.jsonl_gz.size_bytes ?? release.size_bytes),
            },
          ].map(({ label, value }) => (
            <div
              key={label}
              style={{
                padding: '10px 14px',
                background: 'var(--surface-2)',
                borderRadius: 8,
                border: '1px solid var(--border)',
              }}
            >
              <p style={{ margin: 0, fontSize: 11, color: 'var(--text-soft)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {label}
              </p>
              <p style={{ margin: '4px 0 0', fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>
                {value}
              </p>
            </div>
          ))}
        </div>
      )}

      {error && (
        <p style={{ margin: 0, color: 'var(--text-soft)', fontSize: 13 }}>
          {t('downloadMetaUnavailable')}
        </p>
      )}

      {/* Download buttons */}
      {(() => {
        // Prefer the URL from releases (may be absolute S3/CDN URL).
        // Fall back to API-host-relative path so we never hit the Next.js host.
        const jsonlHref = release?.formats.jsonl_gz.url
          ? resolveApiUrl(release.formats.jsonl_gz.url)
          : resolveApiUrl('/corpus/download');
        const csvHref = release?.formats.csv_gz?.url
          ? resolveApiUrl(release.formats.csv_gz.url)
          : resolveApiUrl('/corpus/download?format=csv');
        const showCsv = release?.formats.csv_gz != null || !release;

        return (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            <a
              href={jsonlHref}
              download
              aria-label={t('downloadJsonl')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '12px 22px',
                minHeight: 44,
                background: 'var(--primary)',
                color: 'white',
                borderRadius: 10,
                fontWeight: 700,
                fontSize: 15,
                textDecoration: 'none',
                whiteSpace: 'nowrap',
              }}
            >
              <Icon name="download" size={16} />
              {t('downloadJsonl')}
              {release && (
                <span style={{ opacity: 0.8, fontWeight: 400, fontSize: 12 }}>
                  ({formatBytes(release.formats.jsonl_gz.size_bytes ?? release.size_bytes)})
                </span>
              )}
            </a>

            {showCsv && (
              <a
                href={csvHref}
                download
                aria-label={t('downloadCsv')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '12px 18px',
                  minHeight: 44,
                  background: 'var(--surface)',
                  color: 'var(--text)',
                  border: '1.5px solid var(--border)',
                  borderRadius: 10,
                  fontWeight: 600,
                  fontSize: 14,
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                }}
              >
                <Icon name="file-text" size={15} />
                {t('downloadCsv')}
                {release?.formats.csv_gz && (
                  <span style={{ opacity: 0.6, fontWeight: 400, fontSize: 12 }}>
                    ({formatBytes(release.formats.csv_gz.size_bytes)})
                  </span>
                )}
              </a>
            )}
          </div>
        );
      })()}

      {/* Aux links */}
      {release && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
          {release.manifest_url && (
            <a
              href={release.manifest_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: 13, color: 'var(--primary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}
            >
              <Icon name="list" size={13} />
              manifest.json
            </a>
          )}
          {release.readme_url && (
            <a
              href={release.readme_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: 13, color: 'var(--primary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}
            >
              <Icon name="book-open" size={13} />
              README
            </a>
          )}
          {release.license_url && (
            <a
              href={release.license_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: 13, color: 'var(--primary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}
            >
              <Icon name="scale" size={13} />
              LICENSE
            </a>
          )}
          {release.checksum && (
            <span style={{ fontSize: 12, color: 'var(--text-soft)', fontFamily: 'monospace', wordBreak: 'break-all' }}>
              {release.checksum.slice(0, 32)}…
            </span>
          )}
        </div>
      )}

      {/* License summary */}
      <LicenseSummary />
    </section>
  );
}

function LicenseSummary(): ReactElement {
  const t = useTranslations('corpus');
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      style={{
        padding: '14px 16px',
        background: 'var(--surface-2)',
        borderRadius: 10,
        border: '1px solid var(--border)',
      }}
    >
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
          width: '100%',
          textAlign: 'left',
          color: 'var(--text)',
        }}
        aria-expanded={expanded}
      >
        <Icon name="scale" size={15} style={{ color: 'var(--text-soft)', flexShrink: 0 }} />
        <span style={{ fontWeight: 700, fontSize: 14, flex: 1 }}>{t('licenseTitle')}</span>
        <Icon name={expanded ? 'chevron-up' : 'chevron-down'} size={14} style={{ color: 'var(--text-soft)' }} />
      </button>

      {expanded && (
        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--text)', lineHeight: 1.6 }}>
            {t('licenseSummary')}
          </p>
          <p
            style={{
              margin: 0,
              fontSize: 12,
              color: 'var(--text-soft)',
              lineHeight: 1.6,
              padding: '10px 12px',
              background: 'var(--surface)',
              borderRadius: 8,
              borderLeft: '3px solid var(--primary)',
            }}
          >
            {t('licenseDisclaimer')}
          </p>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--text)', lineHeight: 1.6 }}>
            {t('licenseCitation')}
          </p>
        </div>
      )}
    </div>
  );
}
