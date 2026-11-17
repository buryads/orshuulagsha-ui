import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { CardView } from '@/components/cards/card-view';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

async function loadRu(id: string): Promise<string | null> {
  if (!API_BASE || !/^\d+$/.test(id)) return null;
  try {
    const res = await fetch(`${API_BASE.replace(/\/$/, '')}/api/greetings/${id}`, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(2500),
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const body = (await res.json()) as { data?: { live?: boolean; ru?: string | null } };
    return body.data?.live && body.data.ru ? body.data.ru : null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: { locale: string; id: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: 'cards.card' });
  const ru = await loadRu(params.id);
  const title = ru ? `${t('metaTitle')}: ${ru}` : t('metaTitle');
  return { title, openGraph: { title }, robots: { index: false } };
}

export default function CardPage({ params }: { params: { locale: string; id: string } }) {
  setRequestLocale(params.locale);
  return <CardView id={params.id} />;
}
