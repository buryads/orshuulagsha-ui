<template>
  <div class="container">
    {{ $t('games') }}
  </div>
</template>

<script setup lang="ts">
  import games from '../constants/games.json';

  const { $i18n } = useNuxtApp();

  /*  useHead({
    meta: [
      {
        property: 'og:title',
        name: 'title',
        content: t('games'),
      },
      {
        property: 'title',
        name: 'title',
        content: $t('games'),
      },
    ],
  });*/
</script>
