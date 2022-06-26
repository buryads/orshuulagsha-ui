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
              Languages:
            </h2>
            <div class="py-3">
              <p>
                <word-match-link
                  name="Create Buryad word with Russian translations"
                  :active="$route.fullPath.includes('/words/bur/ru')"
                  link="/words/bur/ru"
                />
              </p>
              <p>
                <word-match-link
                  name="Create Russian word with Buryad translations"
                  :active="$route.fullPath.includes('/words/ru/bur')"
                  link="/words/ru/bur"
                />
              </p>
            </div>
            <div class="py-3 w-full" :key="rerender">
              <p class="pb-1">Word:</p>
              <Input
                placeholder="New word"
                v-model="word.name"
                ref="newWord"
              />
              <p class="pb-1">Description:</p>
              <textarea
                v-for="translation in word.translations"
                placeholder="New word description"
                rows="6"
                class="p-2 mb-2 lg:w-9/12 w-full border-2 border-fuchsia-600 rounded"
                v-model="translation.name"
              />
              <div class="my-2 text-lg text-slate-700 dark:text-slate-400">
                <p class="pb-5">Translations:</p>
                <div v-for="(w, i) in word[destinationLanguageWordsKey]" class="inline-block">
                  <span :class="`mr-5`">{{ w.name }}<span class="absolute -mt-3 px-2 cursor-pointer text-red-600" @click="removeWord(i)">x</span>&nbsp;</span>
                </div>
              </div>
              <Input
                placeholder="Enter the translation word"
                v-model="searchText"
                ref="searchText"
              />
              <div>
                <button @click.prevent="addNewWord" :disabled="isDisabledCreateNewRelatedWord" type="button" :class="`py-1 ${isDisabledCreateNewRelatedWord ? 'bg-gray-600 cursor-wait' : 'bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700'} lg:w-9/12 w-full focus:outline-none text-white  focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2  dark:focus:ring-green-800`">
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
                Save
              </button>
              <button @click.prevent="saveAndSkip" type="button" class="py-2 text-white bg-green-800 hover:bg-green-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700">
                Save & continue
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
import Input from "~/components/Input.vue";

let input;

export default Vue.extend({
  created() {
    if (!this.$auth.loggedIn) {
      this.$router.push('/login');
    }
  },
  data () {
    return {
      rerender: 0,
      isDisabledCreateNewRelatedWord: false,
      newWord: '',
      searchText: '',
      word: this.defaultWord(),
      suggestedWords: [],
      updateSuggestedWords: 0,
      loadSuggestedWordsTimeout: null
    }
  },
  components: {
    Input,
    WordMatchLink
  },
  watch: {
    searchText (newVal) {
      if (this.loadSuggestedWordsTimeout) {
        clearTimeout(this.loadSuggestedWordsTimeout);
      }
      this.isDisabledCreateNewRelatedWord = true;
      this.loadSuggestedWordsTimeout = setTimeout(() => {
        try {
          this.loadSimilarWords(newVal);
        } finally {
          this.isDisabledCreateNewRelatedWord = false;
        }
      }, 2000);
    }
  },
  async mounted() {
    if (this.wordId) {
      this.word = await this.$axios.$get(`/api/api/words-matcher/${this.sourceLanguageCodeCode}/${this.destinationLanguageCode}/${this.wordId}`);
    }
  },
  computed: {
    title () {
      return `${!this.wordId ? 'Add' : 'Edit'} word`;
    },
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
    defaultWord () {
      return {
        name: null,
        description: 'Слово описание',
        translations: [
          {
            'description': null
          }
        ],
        ru_words: [],
        bur_words: []
      };
    },
    async loadWord(sourceLanguageCodeCode, destinationLanguageCode, wordId) {
      return await this.$axios.$get(`/api/api/words-matcher/${sourceLanguageCodeCode}/${destinationLanguageCode}/${wordId}`) || this.defaultWord();
    },
    async loadSimilarWords(word: string) {
        this.suggestedWords = await this.$axios.$get(`/api/api/words-matcher/${this.sourceLanguageCodeCode}/${this.destinationLanguageCode}?word=${word}`);
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
    async saveWord(word) {
      return await this.$axios.$post(`/api/api/words-matcher/${this.destinationLanguageCode}/${this.sourceLanguageCodeCode}`, word);
    },
    async sync(word) {
      return await this.$axios.$put(`/api/api/words-matcher/${this.sourceLanguageCodeCode}/${this.destinationLanguageCode}/${word.id}/sync`, word);
    },
    async save() {
      let translations = [...this.word.translations];
      let ruWords = this.word.ru_words ? [...this.word.ru_words] : [];
      let burWords = this.word.bur_words ? [...this.word.bur_words] : [];
      let word = await this.saveWord(this.word);
      word = {
        ...word,
        ru_words: ruWords,
        bur_words: burWords
      };
      this.word = await this.sync(word);
      document.location.href = document.location.href.replace(this.wordId, '').replace(/\/$/, '') + `/${word.id}`;
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
