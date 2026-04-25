import type { ReactElement } from 'react';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Icon, type IconName } from '@/components/ui/icon';

type CategoryKey =
  | 'dictionary'
  | 'lessons'
  | 'names'
  | 'etymology'
  | 'community'
  | 'phraseology';

interface CategoryDescriptor {
  key: CategoryKey;
  href: string;
  count: string;
  icon: IconName;
  color: string;
  soft: string;
}

const CATEGORIES: readonly CategoryDescriptor[] = [
  {
    key: 'dictionary',
    href: '/explore',
    count: '124k слов',
    icon: 'library',
    color: 'var(--primary)',
    soft: 'var(--primary-50)',
  },
  {
    key: 'lessons',
    href: '/learn',
    count: '32 курса',
    icon: 'lightbulb',
    color: 'var(--accent-warm)',
    soft: 'var(--accent-warm-soft)',
  },
  {
    key: 'names',
    href: '/names',
    count: '1 240 имён',
    icon: 'users',
    color: 'var(--tertiary)',
    soft: 'var(--tertiary-soft)',
  },
  {
    key: 'etymology',
    href: '/explore',
    count: 'новый раздел',
    icon: 'compass',
    color: 'var(--accent-green)',
    soft: 'var(--accent-green-soft)',
  },
  {
    key: 'community',
    href: '/community',
    count: '2.4k участников',
    icon: 'comment',
    color: 'var(--primary)',
    soft: 'var(--primary-50)',
  },
  {
    key: 'phraseology',
    href: '/explore',
    count: 'идиомы и пословицы',
    icon: 'leaf',
    color: 'var(--accent-green)',
    soft: 'var(--accent-green-soft)',
  },
];

export async function Categories(): Promise<ReactElement> {
  const t = await getTranslations('home.categories');

  return (
    <section style={{ padding: '0 clamp(16px, 4vw, 28px)', marginTop: 60 }}>
      <div>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            marginBottom: 20,
          }}
        >
          <div>
            <h2
              style={{
                fontSize: 30,
                fontWeight: 700,
                letterSpacing: '-0.02em',
              }}
            >
              {t('title')}
            </h2>
            <p
              style={{
                color: 'var(--text-muted)',
                fontSize: 15,
                marginTop: 6,
              }}
            >
              {t('subtitle')}
            </p>
          </div>
          <Link href="/explore" className="btn btn-ghost" style={{ textDecoration: 'none' }}>
            <span>{t('all')}</span> <Icon name="arrow-right" size={14} />
          </Link>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 16,
          }}
        >
          {CATEGORIES.map((c) => (
            <Link
              key={c.key}
              href={c.href}
              className="card"
              style={{
                padding: 22,
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                cursor: 'pointer',
                transition: 'all 0.2s',
                textDecoration: 'none',
                color: 'inherit',
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  background: c.soft,
                  color: c.color,
                  display: 'grid',
                  placeItems: 'center',
                  flexShrink: 0,
                }}
              >
                <Icon name={c.icon} size={22} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 2 }}>
                  {t(c.key)}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {c.count}
                </div>
              </div>
              <Icon
                name="arrow-right"
                size={16}
                style={{ color: 'var(--text-soft)' }}
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
