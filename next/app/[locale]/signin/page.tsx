import type { Metadata } from 'next';
import { Suspense } from 'react';
import { setRequestLocale } from 'next-intl/server';
import { SigninForm } from '@/components/auth/signin-form';

export const metadata: Metadata = {
  title: 'Войти — Orshuulagsha',
};

interface SignInPageProps {
  params: { locale: string };
}

export default function SignInPage({ params }: SignInPageProps) {
  setRequestLocale(params.locale);
  return (
    <Suspense fallback={null}>
      <SigninForm />
    </Suspense>
  );
}
