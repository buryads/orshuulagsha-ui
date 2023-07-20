<template>
  <div>
    <div class="flex w-full justify-center bg-gray-900">
      <div class="w-full max-w-xl p-3">
        <div class="align-center flex h-full w-full justify-center">
          <div id="cloud" class="" style="height: 4em; width: 100em">
            <h1 class="text-center text-4xl font-bold text-white">
              {{ word.name }}
              <span
                :key="update"
                v-if="word && word.speechs && word.speechs.length > 0"
                class="mr-2 inline-block"
              >
                <a v-if="!word.isPlaying" href="#" @click.prevent="playSpeech()"
                  ><outline-play-icon
                    class="inline-block h-5 w-5 cursor-pointer"
                /></a>
                <a v-else href="#" @click.prevent="pauseSpeech()"
                  ><outline-pause-icon
                    class="inline-block h-5 w-5 cursor-pointer"
                /></a>
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
                <img :src="word.images[0].url" class="mb-5" />
              </div>
              <div class="mb-2">
                <p class="mb-5 w-full">
                  <template v-for="translation in word.translations">
                    {{ translation.name }}<br />
                  </template>
                </p>
                <p v-if="word && word.description">
                  <b
                    >Wiki
                    <a
                      class="text-blue-500"
                      :href="word.description.url"
                      target="_blank"
                      >⇪</a
                    >:</b
                  ><br />
                  {{ word.description.short_description }}
                  <a
                    class="text-blue-500"
                    :href="word.description.url"
                    target="_blank"
                    >⇪</a
                  >
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <hr />
    <div class="flex w-full justify-center">
      <Words
        :words="words"
        :pagination="pagination"
        :source-language-code-code="sourceLanguageCodeCode"
        @loadPage="loadPage"
      />
    </div>
  </div>
</template>

<script>
  // @ts-nocheck
  import Words from '~/_components/Words.vue';
  import UrlHelper from '../utils/url';

  export default {
    name: 'view',
    components: { Words },
    head() {
      return {
        title: `${this.$t('singleWordPageTitle').replace(
          '{word}',
          this.word.name,
        )} - ${this.$t('appName')}`,
        meta: [
          {
            hid: 'description',
            name: 'description',
            content: this.$t('singleWordPageTitle').replace(
              '{word}',
              this.word.name,
            ),
          },
          {
            property: 'og:title',
            name: 'title',
            content: this.$t('singleWordPageTitle').replace(
              '{word}',
              this.word.name,
            ),
          },
          {
            property: 'og:type',
            name: 'type',
            content: `article`,
          },
          {
            property: 'og:description',
            name: 'description',
            content: this.$t('singleWordPageDescription')
              .replace('{word}', this.word.name)
              .replace(
                '{lang}',
                this.$t(this.sourceLanguageCodeCode === 'bur' ? 'ru' : 'bur'),
              ),
          },
          {
            property: 'og:image',
            name: 'image',
            content: this.word?.images[0]?.url,
          },
        ],
      };
    },
    mounted() {
      this.loadPage();
    },
    computed: {
      sourceLanguageCodeCode() {
        return this.$route.params.sourceLanguageCode ?? 'bur';
      },
    },
    async asyncData({ $axios, params, error }) {
      let word = null;
      try {
        document;
        const {
          data: { data },
        } = await $axios.get(
          `/api/words/${params.sourceLanguageCode}/${params.wordSlug}`,
        );
        word = data;
      } catch (e) {
        const {
          data: { data },
        } = await $axios.get(
          `/api/words/${params.sourceLanguageCode}/${params.wordSlug}`,
        );
        word = data;
      }
      if (!word || word.id === 0) {
        return error({ statusCode: 404, message: 'Word not found' });
      }
      return {
        word,
      };
    },
    data() {
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
        this.$axios
          .$get(
            `/api/words/${this.sourceLanguageCodeCode}/${this.word.id}/next`,
          )
          .then(({ data, pagination }) => {
            this.words = data;
            this.pagination = pagination;
          });
      },
      playSpeech() {
        this.word.isPlaying = true;
        this.audio = new Audio(this.word?.speechs[0].url);
        this.audio.play();
        this.audio.addEventListener('pause', (event) => {
          this.word.isPlaying = false;
          this.update++;
        });
        this.update++;
      },
      pauseSpeech() {
        this.word.isPlaying = true;
        this.audio = new Audio(this.word?.speechs[0].url);
        this.audio.pause();
        this.update++;
      },
      async loadWord(asyncData = false) {
        const {
          data: { data },
        } = await $axios.get(
          `/api/words/${params.sourceLanguageCode}/${params.wordSlug}`,
        );
        return data;
      },
    },
  };
</script>

<style scoped>
  .echarts {
    width: 400px;
    height: 400px;
  }
</style>
