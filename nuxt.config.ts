// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
  // @ts-ignore if you install typescript as a dev dependency, this will help
  app: {
    head: {
      link: [
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&display=swap',
        },
      ],
    },
  },
  css: ['~/assets/css/main.css'],
  modules: ['@nuxtjs/i18n'],
  i18n: {
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
