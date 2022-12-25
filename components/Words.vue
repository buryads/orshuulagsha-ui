<template>
  <div class="block md:flex">
    <div class="flex-auto md:py-5 pb-10 w-full ">
      <div v-for="word in words" :key="word.id" class="container mx-auto px-5">
        <nuxt-link :to="localePath(`/words`) + `/${sourceLanguageCodeCode}/${word.slug}`" class="w-full p-4 my-8 sm:p-6 lg:p-8 " :class="{'bg-white border border-gray-200 block rounded-lg shadow-md dark:bg-gray-800 dark:border-gray-700': withBg}" aria-label="Subscribe to the Flowbite newsletter">
          <div class="mb-3 text-xl font-medium text-gray-900 dark:text-white">
            {{ word.name }}
            <span v-if="word.images && word.images[0]" class="opacity-5">*</span>
          </div>
          <p class="mb-2 text-sm font-medium text-gray-500 dark:text-gray-300">{{ word.translations ? word.translations[0].name : "..." }}</p>
        </nuxt-link>
      </div>
      <PublicPagination :pagination="pagination" @paginate="loadPage"/>
    </div>
  </div>
</template>

<script>
import PublicPagination from "~/components/PublicPagination.vue";

export default {
  name: "Words",
  props: [
    'pagination',
    'words',
    'sourceLanguageCodeCode',
    'withBg'
  ],
  components: {
    PublicPagination
  },
  methods: {
    loadPage (page) {
      this.$emit('loadPage', page)
    }
  }
}
</script>

<style scoped>

</style>
