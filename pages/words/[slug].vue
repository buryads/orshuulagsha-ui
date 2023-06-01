<template>
  <div class="container mt-6">
    <h1
      class="text-center text-xl font-bold capitalize text-gray-900 md:text-3xl"
    >
      {{ word.name }}
    </h1>

    <h2 class="text-center text-lg font-semibold capitalize text-gray-600">
      ({{ word.translations?.map((t) => t.name).join(',') }})
    </h2>

    <div class="mx-auto mt-6 max-w-4xl gap-4 sm:columns-2 lg:columns-3">
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
  import { useMyFetch } from '#imports';
  import { word as wordType } from '~/repository/modules/types';

  const route = useRoute();
  const { $api } = useNuxtApp();
  const { t } = useI18n();

  // @TODO rewrite it with SSG instead of SSR
  const { data } = useMyFetch(
    $api.words.RESOURCE_BUR + '/' + route.params.slug,
  );

  const word: wordType = data.value?.data || {};
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
