<template>
  <div class="container my-5">
    <UIBreadcrumbs :pages="pages" />

    <div class="mt-4 flex flex-wrap items-center justify-between gap-3">
      <div>
        <div class="flex items-center gap-2">
          <h1 class="title">
            {{ pack.name }}
          </h1>
          <NuxtLink
            v-if="isPackOfTheCurrentUser"
            :to="localePath(`/packs/edit/${pack.slug}`)"
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
      <PackWord
        v-for="word in pack.burWords"
        :key="word.id"
        :word="word"
        :editing-image-available="isPackOfTheCurrentUser"
        :show-delete-button="isPackOfTheCurrentUser"
        @image-click="openSelectingImageModal"
        @delete="deleteWord"
      />
    </ul>

    <UIButton
      @click="showAddingWordModal = true"
      class="mt-4 bg-bur-yellow text-white transition-opacity hover:opacity-90"
    >
      {{ $t('add word') }}
    </UIButton>

    <WidgetAddingNewWordModal
      :visible="showAddingWordModal"
      :pack-id="+pack.id"
      @close="showAddingWordModal = false"
      @attached="getPack"
    />

    <WidgetSelectingImageModal
      :visible="showSelectingImageModal"
      :pack-id="+pack.id"
      :word="selectedWord"
      @close="showSelectingImageModal = false"
      @attached="getPack"
    />
  </div>
</template>

<script setup lang="ts">
  import { useI18n } from 'vue-i18n';
  import { Ref } from 'vue';
  import { useUserStore } from '~/store/user';
  import { Pack } from '~/repository/modules/user/types';
  import { TrashIcon, CameraIcon } from '@heroicons/vue/24/outline';
  import { Word as wordType } from '~/repository/modules/types';
  import getWordImage from '~/utils/getWordImage';
  import { definePageMeta } from '#imports';
  import PackWord from '~/components/UI/PackWord.vue';
  import { useAsyncData } from '#app';

  definePageMeta({
    middleware: 'auth',
  });

  const user = useUserStore().user;
  const { t } = useI18n();
  const localePath = useLocalePath();
  const { $api } = useNuxtApp();
  const pack: Ref<Partial<Pack>> = ref({});
  const route = useRoute();
  const showAddingWordModal = ref(false);
  const showSelectingImageModal = ref(false);
  const selectedWord = ref();

  const { data } = await useAsyncData('pack', () =>
    $api.user.getPack(route.params.slug.toString()),
  );
  pack.value = data.value;
  const pages = [
    { name: t('packsTitle'), to: localePath('/packs'), current: false },
    { name: pack.value.name, to: '', current: true },
  ];
  const isPackOfTheCurrentUser = pack.value.user_id === user?.id;

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
    pack.value = await $api.user.getPack(route.params.slug.toString());
  }

  async function deleteWord(wordId: number) {
    if (!pack.value.id) return;

    try {
      await $api.user.deleteAttachedWordFromPack(pack.value.id, wordId);
      await getPack();
    } catch (error) {
      console.error(error);
    }
  }

  function openSelectingImageModal(word: wordType) {
    if (isPackOfTheCurrentUser) {
      selectedWord.value = word;
      showSelectingImageModal.value = true;
    }
  }
</script>
