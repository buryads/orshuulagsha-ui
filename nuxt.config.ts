// https://nuxt.com/docs/api/configuration/nuxt-config
import process from 'node:process';

const sw = process.env.SW === 'true';

export default defineNuxtConfig({
  // @ts-ignore if you install typescript as a dev dependency, this will help
  app: {
    head: {
      link: [
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700;900&display=swap',
        },
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      ],
    },
    /* page transition doesn't work https://github.com/nuxt/nuxt/issues/13350 */
  },
  routeRules: {
    '/words/**': { prerender: true },
  },
  css: [
    '~/assets/css/main.css',
    '~/node_modules/vue-toast-notification/dist/theme-default.css',
  ],
  modules: [
    '@nuxtjs/i18n',
    '@pinia/nuxt',
    'nuxt-gtag',
    '@artmizu/yandex-metrika-nuxt',
    '@vite-pwa/nuxt',
  ],
  pwa: {
    strategies: sw ? 'injectManifest' : 'generateSW',
    srcDir: sw ? 'service-worker' : undefined,
    filename: sw ? 'sw.ts' : undefined,
    registerType: 'autoUpdate',
    manifest: {
      name: 'Buryad Orod Toli',
      short_name: 'Buryad Toli',
      theme_color: '#ffffff',
      icons: [
        {
          src: '/icons/48.png',
          sizes: '48x48',
          type: 'image/png',
        },
        {
          src: '/icons/72.png',
          sizes: '72x72',
          type: 'image/png',
        },
        {
          src: '/icons/96.png',
          sizes: '96x96',
          type: 'image/png',
        },
        {
          src: '/icons/192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: '/icons/256.png',
          sizes: '256x256',
          type: 'image/png',
        },
        {
          src: '/icons/512.png',
          sizes: '512x512',
          type: 'image/png',
        },
      ],
    },
    workbox: {
      globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
    },
    injectManifest: {
      globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
    },
    devOptions: {
      enabled: true,
      suppressWarnings: true,
      navigateFallback: '/',
      navigateFallbackAllowlist: [/^\/$/],
      type: 'module',
    },
  },
  gtag: {
    id: 'G-WNB3T9B0XR',
  },
  yandexMetrika: {
    id: '95297205',
  },
  i18n: {
    locales: [
      { code: 'en', file: 'en.json', name: 'English' },
      { code: 'bur', file: 'bur.json', name: 'Буряад' },
      { code: 'ru', file: 'ru.json', name: 'Русский' },
      /*      { code: 'ua', file: 'ua.json', name: 'Українська' },
      { code: 'se', file: 'se.json', name: 'Svenska' },
      { code: 'kr', file: 'kr.json', name: '한국어' },*/
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
