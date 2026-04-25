import { getTranslations } from 'next-intl/server';
import { Logo } from '@/components/brand/logo';
import { Link } from '@/i18n/navigation';
import { getTranslationsAmount } from '@/lib/api/statistic';

const RESOURCES: ReadonlyArray<{ label: string; href: string }> = [
  { label: 'Burlang.Toli', href: 'https://buryat-lang.ru/' },
  { label: 'Үүлэн', href: 'https://uulen.gazeta-n1.ru/' },
];

const SUPPORT_LINKS: ReadonlyArray<{ label: string; href: string }> = [
  { label: 'Boosty', href: 'https://boosty.to/buryads' },
  { label: 'Patreon', href: 'https://www.patreon.com/buryads' },
];

const APPLE_HREF =
  'https://apps.apple.com/ru/app/%D0%B1%D1%83%D1%80%D1%8F%D1%82%D1%81%D0%BA%D0%BE-%D1%80%D1%83%D1%81%D1%81%D0%BA%D0%B8%D0%B9-%D1%81%D0%BB%D0%BE%D0%B2%D0%B0%D1%80%D1%8C/id1584232985';
const PLAY_HREF =
  'https://play.google.com/store/apps/details?id=com.buryads.orshuulga_mobile';
const CHROME_HREF =
  'https://chrome.google.com/webstore/detail/%D0%B1%D1%83%D1%80%D1%8F%D1%82%D1%81%D0%BA%D0%BE-%D1%80%D1%83%D1%81%D1%81%D0%BA%D0%B8%D0%B9-%D1%81%D0%BB%D0%BE%D0%B2%D0%B0%D1%80%D1%8C/gmljjdkoihndbbddpmechgpmacpglcei?hl=ru';
const KEYBOARD_HREF = 'https://github.com/buryads/buryad-keyboard-layout';

const NAV_LINKS: ReadonlyArray<{ id: 'home' | 'dictionary' | 'names' | 'packs'; href: string }> = [
  { id: 'home', href: '/' },
  { id: 'dictionary', href: '/explore' },
  { id: 'names', href: '/names' },
  { id: 'packs', href: '/packs' },
];

const linkStyle = {
  display: 'block',
  fontSize: 13,
  color: 'var(--text-muted)',
  padding: '5px 0',
  textDecoration: 'none',
} as const;

export async function Footer() {
  const t = await getTranslations('footer');
  const dailyCount = await getTranslationsAmount().catch(() => null);

  return (
    <footer
      style={{
        marginTop: 80,
        borderTop: '1px solid var(--border)',
        background: 'var(--surface-2)',
        padding: '40px clamp(16px, 4vw, 28px) 32px',
      }}
    >
      <div className="footer-grid">
        <div>
          <Logo />
          <p
            style={{
              marginTop: 14,
              color: 'var(--text-muted)',
              fontSize: 13,
              lineHeight: 1.6,
              maxWidth: 280,
            }}
          >
            {t('description')}
          </p>
          <div
            style={{
              display: 'flex',
              gap: 10,
              marginTop: 16,
              flexWrap: 'wrap',
              alignItems: 'center',
            }}
          >
            <a href={APPLE_HREF} target="_blank" rel="noreferrer noopener" aria-label="App Store">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/apple-appstore-badge.svg" alt="App Store" height={36} style={{ height: 36 }} />
            </a>
            <a href={PLAY_HREF} target="_blank" rel="noreferrer noopener" aria-label="Google Play">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/google-playstore-badge.svg" alt="Google Play" height={36} style={{ height: 36 }} />
            </a>
            <a href={CHROME_HREF} target="_blank" rel="noreferrer noopener" aria-label="Chrome Web Store">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/chrome-web-store.png" alt="Chrome Web Store" height={36} style={{ height: 36 }} />
            </a>
          </div>
        </div>

        <div>
          <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>
            {t('sections.navigation')}
          </h4>
          {NAV_LINKS.map((item) => (
            <Link key={item.id} href={item.href} style={linkStyle}>
              {t(`navigation.${item.id}`)}
            </Link>
          ))}
        </div>

        <div>
          <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>
            {t('sections.resources')}
          </h4>
          {RESOURCES.map((r) => (
            <a key={r.href} href={r.href} target="_blank" rel="noreferrer noopener" style={linkStyle}>
              {r.label}
            </a>
          ))}
        </div>

        <div>
          <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>
            {t('sections.tools')}
          </h4>
          <a href={KEYBOARD_HREF} target="_blank" rel="noreferrer noopener" style={linkStyle}>
            {t('tools.keyboard')}
          </a>
          <a href={CHROME_HREF} target="_blank" rel="noreferrer noopener" style={linkStyle}>
            {t('tools.chrome')}
          </a>
        </div>

        <div>
          <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>
            {t('sections.support')}
          </h4>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8, lineHeight: 1.5 }}>
            {t('supportText')}
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {SUPPORT_LINKS.map((s) => (
              <a
                key={s.href}
                href={s.href}
                target="_blank"
                rel="noreferrer noopener"
                className="chip"
                style={{ textDecoration: 'none', cursor: 'pointer' }}
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      {dailyCount != null && (
        <div
          style={{
            margin: '28px auto 0',
            textAlign: 'center',
            fontSize: 13,
            color: 'var(--text-muted)',
          }}
        >
          {t('todayTranslated')}:{' '}
          <b style={{ color: 'var(--text)', fontWeight: 700 }}>
            {dailyCount.toLocaleString('ru-RU')}
          </b>
        </div>
      )}

      <p
        style={{
          maxWidth: 720,
          margin: '20px auto 0',
          fontSize: 12,
          color: 'var(--text-soft)',
          textAlign: 'center',
          lineHeight: 1.5,
        }}
      >
        {t('disclaimer')}
      </p>

      <div
        className="footer-bottom"
        style={{
          maxWidth: 1280,
          margin: '20px auto 0',
          paddingTop: 20,
          borderTop: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 8,
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
