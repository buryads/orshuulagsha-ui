// TODO i18n: port hardcoded strings to t(...) using next-intl
import { Link } from '@/i18n/navigation';
import type { Pack } from '@/lib/api/types';
import { Icon } from '@/components/ui/icon';

interface PackCardProps {
  pack: Pack;
  hrefBase?: string;
  showEdit?: boolean;
}

export function PackCard({
  pack,
  hrefBase = '/packs',
  showEdit = true,
}: PackCardProps) {
  const wordCount = pack.burWords?.length ?? 0;
  const isPrivate = Boolean(pack.is_private);

  return (
    <article
      className="card"
      style={{
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        height: '100%',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
        <h3
          style={{
            fontSize: 18,
            fontWeight: 700,
            flex: 1,
            margin: 0,
            lineHeight: 1.25,
          }}
        >
          <Link
            href={`${hrefBase}/${pack.slug}`}
            style={{ color: 'var(--text)' }}
          >
            {pack.name}
          </Link>
        </h3>
        <span className={isPrivate ? 'chip chip-rose' : 'chip chip-green'}>
          {isPrivate ? 'Приватный' : 'Публичный'}
        </span>
      </div>

      {pack.description ? (
        <p
          style={{
            color: 'var(--text-muted)',
            fontSize: 14,
            margin: 0,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {pack.description}
        </p>
      ) : null}

      <div
        style={{
          marginTop: 'auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          paddingTop: 8,
        }}
      >
        <span
          className="chip"
          style={{ display: 'inline-flex', alignItems: 'center' }}
        >
          <Icon name="book" size={14} />
          {wordCount} {wordCountLabel(wordCount)}
        </span>

        <div style={{ display: 'flex', gap: 8 }}>
          {showEdit ? (
            <Link
              href={`/packs/edit/${pack.slug}`}
              className="btn btn-secondary"
              style={{ padding: '8px 12px', fontSize: 12 }}
            >
              <Icon name="edit" size={14} />
              Изменить
            </Link>
          ) : null}
          <Link
            href={`${hrefBase}/${pack.slug}`}
            className="btn btn-primary"
            style={{ padding: '8px 14px', fontSize: 12 }}
          >
            Открыть
          </Link>
        </div>
      </div>
    </article>
  );
}

function wordCountLabel(n: number): string {
  const abs = Math.abs(n) % 100;
  const last = abs % 10;
  if (abs > 10 && abs < 20) return 'слов';
  if (last > 1 && last < 5) return 'слова';
  if (last === 1) return 'слово';
  return 'слов';
}
