<template>
  <div class="container mt-5">
    <UIBreadcrumbs :pages="pages" />

    <h1 class="title mt-4">{{ $t('training') }}</h1>

    <TrainingPacks
      :questions="questions"
      :is-loading="isLoading"
      :show-new-quiz-button="false"
    />
  </div>
</template>

<script setup lang="ts">
  import type { Ref } from 'vue';
  import type { Pack } from '~/repository/modules/user/types';
  import type { trainingPackQuiz } from '~/repository/modules/types';
  import { useI18n } from 'vue-i18n';
  import { useUserStore } from '~/store/user';
  import TrainingPacks from '~/components/TrainingPacks.vue';
  import { definePageMeta } from '#imports';
  import { useAsyncData } from '#app';

  definePageMeta({
    middleware: 'auth',
  });

  const user = useUserStore().user;
  const { t } = useI18n();
  const localePath = useLocalePath();
  const { $api } = useNuxtApp();
  const pack: Ref<Pack | undefined> = ref(undefined);
  const questions: Ref<trainingPackQuiz[]> = ref([]);
  const isLoading = ref(true);
  const route = useRoute();

  /*[pack.value] = await Promise.all([
    $api.user.getPack(route.params.packSlug.toString()),
    loadQuestions(),
  ]);*/
  const { data } = await useAsyncData('packs', () =>
    $api.user.getPack(route.params.packSlug.toString()),
  );
  pack.value = data.value;
  const pages = [
    { name: t('packsTitle'), to: localePath('/packs'), current: false },
    {
      name: pack.value?.name,
      to: localePath(`/packs/${pack.value?.slug}`),
      current: false,
    },
    {
      name: t('training'),
      current: true,
    },
  ];

  const title = `${t('pack')} ${pack.value?.name} - ${t('training')}`;

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

  async function loadQuestions() {
    try {
      isLoading.value = true;
      questions.value = await $api.user.getPackQuizQuestionsBySlug(
        route.params.packSlug.toString() || '',
      );
    } catch (e) {
      console.error(e);
    } finally {
      isLoading.value = false;
    }
  }

  onBeforeMount(loadQuestions);
</script>
