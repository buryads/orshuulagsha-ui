<template>
  <div class="container mx-auto w-full h-screen justify-center items-center">
    <h1 class="font-bold text-5xl text-center text-indigo-700">
      {{ title }}
    </h1>
    <div class="flex w-full grid grid-flow-row-dense grid-cols-3 bg-white px-12 rounded-lg ">
      <div class="col-span-1 p-3 my-auto">
        <div class="w-full text-center">
          <Speech v-if="questions && questions.length > 0 && questions[idx] && questions[idx].correctAnswer.speechs && questions[idx]['correctAnswer'].speechs.length > 0" :speech="questions[idx]['correctAnswer'].speechs[0]"/>
        </div>
        <div class="w-full">
          <img
            v-if="questions && questions.length > 0 && questions[idx] && questions[idx]['correctAnswer'].images && questions[idx]['correctAnswer'].images.length > 0"
            class="inline-block center my-auto mx-auto"
            :src="extractDefaultBurImageFromBurWord(questions[idx]['correctAnswer'])"
            :class="{'blur': questions && questions.length > 0 && questions[idx] && !questions[idx]['correctAnswer'].answered}"
          />
          <img v-else class="inline-block center my-auto mx-auto" :class="{'blur': questions && questions.length > 0 && questions[idx] && !questions[idx]['correctAnswer'].answered}" src="/card-top.jpeg"/>
        </div>
      </div>
      <div class="col-span-2 p-3">
        <div v-if="questions.length > 0" class="w-full mt-8">
          <div v-if="idx < count">
            <p class="text-2xl font-bold">{{questions[idx]['correctAnswer'].name}}</p>
            <label
              v-for="(answer, index) in questions[idx].answers.data"
              :key="index"
              :for="index"
              class="block mt-4 border border-gray-300 rounded-lg py-2 px-6 text-lg relative"
              :class="{'hover:bg-gray-100 cursor-pointer' : selectedAnswer === '', 'bg-green-200' : index === questions[idx].correctAnswer.name && selectedAnswer !== '', 'bg-red-200' : selectedAnswer === index}"
              @click="answered({target: {value: index}})"
            >
              <input
                :id="index"
                type="radio"
                class="hidden"
                :value="index"
                @change="answered($event)"
                :disabled="!selectedAnswer"
              />
              {{ extractTranslation(questions[idx].answers.data[index]) }}
              <outline-emoji-happy-icon v-if="selectedAnswer === answer.name && questions && questions.length > 0 && questions[idx]['correctAnswer'].answered && questions[idx]['correctAnswer'].correctAnswered" class="w-5 m-5 inline-block absolute right-0 mt-1 mr-2 text-green-500 hover:bg-gray-300 rounded cursor-pointer"/>
              <outline-emoji-sad-icon v-if="selectedAnswer === answer.name && questions && questions.length > 0 && questions[idx]['correctAnswer'].answered && !questions[idx]['correctAnswer'].correctAnswered" class="w-5 m-5  inline-block absolute right-0 mt-1 mr-2 text-red-500 hover:bg-gray-300 rounded cursor-pointer"/>
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
                Train again <outline-refresh-icon class="w-8 inline-block"/>
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
            Next  <outline-arrow-circle-right-icon class="w-8 inline-block"/>
          </button>
          <button
            @click="showResults"
            v-show="selectedAnswer !== '' && idx === count - 1"
            class="float-right bg-indigo-600 text-white text-sm font-bold tracking-wide rounded-full px-5 py-2"
          >
            Finish <outline-badge-check-icon class="w-8 inline-block"/>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
// @ts-nocheck
import Vue from 'vue';
import Speech from "~/components/Speech.vue";
import extractDefaultBurImageFromBurWord from "~/utils/extractDefaultBurImageFromBurWord";

export default Vue.extend({
  components: {Speech},
  data () {
    return {
      idx: 0,
      selectedAnswer: "",
      correctAnswers: 0,
      wrongAnswers: 0,
      count: 3,
      questions: [],
      pack: {}
    }
  },
  computed: {
    packName() {
      return this.$route.params.packName;
    },
    title () {
      return `${this.pack?.name}`;
    }
  },
  head(): any {
    return {
      title: `${this.pack?.name} - ${this.$t('appName')}`,
      meta: [
        {
          hid: 'description',
          name: 'description',
          content: this.pack?.description
        },
        {
          property: 'og:title',
          name: 'title',
          content: this.title
        },
        {
          property: 'og:description',
          name: 'description',
          content: this.pack?.description
        }
      ]
    }
  },
  watch: {},
  async mounted() {
    await this.loadQuestions();
    await this.loadPack();
  },
  methods: {
    extractDefaultBurImageFromBurWord,
    async loadPack () {
      const { data } = await this.$axios.$get(`/api/user/packs/${this.packName}/by-slug`);
      this.pack = data;
    },
    async loadQuestions() {
      const {data: questions, meta: {count}} = await this.$axios.$get(`/api/user/packs/${this.packName}/by-slug/questions`);
      this.questions = questions;
      this.count = count;
      console.log(questions, count)
    },
    answered(e) {
      if (this.questions[this.idx].correctAnswer.answered) {
        return;
      }
      this.selectedAnswer = this.questions[this.idx].answers.data[e.target.value].name;
      this.questions[this.idx].correctAnswer.answered = true;
      if (this.selectedAnswer == this.questions[this.idx].correctAnswer.name) {
        this.questions[this.idx].correctAnswer.correctAnswered = true;
        this.correctAnswers++;
      } else {
        this.questions[this.idx].correctAnswer.correctAnswered = false;
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
    extractTranslation (word) {
      if (word.ru_words && word.ru_words.length) {
        return word.ru_words[0].name
      }
      if (word.translations && word.translations.length > 0) {
        return word.translations[0].name
      }
      return '...';
    }
  }
})
</script>

<style>
  .blur {
    filter: blur(1.5rem);
  }
</style>
