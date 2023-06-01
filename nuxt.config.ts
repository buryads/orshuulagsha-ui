// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
  // @ts-ignore if you install typescript as a dev dependency, this will help
  app: {
    head: {
      link: [
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700;900&display=swap',
        },
      ],
    },
    /* page transition doesn't work https://github.com/nuxt/nuxt/issues/13350 */
  },
  routeRules: {
    '/words/**': { prerender: true },
  },
  css: ['~/assets/css/main.css'],
  modules: ['@nuxtjs/i18n'],
  i18n: {
    locales: [
      { code: 'en', file: 'en.json', name: 'English' },
      { code: 'bur', file: 'bur.json', name: 'Буряад' },
      { code: 'ru', file: 'ru.json', name: 'Русский' },
      { code: 'ua', file: 'ua.json', name: 'Українська' },
      { code: 'se', file: 'se.json', name: 'Svenska' },
      { code: 'kr', file: 'kr.json', name: '한국어' },
    ],
    defaultLocale: 'ru',
    langDir: 'i18n',
    strategy: 'prefix', // default 'prefix_except_default' doesn't work. It's a known problem of the beta version of the plugin. Please check it if you see this message https://volta.net/nuxt-modules/i18n/issues/1905
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'locale',
      fallbackLocale: 'en',
      alwaysRedirect: true,
      redirectOn: 'root',
    },
    vueI18n: './i18n.config.ts',
  },
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  runtimeConfig: {
    public: {
      baseURL: process.env.API_BASE_URL,
    },
  },
});
