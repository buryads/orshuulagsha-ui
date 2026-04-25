import type { Metadata } from 'next';
import { Suspense } from 'react';
import { setRequestLocale } from 'next-intl/server';
import { SignupForm } from '@/components/auth/signup-form';

export const metadata: Metadata = {
  title: 'Регистрация — Orshuulagsha',
};

interface SignUpPageProps {
  params: { locale: string };
}

export default function SignUpPage({ params }: SignUpPageProps) {
  setRequestLocale(params.locale);
  return (
    <Suspense fallback={null}>
      <SignupForm />
    </Suspense>
  );
}
