<template>
  <div class="container mt-6">
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

          <UIBuryadInput
            id="input-word"
            v-model="inputValue"
            :placeholder="
              $t(sourceLanguage === 'bur' ? 'inputBurText' : 'inputRuText')
            "
            class="mt-2"
            :show-buryad-letters="sourceLanguage === 'bur'"
            @change="onTranslate"
          />
        </UILabel>

        <UIButton
          class="bg-bur-yellow text-white transition-opacity hover:opacity-90"
          :disabled="isLoading"
          @click="onTranslate"
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

      <div class="mt-8">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <h3 class="text-base font-medium text-gray-700 md:text-xl">
            {{ $t('trainingWordsSet') }}
          </h3>

          <NuxtLink
            :to="localePath('/packs')"
            class="flex items-center gap-1 border-b border-transparent text-sm font-medium text-gray-500 transition hover:border-gray-500"
          >
            <span>{{ $t('moreWordSets') }}</span>
            <ArrowUpRightIcon class="h-4 w-4 fill-gray-500" />
          </NuxtLink>
        </div>

        <ul
          role="list"
          class="mt-6 grid gap-x-4 gap-y-8 sm:grid-cols-2 sm:gap-x-6 md:grid-cols-3 lg:grid-cols-4 xl:gap-x-8"
        >
          <li v-for="pack in packs" :key="pack.id" class="relative">
            <UIPack :pack="pack" :pack-url="`/public-packs/${pack.slug}`" />
          </li>
        </ul>
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
  import { ArrowUpRightIcon } from '@heroicons/vue/20/solid';
  import { useAsyncData, useRoute, useRouter } from '#app';
  import type { queryParams, translationLanguage } from '~/types/types';

  const { $api } = useNuxtApp();
  const { t } = useI18n();
  const localePath = useLocalePath();
  const route = useRoute();
  const router = useRouter();
  const initialQuery = route.query as queryParams;

  useHead({
    title: t('appName'),
    meta: [
      {
        property: 'description',
        name: 'description',
        content: t('appName'),
      },
    ],
  });

  const sourceLanguage: Ref<translationLanguage> = ref(
    initialQuery.source || 'ru',
  );
  const inputValue = ref(initialQuery.q || '');
  const result: Ref<Partial<translationType>> = ref({});
  const translationType = computed(() =>
    sourceLanguage.value === 'ru' ? 'ru2bur' : 'bur2ru',
  );
  const isLoading = ref(false);
  const showKeyboard = ref(false);
  const packs = ref();

  const toggleLanguage = () => {
    sourceLanguage.value = sourceLanguage.value === 'bur' ? 'ru' : 'bur';
  };

  const { data } = await useAsyncData('public-packs', () =>
    $api.user.getPublicPacks({ per_page: 4, rand: 1 }),
  );

  packs.value = data.value;

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

  const onTranslate = async () => {
    await translate();
    const query: queryParams = {
      q: inputValue.value,
    };
    if (sourceLanguage.value === 'bur') {
      query.source = 'bur';
    }

    router.push({ query });
  };

  watch(route, async () => {
    const query = route.query as queryParams;

    if (query.q) {
      inputValue.value = query.q;
    }

    if (query.source) {
      sourceLanguage.value = query.source;
    }

    await translate();
  });

  onMounted(async () => {
    if (initialQuery.q?.trim() !== '') {
      await translate();
    }
  });
</script>
