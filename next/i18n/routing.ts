import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['ru', 'bur', 'en'],
  defaultLocale: 'ru',
  localePrefix: 'always',
});

export type Locale = (typeof routing.locales)[number];
