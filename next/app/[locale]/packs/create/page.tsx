import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { Breadcrumb } from '@/components/breadcrumb';
import { PackForm } from '@/components/packs/pack-form';

export const metadata: Metadata = {
  title: 'Создание пакета',
};

interface CreatePackPageProps {
  params: { locale: string };
}

export default function CreatePackPage({ params }: CreatePackPageProps) {
  setRequestLocale(params.locale);
  return (
    <div className="container fade-up" style={{ paddingTop: 32, paddingBottom: 32 }}>
      <Breadcrumb
        items={[
          { label: 'Главная', href: '/' },
          { label: 'Мои пакеты', href: '/packs' },
          { label: 'Создание пакета' },
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
        Новый пакет
      </h1>
      <PackForm mode="create" />
    </div>
  );
}
