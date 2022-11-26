<template>
  <div class="container mx-auto md:px-10 px-3">
    <h1 class="text-xl sm:text-2xl lg:text-4xl py-10 text-gray-900">
      {{ title }}
    </h1>
    <div class="block md:flex">
      <div class="flex-auto">
        <div class="container mx-auto md:px-5 md:py-5">
          <h2 class="text-gray-800 pb-2 h-7">
      <span v-if="currentLocale === 'bur'">
        {{ locale('buryad') }} <span class="cursor-pointer text-blue-300 hover:text-blue-600 hover:bg-gray-200 rounded-full inline-block text-center" style="width: 20px; height: 20px;" @click="toggleVocabularies">⇄</span> {{ locale('russian') }} {{ locale('vocabulary') }}
      </span>
      <span v-else>
        {{ locale('russian') }} <span class="cursor-pointer text-blue-300 hover:text-blue-600 hover:bg-gray-200 rounded-full inline-block text-center" style="width: 20px; height: 20px;" @click="toggleVocabularies">⇄</span> {{ locale('buryad') }} {{ locale('vocabulary') }}
      </span>
            &nbsp;
            <svg v-if="loading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-blue inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </h2>
          <div class="block md:flex">
            <div class="flex-auto">
              <div class="w-full">
                <div class="flex mb-2 border-fuchsia-600 border-2 rounded">
                  <input
                    :placeholder="locale('inputText')" name="" id="second" rows="10"
                    class="p-2 w-full"
                    v-model="text"
                    @keypress="translate($event.target)"
                    ref="text"
                  >
                  <button v-if="currentLocale === 'bur'" @click.prevent="text = text + 'ө'" class="inline bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white px-2">
                    ө
                  </button>
                  <button v-if="currentLocale === 'bur'" @click.prevent="text = text + 'h'" class="inline bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white px-2">
                    h
                  </button>
                  <button v-if="currentLocale === 'bur'" @click.prevent="text = text + 'ү'" class="inline bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white px-2">
                    ү
                  </button>
                </div>
              </div>
              <div class="w-full">
                <button @click="translate($refs.text, true)" class="w-full bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded">
                  <span class="">{{ locale('buttonTranslate') }}</span>
                </button>
              </div>
            </div>
          </div>
          <div class="block md:flex">
            <div class="flex-auto">
              <a href="#" @click.prevent="toggleVocabularies" class="ml-2 text-blue-300 hover:text-blue-600">{{ locale('toggleLanguage') }}</a>
              |
              <a href="#" @click.prevent="toggleShowFullKeyboard" class="ml-2 text-blue-300 hover:text-blue-600">{{ locale('showFullKeyboard') }}</a>
            </div>
          </div>
          <div class="block md:flex" v-if="foundWordsInOppositeLanuage">
            <div class="flex-auto">
              <a href="#" @click.prevent="toggleVocabularies(true)" class="ml-2 text-red-400 hover:text-red-800">{{ locale('foundWordsInOppositeLanuage') }} {{ foundWordsInOppositeLanuage }}</a>
            </div>
          </div>
          <div class="block md:flex">
            <div class="flex-auto">
              <div class="keyboard-app" v-show="showFullKeyboard"></div>
            </div>
          </div>
          <div class="block mt-10 text-gray-500">
            <div v-if="translates.result.length" class="mb-5 text-gray-800">
              <h2 class="text-2xl">{{ locale('translates') }}</h2>
              <hr>
              <p v-for="result in translates.result">
                <span>
                  <b>{{ result.name }}</b>&nbsp;<sup v-if="$auth.loggedIn" class="text-blue-600 hover:underline"><nuxt-link :to="getLinkToEditForm(result)">{{ locale('change') }}</nuxt-link></sup><br>
                  <span v-for="translation in result.translations">{{ translation.name }}<br></span>
                </span>
                <span v-if="result.description">
                  <b>Wiki <a class="text-blue-500" :href="result.description.url" target="_blank">⇪</a>:</b><br>
                  {{ result.description.short_description }} <a class="text-blue-500" :href="result.description.url" target="_blank">⇪</a>
                </span>
              </p>
            </div>
            <div v-if="translates.include.length" class="mb-5 text-gray-800">
              <h2 class="text-2xl">{{ locale('includes') }}</h2>
              <hr>
              <p v-for="result in translates.include">
                <span>
                  <b>{{ result.name }}</b>&nbsp;<sup v-if="$auth.loggedIn" class="text-blue-600 hover:underline"><nuxt-link :to="getLinkToEditForm(result)">{{ locale('change') }}</nuxt-link></sup><br>
                  <span v-for="translation in result.translations">{{ translation.name }}<br></span>
                </span>
              </p>
            </div>
            <div v-if="translates.match.length" class="mb-5 text-gray-800">
              <h2 class="text-2xl">{{ locale('matches') }}</h2>
              <hr>
              <p v-for="result in translates.match">
                <span>
                  <b>{{ result.name }}</b>&nbsp;<sup v-if="$auth.loggedIn" class="text-blue-600 hover:underline"><nuxt-link :to="getLinkToEditForm(result)">{{ locale('change') }}</nuxt-link></sup><br>
                  <span v-for="translation in result.translations">{{ translation.name }}<br></span>
                </span>
              </p>
            </div>
            <div v-if="translates.fuzzy.length" class="mb-5 text-gray-800">
              <h2 class="text-2xl">{{ locale('possibleTranslates') }}</h2>
              <hr>
              <p v-for="result in translates.fuzzy">
          <span>
            <b>{{ result.name }}</b>&nbsp;<sup v-if="$auth.loggedIn" class="text-blue-600 hover:underline"><nuxt-link :to="getLinkToEditForm(result)">{{ locale('change') }}</nuxt-link></sup><br>
            <span v-for="translation in result.translations">{{ translation.name }}<br></span>
          </span>
              </p>
            </div>
          </div>

          <div class="block mt-5 text-gray-700">
            <aside id="revue-embed" class="p-4 my-8 bg-white border border-gray-200 rounded-lg shadow-md sm:p-6 lg:p-8 dark:bg-gray-800 dark:border-gray-700" aria-label="Subscribe to the Flowbite newsletter">
              <h3 class="mb-3 text-xl font-medium text-gray-900 dark:text-white">Не удалось перевести то что нужно?</h3>
              <p class="mb-2 text-sm font-medium text-gray-500 dark:text-gray-300">В случае если вы хотели бы перевести что то но в нашей базе не оказалось того что вам нужно вы можете обратиться за помощью к нам в дискорд сервер.</p>
              <form action="https://www.getrevue.co/profile/flowbite/add_subscriber" method="post" id="revue-form" name="revue-form">
                <div class="flex items-end">
                  <p>
                    <a href="https://discord.gg/8KG84E6y8T" target="_blank" class="text-gray-600 bg-white-100 hover:bg-gray-100 hover:text-blue-600 border border-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:border-gray-600 font-medium rounded-lg text-base px-6 py-2.5 text-center inline-flex justify-center items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="32px" height="32px" viewBox="0 -28.5 256 256" version="1.1" preserveAspectRatio="xMidYMid">
                        <g>
                          <path d="M216.856339,16.5966031 C200.285002,8.84328665 182.566144,3.2084988 164.041564,0 C161.766523,4.11318106 159.108624,9.64549908 157.276099,14.0464379 C137.583995,11.0849896 118.072967,11.0849896 98.7430163,14.0464379 C96.9108417,9.64549908 94.1925838,4.11318106 91.8971895,0 C73.3526068,3.2084988 55.6133949,8.86399117 39.0420583,16.6376612 C5.61752293,67.146514 -3.4433191,116.400813 1.08711069,164.955721 C23.2560196,181.510915 44.7403634,191.567697 65.8621325,198.148576 C71.0772151,190.971126 75.7283628,183.341335 79.7352139,175.300261 C72.104019,172.400575 64.7949724,168.822202 57.8887866,164.667963 C59.7209612,163.310589 61.5131304,161.891452 63.2445898,160.431257 C105.36741,180.133187 151.134928,180.133187 192.754523,160.431257 C194.506336,161.891452 196.298154,163.310589 198.110326,164.667963 C191.183787,168.842556 183.854737,172.420929 176.223542,175.320965 C180.230393,183.341335 184.861538,190.991831 190.096624,198.16893 C211.238746,191.588051 232.743023,181.531619 254.911949,164.955721 C260.227747,108.668201 245.831087,59.8662432 216.856339,16.5966031 Z M85.4738752,135.09489 C72.8290281,135.09489 62.4592217,123.290155 62.4592217,108.914901 C62.4592217,94.5396472 72.607595,82.7145587 85.4738752,82.7145587 C98.3405064,82.7145587 108.709962,94.5189427 108.488529,108.914901 C108.508531,123.290155 98.3405064,135.09489 85.4738752,135.09489 Z M170.525237,135.09489 C157.88039,135.09489 147.510584,123.290155 147.510584,108.914901 C147.510584,94.5396472 157.658606,82.7145587 170.525237,82.7145587 C183.391518,82.7145587 193.761324,94.5189427 193.539891,108.914901 C193.539891,123.290155 183.391518,135.09489 170.525237,135.09489 Z" fill="#5865F2" fill-rule="nonzero"/>
                        </g>
                        <script xmlns=""/></svg>
                      <span class="ml-2 p-3">Открыть Discord сервер: Buryads</span>
                    </a>
                  </p>
                </div>
              </form>
            </aside>
          </div>

          <div class="block mt-5 text-gray-700">
            <p>
              {{ locale('dailyTranslationsCount') }}: {{ dailyTranslationsCount }}
            </p>
          </div>
          <div class="block mt-5 text-gray-700" v-if="messageFromServer.show">
            <h2 class="text-xl sm:text-xl lg:text-6xl py-1">{{ messageFromServer.body.title }}</h2>
            <p>
              {{ messageFromServer.body.message }}
            </p>
          </div>
          <div class="block mt-5 text-gray-500">
            <p>
              * {{ locale('disclaimer') }}
            </p>
          </div>
          <div class="block mt-5 text-gray-500">
            <p>
              * {{ locale('otherServices') }}: <a href="https://buryat-lang.ru/" class="text-blue-500" target="_blank">Burlang.Toli</a>, <a href="https://uulen.gazeta-n1.ru/" class="text-blue-500" target="_blank">Үүлэн</a>
            </p>
          </div>
          <div class="block mt-5  pb-2 text-gray-500">
            <p>
              У нас также есть мобильные приложения и расширение для браузера Google Chrome:
            </p>
          </div>
          <div class="block mt-5  pb-2 text-gray-500">
            <p>Раскладки для клавиатуры: <a href="https://github.com/buryads/buryad-keyboard-layout" class="text-blue-500 hover:text-blue-600 cursor-pointer" target="_blank">GitHub</a></p>
          </div>
          <div class="justify-center flex">
            <div class="block mt-5 md:flex justify-center pb-10 text-gray-500">
              <a href="https://play.google.com/store/apps/details?id=com.buryads.orshuulga_mobile" target="_blank" class="mr-5">
                <img src="/playstore.png" width="150px" alt="Play Store"/>
              </a>
              <a href="https://apps.apple.com/ru/app/%D0%B1%D1%83%D1%80%D1%8F%D1%82%D1%81%D0%BA%D0%BE-%D1%80%D1%83%D1%81%D1%81%D0%BA%D0%B8%D0%B9-%D1%81%D0%BB%D0%BE%D0%B2%D0%B0%D1%80%D1%8C/id1584232985" target="_blank" class="mr-5">
                <img src="/appstore.png" width="150px" alt="App Store"/>
              </a>
              <a href="https://chrome.google.com/webstore/detail/%D0%B1%D1%83%D1%80%D1%8F%D1%82%D1%81%D0%BA%D0%BE-%D1%80%D1%83%D1%81%D1%81%D0%BA%D0%B8%D0%B9-%D1%81%D0%BB%D0%BE%D0%B2%D0%B0%D1%80%D1%8C/gmljjdkoihndbbddpmechgpmacpglcei?hl=ru" target="_blank">
                <img src="/chromewebstore.png" width="150px" alt="App Store"/>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
