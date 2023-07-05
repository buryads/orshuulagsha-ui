<template>
  <div class="container mt-5">
    <UIBreadcrumbs :pages="pages" />

    <div class="mt-4 flex flex-wrap items-center justify-between gap-3">
      <div>
        <div class="flex items-center gap-2">
          <h1 class="title">
            {{ pack.name }}
          </h1>
          <NuxtLink
            v-if="pack.user_id === user?.id"
            :to="`/packs/edit/${pack.slug}`"
            class="text-blue-500 hover:underline"
          >
            ( {{ $t('edit') }} )
          </NuxtLink>
        </div>

        <p class="prose mt-2">{{ pack.description }}</p>
      </div>

      <UIButton
        v-if="pack.burWords?.length"
        :to="localePath(`/packs/training/${pack.slug}`)"
        class="bg-bur-yellow text-white transition-opacity hover:opacity-90"
      >
        {{ $t('train the pack') }}
      </UIButton>
    </div>

    <ul
      v-if="pack.burWords?.length"
      role="list"
      class="mt-4 divide-y divide-gray-200"
    >
      <li
        v-for="word in pack.burWords"
        :key="word.id"
        class="flex items-center justify-between gap-x-6 py-5"
      >
        <div class="flex gap-x-4">
          <div
            class="h-12 w-12 flex-none rounded-full bg-gray-50 bg-cover bg-center bg-no-repeat"
            :style="{
              backgroundImage: `url(${
                word.images.find(
                  (img) => word?.pivot?.bur_word_image_id === img.id,
                )?.url
              })`,
            }"
          />
          <div class="min-w-0 flex-auto">
            <p class="text-sm font-semibold leading-6 text-gray-900">
              {{ word.name }}
            </p>
            <p class="mt-1 text-xs leading-5 text-gray-500">
              <template v-if="word.ru_words?.length">
                {{ word.ru_words.map((v) => v.name)[0] }}
              </template>
              <template v-else-if="word.translations?.length">
                {{ word.translations.map((v) => v.name)[0] }}
              </template>
            </p>
          </div>
        </div>

        <Speech v-if="word.speechs?.length > 0" :speech="word.speechs[0]" />
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
  import { useI18n } from 'vue-i18n';
  import { Ref } from 'vue';
  import { useUserStore } from '~/store/user';
  import { packType } from '~/repository/modules/user/types';

  const user = useUserStore().user;
  const { t } = useI18n();
  const localePath = useLocalePath();
  const { $api } = useNuxtApp();
  const pack: Ref<Partial<packType>> = ref({});
  const route = useRoute();

  pack.value = await $api.user.getPack(route.params.slug.toString());
  const pages = [
    { name: t('packsTitle'), to: localePath('/packs'), current: false },
    { name: pack.value.name, to: '', current: true },
  ];

  const title = `${t('pack')} ${pack.value.name}`;

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
    ],
  });
</script>
