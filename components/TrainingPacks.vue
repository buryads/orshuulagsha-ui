<template>
  <div class="mt-6 rounded-lg bg-white p-6 pb-10">
    <div
      v-if="isLoading"
      class="text-center font-bold text-gray-900 sm:text-xl"
    >
      {{ $t('loading') }}...
    </div>

    <template v-if="!isLoading && currentQuestionIndex < questions?.length">
      <div
        class="flex items-center justify-center gap-2 text-center font-bold text-gray-900 sm:text-xl"
      >
        {{ questions?.[currentQuestionIndex]?.correctAnswer?.name }}

        <Speech
          ref="audio"
          v-if="
            questions?.[currentQuestionIndex]?.correctAnswer?.speechs?.length >
            0
          "
          :speech="questions[currentQuestionIndex].correctAnswer.speechs[0]"
        />
      </div>

      <div
        class="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4"
      >
        <div
          v-if="
            questions?.[currentQuestionIndex]?.correctAnswer?.images?.[0]?.url
          "
          class="h-60 w-60 overflow-hidden rounded sm:h-72 sm:w-72"
        >
          <div
            class="h-full w-full bg-cover bg-center"
            :class="[!selectedAnswer && 'blur-xl']"
            :style="{
              backgroundImage: `url(${getWordImage(
                questions[currentQuestionIndex].correctAnswer,
              )})`,
            }"
          />
        </div>

        <div class="flex w-full flex-col gap-2 md:w-auto md:px-0">
          <button
            v-for="word in questions?.[currentQuestionIndex]?.answers?.data"
            :key="word"
            :class="[
              selectedAnswer ===
                questions?.[currentQuestionIndex]?.correctAnswer.id &&
                selectedAnswer === word.id &&
                '!bg-green-500 !text-white',
              selectedAnswer !==
                questions?.[currentQuestionIndex]?.correctAnswer.id &&
                selectedAnswer === word.id &&
                '!bg-red-500 !text-white',
            ]"
            class="w-full rounded-md bg-gray-200 px-4 py-2 text-sm text-gray-800 hover:bg-gray-300 md:w-96 md:truncate md:text-base"
            @click="handleAnswer(word.id)"
            :disabled="disabled"
            :title="word.translations.map((t) => t.name).join(', ')"
          >
            {{
              word.ru_words?.[0]?.name ||
              word.translations.map((t) => t.name).join(', ')
            }}
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
          v-for="(item, i) in questions"
          :key="item"
          class="mt-3 font-medium first:mt-0"
        >
          <div class="flex items-center gap-2">
            <div>
              {{ i + 1 }}. {{ item.correctAnswer.name }}

              <div class="font-light">
                {{ $t('yourAnswer') }}:

                <span
                  class="underline"
                  :class="[
                    item.yourAnswer === item.correctAnswer.id
                      ? 'text-green-500'
                      : 'text-red-500',
                  ]"
                >
                  {{
                    item.answers.data.find(
                      (word) => word.id === item.yourAnswer,
                    ).name
                  }}
                </span>
              </div>

              <div class="font-light">
                {{ $t('correctAnswer') }}:
                <span class="text-green-500 underline">
                  {{
                    item.correctAnswer.translations
                      .map((t) => t.name)
                      .join(', ')
                  }}
                </span>
              </div>
            </div>

            <div class="ml-auto shrink-0">
              <IconsCheckmark
                v-if="item.yourAnswer === item.correctAnswer.id"
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
  import type { trainingPackQuiz } from '~/repository/modules/types';
  import getWordImage from '~/utils/getWordImage';

  interface Props {
    questions: trainingPackQuiz[];
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
  const audio = ref();

  const handleAnswer = (wordID: number) => {
    disabled.value = true;
    selectedAnswer.value = wordID;
    props.questions[currentQuestionIndex.value].yourAnswer = wordID;
    if (
      wordID === props.questions[currentQuestionIndex.value].correctAnswer.id
    ) {
      correctAnswers.value++;
    } else {
      wrongAnswers.value++;
    }

    setTimeout(() => {
      currentQuestionIndex.value++;
      selectedAnswer.value = null;
      disabled.value = false;
    }, 2000);
  };

  const tryAgain = () => {
    currentQuestionIndex.value = 0;
    correctAnswers.value = 0;
    wrongAnswers.value = 0;
  };

  watchEffect(() => {
    if (audio.value) {
      audio.value.playWithoutPause();
    }
  });
</script>
