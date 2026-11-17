import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: 'privacy' });
  return { title: t('metaTitle'), description: t('metaDescription') };
}

const heading = { fontSize: 20, fontWeight: 700, margin: '0 0 8px' } as const;
const list = { listStyle: 'disc', paddingLeft: 20, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 } as const;

export default async function PrivacyPage({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale);
  const t = await getTranslations('privacy');
  const collect = t.raw('collect') as string[];
  const emailCategories = t.raw('emailCategories') as string[];
  const licenseUrl = (await getTranslations('pomoch.form'))('licenseUrl');

  return (
    <div
      className="container fade-up"
      style={{ paddingTop: 32, paddingBottom: 32, display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 680, lineHeight: 1.6 }}
    >
      <div>
        <h1 style={{ fontSize: 36, fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.02em' }}>{t('title')}</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: 8, fontSize: 14 }}>{t('updated')}</p>
      </div>

      <section>
        <h2 style={heading}>{t('collectTitle')}</h2>
        <ul style={list}>
          {collect.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2 style={heading}>{t('whyTitle')}</h2>
        <p style={{ margin: 0 }}>{t('why')}</p>
      </section>

      <section>
        <h2 style={heading}>{t('storageTitle')}</h2>
        <p style={{ margin: 0 }}>{t('storage')}</p>
      </section>

      <section>
        <h2 style={heading}>{t('emailTitle')}</h2>
        <p style={{ margin: 0 }}>{t('emailConsent')}</p>
        <ul style={{ ...list, margin: '8px 0' }}>
          {emailCategories.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
        <p style={{ margin: 0 }}>{t('emailUnsubscribe')}</p>
        <p style={{ margin: '8px 0 0' }}>{t('emailService')}</p>
      </section>

      <section>
        <h2 style={heading}>{t('licenseTitle')}</h2>
        <p style={{ margin: 0 }}>{t('license')}</p>
        <p style={{ margin: '8px 0 0' }}>
          <a href={licenseUrl} target="_blank" rel="noreferrer noopener" style={{ color: 'var(--primary-700)', textDecoration: 'underline' }}>
            {t('licenseLabel')}
          </a>
        </p>
      </section>

      <section>
        <h2 style={heading}>{t('contactsTitle')}</h2>
        <p style={{ margin: 0 }}>{t('contacts')}</p>
      </section>

      <section>
        <h2 style={heading}>{t('deleteTitle')}</h2>
        <p style={{ margin: 0 }}>{t('delete')}</p>
        <p style={{ margin: '8px 0 0' }}>
          <Link href="/pomoch" style={{ color: 'var(--primary-700)', textDecoration: 'underline' }}>
            {t('deleteLink')}
          </Link>
        </p>
      </section>
    </div>
  );
}
