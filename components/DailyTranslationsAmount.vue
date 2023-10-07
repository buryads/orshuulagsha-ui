<template>
  <div class="font-medium text-neutral-600">
    {{ $t('todayTranslated') }}: {{ data }}
  </div>
</template>

<script setup lang="ts">
  import { useAsyncData } from '#app';

  const { $api } = useNuxtApp();

  const { data } = await useAsyncData('count', () =>
    $api.statistic.getTranslationsAmount(),
  );
</script>
