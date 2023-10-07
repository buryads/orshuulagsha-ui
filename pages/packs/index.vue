<template>
  <div class="container mt-5">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <h1 class="title">
        {{ $t('packsTitle') }}
      </h1>

      <UIButton
        :to="localePath('/packs/create')"
        class="bg-bur-yellow text-white transition-opacity hover:opacity-90"
      >
        {{ $t('create new pack') }}
      </UIButton>
    </div>

    <ul
      role="list"
      class="mt-6 grid gap-x-4 gap-y-8 sm:grid-cols-2 sm:gap-x-6 md:grid-cols-3 lg:grid-cols-4 xl:gap-x-8"
    >
      <li v-for="pack in packs" :key="pack.id" class="relative">
        <UIPack :pack="pack" :pack-url="`/packs/${pack.slug}`" />
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
  import { Ref } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { Pack } from '~/repository/modules/user/types';
  import { definePageMeta } from '#imports';
  import { useAsyncData } from '#app';

  definePageMeta({
    middleware: 'auth',
  });

  const { t } = useI18n();
  useHead({
    title: t('packs'),
    meta: [
      {
        property: 'og:title',
        name: 'title',
        content: t('packs'),
      },
      {
        property: 'title',
        name: 'title',
        content: t('packs'),
      },
    ],
  });

  const localePath = useLocalePath();
  const { $api } = useNuxtApp();
  const packs: Ref<Pack[]> = ref([]);

  const { data } = await useAsyncData('packs', () => $api.user.getPacks());

  packs.value = data.value;
</script>
