import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { LogsTable } from '@/components/admin/logs-table';

export const metadata: Metadata = {
  title: 'Логи переводов',
};

interface AdminLogsPageProps {
  params: { locale: string };
}

export default function AdminLogsPage({ params }: AdminLogsPageProps) {
  setRequestLocale(params.locale);
  return <LogsTable />;
}
