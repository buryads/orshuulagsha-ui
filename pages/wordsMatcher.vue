<template>
  <div class="container mx-auto px-10">
    <div class="block md:flex">
      <div class="flex-auto">
        <div class="max-w-3xl mx-auto pt-10 xl:max-w-none xl:ml-0 xl:mr-[15.5rem] xl:pr-16">
          <header id="header" class="relative z-20">
            <div>
              <div class="flex items-center">
                <h1 class="inline-block text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight dark:text-slate-200">{{ title }}</h1>
              </div>
            </div>
          </header>
          <div class="mt-10 relative">
            <h2 class="inline-block text-1xl sm:text-2xl font-extrabold text-slate-900 tracking-tight dark:text-slate-200">
              Языки:
            </h2>
            <div class="py-3">
<!--              <p>-->
<!--                <word-match-link name="с бурятского на английский" :active="$route.fullPath === '/words-matcher/bur/en'" link="/words-matcher/bur/en"/>-->
<!--              </p>-->
              <p>
                <word-match-link name="с бурятского на русский" :active="$route.fullPath.includes('/words-matcher/bur/ru')" link="/words-matcher/bur/ru"/>
              </p>
<!--              <p>-->
<!--                <word-match-link name="с английского на бурятский" :active="$route.fullPath.includes('/words-matcher/en/bur')" link="/words-matcher/en/bur"/>-->
<!--              </p>-->
<!--              <p>-->
<!--                <word-match-link name="с английского на русский" :active="$route.fullPath.includes('/words-matcher/en/ru')" link="/words-matcher/en/ru"/>-->
<!--              </p>-->
              <p>
                <word-match-link name="с русского на бурятский" :active="$route.fullPath.includes('/words-matcher/ru/bur')" link="/words-matcher/ru/bur"/>
              </p>
<!--              <p>-->
<!--                <word-match-link name="с русского на английский" :active="$route.fullPath.includes('/words-matcher/ru/en')" link="/words-matcher/ru/en"/>-->
<!--              </p>-->
            </div>
            <div class="py-3">
              <p>
                <b>{{ word.name }}</b>
              </p>
              <p class="mt-2 text-lg text-slate-700 dark:text-slate-400" v-for="translation in word.translations">
                {{ translation.name }}
              </p>
              <div class="mt-2 text-lg text-slate-700 dark:text-slate-400">
                <div v-for="(w, i) in word[destinationLanguageWordsKey]" class="inline-block">
                  <span :class="`mr-5`">{{ w.name }}<span class="absolute -mt-3 px-2 cursor-pointer text-red-600" @click="removeWord(i)">x</span>&nbsp;</span>
                </div>
              </div>
            </div>
            <div class="py-3 w-full">
              <input
                placeholder="Введите слово для поиска"
                class="p-2 mb-2 w-full border-2 border-fuchsia-600 rounded w-full"
                v-model="searchText"
                ref="text"
              >
              <div v-if="!suggestedWords.length && searchText !== ''">
                <button @click.prevent="addNewWord" type="button" class="py-1 w-full focus:outline-none text-white bg-green-600 hover:bg-green-700 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800">
                  Добавить слово/фразу в базу данных
                </button>
              </div>
              <div :key="updateSuggestedWords">
                <p v-for="(suggestedWord, i) in suggestedWords" href="#" class="mt-2 text-lg text-slate-700 dark:text-slate-400">
                  <a href="#" :class="`${isAlreadyInWords(suggestedWord) ? 'opacity-25' : ''}`">{{ suggestedWord.name }}</a><span v-if="!isAlreadyInWords(suggestedWord)" class="ml-2 text-green-500 cursor-pointer" @click="addSuggestedWord(suggestedWord)">+</span>
                </p>
              </div>
            </div>
            <div class="py-3">
              <button @click.prevent="save" type="button" class="py-2 focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800">
                Сохранить
              </button>
              <button @click.prevent="saveAndSkip" type="button" class="py-2 text-white bg-green-800 hover:bg-green-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700">
                Сохранить и продолжить
              </button>
              <button @click.prevent="skip" type="button" class="py-2 text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700">
                Пропустить/Продолжить
              </button>
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
import WordMatchLink from '../components/WordMatchLink.vue';

