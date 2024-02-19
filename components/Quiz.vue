<template>
  <div class="mt-6 max-w-2xl rounded-lg bg-white p-3 sm:p-6">
    <div
      v-if="isLoading"
      class="text-center font-bold text-gray-900 sm:text-xl"
    >
      {{ $t('loading') }}...
    </div>

    <template v-if="!isLoading && currentQuestionIndex < questions?.length">
      <div class="text-center font-bold text-gray-900 sm:text-xl">
        {{ questions?.[currentQuestionIndex]?.question }}
      </div>

      <div class="mt-6">
        <div class="grid gap-4 sm:grid-cols-2">
          <button
            v-for="(answer, i) in questions?.[currentQuestionIndex]?.answers"
            :key="answer"
            :class="[
              selectedAnswer ===
                questions?.[currentQuestionIndex]?.correctAnswer &&
                selectedAnswer === i &&
                '!bg-green-500 !text-white',
              selectedAnswer !==
                questions?.[currentQuestionIndex]?.correctAnswer &&
                selectedAnswer === i &&
                '!bg-red-500 !text-white',
            ]"
            class="rounded-md bg-gray-200 px-4 py-2 text-sm text-gray-800 hover:bg-gray-300 md:text-base"
            @click="handleAnswer(i)"
            :disabled="disabled"
          >
            {{ answer }}
          </button>
        </div>
      </div>
    </template>

    <div v-if="!isLoading && currentQuestionIndex >= questions?.length">
      <div class="text-center font-bold text-gray-900 sm:text-xl">
        {{ $t('results') }}
      </div>
      <div class="text-green-500">
        Correct answers: <span class="font-bold">{{ correctAnswers }}</span>
      </div>

      <div class="text-red-500">
        Wrong answers:
        <span class="font-bold">{{ wrongAnswers }}</span>
      </div>

      <ul class="mt-4">
        <li
          v-for="(answer, i) in questions"
          :key="answer"
          class="mt-3 font-medium first:mt-0"
        >
          <div class="flex items-center gap-2">
            <div>
              {{ i + 1 }}. {{ answer.question }}

              <div class="font-light">
                {{ $t('yourAnswer') }}:

                <span
                  class="underline"
                  :class="[
                    answer.yourAnswer === answer.correctAnswer
                      ? 'text-green-500'
                      : 'text-red-500',
                  ]"
                >
                  {{ answer.answers[answer.yourAnswer] }}
                </span>
              </div>

              <div class="font-light">
                {{ $t('correctAnswer') }}:
                <span class="text-green-500 underline">
                  {{ answer.answers[answer.correctAnswer] }}
                </span>
              </div>
            </div>

            <div class="ml-auto shrink-0">
              <IconsCheckmark
                v-if="answer.yourAnswer === answer.correctAnswer"
                class="h-7 w-7 stroke-green-500"
              />
              <IconsClose v-else class="ml-auto h-7 w-7 stroke-red-500" />
            </div>
          </div>
        </li>
      </ul>

      <div class="mt-6 flex justify-end gap-3">
        <button
          class="rounded-md bg-gray-200 px-4 py-2 text-sm text-gray-800 hover:bg-gray-300 md:text-base"
          @click="tryAgain"
        >
          {{ $t('tryAgain') }}
        </button>

        <button
          v-if="showNewQuizButton"
          class="rounded-md bg-gray-200 px-4 py-2 text-sm text-gray-800 hover:bg-gray-300 md:text-base"
          @click="
            () => {
              tryAgain();
              $emit('newQuiz');
            }
          "
        >
          {{ $t('newWords') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import type { Ref } from 'vue';
  import type { quizQuestion } from '~/repository/modules/quiz/types';

  interface Props {
    questions: quizQuestion[];
    isLoading: boolean;
    showNewQuizButton: boolean;
  }

  const props = withDefaults(defineProps<Props>(), {
    showNewQuizButton: true,
  });
  defineEmits(['newQuiz']);

  const correctAnswers = ref(0);
  const wrongAnswers = ref(0);
  const selectedAnswer: Ref<number | null> = ref(null);
  const currentQuestionIndex = ref(0);
  const disabled = ref(false);

  const handleAnswer = (index: number) => {
    disabled.value = true;
    selectedAnswer.value = index;
    props.questions[currentQuestionIndex.value].yourAnswer = index;
    if (index === props.questions[currentQuestionIndex.value].correctAnswer) {
      correctAnswers.value++;
    } else {
      wrongAnswers.value++;
    }

    setTimeout(() => {
      currentQuestionIndex.value++;
      selectedAnswer.value = null;
      disabled.value = false;
    }, 1000);
  };

  const tryAgain = () => {
    currentQuestionIndex.value = 0;
    correctAnswers.value = 0;
    wrongAnswers.value = 0;
  };
</script>
