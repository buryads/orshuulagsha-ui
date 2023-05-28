<template>
  <div class="container">
    {{ $t('games') }}
  </div>
</template>

<script setup lang="ts">
  import games from '../constants/games.json';
  import { useI18n } from 'vue-i18n';

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
    ],
  });
</script>
