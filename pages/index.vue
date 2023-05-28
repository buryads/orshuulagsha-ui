<template>
  <div class="container mt-4">
    <div class="mx-auto flex min-h-[calc(100vh-100px)] flex-col">
      <div class="flex flex-col gap-2">
        <UILabel>
          <span
            class="flex w-full select-none items-center gap-3 text-gray-700"
          >
            <span
              class="flex cursor-pointer items-center gap-2 text-base"
              @click="toggleLanguage"
            >
              {{ sourceLanguage === 'bur' ? $t('buryad') : $t('russian') }}
              –
              {{
                sourceLanguage === 'bur'
                  ? $t('russianDictionary')
                  : $t('buryadDictionary')
              }}
            </span>

            <IconsExchange
              class="ml-auto h-4 w-4 cursor-pointer"
              @click="toggleLanguage"
            />

            <IconsKeyboard
              class="h-6 w-6 cursor-pointer"
              @click="showKeyboard = !showKeyboard"
            />
          </span>

          <UIInput
            id="input-word"
            v-model="inputValue"
            :placeholder="$t('inputText')"
            class="mt-2"
            autofocus
            @change="translate"
          />
        </UILabel>

        <UIButton
          class="bg-bur-yellow transition-opacity hover:opacity-90"
          :disabled="isLoading"
          @click="translate"
        >
          <span class="relative">
            {{ $t('translate') }}
            <span class="absolute left-full top-1/2 -translate-y-1/2">
              <IconsSpinner
                v-if="isLoading"
                class="ml-1.5 h-3.5 w-3.5 animate-spin"
              />
            </span>
          </span>
        </UIButton>

        <BurlangKeyboard v-if="showKeyboard" />
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

      <SectionDiscord class="my-5" />

      <DailyTranslationsAmount class="mt-auto text-center" />

      <SectionSocialInfo class="mt-4 text-center text-neutral-400" />
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { Ref } from 'vue';
  import type { translationType } from '~/repository/modules/translate/types';
  import { useI18n } from 'vue-i18n';

  const { $api } = useNuxtApp();
  const { t } = useI18n();

  useHead({
    title: t('dictionary'),
  });

  type translationLanguage = 'bur' | 'ru';
  const sourceLanguage: Ref<translationLanguage> = ref('ru');
  const inputValue = ref('');
  const result: Ref<Partial<translationType>> = ref({});
  const translationType = computed(() =>
    sourceLanguage.value === 'ru' ? 'ru2bur' : 'bur2ru',
  );
  const isLoading = ref(false);
  const showKeyboard = ref(false);

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
