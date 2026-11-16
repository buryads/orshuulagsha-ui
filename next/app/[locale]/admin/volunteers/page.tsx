import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { VolunteersTable } from '@/components/admin/volunteers-table';

export const metadata: Metadata = {
  title: 'Заявки знатоков',
};

export default function AdminVolunteersPage({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale);
  return <VolunteersTable />;
}
