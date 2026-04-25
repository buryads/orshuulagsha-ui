import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { Breadcrumb } from '@/components/breadcrumb';
import { PackQuiz } from '@/components/packs/pack-quiz';

export const metadata: Metadata = {
  title: 'Тренировка пакета',
};

interface TrainingPageProps {
  params: { locale: string; slug: string };
}

export default function TrainingPage({ params }: TrainingPageProps) {
  setRequestLocale(params.locale);
  return (
    <div className="container fade-up" style={{ padding: '32px 0' }}>
      <Breadcrumb
        items={[
          { label: 'Главная', href: '/' },
          { label: 'Мои пакеты', href: '/packs' },
          { label: 'Пакет', href: `/packs/${params.slug}` },
          { label: 'Тренировка' },
        ]}
      />
      <h1
        style={{
          marginTop: 16,
          marginBottom: 24,
          fontSize: 32,
          fontWeight: 700,
          letterSpacing: '-0.02em',
        }}
      >
        Тренировка
      </h1>
      <PackQuiz packSlug={params.slug} />
    </div>
  );
}
