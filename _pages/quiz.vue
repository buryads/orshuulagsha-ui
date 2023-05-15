<template>
  <div class="flex h-screen w-full items-center justify-center">
    <div class="w-full max-w-xl p-3">
      <h1 class="text-center text-5xl font-bold text-indigo-700">
        {{ title }}
      </h1>
      <div
        v-if="questions.length > 0"
        class="mt-8 w-full rounded-lg bg-white p-12">
        <div v-if="idx < count">
          <p class="text-2xl font-bold">{{ questions[idx]['question'] }}</p>
          <label
            v-for="(answer, index) in questions[idx].answers"
            :key="index"
            :for="index"
            class="mt-4 block rounded-lg border border-gray-300 px-6 py-2 text-lg"
            :class="{
              'cursor-pointer hover:bg-gray-100': selectedAnswer === '',
              'bg-green-200':
                index === questions[idx].correctAnswer && selectedAnswer !== '',
              'bg-red-200': selectedAnswer === index,
            }">
            <input
              :id="index"
              type="radio"
              class="hidden"
              :value="index"
              @change="answered($event)"
              :disabled="selectedAnswer !== ''" />
            {{ answer }}
          </label>
          <div class="mt-6 flow-root">
            <button
              @click="nextQuestion"
              v-show="selectedAnswer !== '' && idx < count - 1"
              class="float-right rounded-full bg-indigo-600 px-5 py-2 text-sm font-bold tracking-wide text-white">
              Next &gt;
            </button>
            <button
              @click="showResults"
              v-show="selectedAnswer !== '' && idx === count - 1"
              class="float-right rounded-full bg-indigo-600 px-5 py-2 text-sm font-bold tracking-wide text-white">
              Finish
            </button>
          </div>
        </div>
        <div v-else>
          <h2 class="text-bold text-3xl">Results</h2>
          <div class="mt-6 flex justify-start space-x-4">
            <p>
              Correct Answers:
              <span class="text-2xl font-bold text-green-700">
                {{ correctAnswers }}
              </span>
            </p>
            <p>
              Wrong Answers:
              <span class="text-2xl font-bold text-red-700">
                {{ wrongAnswers }}
              </span>
            </p>
          </div>
          <div class="mt-6 flow-root">
            <button
              @click="resetQuiz"
              class="float-right rounded-full bg-indigo-600 px-5 py-2 text-sm font-bold tracking-wide text-white">
              Play again
            </button>
          </div>
        </div>
      </div>
      <div v-else class="mt-8 w-full rounded-lg bg-white p-12">
        <p>Wait for loading questions</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  // @ts-nocheck
  import Vue from 'vue';
  import locales from '~/_i18n/locales';

  export default Vue.extend({
    data() {
      return {
        title: this.$t('quiz'),
        idx: 0,
        selectedAnswer: '',
        correctAnswers: 0,
        wrongAnswers: 0,
        count: 3,
        questions: [],
      };
    },
    head(): any {
      return {
        title: this.$t('quiz'),
        meta: [
          {
            hid: 'description',
            name: 'description',
            content: this.title,
          },
          {
            property: 'og:title',
            name: 'title',
            content: this.title,
          },
          {
            property: 'og:description',
            name: 'description',
            content:
              this.$t('localizedForBuryadLanguageGames') + ' ' + this.title,
          },
        ],
      };
    },
    watch: {},
    async mounted() {
      await this.loadQuestions();
    },
    methods: {
      async loadQuestions() {
        const {
          data: {
            data: questions,
            meta: { count },
          },
        } = await this.$axios.get('/api/quiz/questions');
        this.questions = questions;
        this.count = count;
      },
      answered(e) {
        this.selectedAnswer = e.target.value;
        if (this.selectedAnswer == this.questions[this.idx].correctAnswer) {
          this.correctAnswers++;
        } else {
          this.wrongAnswers++;
        }
      },
      nextQuestion() {
        this.idx++;
        this.selectedAnswer = '';
        document
          .querySelectorAll('input')
          .forEach((el) => (el.checked = false));
      },
      showResults() {
        this.idx++;
      },
      async resetQuiz() {
        this.questions = [];
        await this.loadQuestions();
        this.idx = 0;
        this.selectedAnswer = '';
        this.correctAnswers = 0;
        this.wrongAnswers = 0;
      },
    },
  });
</script>

<style></style>
