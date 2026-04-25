// TODO i18n: port hardcoded strings to t(...) using next-intl
import { Link } from '@/i18n/navigation';
import type { ReactElement } from 'react';
import { Icon } from '@/components/ui/icon';

export interface BreadcrumbsProps {
  category?: string;
  word: string;
}

export function Breadcrumbs({ category, word }: BreadcrumbsProps): ReactElement {
  return (
    <nav
      aria-label="Хлебные крошки"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        marginBottom: 20,
        fontSize: 13,
        color: 'var(--text-muted)',
        flexWrap: 'wrap',
      }}
    >
      <Link
        href="/explore"
        className="btn-ghost"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '6px 10px',
          borderRadius: 8,
          textDecoration: 'none',
          color: 'var(--text-muted)',
        }}
      >
        <Icon name="arrow-left" size={14} /> Словарь
      </Link>
      {category && (
        <>
          <span style={{ color: 'var(--text-soft)' }}>/</span>
          <span>{category}</span>
        </>
      )}
      <span style={{ color: 'var(--text-soft)' }}>/</span>
      <b style={{ color: 'var(--text)' }}>{word}</b>
    </nav>
  );
}
