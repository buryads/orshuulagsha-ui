<template>
  <div class="container mt-4 text-gray-600">
    <h1 class="text-xl font-bold text-gray-900 md:text-3xl">
      {{ $t('games') }}
    </h1>

    <p class="prose mt-2">{{ $t('localizedForBuryadLanguageGames') }}</p>

    <div
      class="mt-5 divide-y divide-gray-200 overflow-hidden rounded-lg bg-gray-200 shadow sm:grid sm:grid-cols-2 sm:gap-px sm:divide-y-0"
    >
      <LinkCard
        v-for="(game, index) in games"
        :key="game.title"
        :class="[
          index === games.length - 2 ? 'sm:rounded-bl-lg' : '',
          index === games.length - 1
            ? 'rounded-bl-lg rounded-br-lg sm:rounded-bl-none'
            : '',
        ]"
        :title="game.title"
        :link="game.link"
        :index="+index"
        :text="game.description"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import games from '../constants/games.json';
  import { useI18n } from 'vue-i18n';
  import LinkCard from '~/components/UI/LinkCard.vue';

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
</script>