let input;

export default Vue.extend({
  created() {
    if (!this.$auth.loggedIn) {
      this.$router.push('/login');
    }
  },
  data () {
    return {
      title: 'Сопоставитель слов',
      searchText: '',
      word: {
        name: 'Слово',
        description: 'Слово описание',
        words: [
          {
            id: 1,
            'name': 'Слово 1',
            'description': 'Слово 1',
          },
          {
            id: 2,
            'name': 'Слово 2',
            'description': 'Слово 2',
          },
          {
            id: 3,
            'name': 'Слово 3',
            'description': 'Слово 3',
          }
        ]
      },
      suggestedWords: [],
      updateSuggestedWords: 0,
      loadSuggestedWordsTimeout: null
    }
  },
  components: {
    WordMatchLink
  },
  watch: {
    searchText (newVal) {
      if (this.loadSuggestedWordsTimeout) {
        clearTimeout(this.loadSuggestedWordsTimeout);
      }
      this.loadSuggestedWordsTimeout = setTimeout(() => {
        this.loadSimilarWords(newVal);
      }, 1000);
    }
  },
  mounted() {
    this.$axios.$get(`/api/api/words-matcher/${this.sourceLanguageCodeCode}/${this.destinationLanguageCode}/${this.wordId ? this.wordId : 'random'}`).then(data => {
      this.word = data;
    })
  },
  computed: {
    sourceLanguageCodeCode() {
      return this.$route.params.sourceLanguageCode;
    },
    destinationLanguageCode() {
      return this.$route.params.destinationLanguageCode;
    },
    destinationLanguageWordsKey() {
      return `${this.destinationLanguageCode}_words`;
    },
    wordId() {
      return this.$route.params.wordId;
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
  methods: {
    async loadSimilarWords(word: string) {
      const words = await this.$axios.$get(`/api/api/words-matcher/${this.sourceLanguageCodeCode}/${this.destinationLanguageCode}?word=${word}`);
      this.suggestedWords = words;
    },
    removeWord(index: number) {
      this.word[this.destinationLanguageWordsKey] = this.removeItemFromArray(this.word[this.destinationLanguageWordsKey], index);
    },
    removeItemFromArray(array: any, index: number) {
      return [].concat(array.slice(0, index), array.slice(index+1, array?.length));
    },
    addSuggestedWord(suggestedWord: object) {
      if (this.isAlreadyInWords(suggestedWord)) {
        return;
      }

      this.word[this.destinationLanguageWordsKey].push(suggestedWord);
      this.updateSuggestedWords++;
    },
    isAlreadyInWords(word: object) {
      if (!this.word[this.destinationLanguageWordsKey]) {
        return false;
      }
      for (let i = 0; i < this.word[this.destinationLanguageWordsKey].length; i++) {
        if (this.word[this.destinationLanguageWordsKey][i].id === word.id) {
          return true;
        }
      }
      return false;
    },
    async addNewWord() {
      const word = this.searchText.trim();
      await this.$axios.$post(`/api/api/words-matcher/${this.sourceLanguageCodeCode}/${this.destinationLanguageCode}`, {
        name: word
      });
      this.loadSimilarWords(word);
    },
    async save() {
      this.word = await this.$axios.$put(`/api/api/words-matcher/${this.sourceLanguageCodeCode}/${this.destinationLanguageCode}/${this.word.id}/sync`, this.word);
      document.location.href = document.location.href.replace(this.wordId, '').replace(/\/$/, '') + `/${this.word.id}`;
    },
    async saveAndSkip() {
      await this.save();
      this.skip();
    },
    skip() {
      if (this.wordId) {
        document.location.href = document.location.href.replace(this.wordId, '');
      } else {
        document.location.reload();
      }
    }
  }
})
</script>

<style>
</style>