// @ts-nocheck
import Vue from 'vue';
import Keyboard from "../keyboard/BuryadKeyboard";
import locales from "~/i18n/locales";
import UrlHelper from '~/utils/url.js';

let input;

export default Vue.extend({
  data () {
    return {
      text: '',
      sourceLanguage: 'ru',
      destinationLanguage: 'bur',
      foundWordsInOppositeLanuage: 0,
      languages: [
        'ru',
        'bur'
      ],
      loading: false,
      translateTimeout: null,
      messageFromServer: {
        body: {
          title: '',
          message: ''
        },
        show: false
      },
      translates: this.defaultTranslates(),
      currentLocale: 'ru',
      showFullKeyboard: false,
      locales: {
        bur: locales.bur.index,
        ru: locales.ru.index,
        en: locales.en.index,
      },
      dailyTranslationsCount: 0
    }
  },
  computed: {
    title () {
      return this.locales[this.currentLocale].title;
    }
  },
  head(): any {
    return {
      title: this.title,
      meta: [
        {
          hid: 'description',
          name: 'description',
          content: this.title
        }
      ]
    }
  },
  watch: {
    text(newVal) {
      document.querySelector('.keyboard-app').value = newVal;
    }
  },
  mounted() {
    input = document.createElement('input');
    input.style.display = 'none';
    document.body.appendChild(input);

    const keyboard = new Keyboard('keyboard-app', {
      onKeyPress: (button) => {
        if (button === "{shift}" || button === "{lock}") handleShift();
        if (!button.includes('{')) {
          this.text += button;
        }
        if (button.includes('{space}')) {
          this.text += ' ';
        }
      }
    });
    const handleShift = () => {
      let currentLayout = keyboard.options.layoutName;
      let shiftToggle = currentLayout === "default" ? "shift" : "default";

      keyboard.setOptions({
        layoutName: shiftToggle
      });
    };

    this.initDailyTranslationsCount();
    this.initTextAndLanguageConfigurations();
  },
  methods: {
    async initDailyTranslationsCount () {
      this.dailyTranslationsCount = (await this.$axios.$get('/api/api/statistic/daily-translations-count'))?.count || 0;
    },
    initTextAndLanguageConfigurations () {
      const {s: sourceLanguage, d: destinationLanguage, t: translateWord} = this.$route.query;
      if (sourceLanguage && destinationLanguage && sourceLanguage !== destinationLanguage) {
        this.setCurrentLocale(sourceLanguage);
        this.sourceLanguage = sourceLanguage;
        this.destinationLanguage = destinationLanguage;
      }
      if (translateWord) {
        this.text = translateWord;
        this.translate({value: translateWord}, true);
      }
    },
    defaultTranslates (): object {
      return {
        result: [],
        include: [],
        match: [],
        fuzzy: []
      };
    },
    locale(key: string): string|null {
      return this.locales[this.currentLocale][key]
    },
    getLinkToEditForm(word) {
      return `/words/${this.sourceLanguage}/${this.destinationLanguage}/${word.id}`
    },
    toggleShowFullKeyboard() {
      this.showFullKeyboard = !this.showFullKeyboard;
    },
    toggleVocabularies(imidiately: boolean = false) {
      let newLocale = this.currentLocale;
      if (this.currentLocale === 'ru') {
        newLocale = 'bur';
        this.setLanguages();
      } else {
        newLocale = 'ru';
        this.setLanguages('ru', 'bur');
      }
      this.setCurrentLocale(newLocale);
      this.foundWordsInOppositeLanuage = 0;
      this.translate({
        value: this.text
      }, imidiately);
      this.translates = this.defaultTranslates();
    },
    setLanguages(source = 'bur', destination = 'ru') {
      this.sourceLanguage = source;
      this.destinationLanguage = destination;
      UrlHelper.setQueryParameters({
        s: source,
        d: destination
      });
    },
    setCurrentLocale(newLocale) {
      this.currentLocale = newLocale;
    },
    async translate(e: any, imidiately: boolean = false): any {
      clearTimeout(this.translateTimeout);
      if (!e.value || e.value.trim() === '') {
        this.translates = this.defaultTranslates();
        return;
      }
      this.translateTimeout = setTimeout(async () => {
        this.loading = true;
        const value = e.value.trim();
        UrlHelper.setQueryParameter('t', value);
        try {
          this.translates = await this.translateText(this.sourceLanguage, this.destinationLanguage, value);
          if (this.translates.message) {
            this.messageFromServer.body = data.message;
            this.messageFromServer.show = true;
          } else {
            this.messageFromServer.body = {
              title: '',
              message: ''
            };
            this.messageFromServer.show = false;
          }
          const translationResultCount = this.countResultCount(this.translates);
          if (translationResultCount === 0) {
            const oppositeTranslates = await this.translateText(this.destinationLanguage, this.sourceLanguage, value);
            this.foundWordsInOppositeLanuage = this.countResultCount(oppositeTranslates);
          }
        } catch (e) {
          console.error(e);
        } finally {
          this.loading = false;
        }
      }, imidiately ? 1 : 5000);
    },
    countResultCount (translates) {
      return translates.result.filter(word => word.id !== 0 && word?.translations[0]?.id !== 0).length;
    },
    async translateText(sourceLanguge, destinationLanguage, text) {
      const {data: {data}}: any = await this.$axios.get(`/api/api/translate/${sourceLanguge}2${destinationLanguage}?` + this.jsonObjectToQueryString({
        word: text
      }));
      return data;
    },
    jsonObjectToQueryString (obj: object, prefix: string|null = null): string {
      const euc = encodeURIComponent;
      const serialize = this.jsonObjectToQueryString;
      const isNotNullObject = (v: object) => v !== null && typeof v === "object";
      const queryStringItems = [];

      for (let p in obj) {
        if (!obj.hasOwnProperty(p)) {
          continue
        }

        const key: string = p;
        const k = prefix ? prefix + "[" + p + "]" : p;
        const v = obj[key];
        queryStringItems.push(isNotNullObject(v) ? serialize(v, k) : euc(k) + "=" + euc(v));
      }
      return queryStringItems.join("&");
    }
  }
})
</script>

<style>
</style>
