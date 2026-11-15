import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form';

export const metadata: Metadata = {
  title: 'Восстановление пароля — Orshuulagsha',
};

interface ForgotPasswordPageProps {
  params: { locale: string };
}

export default function ForgotPasswordPage({ params }: ForgotPasswordPageProps) {
  setRequestLocale(params.locale);
  return <ForgotPasswordForm />;
}
