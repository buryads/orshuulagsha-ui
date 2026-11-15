import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { ResetPasswordForm } from '@/components/auth/reset-password-form';

export const metadata: Metadata = {
  title: 'Новый пароль — Orshuulagsha',
  referrer: 'no-referrer',
  robots: { index: false },
};

interface ResetPasswordPageProps {
  params: { locale: string; token: string };
}

export default function ResetPasswordPage({ params }: ResetPasswordPageProps) {
  setRequestLocale(params.locale);
  return <ResetPasswordForm token={params.token} />;
}
