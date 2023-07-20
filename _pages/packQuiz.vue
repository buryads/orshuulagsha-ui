<template>
  <div class="container mx-auto h-screen w-full items-center justify-center">
    <h1 class="text-center text-5xl font-bold text-indigo-700">
      {{ title }}
    </h1>
    <div
      class="flex grid w-full grid-flow-row-dense grid-cols-3 rounded-lg bg-white px-12"
    >
      <div class="col-span-1 my-auto p-3">
        <div class="w-full text-center">
          <Speech
            v-if="
              questions &&
              questions.length > 0 &&
              questions[idx] &&
              questions[idx].correctAnswer.speechs &&
              questions[idx]['correctAnswer'].speechs.length > 0
            "
            :speech="questions[idx]['correctAnswer'].speechs[0]"
          />
        </div>
        <div class="w-full">
          <img
            v-if="
              questions &&
              questions.length > 0 &&
              questions[idx] &&
              questions[idx]['correctAnswer'].images &&
              questions[idx]['correctAnswer'].images.length > 0
            "
            class="center mx-auto my-auto inline-block"
            :src="
              extractDefaultBurImageFromBurWord(questions[idx]['correctAnswer'])
            "
            :class="{
              blur:
                questions &&
                questions.length > 0 &&
                questions[idx] &&
                !questions[idx]['correctAnswer'].answered,
            }"
          />
          <img
            v-else
            class="center mx-auto my-auto inline-block"
            :class="{
              blur:
                questions &&
                questions.length > 0 &&
                questions[idx] &&
                !questions[idx]['correctAnswer'].answered,
            }"
            src="/images/card-top.jpeg"
          />
        </div>
      </div>
      <div class="col-span-2 p-3">
        <div v-if="questions.length > 0" class="mt-8 w-full">
          <div v-if="idx < count">
            <p class="text-2xl font-bold">
              {{ questions[idx]['correctAnswer'].name }}
            </p>
            <label
              v-for="(answer, index) in questions[idx].answers.data"
              :key="index"
              :for="index"
              class="relative mt-4 block rounded-lg border border-gray-300 px-6 py-2 text-lg"
              :class="{
                'cursor-pointer hover:bg-gray-100': selectedAnswer === '',
                'bg-green-200':
                  index === questions[idx].correctAnswer.name &&
                  selectedAnswer !== '',
                'bg-red-200': selectedAnswer === index,
              }"
              @click="answered({ target: { value: index } })"
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
              <outline-emoji-happy-icon
                v-if="
                  selectedAnswer === answer.name &&
                  questions &&
                  questions.length > 0 &&
                  questions[idx]['correctAnswer'].answered &&
                  questions[idx]['correctAnswer'].correctAnswered
                "
                class="absolute right-0 m-5 mr-2 mt-1 inline-block w-5 cursor-pointer rounded text-green-500 hover:bg-gray-300"
              />
              <outline-emoji-sad-icon
                v-if="
                  selectedAnswer === answer.name &&
                  questions &&
                  questions.length > 0 &&
                  questions[idx]['correctAnswer'].answered &&
                  !questions[idx]['correctAnswer'].correctAnswered
                "
                class="absolute right-0 m-5 mr-2 mt-1 inline-block w-5 cursor-pointer rounded text-red-500 hover:bg-gray-300"
              />
            </label>
          </div>
          <div v-else>
            <h2 class="text-bold text-3xl">Results</h2>
            <div class="mt-6 flex justify-start space-x-4">
              <p>
                Correct Answers:
                <span class="text-2xl font-bold text-green-700">{{
                  correctAnswers
                }}</span>
              </p>
              <p>
                Wrong Answers:
                <span class="text-2xl font-bold text-red-700">{{
                  wrongAnswers
                }}</span>
              </p>
            </div>
            <div class="mt-6 flow-root">
              <button
                @click="resetQuiz"
                class="float-right rounded-full bg-indigo-600 px-5 py-2 text-sm font-bold tracking-wide text-white"
              >
                Train again <outline-refresh-icon class="inline-block w-8" />
              </button>
            </div>
          </div>
        </div>
        <div v-else class="mt-8 w-full rounded-lg bg-white p-12">
          <p>Wait for loading questions</p>
        </div>
      </div>
      <div class="col-span-3">
        <div class="my-6 flow-root">
          <button
            @click="nextQuestion"
            v-show="selectedAnswer !== '' && idx < count - 1"
            class="float-right rounded-full bg-indigo-600 px-5 py-2 text-sm font-bold tracking-wide text-white"
          >
            Next <outline-arrow-circle-right-icon class="inline-block w-8" />
          </button>
          <button
            @click="showResults"
            v-show="selectedAnswer !== '' && idx === count - 1"
            class="float-right rounded-full bg-indigo-600 px-5 py-2 text-sm font-bold tracking-wide text-white"
          >
            Finish <outline-badge-check-icon class="inline-block w-8" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  // @ts-nocheck
  import Vue from 'vue';
  import Speech from '~/_components/Speech.vue';
  import extractDefaultBurImageFromBurWord from '~/utils/extractDefaultBurImageFromBurWord';

  export default Vue.extend({
    components: { Speech },
    data() {
      return {
        idx: 0,
        selectedAnswer: '',
        correctAnswers: 0,
        wrongAnswers: 0,
        count: 3,
        questions: [],
        pack: {},
      };
    },
    computed: {
      packName() {
        return this.$route.params.packName;
      },
      title() {
        return `${this.pack?.name}`;
      },
    },
    head(): any {
      return {
        title: `${this.pack?.name} - ${this.$t('appName')}`,
        meta: [
          {
            hid: 'description',
            name: 'description',
            content: this.pack?.description,
          },
          {
            property: 'og:title',
            name: 'title',
            content: this.title,
          },
          {
            property: 'og:description',
            name: 'description',
            content: this.pack?.description,
          },
        ],
      };
    },
    watch: {},
    async mounted() {
      await this.loadQuestions();
      await this.loadPack();
    },
    methods: {
      extractDefaultBurImageFromBurWord,
      async loadPack() {
        const { data } = await this.$axios.$get(
          `/api/user/packs/${this.packName}/by-slug`,
        );
        this.pack = data;
      },
      async loadQuestions() {
        const {
          data: questions,
          meta: { count },
        } = await this.$axios.$get(
          `/api/user/packs/${this.packName}/by-slug/questions`,
        );
        this.questions = questions;
        this.count = count;
        console.log(questions, count);
      },
      answered(e) {
        if (this.questions[this.idx].correctAnswer.answered) {
          return;
        }
        this.selectedAnswer =
          this.questions[this.idx].answers.data[e.target.value].name;
        this.questions[this.idx].correctAnswer.answered = true;
        if (
          this.selectedAnswer == this.questions[this.idx].correctAnswer.name
        ) {
          this.questions[this.idx].correctAnswer.correctAnswered = true;
          this.correctAnswers++;
        } else {
          this.questions[this.idx].correctAnswer.correctAnswered = false;
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
      extractTranslation(word) {
        if (word.ru_words && word.ru_words.length) {
          return word.ru_words[0].name;
        }
        if (word.translations && word.translations.length > 0) {
          return word.translations[0].name;
        }
        return '...';
      },
    },
  });
</script>

<style>
  .blur {
    filter: blur(1.5rem);
  }
</style>
