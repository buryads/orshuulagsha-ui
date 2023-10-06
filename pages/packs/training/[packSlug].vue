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
  import { useI18n } from 'vue-i18n';
  import { Ref } from 'vue';
  import { useUserStore } from '~/store/user';
  import { Pack } from '~/repository/modules/user/types';
  import TrainingPacks from '~/components/TrainingPacks.vue';
  import { trainingPackQuiz } from '~/repository/modules/types';
  import { definePageMeta } from '#imports';

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
  pack.value = await $api.user.getPack(route.params.packSlug.toString());
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
