import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { SuggestionsTable } from '@/components/admin/suggestions-table';

export const metadata: Metadata = {
  title: 'Предложения переводов',
};

interface AdminSuggestionsPageProps {
  params: { locale: string };
}

export default function AdminSuggestionsPage({
  params,
}: AdminSuggestionsPageProps) {
  setRequestLocale(params.locale);
  return <SuggestionsTable />;
}
