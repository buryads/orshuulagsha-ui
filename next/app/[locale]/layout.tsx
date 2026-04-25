import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { ThemeProvider } from '@/components/theme-provider';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { routing } from '@/i18n/routing';
import { manrope, jakarta, fraunces, jetbrainsMono } from '../fonts';
import '../globals.css';

export const metadata: Metadata = {
  title: 'Orshuulagsha — Buryad Dictionary',
  description: 'Buryad-Russian-English dictionary and language learning platform',
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const { locale } = params;

  if (!(routing.locales as readonly string[]).includes(locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${manrope.variable} ${jakarta.variable} ${fraunces.variable} ${jetbrainsMono.variable}`}
    >
      <body
        className="antialiased min-h-screen flex flex-col bg-bg text-text"
        style={{ fontFamily: 'var(--font-body)' }}
      >
        <ThemeProvider attribute="data-theme" defaultTheme="light" enableSystem={false}>
          <NextIntlClientProvider locale={locale} messages={messages}>
            <Header />
            <main className="flex-1">
              <div className="fade-up">{children}</div>
            </main>
            <Footer />
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
