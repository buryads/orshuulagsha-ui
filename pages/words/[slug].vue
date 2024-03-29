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
  import type { Word as wordType } from '~/repository/modules/types';
  import { useAsyncData } from '#app';

  const route = useRoute();
  const { $api } = useNuxtApp();
  const { t } = useI18n();

  const { data } = await useAsyncData('word', () =>
    $api.words.getOneBurWord(route.params.slug.toString()),
  );

  const word = data.value as wordType;
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
        property: 'description',
        name: 'description',
        content: t('singleWordPageDescription', {
          word: word.name,
          lang: t('ru'),
        }),
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
