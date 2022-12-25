<template>
  <div>
    <div class="flex w-full justify-center">
      <div class="w-full max-w-xl p-3">
        <div class="w-full h-full flex align-center justify-center">
          <h1 class="font-bold text-3xl text-center text-gray-700">
            {{ title }}
          </h1>
        </div>
      </div>
    </div>
    <div class="flex w-full h-screen justify-center">
      <div class="w-full max-w-xl p-3">
        <div class="block md:flex">
          <div class="flex-auto">
            <p class="container mx-auto md:px-10 px-5 text-gray-500 bg-gray-50">
              {{ $t('localizedForBuryadLanguageGames') }}
            </p>
            <div class="container mx-auto md:px-5 md:py-5" v-for="link in links" :key="link.title">
              <a :href="link.link" target="_blank" class="inline-flex justify-center items-center p-5 text-base font-medium text-gray-500 bg-gray-50 rounded-lg hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700 dark:hover:text-white">
                <p>
                  <span class="w-full">{{ link.title }}</span>
                  <br>
                  <span class="w-full">{{ link.description }}</span>
                </p>
                <svg aria-hidden="true" class="ml-3 w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// @ts-nocheck

export default {
  name: 'view',
  mounted() {},
  head() {
    return {
      title: this.$t('games'),
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
          content: this.$t('localizedForBuryadLanguageGames')
        }
      ]
    }
  },
  data() {
    return {
      title: this.$t('games'),
      links: [
        {
          title: 'BombParty',
          description: 'is an explosive word game. Type a word that contains the prompt. Be quick! If the bomb explodes during your turn, you lose a life.',
          link: 'https://bombparty.games.buryads.com/'
        },
        {
          title: 'Alias',
          description: 'is a board game, where the objective of the players is to explain words to each other. Hence, Alias is similar to Taboo, but the only forbidden word in the explanations is the word to be explained. The game is played in teams of varying size, and fits well as a party game for larger crowds.',
          link: 'https://alias.games.buryads.com/'
        },
        {
          title: 'Wordle',
          description: 'Guess the Wordle in 6 tries. Each guess must be a valid 5-letter word. The color of the tiles will change to show how close your guess was to the word.',
          link: 'https://wordle.games.buryads.com/'
        },
        {
          title: 'Scribble',
          description: 'Scribble It! is a fun and exciting drawing game that we all know and love. Perfect game if you want to have fun with friends and family.',
          link: 'http://scribble.games.buryads.com/'
        },
      ]
    };
  },
  methods: {}
};
</script>

<style scoped>
.echarts {
  width: 400px;
  height: 400px;
}
</style>
