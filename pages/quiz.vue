<template>
  <div class="container mt-6">
    <h1 class="title">
      {{ $t('quiz') }}
    </h1>

    <Quiz :questions="questions" :is-loading="isLoading" @newQuiz="newGame" />
  </div>
</template>

<script setup lang="ts">
  import { Ref } from 'vue';
  import { quizQuestion } from '~/repository/modules/quiz/types';
  import { useI18n } from 'vue-i18n';

  const { t } = useI18n();

  useHead({
    title: t('quiz'),
    meta: [
      {
        property: 'description',
        name: 'description',
        content: t('quiz'),
      },
      {
        property: 'og:title',
        name: 'title',
        content: t('quiz'),
      },
      {
        property: 'og:description',
        name: 'description',
        content: t('localizedForBuryadLanguageGames') + ' ' + t('quiz'),
      },
    ],
  });

  const { $api } = useNuxtApp();
  const questions: Ref<quizQuestion[]> = ref([]);
  const isLoading = ref(true);

  const loadData = () => {
    isLoading.value = true;
    $api.quiz
      .getQuizQuestions()
      .then((res) => {
        questions.value = res.questions;
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        isLoading.value = false;
      });
  };

  onBeforeMount(() => {
    loadData();
  });

  const newGame = () => {
    loadData();
  };
</script>
