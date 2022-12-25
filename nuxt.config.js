require('dotenv').config();

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
    ['@nuxtjs/dotenv', { filename: '.env' }]
  ],
  i18n: {
    encodePaths: false,
    locales: ['ru', 'en', 'ua', 'bur'],
    defaultLocale: process.env.DEFAULT_LOCALE,
    vueI18n: {
      fallbackLocale: process.env.DEFAULT_LOCALE,
      messages: {
        ru: {
          appName: 'Бурятcко-Русский словарь',
          words: 'Слова',
          wordsPageDescription: 'База слов',
          next: 'Следующий',
          previous: 'Предыдущий',
          russian: 'Русско',
          ru: 'Русский',
          ua:'Украинский',
          bur: 'Бурятский',
          en: 'Английский',
          russianDictionary: 'Русский словарь',
          buryad: 'Бурятско',
          buryadNames: 'Бурятские имена',
          clear: 'Сбросить',
          buryadDictionary: 'Бурятский словарь',
          switchLanguage: 'Переключить языки',
          inputText: 'Введите слово',
          showFullKeyboard: 'Показать клавиатуру',
          todayTranslated: 'Сегодня было переведено',
          keyboardLayouts: 'Раскладки для клавиатуры',
          games: 'Игры',
          names: 'Имена',
          quiz: 'Викторина',
          localizedForBuryadLanguageGames: 'Языковые игры локализованные под бурятский язык',
          translate: 'Перевести',
          title: 'Бурятско-Русский словарь',
          foundWordsInOppositeLanuage: 'Переключить язык. Найдено на другом языке резултатов: ',
          change: 'править',
          vocabulary: 'словарь',
          buttonTranslate: 'Перевести',
          translates: 'Переводы',
          includes: 'Вхождения',
          matches: 'Совпадения',
          possibleTranslates: 'Возможные переводы',
          otherServices: 'Также можно использовать другие онлайн словари',
          disclaimer: 'Переводы могут быть неточным, 100% правильность не гарантируется',
          toggleLanguage: 'Переключить языки',
          dailyTranslationsCount: 'Сегодня было переведено',
          inputNameToSearch: 'Введите имя для поиска',
          notFount: 'Не найдено'
        },
        ua: {
          appName: 'Бурятсько-Російський словник',
          words: 'Слова',
          wordsPageDescription: 'База даних слів',
          next: 'Наступний',
          previous: 'Попередній',
          russian: 'російсько',
          ukrainian:'Українсько',
          ukrainianDictionary:'Український словник',
          russianDictionary: 'російський словник',
          inputText: 'Введіть слово',
          buryad: 'Бурятсько',
          bur: 'Бурятська',
          ru: 'російська',
          en: 'Англійська',
          ua:'Українська',
          buryadNames: 'Бурятські імена',
          clear: 'Очистити',
          buryadDictionary: 'Бурятський словник',
          switchLanguage: 'Змінити мову',
          showFullKeyboard: 'Показати повну клавіатуру',
          todayTranslated: 'Перекладено сьогодні',
          keyboardLayouts: 'Клавітурні розкладки',
          games: 'Ігри',
          names: 'Імена',
          quiz: 'Лотерея',
          localizedForBuryadLanguageGames: 'Мовні Ігри адаптовані під Бурятську мову.',
          translate: 'Перекласти',
          title: 'Бурятсько-Український словник',
          foundWordsInOppositeLanuage: 'Змінити мову.Результатів знайдено на іншій мові',
          change: 'змінити',
          vocabulary: 'словник',
          buttonTranslate: 'Перекласти',
          translates: 'Переклади',
          includes: 'Включено',
          matches: 'Збіг',
          possibleTranslates: 'Можливий переклад',
          otherServices: 'Інші сервіси',
          disclaimer: 'Переклад можливо не вірний на 100%, правильність не гарантується',
          toggleLanguage: 'Змінити мову',
          dailyTranslationsCount: 'Перекладено сьогодні',
          inputNameToSearch: 'Введіть ім`я для пошуку',
          notFount: 'Не знайдено'
        },
        en: {
          appName: 'Buryad-Russian dictionary',
          words: 'Words',
          wordsPageDescription: 'The words database',
          next: 'Next',
          previous: 'Previous',
          russian: 'Russian',
          ua:'Ukrainian',
          russianDictionary: 'Russian dictionary',
          inputText: 'Enter the word',
          buryad: 'Buryad',
          bur: 'Buryad',
          ru: 'Russian',
          en: 'English',
          buryadNames: 'Buryad names',
          clear: 'Clear',
          buryadDictionary: 'Buryad dictionary',
          switchLanguage: 'Switch languages',
          showFullKeyboard: 'Show full keyboard',
          todayTranslated: 'Today was translated',
          keyboardLayouts: 'Keyboard layouts',
          games: 'Games',
          names: 'Names',
          quiz: 'Quiz',
          localizedForBuryadLanguageGames: 'The games which has Buryad language database of words.',
          translate: 'Translate',
          title: 'Buryat-Russian vocabulary',
          foundWordsInOppositeLanuage: 'Switch language. Found words in opposite language: ',
          change: 'change',
          vocabulary: 'vocabulary',
          buttonTranslate: 'Tranlsate',
          translates: 'Translations',
          includes: 'Includes',
          matches: 'Matches',
          possibleTranslates: 'Possible translations',
          otherServices: 'Other services',
          disclaimer: 'Translations could be wrong, it\'s not like 100% right translations here',
          toggleLanguage: 'Toggle language',
          dailyTranslationsCount: 'Today was translated',
          inputNameToSearch: 'Enter name to search',
          notFount: 'Not found'
        },
        bur: {
          appName: 'Буряад-Ород толи',
          words: 'Үгэнүүд',
          wordsPageDescription: 'Үгэнүүдэй база',
          next: 'Удаадахи',
          previous: 'Урдахи',
          russian: 'Ород',
          ua:'Украинскэ',
          ru: 'Ород хэлэн',
          bur: 'Буряад хэлэн',
          en: 'Англи хэлэн',
          russianDictionary: 'Ород толи',
          buryad: 'Буряад',
          buryadNames: 'Буряад нэрэнүүд',
          clear: 'Сэбэрлэх',
          buryadDictionary: 'Буряад толи',
          switchLanguage: 'Хэлэнүүдые hэлгэхэ',
          showFullKeyboard: 'Клавиатурын харуулха',
          todayTranslated: 'Мзнөөдэр оршуулагдаhан',
          keyboardLayouts: 'Клавиатурын раскладканууд',
          games: 'Нааданууд',
          names: 'Нэрэнүүд',
          quiz: 'Викторинэ',
          localizedForBuryadLanguageGames: 'Буряад хэлэнэй үгэнүүдтэй нааданууд',
          translate: 'Оршуулха',
          title: 'Буряад-Ород толи',
          foundWordsInOppositeLanuage: 'Хэлэнуудые hэлгэхэ. Нүгөөдэ хэлэн дээрэ олдоhон үгэнүүд: ',
          change: 'залгаха',
          vocabulary: 'толи',
          inputText: 'Үгэ бэшэгты',
          buttonTranslate: 'Оршуулха',
          translates: 'Оршуулганууд',
          includes: 'Оршуулгын үгэ соо ороошо үгэнүүд',
          matches: 'Адлирху үгэнүүд',
          possibleTranslates: 'Энэ үгэ байжа болохо',
          otherServices: 'Тигээд баhа ондо онлайн толинууд',
          disclaimer: 'Оршуулга буруу байжа болохо, 100% зүб гэжэ хэлэхэр бэшэ',
          toggleLanguage: 'Хэлэнуудые hэлгэхэ',
          dailyTranslationsCount: 'Mүнөөүдэр оршуулагдаа',
          inputNameToSearch: 'Нэрэ бэшэгты олохын түлөө',
          notFount: 'Олдобогүй'
        }
      }
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
        '^/api/': ''
      }
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
    ]
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
