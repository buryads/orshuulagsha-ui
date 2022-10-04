export default {
  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: 'orshuulagsha-ui',
    htmlAttrs: {
      lang: 'en'
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' }
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
    '@nuxtjs/auth-next'
  ],

  axios: {
    baseURL: 'https://tt.buryads.com',
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
      target: 'https://tt.buryads.com',
      pathRewrite: {
        '^/api/': ''
      }
    }
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
    transpile: [
      '@amcharts/amcharts5', '@amcharts/amcharts5/wc', '@amcharts/amcharts5/themes/Animated',
      'd3-shape', 'd3-path'
    ]
  },
  server: {
    host: '0.0.0.0' // default: localhost
  },
  router: {
    extendRoutes(routes, resolve) {
      routes.push({
        name: 'Quiz',
        path: '/quiz',
        component: resolve(__dirname, 'pages/quiz.vue')
      });
      routes.push({
        name: 'Names',
        path: '/names',
        component: resolve(__dirname, 'pages/names.vue')
      });
      routes.push({
        name: 'TranslationsLogs',
        path: '/logs',
        component: resolve(__dirname, 'pages/translationsLogs.vue')
      });
      routes.push({
        name: 'TranslationsLogsUniqueNotFoundWords',
        path: '/logs/unique-not-found-words',
        component: resolve(__dirname, 'pages/translationsLogs.vue')
      });
      routes.push({
        name: 'WordsMatcher',
        path: '/words-matcher/:sourceLanguageCode/:destinationLanguageCode/:wordId?',
        component: resolve(__dirname, 'pages/wordsMatcher.vue')
      });
      routes.push({
        name: 'Login',
        path: '/login',
        component: resolve(__dirname, 'pages/login.vue')
      });
      routes.push({
        name: 'CreateNewWord',
        path: '/words/:sourceLanguageCode/:destinationLanguageCode/:wordId?',
        component: resolve(__dirname, 'pages/createNewWord.vue')
      });
    }
  }
}
