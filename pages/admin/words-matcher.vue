<template>
  <div class="container mt-6">
    <h1 class="title">Words matcher</h1>

    <section class="mt-2">
      <h2 class="text-xl font-medium text-gray-800">
        A word without translation: <b>{{ wordWithoutTranslation.name }}</b>
      </h2>

      <p class="mt-2 font-medium text-gray-600">
        Possible translations:
        <b>
          {{
            wordWithoutTranslation.translations.map((t) => t.name).join('\n ')
          }}
        </b>
      </p>
    </section>

    <section class="mt-6">
      <h2 class="text-xl font-medium text-gray-800">Attach a word</h2>
      <p class="font-medium text-gray-500">
        Type a word in the input below and attach it to the main word. If there
        are no any suggestions create a new one and then attach it.
      </p>

      <UIInput
        type="search"
        v-model="inputWord"
        class="mt-3 !w-96"
        @update:modelValue="searchWord"
      />

      <ul
        v-if="Array.isArray(foundWordsByInput) && foundWordsByInput.length > 0"
        class="mt-3 flex max-h-96 w-96 flex-col gap-1 overflow-y-auto font-medium text-gray-900"
      >
        <li
          v-for="word in foundWordsByInput"
          class="group flex cursor-pointer items-center justify-between rounded-md px-2 py-1 hover:bg-neutral-200"
          :key="word.id"
          @click="addSuggestedWord(word.id)"
        >
          <span>{{ word.name }}</span>
          <PlusIcon class="hidden h-4 w-4 fill-gray-900 group-hover:block" />
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup lang="ts">
  import { useAsyncData } from '#app';
  import { PlusIcon } from '@heroicons/vue/20/solid';
  import type { Word } from '~/repository/modules/types';

  useHead({
    title: 'Logs',
  });

  const { $api } = useNuxtApp();
  const route = useRoute();
  const wordWithoutTranslation = ref();
  const inputWord = ref();
  const foundWordsByInput = ref();
  const selectedWords = ref<Word[]>([]);
  const isSearchingWord = ref(false);

  const { data } = await useAsyncData('words-matcher', () =>
    $api.admin.getRandomRelationshipLessWord('bur', 'ru'),
  );

  wordWithoutTranslation.value = data.value;
  let abortController = new AbortController();
  // @ts-ignore @todo Timeout type cannot be imported for some reason
  let searchTimeout;

  async function searchWord(input: string) {
    inputWord.value = input;
    abortController.abort();
    abortController = new AbortController();

    // @ts-ignore @todo Timeout type cannot be imported for some reason
    clearTimeout(searchTimeout);

    searchTimeout = setTimeout(async () => {
      try {
        isSearchingWord.value = true;
        foundWordsByInput.value = await $api.admin.getWords(
          inputWord.value,
          'bur',
          'ru',
          abortController.signal,
        );
      } catch (e) {
        console.error(e);
      } finally {
        isSearchingWord.value = false;
      }
    }, 300);
  }

  // @todo check if the type if correct
  async function addSuggestedWord(word: Word) {
    selectedWords.value.push(word);
  }
</script>
