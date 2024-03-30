<template>
  <div class="container mt-6">
    <h1 class="title">Words matcher</h1>

    <section class="mt-2">
      <h2 class="text-xl font-medium text-gray-800">
        A word without translation:
        <b>{{ wordWithoutTranslation?.name || '' }}</b>
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
      <div class="grid gap-6 md:grid-cols-2">
        <div>
          <h2 class="text-xl font-medium text-gray-800">Attach a word</h2>
          <p class="font-medium text-gray-500">
            Type a word in the input below and attach it to the main word. If
            there are no any suggestions create a new one and then attach it.
          </p>
        </div>

        <div class="justify-self-end">
          <UIButton
            @click="skip"
            class="mr-3 bg-bur-navy px-4 text-white transition-opacity hover:opacity-90"
          >
            Skip
          </UIButton>

          <UIButton
            @click="syncWord"
            class="bg-bur-yellow px-4 text-white transition-opacity hover:opacity-90"
            :disabled="selectedWords.length === 0"
          >
            Save
          </UIButton>
        </div>
      </div>

      <div
        class="mt-3 flex flex-col items-start md:flex-row md:space-x-6 md:divide-x-2"
      >
        <div class="relative w-96 max-w-full shrink-0">
          <Transition mode="out-in">
            <IconsSpinner
              v-if="isSearchingWord"
              class="absolute right-8 top-2.5 h-3.5 w-3.5 animate-spin text-neutral-600"
            />
          </Transition>

          <UIInput
            type="search"
            v-model="inputWord"
            @update:modelValue="searchWord"
          />

          <!-- Empty state -->
          <div
            v-if="!foundWordsByInput.length && inputWord && !isSearchingWord"
            class="mt-6 flex flex-col items-center"
          >
            <p class="font-medium text-gray-500">
              There is not such word in the database
            </p>

            <UIButton
              @click="addNewWord"
              class="mt-2 bg-bur-navy px-4 text-white transition-opacity hover:opacity-90"
            >
              add the word to database
            </UIButton>
          </div>

          <!-- Words found after user input value -->
          <ul
            v-if="
              Array.isArray(foundWordsByInput) && foundWordsByInput.length > 0
            "
            class="mt-3 flex max-h-40 flex-col gap-1 overflow-y-auto font-medium text-gray-900 md:max-h-96"
          >
            <li
              v-for="word in foundWordsByInput"
              class="group flex cursor-pointer items-center justify-between rounded-md px-2 py-1 hover:bg-neutral-200"
              :class="
                selectedWordIds.includes(word.id) && 'cursor-auto opacity-30'
              "
              :key="word.id"
              @click="addSuggestedWord(word)"
            >
              <span>{{ word.name }}</span>
              <PlusIcon
                class="hidden h-4 w-4 fill-gray-900 group-hover:block"
              />
            </li>
          </ul>
        </div>

        <div class="mt-6 md:mt-0 md:pl-6">
          <ul class="flex flex-wrap gap-3">
            <li v-for="selectedWord in selectedWords" :key="selectedWord.id">
              <button
                @click="removeSelectedWord(selectedWord.id)"
                class="group relative rounded-md bg-neutral-200 px-6 py-1.5 font-medium text-gray-600"
                :title="`delete word ${selectedWord.name}`"
              >
                {{ selectedWord.name }}

                <XMarkIcon
                  class="absolute right-1.5 top-1/2 hidden h-4 w-4 -translate-y-1/2 cursor-pointer stroke-neutral-600 group-hover:block"
                />
              </button>
            </li>
          </ul>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
  import { useAsyncData } from '#app';
  import { PlusIcon } from '@heroicons/vue/20/solid';
  import type { Word } from '~/repository/modules/types';
  import { XMarkIcon } from '@heroicons/vue/24/outline';

  useHead({
    title: 'Words matcher',
  });

  const { $api } = useNuxtApp();
  const route = useRoute();
  const router = useRouter();
  const wordWithoutTranslation = ref<Word | null>(null);
  const inputWord = ref();
  const foundWordsByInput = ref([]);
  const selectedWords = ref<Word[]>([]);
  const isSearchingWord = ref(false);

  const selectedWordIds = computed(
    () => selectedWords.value.flatMap((word) => word.id) || [],
  );

  const { data } = await useAsyncData('words-matcher', async () => {
    if (route.query.id && !isNaN(+route.query.id)) {
      return await $api.admin.getWord(+route.query.id, 'bur', 'ru');
    }

    return await $api.admin.getRandomRelationshipLessWord('bur', 'ru');
  });

  wordWithoutTranslation.value = data.value;
  selectedWords.value = data.value.ru_words;
  router.replace({
    query: {
      id: data.value.id,
    },
  });

  let abortController = new AbortController();
  // @ts-ignore @todo Timeout type cannot be imported for some reason
  let searchTimeout;

  async function searchWord(input: string) {
    if (input.trim() === '') {
      foundWordsByInput.value = [];
      return;
    }

    isSearchingWord.value = true;
    abortController.abort();
    abortController = new AbortController();

    // @ts-ignore @todo Timeout type cannot be imported for some reason
    clearTimeout(searchTimeout);

    searchTimeout = setTimeout(async () => {
      try {
        foundWordsByInput.value = await $api.admin.getWords(
          input,
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
  function addSuggestedWord(word: Word) {
    if (selectedWordIds.value.includes(word.id)) {
      return;
    }

    selectedWords.value.push(word);
  }

  function removeSelectedWord(wordId: number) {
    selectedWords.value = selectedWords.value.filter(
      (word) => word.id !== wordId,
    );
  }

  async function addNewWord() {
    await $api.admin.addNewWordToDatabase(inputWord.value, 'bur', 'ru');
    await searchWord(inputWord.value);
  }

  async function syncWord() {
    if (!wordWithoutTranslation.value) return;

    wordWithoutTranslation.value!.ru_words =
      wordWithoutTranslation.value!.ru_words.concat(selectedWords.value);
    await $api.admin.syncWord(wordWithoutTranslation.value, 'bur', 'ru');
  }

  async function skip() {
    wordWithoutTranslation.value =
      (await $api.admin.getRandomRelationshipLessWord('bur', 'ru')) as Word;

    await router.replace({
      query: {
        id: wordWithoutTranslation.value.id,
      },
    });
  }
</script>
