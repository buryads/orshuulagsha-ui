require('dotenv').config();
const burWordSlugs = require('./data/slugs/bur.js').default;
const ruWordSlugs = require('./data/slugs/ru.js').default;
const locales = require('./data/locales/index.js').default;
export default {
  head: {
    title: process.env.APP_TITLE,
    htmlAttrs: {
      lang: 'en'
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: process.env.APP_DESCRIPTION }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.png' }
    ]
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
  ],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
    {
      src: '~/plugins/amcharts.js',
      ssr: false
    },
    {
      src: "~/plugins/echarts.js",
      ssr: false
    },
    {
      src: "~/plugins/authUtils.js",
      ssr: false
    }
  ],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/typescript
    '@nuxt/typescript-build',
    // https://go.nuxtjs.dev/tailwindcss
    '@nuxtjs/tailwindcss',
    '@nuxt-hero-icons/outline/nuxt',
    '@nuxt-hero-icons/solid/nuxt',
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    '@nuxtjs/axios',
    '@nuxtjs/auth-next',
    '@nuxtjs/i18n',
    '@nuxtjs/sitemap',
    ['@nuxtjs/dotenv', { filename: '.env' }]
  ],
  sitemap: {
    gzip: true,
    exclude: [
      '**/singleWordPage',
      '**/translationsLogs',
      '**/wordsPage',
      '**/login',
      '**/wordsMatcher',
      '*/wordsMatcher',
      '**/logs',
      '**/createNewWord',
      '**/logs/unique-not-found-words',
    ],
    routes: [
      'words',
      'bur/words',
      'en/words',
      'ua/words',
      'words/bur',
      'bur/words/bur',
      'en/words/bur',
      'ua/words/bur',
      'words/ru',
      'bur/words/ru',
      'en/words/ru',
      'ua/words/ru',
      ...burWordSlugs.map(s => `words/bur/${s}`),
      ...burWordSlugs.map(s => `bur/words/bur/${s}`),
      ...burWordSlugs.map(s => `en/words/bur/${s}`),
      ...burWordSlugs.map(s => `ua/words/bur/${s}`),
      ...ruWordSlugs.map(s => `words/ru/${s}`),
      ...ruWordSlugs.map(s => `bur/words/ru/${s}`),
      ...ruWordSlugs.map(s => `en/words/ru/${s}`),
      ...ruWordSlugs.map(s => `ua/words/ru/${s}`),
    ]
  },
  i18n: {
    encodePaths: false,
    locales: Object.keys(locales),
    defaultLocale: process.env.DEFAULT_LOCALE,
    vueI18n: {
      fallbackLocale: process.env.DEFAULT_LOCALE,
      messages: locales
    }
  },
  axios: {
    baseURL: process.env.API_BASE_URL,
    proxy: true,
    credentials: true
  },

  auth: {
    strategies: {
      laravelSanctum: {
        provider: 'laravel/sanctum',
        url: '/api',
        user: {
          property: false,
          autoFetch: true
        }
      }
    }
  },

  proxy: {
    '/api': {
      target: process.env.API_BASE_URL,
      pathRewrite: {
        '^/api/sanctum/': '/sanctum/',
        '^/api/api/': '/api/',
        '^/api/': '/api/'
      },
      secure: false
    }
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
    transpile: [
      '@amcharts/amcharts5',
      '@amcharts/amcharts5/wc',
      '@amcharts/amcharts5/themes/Animated',
      'd3-shape',
      'd3-path'
    ],
    extend: function (config, {isDev, isClient}) {
      config.node = {

        fs: "empty"
      };
    }
  },
  server: {
    host: process.env.APP_HOST
  },
  router: {
    extendRoutes(routes, resolve) {
      routes.push({
        name: 'Quiz',
        path: '/quiz',
        component: resolve(__dirname, 'pages/quiz.vue')
      });
      routes.push({
        name: 'Words',
        path: '/words/:sourceLanguageCode?',
        component: resolve(__dirname, 'pages/wordsPage.vue')
      });
      routes.push({
        name: 'Words',
        path: '/words/:sourceLanguageCode/:wordSlug',
        component: resolve(__dirname, 'pages/singleWordPage.vue')
      });
      routes.push({
        name: 'Names',
        path: '/names',
        component: resolve(__dirname, 'pages/names.vue')
      });
      routes.push({
        name: 'Games',
        path: '/games',
        component: resolve(__dirname, 'pages/games.vue')
      });
      routes.push({
        name: 'Login',
        path: '/login',
        component: resolve(__dirname, 'pages/login.vue')
      });
      routes.push({
        name: 'Signup',
        path: '/signup',
        component: resolve(__dirname, 'pages/signup.vue')
      });
      routes.push({
        name: 'Dashboard',
        path: '/dashboard',
        component: resolve(__dirname, 'pages/dashboard.vue')
      });


      routes.push({
        name: 'TranslationsLogs',
        path: '/admin/logs',
        component: resolve(__dirname, 'pages/translationsLogs.vue')
      });
      routes.push({
        name: 'TranslationsLogsUniqueNotFoundWords',
        path: '/admin/logs/unique-not-found-words',
        component: resolve(__dirname, 'pages/translationsLogs.vue')
      });
      routes.push({
        name: 'WordsMatcher',
        path: '/admin/words-matcher/:sourceLanguageCode/:destinationLanguageCode/:wordId?',
        component: resolve(__dirname, 'pages/wordsMatcher.vue')
      });
      routes.push({
        name: 'CreateNewWord',
        path: '/admin/words/:sourceLanguageCode/:destinationLanguageCode/:wordId?',
        component: resolve(__dirname, 'pages/createNewWord.vue')
      });
      routes.push({
        name: 'Packs',
        path: '/packs',
        component: resolve(__dirname, 'pages/cardsPacks.vue')
      });
      routes.push({
        name: 'PackFormPage',
        path: '/pack/create',
        component: resolve(__dirname, 'pages/packFormPage.vue')
      });
      routes.push({
        name: 'Cards',
        path: '/packs/:packName/cards',
        component: resolve(__dirname, 'pages/cards.vue')
      });
      routes.push({
        name: 'PackQuiz',
        path: '/packs/:packName/train',
        component: resolve(__dirname, 'pages/packQuiz.vue')
      });
      routes.push({
        name: 'PackFormPage',
        path: '/packs/:id/edit',
        component: resolve(__dirname, 'pages/packFormPage.vue')
      });
    }
  }
}
