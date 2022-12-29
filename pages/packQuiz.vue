<template>
  <div class="container mx-auto w-full h-screen justify-center items-center">
    <h1 class="font-bold text-5xl text-center text-indigo-700">
      {{ title }}
    </h1>
    <div class="flex w-full grid grid-flow-row-dense grid-cols-3 bg-white px-12 rounded-lg ">
      <div class="col-span-1 p-3 my-auto">
        <div class="w-full text-center">
          <div class="inline-block mb-5">
            <a v-if="true" href="#"><outline-play-icon class="cursor-pointer w-8 h-8 inline-block" /></a>
            <a v-else href="#"><outline-pause-icon class="cursor-pointer w-8 h-8 inline-block" /></a>
          </div>
        </div>
        <div class="w-full">
          <img class="inline-block center my-auto mx-auto" src="/card-top.jpeg" alt="Sunset in the mountains"></p>
        </div>
      </div>
      <div class="col-span-2 p-3">
        <div v-if="questions.length > 0" class="w-full mt-8">
          <div v-if="idx < count">
            <p class="text-2xl font-bold">{{questions[idx]['question']}}</p>
            <label
              v-for="(answer, index) in questions[idx].answers"
              :key="index"
              :for="index"
              class="block mt-4 border border-gray-300 rounded-lg py-2 px-6 text-lg"
              :class="{'hover:bg-gray-100 cursor-pointer' : selectedAnswer === '', 'bg-green-200' : index === questions[idx].correctAnswer && selectedAnswer !== '', 'bg-red-200' : selectedAnswer === index}"
            >
              <input
                :id="index"
                type="radio"
                class="hidden"
                :value="index"
                @change="answered($event)"
                :disabled="selectedAnswer !== ''"
              />
              {{answer}}
            </label>
          </div>
          <div v-else>
            <h2 class="text-bold text-3xl">Results</h2>
            <div class="flex justify-start space-x-4 mt-6">
              <p>
                Correct Answers:
                <span class="text-2xl text-green-700 font-bold"
                >{{correctAnswers}}</span
                >
              </p>
              <p>
                Wrong Answers:
                <span class="text-2xl text-red-700 font-bold"
                >{{wrongAnswers}}</span
                >
              </p>
            </div>
            <div class="mt-6 flow-root">
              <button
                @click="resetQuiz"
                class="float-right bg-indigo-600 text-white text-sm font-bold tracking-wide rounded-full px-5 py-2"
              >
                Play again
              </button>
            </div>
          </div>
        </div>
        <div v-else class="bg-white p-12 rounded-lg w-full mt-8">
          <p>Wait for loading questions</p>
        </div>
      </div>
      <div class="col-span-3">
        <div class="my-6 flow-root">
          <button
            @click="nextQuestion"
            v-show="selectedAnswer !== '' && idx < count - 1"
            class="float-right bg-indigo-600 text-white text-sm font-bold tracking-wide rounded-full px-5 py-2"
          >
            Next &gt;
          </button>
          <button
            @click="showResults"
            v-show="selectedAnswer !== '' && idx === count - 1"
            class="float-right bg-indigo-600 text-white text-sm font-bold tracking-wide rounded-full px-5 py-2"
          >
            Finish
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
// @ts-nocheck
import Vue from 'vue';
import locales from "~/i18n/locales";

export default Vue.extend({
  data () {
    return {
      title: this.$t('packQuiz'),
      idx: 0,
      selectedAnswer: "",
      correctAnswers: 0,
      wrongAnswers: 0,
      count: 3,
      questions: [],
    }
  },
  head(): any {
    return {
      title:this.$t('quiz'),
      meta: [
        {
          hid: 'description',
          name: 'description',
          content: this.title
        },
        {
          property: 'og:title',
          name: 'title',
          content: this.title
        },
        {
          property: 'og:description',
          name: 'description',
          content: this.$t('localizedForBuryadLanguageGames') + ' ' + this.title
        }
      ]
    }
  },
  watch: {},
  async mounted() {
    await this.loadQuestions();
  },
  methods: {
    async loadQuestions() {
      const {data: {data: questions, meta: {count}}} = await this.$axios.get('/api/api/quiz/questions');
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
      this.selectedAnswer = "";
      document.querySelectorAll("input").forEach((el) => (el.checked = false));
    },
    showResults() {
      this.idx++;
    },
    async resetQuiz() {
      this.questions = [];
      await this.loadQuestions();
      this.idx = 0;
      this.selectedAnswer = "";
      this.correctAnswers = 0;
      this.wrongAnswers = 0;
    },
  }
})
</script>

<style>
</style>
