<template>
  <div class="container mx-auto px-10">
    <h1 class="text-2xl sm:text-4xl lg:text-6xl py-10">
      Бурятско-Русский словарь
    </h1>
    <div class="block md:flex">
      <div class="flex-auto">
        <textarea
          placeholder="Угэ бэшэгты" name="" id="second" rows="10"
          class="p-5 w-full border-b-2 border-fuchsia-600"
          v-model="to"
          @keypress="changeTo($event.target)"
          ref="to"
        ></textarea>
        <button @click="changeTo($refs.to)" class="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded w-full">
          <span class="pr-5">Оршуулха</span>
          <svg v-if="toLoading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-blue inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </button>
      </div>
      <div class="my-5 m-auto text-center">
        <svg class="inline cursor-pointer" style="width: 30px;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" />
        </svg>
      </div>
      <div class="flex-auto">
        <textarea
          placeholder="Введите слово" name="" id="first" rows="10"
          class="p-5 w-full border-b-2 border-fuchsia-600"
          v-model="from"
          ref="from"
          @keypress="changeFrom($event.target)"
        ></textarea>
        <button @click="changeFrom($refs.from)" class="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded w-full">
          <span class="pr-5">Перевести</span>
          <svg v-if="fromLoading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-blue inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </button>
      </div>
    </div>
    <div class="block mt-10 text-gray-500">
      <div v-if="translates.result.length" class="mb-5">
        <h2 class="text-2xl">Переводы</h2>
        <hr>
        <p v-for="result in translates.result">
          <span>
            <b>{{ result.name }}</b><br>
            <span v-for="translation in result.translations">{{ translation.name }}<br></span>
          </span>
        </p>
      </div>
      <div v-if="translates.match.length" class="mb-5">
        <h2 class="text-2xl">Совпадения</h2>
        <hr>
        <p v-for="result in translates.match">
          <span>
            <b>{{ result.name }}</b><br>
            <span v-for="translation in result.translations">{{ translation.name }}<br></span>
          </span>
        </p>
      </div>
      <div v-if="translates.fuzzy.length" class="mb-5">
        <h2 class="text-2xl">Возможные переводы</h2>
        <hr>
        <p v-for="result in translates.fuzzy">
          <span>
            <b>{{ result.name }}</b><br>
            <span v-for="translation in result.translations">{{ translation.name }}<br></span>
          </span>
        </p>
      </div>
    </div>
    <div class="block mt-40 text-gray-500">
      <p>
        * Пока переводчик может только дословно переводить текста.
        Это попытка сделать какое то решение для перевода текста с русского на бурятский.
      </p>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  data () {
    return {
      title: 'Бурятско-Русский словарь',
      from: '',
      to: '',
      fromLoading: false,
      toLoading: false,
      translateTimeout: null,
      translates: {
        result: [],
        match: [],
        fuzzy: [],
      }
    }
  },
  head() {
    return {
      title: this.title,
      meta: [
        {
          hid: 'description',
          name: 'description',
          content: 'Бурятско-Русский словарь'
        }
      ]
    }
  },
  methods: {
    changeFrom(e: any) {
      clearTimeout(this.translateTimeout);

      this.translateTimeout = setTimeout(() => {
        this.fromLoading = true;
        const value = e.value;
        this.$axios.get('/api/translate/ru2bur?' + this.jsonObjectToQueryString({
          word: value
        })).then(({data: {data}}) => {
          this.to = data?.result?.[0]?.translations?.[0]?.name;
          console.log(this.to);
          this.translates = data;
        }).finally(() => {
          this.fromLoading = false;
        });
      }, 500);
    },
    changeTo(e: any) {
      clearTimeout(this.translateTimeout);

      this.translateTimeout = setTimeout(() => {
        this.toLoading = true;
        const value = e.value;
        this.$axios.get('/api/translate/bur2ru?' + this.jsonObjectToQueryString({
          word: value
        })).then(({data: {data}}) => {
          this.from = data?.result?.[0]?.translations?.[0]?.name;
          this.translates = data;
        }).finally(() => {
          this.toLoading = false;
        });
      }, 500);
    },
    jsonObjectToQueryString (obj: any, prefix: any = null): string {
      const euc = encodeURIComponent
      const serialize = this.jsonObjectToQueryString
      const isNotNullObject = (v: any) => v !== null && typeof v === "object"
      const queryStringItems = []

      for (let p in obj) {
        if (!obj.hasOwnProperty(p)) {
          continue
        }

        const k = prefix ? prefix + "[" + p + "]" : p
        const v = obj[p]
        queryStringItems.push(isNotNullObject(v) ? serialize(v, k) : euc(k) + "=" + euc(v));
      }
      return queryStringItems.join("&");
    }
  }
})
</script>

<style>
</style>
