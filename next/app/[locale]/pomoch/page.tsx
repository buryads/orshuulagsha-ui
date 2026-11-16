import type { Metadata } from 'next';
import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PostActions } from '@/components/pomoch/post-actions';
import { VolunteerForm } from '@/components/pomoch/volunteer-form';

const POSTER = '/images/znatoki-poster.jpg';

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: 'pomoch' });
  return {
    metadataBase: new URL('https://next.buryads.com'),
    title: t('metaTitle'),
    description: t('metaDescription'),
    openGraph: {
      title: t('metaTitle'),
      description: t('metaDescription'),
      images: [{ url: POSTER, width: 1080, height: 1080, alt: t('posterAlt') }],
    },
    twitter: { card: 'summary_large_image', images: [POSTER] },
  };
}

const sectionTitle = { fontSize: 22, fontWeight: 700, margin: '0 0 10px' } as const;
const subTitle = { fontSize: 16, fontWeight: 700, margin: '20px 0 6px' } as const;
const list = { listStyle: 'disc', paddingLeft: 20, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 } as const;

export default async function PomochPage({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale);
  const t = await getTranslations('pomoch');
  const post = t.raw('post') as string[];
  const works = t.raw('works') as string[];
  const doing = t.raw('doing') as string[];
  const help = t.raw('help') as string[];

  return (
    <div
      className="container fade-up"
      style={{
        paddingTop: 32,
        paddingBottom: 32,
        display: 'flex',
        flexDirection: 'column',
        gap: 28,
        maxWidth: 680,
        lineHeight: 1.6,
      }}
    >
      <div>
        <h1 style={{ fontSize: 36, fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.02em' }}>
          {t('title')}
        </h1>
        <p style={{ color: 'var(--text-muted)', marginTop: 8, fontSize: 17 }}>{t('why')}</p>
      </div>

      <div>
        <Image
          src={POSTER}
          alt={t('posterAlt')}
          width={1080}
          height={1080}
          priority
          sizes="(max-width: 680px) 100vw, 680px"
          style={{ width: '100%', height: 'auto', borderRadius: 14, display: 'block' }}
        />
        <div style={{ marginTop: 12 }}>
          <a className="btn btn-primary" href={POSTER} download="buryads-znatoki.jpg">
            {t('download')}
          </a>
        </div>
      </div>

      <section>
        <h2 style={sectionTitle}>{t('postTitle')}</h2>
        <PostActions
          text={post.join('\n')}
          copyLabel={t('copy')}
          copiedLabel={t('copied')}
          copyFailLabel={t('copyFail')}
        />
      </section>

      <section>
        <h2 style={sectionTitle}>{t('aboutTitle')}</h2>
        <p style={{ margin: 0 }}>{t('aboutIntro')}</p>
        <h3 style={subTitle}>{t('worksTitle')}</h3>
        <ul style={list}>
          {works.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
        <h3 style={subTitle}>{t('doingTitle')}</h3>
        <ul style={list}>
          {doing.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
        <h3 style={subTitle}>{t('helpTitle')}</h3>
        <ul style={list}>
          {help.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
        <p style={{ margin: '12px 0 0', color: 'var(--text-muted)' }}>{t('helpNote')}</p>
      </section>

      <VolunteerForm />
    </div>
  );
}
