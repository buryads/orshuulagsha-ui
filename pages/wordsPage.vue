<template>
  <div>
    <div class="flex bg-gray-900 w-full justify-center">
      <div class="w-full max-w-xl p-3">
        <div class="w-full h-full flex align-center justify-center">
          <div id="cloud" class="" style="height: 4em; width: 100em;">
            <h1 class="font-bold text-4xl text-center text-white">
              {{ title }}
            </h1>
          </div>
        </div>
      </div>
    </div>
    <div class="flex w-full h-screen justify-center">
      <div class="w-full max-w-xl p-3">
        <h2 class="font-bold text-3xl text-center text-indigo-700">
          {{ description }}
        </h2>
        <div class="block md:flex">
          <div class="flex-auto md:py-5">
            <div v-for="word in words" :key="word.id" class="container mx-auto md:px-5">
              <nuxt-link :to="`/words/${sourceLanguageCodeCode}/${word.slug}`" class="p-4 my-8 bg-white border border-gray-200 block rounded-lg shadow-md sm:p-6 lg:p-8 dark:bg-gray-800 dark:border-gray-700" aria-label="Subscribe to the Flowbite newsletter">
                <div class="mb-3 text-xl font-medium text-gray-900 dark:text-white">{{ word.name }}</div>
                <p class="mb-2 text-sm font-medium text-gray-500 dark:text-gray-300">{{ word.translations ? word.translations[0].name : "..." }}</p>
              </nuxt-link>
            </div>
            <PublicPagination :pagination="pagination" @paginate="loadPage"/>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// @ts-nocheck
import IEcharts from 'vue-echarts-v3';
import PublicPagination from "~/components/PublicPagination.vue";

export default {
  name: 'view',
  head() {
    return {
      title: 'Слова',
      description: 'Описание',
      meta: [
        {
          hid: 'description',
          name: 'description',
          content: this.title
        }
      ]
    }
  },
  components: {
    IEcharts,
    PublicPagination
  },
  props: {
  },
  mounted() {
    this.loadPage(this.currentPage);
  },
  data() {
    return {
      title: this.$t('words'),
      description: this.$t('wordsPageDescription'),
      updateNames: 0,
      searchName: '',
      loading: true,
      filteredNames: [],
      names: [],
      words: [],
      pagination: {},
      currentPage: parseInt(this.$route.query?.page || 1)
    };
  },
  computed: {
    sourceLanguageCodeCode() {
      return this.$route.params.sourceLanguageCode ?? 'bur';
    },
  },
  methods: {
    loadPage(page = 1) {
      this.$axios.$get(`/api/api/words/${this.sourceLanguageCodeCode}?page=${page}`).then(({data, pagination}) => {
        this.words = data;
        this.pagination = pagination;
      });
    },
    filter (e) {
      const value = e.value.toLowerCase().trim();
      this.filteredNames = [];
      if (value.length > 0) {
        this.names.forEach(nameInfo => {
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
      while(currentIndex !== 0){
        let randomIndex = Math.floor(Math.random()*array.length);
        currentIndex -=1;
        let temp = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex]=temp;
      }
      return array;
    },
    random(min,max) {
      return Math.floor((Math.random())*(max-min+1))+min;
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
