<template>
  <div class="block md:flex">
    <div class="w-full flex-auto pb-10 md:py-5">
      <div v-for="word in words" :key="word.id" class="container mx-auto px-5">
        <nuxt-link
          :to="localePath(`/words`) + `/${sourceLanguageCodeCode}/${word.slug}`"
          class="my-8 w-full p-4 sm:p-6 lg:p-8"
          :class="{
            'block rounded-lg border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800':
              withBg,
          }"
          aria-label="Subscribe to the Flowbite newsletter"
        >
          <div class="mb-3 text-xl font-medium text-gray-900 dark:text-white">
            {{ word.name }}
            <span v-if="word.images && word.images[0]" class="opacity-5"
              >*</span
            >
          </div>
          <p class="mb-2 text-sm font-medium text-gray-500 dark:text-gray-300">
            {{ word.translations ? word.translations[0].name : '...' }}
          </p>
        </nuxt-link>
      </div>
      <PublicPagination :pagination="pagination" @paginate="loadPage" />
    </div>
  </div>
</template>

<script>
  import PublicPagination from '~/_components/PublicPagination.vue';

  export default {
    name: 'Words',
    props: ['pagination', 'words', 'sourceLanguageCodeCode', 'withBg'],
    components: {
      PublicPagination,
    },
    methods: {
      loadPage(page) {
        this.$emit('loadPage', page);
      },
    },
  };
</script>

<style scoped></style>
