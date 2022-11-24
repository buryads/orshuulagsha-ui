<template>
  <div>
    <div class="flex bg-gray-900 w-full justify-center">
      <div class="w-full max-w-xl p-3">
        <div class="w-full h-full flex align-center justify-center">
          <div id="cloud" class="" style="height: 4em; width: 100em;">
            <h1 class="font-bold text-4xl text-center text-white">
              {{ word.name }}
            </h1>
          </div>
        </div>
      </div>
    </div>
    <div class="flex bg-white w-full h-screen justify-center">
      <div class="w-full max-w-xl p-3">
        <div class="block md:flex">
          <div class="flex-auto">
            <div class="container mx-auto md:px-5 md:py-5">
              <div class="mb-2">
                <p class="w-full mb-5">
                  <template v-for="translation in word.translations">
                    {{ translation.name }}<br>
                  </template>
                </p>
                <p v-if="word && word.description" class="w-full">
                  <b>Wiki <a class="text-blue-500" :href="word.description.url" target="_blank">⇪</a>:</b><br>
                  {{ word.description.short_description }} <a class="text-blue-500" :href="word.description.url" target="_blank">⇪</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import UrlHelper from "../utils/url";

export default {
  name: 'view',
  head() {
    return {
      title: `${this.word.name} - Бурятско-Русский словарь`,
      meta: [
        {
          hid: 'description',
          name: 'description',
          content: `Перевод слова "${this.word.translations[0].name}" - переводим слова с бурятского и русского туда и обратно`
        }
      ]
    }
  },
  mounted() {},
  computed: {
    sourceLanguageCode() {
      return this.$route.params.sourceLanguageCode;
    },
    destinationLanguageCode() {
      return this.$route.params.destinationLanguageCode;
    },
    text() {
      return this.$route.params.word;
    }
  },
  async asyncData ({ $axios, params, error }) {
    console.log(params)
    const {data: {data}} = await $axios.get(`/api/translate/${params.sourceLanguageCode}2${params.destinationLanguageCode}?` + UrlHelper.jsonObjectToQueryString({
      word: params.word
    }));
    const word = data?.result[0];
    console.log(word)
    if (!word || word.id === 0) {
      return error({ statusCode: 404, message: 'Word not found' });
    }
    return {
      word
    };
  },
  methods: {}
};
</script>

<style scoped>
.echarts {
  width: 400px;
  height: 400px;
}
</style>
