<template>
  <div class="container my-6">
    <h1
      class="text-center text-xl font-bold capitalize text-gray-900 md:text-3xl"
    >
      {{ word.name }}
    </h1>

    <h2 class="text-center text-lg font-semibold capitalize text-gray-600">
      ({{ word.translations?.map((t) => t.name).join(',') }})
    </h2>

    <div class="mx-auto mt-6 max-w-6xl gap-4 sm:columns-2 lg:columns-3">
      <img
        v-for="image in word.images"
        class="m-auto mb-4 h-auto max-w-full rounded-lg"
        :key="image.id"
        :src="image.url"
        :alt="word.name"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { word as wordType } from '~/repository/modules/types';

  const route = useRoute();
  const { $api } = useNuxtApp();
  const { t } = useI18n();

  const word: wordType = await $api.words.getOneBurWord(
    route.params.slug.toString(),
  );
  const title = t('singleWordPageTitle', { word: word.name });

  useHead({
    title,
    meta: [
      {
        property: 'og:title',
        name: 'title',
        content: title,
      },
      {
        property: 'title',
        name: 'title',
        content: title,
      },
      {
        property: 'og:description',
        name: 'description',
        content: t('singleWordPageDescription', {
          word: word.name,
          lang: t('ru'),
        }),
      },
    ],
  });
</script>
