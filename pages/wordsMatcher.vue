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
              Язык: <word-match-link name="Русский" :active="sourceLanguage === 'ru'" link="/words-matcher/ru"/> | <word-match-link name="Бурятский" :active="sourceLanguage === 'bur'" link="/words-matcher/bur"/>
            </h2>
            <div class="py-3">
              <p>
                <b>{{ word.name }}</b>
              </p>
              <p class="mt-2 text-lg text-slate-700 dark:text-slate-400">
                {{ word.description }}
              </p>
              <div class="mt-2 text-lg text-slate-700 dark:text-slate-400">
                <div v-for="(w, i) in word.words" class="inline-block">
                  <span :class="`mr-5`">{{ w.name }}<span class="absolute -mt-3 px-2 cursor-pointer text-red-600" @click="removeWord(i)">x</span>&nbsp;</span>
                </div>
              </div>
            </div>
            <div class="py-3">
              <input
                placeholder="Введите слово для поиска"
                class="p-2 mb-2 lg:w-9/12 w-full border-2 border-fuchsia-600 rounded"
                value="Слово"
                ref="text"
              >
              <div :key="updateSuggestedWords">
                <p v-for="(suggestedWord, i) in suggestedWords" href="#" class="mt-2 text-lg text-slate-700 dark:text-slate-400">
                  <a href="#" :class="`${isAlreadyInWords(suggestedWord) ? 'opacity-25' : ''}`">{{ suggestedWord.name }}</a><span v-if="!isAlreadyInWords(suggestedWord)" class="ml-2 text-green-500 cursor-pointer" @click="addSuggestedWord(suggestedWord)">+</span>
                </p>
              </div>
            </div>
            <div class="py-3">
              <button type="button" class="py-2 focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800">
                Сохранить
              </button>
              <button type="button" class="py-2 text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700">
                Пропустить
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import WordMatchLink from '../components/WordMatchLink.vue';

let input;

export default Vue.extend({
  data () {
    return {
      title: 'Сопоставитель слов',
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
      suggestedWords: [
        {
          id: 4,
          'name': 'Слово 4',
          'description': 'Слово 1',
        },
        {
          id: 5,
          'name': 'Слово 5',
          'description': 'Слово 2',
        },
        {
          id: 6,
          'name': 'Слово 6',
          'description': 'Слово 3',
        }
      ],
      updateSuggestedWords: 0
    }
  },
  components: {
    WordMatchLink
  },
  mounted() {
    console.log();
  },
  computed: {
    sourceLanguage() {
      return this.$route.params.sourceLanguage;
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
    removeWord(index: number) {
      this.word.words = this.removeItemFromArray(this.word.words, index);
    },
    removeItemFromArray(array: any, index: number) {
      return [].concat(array.slice(0, index), array.slice(index+1, array.length));
    },
    addSuggestedWord(suggestedWord: object) {
      if (this.isAlreadyInWords(suggestedWord)) {
        return;
      }
      this.word.words.push(suggestedWord);
      this.updateSuggestedWords++;
    },
    isAlreadyInWords(word: object) {
      for (let i = 0; i < this.word.words.length; i++) {
        if (this.word.words[i].id === word.id) {
          return true;
        }
      }
      return false;
    }
  }
})
</script>

<style>
</style>
