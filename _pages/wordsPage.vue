<template>
  <div class="mb-15">
    <div class="flex w-full justify-center bg-gray-900">
      <div class="w-full max-w-xl p-3">
        <div class="align-center flex h-full w-full justify-center">
          <div id="cloud" class="" style="height: 4em; width: 100em">
            <h1 class="text-center text-4xl font-bold text-white">
              {{ title }}
            </h1>
          </div>
        </div>
      </div>
    </div>
    <div class="flex h-screen w-full justify-center">
      <div class="w-full max-w-xl p-3">
        <h2 class="text-center text-3xl font-bold text-indigo-700">
          {{ description }}
        </h2>
        <Words
          :words="words"
          :pagination="pagination"
          :source-language-code-code="sourceLanguageCodeCode"
          :with-bg="true"
          @loadPage="loadPage"
        />
      </div>
    </div>
  </div>
</template>

<script>
  // @ts-nocheck
  import Words from '~/_components/Words.vue';

  export default {
    name: 'view',
    head() {
      return {
        title: this.title,
        description: 'Описание',
        meta: [
          {
            hid: 'description',
            name: 'description',
            content: this.title,
          },
          {
            property: 'og:title',
            name: 'title',
            content: this.title,
          },
          {
            property: 'og:description',
            name: 'description',
            content: this.$t('wordsPageDescription'),
          },
        ],
      };
    },
    components: {
      Words,
    },
    props: {},
    mounted() {
      this.loadPage(this.currentPage);
    },
    data() {
      return {
        description: this.$t('wordsPageDescription'),
        updateNames: 0,
        searchName: '',
        loading: true,
        filteredNames: [],
        names: [],
        words: [],
        pagination: {},
        currentPage: parseInt(this.$route.query?.page || 1),
      };
    },
    computed: {
      sourceLanguageCodeCode() {
        return this.$route.params.sourceLanguageCode ?? 'bur';
      },
      title() {
        return `${this.$t('words')} - ${this.$t(this.sourceLanguageCodeCode)}`;
      },
    },
    methods: {
      loadPage(page = 1) {
        this.$axios
          .$get(`/api/words/${this.sourceLanguageCodeCode}?page=${page}`)
          .then(({ data, pagination }) => {
            this.words = data;
            this.pagination = pagination;
          });
      },
      filter(e) {
        const value = e.value.toLowerCase().trim();
        this.filteredNames = [];
        if (value.length > 0) {
          this.names.forEach((nameInfo) => {
            if (!nameInfo.name.toLowerCase().includes(value)) {
              return;
            }
            this.filteredNames.push(nameInfo);
          });
        }
        this.updateNames++;
      },
      shuffle(array) {
        let currentIndex = array.length;
        while (currentIndex !== 0) {
          let randomIndex = Math.floor(Math.random() * array.length);
          currentIndex -= 1;
          let temp = array[currentIndex];
          array[currentIndex] = array[randomIndex];
          array[randomIndex] = temp;
        }
        return array;
      },
      random(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
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
