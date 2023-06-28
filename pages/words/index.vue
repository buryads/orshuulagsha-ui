<template>
  <div class="container my-6">
    <h1 class="text-xl font-bold text-gray-900 md:text-3xl">
      {{ $t('words') }}
    </h1>

    <section class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <template v-if="isLoading">
        <UICard
          v-for="n in PER_PAGE"
          :key="n"
          class="!h-20 !bg-neutral-100 shadow"
        />
      </template>

      <template v-else>
        <UICard v-for="word in words" :key="word.id" class="min-h-[90px]">
          <a :href="`/words/${word.slug}`" class="focus:outline-none">
            <span class="absolute inset-0" aria-hidden="true" />
            <span
              class="item-start flex flex-col sm:flex-row sm:items-center sm:gap-2"
            >
              <span class="text-xl font-medium text-gray-900">
                {{ word.name }}
              </span>
              <span
                class="text-sm font-medium text-gray-500 sm:ml-auto sm:text-right"
              >
                {{ word.slug.replace('-', ' ') }}
              </span>
            </span>
            <p class="text-sm text-gray-500">
              {{ word.translations.map((t) => t.name).join(',') }}
            </p>
          </a>
        </UICard>
      </template>
    </section>

    <UIPagination
      v-if="meta?.last_page > 1"
      class="mt-6"
      :page="meta.current_page"
      :per-page="meta.per_page"
      :last-page="meta.last_page"
      @changePage="changePage"
    />
  </div>
</template>

<script setup lang="ts">
  import { useI18n } from 'vue-i18n';
  import { Ref } from 'vue';
  import type { metaResponse, word } from '~/repository/modules/types';

  const PER_PAGE = 51;
  const { t } = useI18n();
  const route = useRoute();
  const { $api } = useNuxtApp();

  useHead({
    title: t('words'),
    meta: [
      {
        property: 'og:title',
        name: 'title',
        content: t('words'),
      },
      {
        property: 'title',
        name: 'title',
        content: t('words'),
      },
      {
        property: 'og:description',
        name: 'description',
        content: t('wordsPageDescription'),
      },
    ],
  });

  const words: Ref<word[]> = ref([]);
  const meta: Ref<Partial<metaResponse>> = ref({});
  const isLoading = ref(false);

  const { data, meta: newMeta } = await $api.words.getBurWords({
    page: route.query.page ? +route.query.page : 1,
    perPage: PER_PAGE,
  });
  words.value = data;
  meta.value = newMeta;

  async function changePage(page: number) {
    try {
      isLoading.value = true;
      history.replaceState(null, '', `?page=${page}`);
      meta.value.current_page = page;
      window.scrollTo({ top: 0, behavior: 'smooth' });

      const { data, meta: newMeta } = await $api.words.getBurWords({
        page,
        perPage: PER_PAGE,
      });
      words.value = data;
      meta.value = newMeta;
    } catch (e) {
      console.error(e);
    } finally {
      isLoading.value = false;
    }
  }
</script>
