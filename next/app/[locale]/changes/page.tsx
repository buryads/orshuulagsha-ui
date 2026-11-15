import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Markdown } from '@/components/changes/markdown';
import { getChanges } from '@/lib/changes';

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: 'changes' });
  return { title: t('title') };
}

export default async function ChangesPage({ params }: { params: { locale: string } }) {
  const { locale } = params;
  setRequestLocale(locale);
  const t = await getTranslations('changes');
  const entries = getChanges(locale);
  const fmt = new Intl.DateTimeFormat(locale === 'bur' ? 'ru' : locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });

  return (
    <div
      className="container fade-up"
      style={{
        paddingTop: 32,
        paddingBottom: 32,
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
        maxWidth: 800,
      }}
    >
      <div>
        <h1 style={{ fontSize: 36, fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.02em' }}>
          {t('title')}
        </h1>
        <p style={{ color: 'var(--text-muted)', marginTop: 6, fontSize: 15 }}>{t('subtitle')}</p>
      </div>

      {entries.length === 0 && <p style={{ color: 'var(--text-muted)' }}>{t('empty')}</p>}

      {entries.map((e) => (
        <article key={e.slug} className="card changes-entry" style={{ padding: 20 }}>
          <time dateTime={e.date} style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            {fmt.format(new Date(`${e.date}T00:00:00Z`))}
          </time>
          <h2 style={{ fontSize: 22, fontWeight: 700, margin: '4px 0 8px' }}>{e.title}</h2>
          {e.aiTranslated && (
            <p style={{ fontSize: 12, color: 'var(--text-soft)', margin: '0 0 8px' }}>
              {t('aiNote')}
            </p>
          )}
          <Markdown source={e.body} />
        </article>
      ))}
    </div>
  );
}
