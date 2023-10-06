<template>
  <div class="container my-5">
    <div class="mt-4 flex flex-wrap items-center justify-between gap-3">
      <div>
        <div class="flex items-center gap-2">
          <h1 class="title">
            {{ pack.name }}
          </h1>
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
      <PackWord v-for="word in pack.burWords" :key="word.id" :word="word" />
    </ul>
  </div>
</template>

<script setup lang="ts">
  import { useI18n } from 'vue-i18n';
  import { Ref } from 'vue';
  import { Pack } from '~/repository/modules/user/types';
  import PackWord from '~/components/UI/PackWord.vue';

  const { t } = useI18n();
  const localePath = useLocalePath();
  const { $api } = useNuxtApp();
  const pack: Ref<Partial<Pack>> = ref({});
  const route = useRoute();

  pack.value = await $api.user.getPublicPack(route.params.slug.toString());

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

  async function getPack() {
    showAddingWordModal.value = false;
    showSelectingImageModal.value = false;
    pack.value = await $api.user.getPublicPack(route.params.slug.toString());
  }
</script>