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
        <NuxtLink
          :to="localePath(`/packs/${pack.slug}`)"
          class="aspect-h-7 aspect-w-10 group block w-full cursor-pointer overflow-hidden rounded-lg bg-gray-100"
        >
          <div
            class="h-48 w-full bg-cover bg-center bg-no-repeat group-hover:opacity-80"
            :style="{
              backgroundImage: `url(${
                pack.burWords[0]?.images[0]?.url || '/images/stub-image.jpg'
              })`,
            }"
          />
          <button type="button" class="absolute inset-0 focus:outline-none">
            <span class="sr-only">View details for {{ pack.name }}</span>
          </button>
        </NuxtLink>
        <p
          class="pointer-events-none mt-2 block truncate text-sm font-medium text-gray-900"
        >
          {{ pack.name }}
        </p>
        <p class="pointer-events-none block text-sm font-medium text-gray-500">
          {{ pack.description }}
        </p>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
  import { Ref } from 'vue';
  import { packType } from '~/repository/modules/packs/types';
  import { useI18n } from 'vue-i18n';

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
  const packs: Ref<packType[]> = ref([]);

  packs.value = await $api.user.getPacks();
</script>
