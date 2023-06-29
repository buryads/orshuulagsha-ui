<template>
  <div class="container mt-5">
    <Breadcrumbs :pages="pages" />

    <h1 class="title mt-4">{{ $t('training') }}</h1>

    <Quiz
      :questions="questions"
      :is-loading="isLoading"
      :show-new-quiz-button="false"
    />
  </div>
</template>

<script setup lang="ts">
  import { useI18n } from 'vue-i18n';
  import { Ref } from 'vue';
  import { packType } from '~/repository/modules/packs/types.js';
  import Breadcrumbs from '~/components/UI/Breadcrumbs.vue';
  import { useUserStore } from '~/store/user';
  import { quizQuestion } from '~/repository/modules/quiz/types';

  const user = useUserStore().user;
  const { t } = useI18n();
  const localePath = useLocalePath();
  const { $api } = useNuxtApp();
  const pack: Ref<Partial<packType>> = ref({});
  const questions: Ref<quizQuestion[]> = ref([]);
  const isLoading = ref(true);
  const route = useRoute();

  pack.value = await $api.packs.getPack(route.params.packSlug.toString());
  const pages = [
    { name: t('packsTitle'), to: localePath('/packs'), current: false },
    {
      name: pack.value.name,
      to: localePath(`/packs/${pack.value.slug}`),
      current: false,
    },
    {
      name: t('training'),
      current: true,
    },
  ];

  const title = `${t('pack')} ${pack.value.name} - ${t('training')}`;

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
      questions.value = await $api.user.getUserPackQuizQuestionsByPack(
        pack.value.slug || '',
      );
    } catch (e) {
      console.error(e);
    } finally {
      isLoading.value = false;
    }
  }

  onBeforeMount(loadQuestions);
</script>
