<template>
  <div class="container mt-6 text-gray-600">
    <h1 class="text-xl font-bold text-gray-900 md:text-3xl">
      {{ $t('games') }}
    </h1>

    <p class="prose mt-2">{{ $t('localizedForBuryadLanguageGames') }}</p>

    <div
      class="mt-5 divide-y divide-gray-200 overflow-hidden rounded-lg bg-gray-200 shadow sm:grid sm:grid-cols-2 sm:gap-px sm:divide-y-0"
    >
      <UILinkCard
        v-for="(game, index) in games"
        :key="game.title"
        :class="[
          index === games.length - 2 ? 'sm:rounded-bl-lg' : '',
          index === games.length - 1
            ? 'rounded-bl-lg rounded-br-lg sm:rounded-bl-none'
            : '',
        ]"
        :icon="game.icon"
        :title="game.title"
        :link="game.link"
        :index="+index"
        :text="game.description"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useI18n } from 'vue-i18n';
  import Alias from '~/components/Icons/Games/Alias.vue';
  import BombParty from '~/components/Icons/Games/BombParty.vue';
  import Scribble from '~/components/Icons/Games/Scribble.vue';
  import Wordle from '~/components/Icons/Games/Wordle.vue';

  const { t } = useI18n();

  useHead({
    title: t('games'),
    meta: [
      {
        property: 'og:title',
        name: 'title',
        content: t('games'),
      },
      {
        property: 'title',
        name: 'title',
        content: t('games'),
      },
      {
        property: 'og:description',
        name: 'description',
        content: t('localizedForBuryadLanguageGames'),
      },
    ],
  });

  const games = [
    {
      title: 'BombParty',
      description:
        'is an explosive word game. Type a word that contains the prompt. Be quick! If the bomb explodes during your turn, you lose a life.',
      link: 'https://bombparty.games.buryads.com/',
      icon: BombParty,
    },
    {
      title: 'Alias',
      description:
        'is a board game, where the objective of the players is to explain words to each other. Hence, Alias is similar to Taboo, but the only forbidden word in the explanations is the word to be explained. The game is played in teams of varying size, and fits well as a party game for larger crowds.',
      link: 'https://alias.games.buryads.com/',
      icon: Alias,
    },
    {
      title: 'Wordle',
      description:
        'Guess the Wordle in 6 tries. Each guess must be a valid 5-letter word. The color of the tiles will change to show how close your guess was to the word.',
      link: 'https://wordle.games.buryads.com/',
      icon: Wordle,
    },
    {
      title: 'Scribble',
      description:
        'Scribble It! is a fun and exciting drawing game that we all know and love. Perfect game if you want to have fun with friends and family.',
      link: 'http://scribble.games.buryads.com/',
      icon: Scribble,
    },
  ];
</script>
