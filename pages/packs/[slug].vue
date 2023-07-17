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
            @click="openSelectingImageModal(word)"
            :title="isPackOfTheCurrentUser && 'Edit image'"
            class="h-12 w-12 flex-none cursor-pointer rounded-full bg-gray-50 bg-cover bg-center bg-no-repeat"
            :style="{
              backgroundImage: `url(${getWordImage(word)})`,
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

        <TrashIcon
          v-if="isPackOfTheCurrentUser"
          class="ml-auto h-4 w-4 cursor-pointer"
          @click="deleteWord(word.id)"
        />
        <Speech v-if="word.speechs?.length > 0" :speech="word.speechs[0]" />
      </li>
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
  import { packType } from '~/repository/modules/user/types';
  import { TrashIcon } from '@heroicons/vue/24/outline';
  import { word as wordType } from '~/repository/modules/types';
  import getWordImage from '~/utils/getWordImage';

  const user = useUserStore().user;
  const { t } = useI18n();
  const localePath = useLocalePath();
  const { $api } = useNuxtApp();
  const pack: Ref<Partial<packType>> = ref({});
  const route = useRoute();
  const showAddingWordModal = ref(false);
  const showSelectingImageModal = ref(false);
  const selectedWord = ref();

  pack.value = await $api.user.getPack(route.params.slug.toString());
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
