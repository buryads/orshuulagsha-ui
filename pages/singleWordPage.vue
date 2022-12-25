<template>
  <div>
    <div class="flex bg-gray-900 w-full justify-center">
      <div class="w-full max-w-xl p-3">
        <div class="w-full h-full flex align-center justify-center">
          <div id="cloud" class="" style="height: 4em; width: 100em;">
            <h1 class="font-bold text-4xl text-center text-white">
              {{ word.name }}
              <span :key="update" v-if="word && word.speechs && word.speechs.length > 0" class="inline-block mr-2">
                  <a v-if="!word.isPlaying" href="#" @click.prevent="playSpeech()"><outline-play-icon class="cursor-pointer w-5 h-5 inline-block" /></a>
                  <a v-else href="#" @click.prevent="pauseSpeech()"><outline-pause-icon class="cursor-pointer w-5 h-5 inline-block" /></a>
              </span>
            </h1>
          </div>
        </div>
      </div>
    </div>
    <div class="flex w-full justify-center">
      <div class="w-full max-w-xl p-3">
        <div class="block md:flex">
          <div class="flex-auto">
            <div class="container mx-auto md:px-5 md:py-5">
              <div v-if="word.images && word.images[0]">
                <img  :src="word.images[0].url" class="mb-5">
              </div>
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
    <hr>
    <div class="flex w-full justify-center">
      <Words :words="words" :pagination="pagination" :source-language-code-code="sourceLanguageCodeCode"/>
    </div>
  </div>
</template>

<script>
// @ts-nocheck
import Words from "~/components/Words.vue";
import UrlHelper from "../utils/url";

export default {
  name: 'view',
  components: {Words},
  head() {
    return {
      title: `${this.word?.name} - ${this.$t('appName')}`,
      meta: [
        {
          hid: 'description',
          name: 'description',
          content: `Перевод слова "${this?.word?.translations[0]?.name}" - переводим слова с бурятского и русского туда и обратно`
        },
        {
          property: 'og:title',
          name: 'title',
          content: `${this.word?.name} - ${this.$t('appName')}`
        },
        {
          property: 'og:type',
          name: 'type',
          content: `article`
        },
        {
          property: 'og:description',
          name: 'description',
          content: `Перевод слова "${this?.word?.translations[0]?.name}" - переводим слова с бурятского и русского туда и обратно`
        },
        {
          property: 'og:image',
          name: 'image',
          content: this.word?.images[0]?.url
        }
      ]
    }
  },
  mounted() {
    this.loadPage();
  },
  computed: {
    sourceLanguageCodeCode() {
      return this.$route.params.sourceLanguageCode ?? 'bur';
    }
  },
  async asyncData ({ $axios, params, error }) {
    let word = null
    try {
      document;
      const {data: {data}} = await $axios.get(`/api/api/words/${params.sourceLanguageCode}/${params.wordSlug}`);
      word = data;
    } catch (e) {
      const {data: {data}} = await $axios.get(`/api/words/${params.sourceLanguageCode}/${params.wordSlug}`);
      word = data;
    }
    if (!word || word.id === 0) {
      return error({ statusCode: 404, message: 'Word not found' });
    }
    return {
      word
    };
  },
  data () {
    return {
      word: {},
      words: [],
      pagination: {},
      audio: {},
      update: 0,
    };
  },
  async beforeMount() {
    if (!this.word) {
      this.word = await this.loadWord();
    }
  },
  methods: {
    loadPage(page = 1) {
      this.$axios.$get(`/api/api/words/${this.sourceLanguageCodeCode}/${this.word.id}/next`).then(({data, pagination}) => {
        this.words = data;
        this.pagination = pagination;
      });
    },
    playSpeech () {
      this.word.isPlaying = true;
      this.audio = new Audio(this.word?.speechs[0].url);
      this.audio.play();
      this.audio.addEventListener('pause', (event) => {
        this.word.isPlaying = false;
        this.update++;
      });
      this.update++;
    },
    pauseSpeech () {
      this.word.isPlaying = true;
      this.audio = new Audio(this.word?.speechs[0].url);
      this.audio.pause();
      this.update++;
    },
    async loadWord (asyncData = false) {
      const {data: {data}} = await $axios.get(`/api/api/words/${params.sourceLanguageCode}/${params.wordSlug}`);
      return data;
    }
  }
};
</script>

<style scoped>
.echarts {
  width: 400px;
  height: 400px;
}
</style>
