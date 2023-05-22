<template>
  <div class="container mt-2">
    <div class="mx-auto flex min-h-[calc(100vh-100px)] max-w-4xl flex-col">
      <div class="flex flex-col gap-2">
        <Label>
          <span class="text-base text-neutral-600">
            {{ sourceLanguage === 'bur' ? $t('buryad') : $t('russian') }}
            <span
              class="inline-block h-5 w-5 cursor-pointer rounded-full text-center text-blue-300 hover:bg-gray-200 hover:text-blue-600"
              @click="toggleLanguage"
            >
              ⇄
            </span>
            {{
              sourceLanguage === 'bur'
                ? $t('russianDictionary')
                : $t('buryadDictionary')
            }}
          </span>

          <Input
            v-model="inputValue"
            :placeholder="$t('inputText')"
            class="mt-2"
            autofocus
            @change="translate"
          />
        </Label>

        <Button
          class="bg-bur-yellow transition-opacity hover:opacity-90"
          @click="translate"
        >
          <span class="relative">
            {{ $t('translate') }}
            <span class="absolute left-full top-1/2 -translate-y-1/2">
              <Spinner
                v-if="isLoading"
                class="ml-1.5 h-3.5 w-3.5 animate-spin"
              />
            </span>
          </span>
        </Button>
      </div>

      <div class="mt-3">
        <TranslationsList
          :title="$t('translates')"
          :items="result.exactTranslations || []"
        />

        <TranslationsList
          :title="$t('includes')"
          :items="result.occurrences || []"
        />

        <TranslationsList
          :title="$t('possibleTranslates')"
          :items="result.possibleTranslations || []"
        />
      </div>

      <DiscordSection class="my-5" />

      <DailyTranslationsAmount class="mt-auto text-center" />

      <SocialInfo class="mt-4 text-center text-neutral-400" />
    </div>
  </div>
</template>

<script setup lang="ts">
  import Label from '~/components/UI/Label.vue';
  import Input from '~/components/UI/Input.vue';
  import Button from '~/components/UI/Button.vue';
  import TranslationsList from '~/components/TranslationsList.vue';
  import Spinner from 'assets/icons/Spinner.vue';
  import type { Ref } from 'vue';
  import type { translationType } from '~/repository/modules/translate/types';
  import DiscordSection from '~/components/DiscordSection.vue';
  import DailyTranslationsAmount from '~/components/DailyTranslationsAmount.vue';
  import InfoFooter from '~/components/Sections/SocialInfo.vue';
  import SocialInfo from '~/components/Sections/SocialInfo.vue';

  const { $api } = useNuxtApp();

  useHead({
    title: 'Словарь',
  });

  type translationLanguage = 'bur' | 'ru';
  const sourceLanguage: Ref<translationLanguage> = ref('ru');
  const inputValue = ref('');
  const result: Ref<Partial<translationType>> = ref({});
  const translationType = computed(() =>
    sourceLanguage.value === 'ru' ? 'ru2bur' : 'bur2ru',
  );
  const isLoading = ref(false);

  const toggleLanguage = () => {
    sourceLanguage.value = sourceLanguage.value === 'bur' ? 'ru' : 'bur';
  };

  const translate = async () => {
    if (inputValue.value.trim() === '') return;

    try {
      isLoading.value = true;
      result.value = await $api.translate.translateWord(
        translationType.value,
        inputValue.value,
      );
    } catch (e) {
      console.error(e);
    } finally {
      isLoading.value = false;
    }
  };
</script>
