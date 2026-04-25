import { getTranslations } from 'next-intl/server';
import { Logo } from '@/components/brand/logo';
import { Icon } from '@/components/ui/icon';

type SectionId = 'dictionary' | 'learn' | 'community' | 'about';

const SECTIONS: ReadonlyArray<{
  id: SectionId;
  links: ReadonlyArray<string>;
}> = [
  { id: 'dictionary', links: ['search', 'wordOfDay', 'names', 'etymology'] },
  { id: 'learn', links: ['lessons', 'flashcards', 'quizzes', 'games'] },
  { id: 'community', links: ['suggest', 'forum', 'contributors', 'news'] },
  { id: 'about', links: ['about', 'team', 'partners', 'contacts'] },
];

export async function Footer() {
  const t = await getTranslations('footer');

  return (
    <footer
      style={{
        marginTop: 80,
        borderTop: '1px solid var(--border)',
        background: 'var(--surface-2)',
        padding: '40px clamp(16px, 4vw, 28px) 32px',
      }}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr repeat(4, 1fr)', gap: 32 }}>
        <div>
          <Logo />
          <p
            style={{
              marginTop: 14,
              color: 'var(--text-muted)',
              fontSize: 13,
              lineHeight: 1.6,
              maxWidth: 260,
            }}
          >
            {t('description')}
          </p>
          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            <button type="button" className="btn-icon" style={{ width: 34, height: 34 }} aria-label={t('aria.site')}>
              <Icon name="globe" size={15} />
            </button>
            <button type="button" className="btn-icon" style={{ width: 34, height: 34 }} aria-label={t('aria.share')}>
              <Icon name="share" size={15} />
            </button>
            <button type="button" className="btn-icon" style={{ width: 34, height: 34 }} aria-label={t('aria.community')}>
              <Icon name="comment" size={15} />
            </button>
          </div>
        </div>
        {SECTIONS.map((col) => (
          <div key={col.id}>
            <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 14 }}>
              {t(`sections.${col.id}`)}
            </h4>
            {col.links.map((link) => (
              <div
                key={link}
                style={{
                  fontSize: 13,
                  color: 'var(--text-muted)',
                  padding: '5px 0',
                  cursor: 'pointer',
                }}
              >
                {t(`links.${col.id}.${link}`)}
              </div>
            ))}
          </div>
        ))}
      </div>
      <div
        style={{
          maxWidth: 1280,
          margin: '32px auto 0',
          paddingTop: 20,
          borderTop: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          color: 'var(--text-soft)',
          fontSize: 12,
        }}
      >
        <span>{t('copyright')}</span>
        <span>{t('madeWith')}</span>
      </div>
    </footer>
  );
}
