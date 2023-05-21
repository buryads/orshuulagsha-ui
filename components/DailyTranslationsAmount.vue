<template>
  <div>{{ $t('dailyTranslationsCount') }}: {{ data?.count }}</div>
</template>

<script setup lang="ts">
  import { useAsyncData } from '#app';
  import StatisticModule from '~/repository/modules/statistic';

  const { $api, $config } = useNuxtApp();

  const amount = ref();

  async function getTranslationsAmount() {
    amount.value = await $api.statistic.getTranslationsAmount();
  }

  //getTranslationsAmount();
  const { data } = useFetch(StatisticModule.RESOURCE, {
    baseURL: $config.public.baseURL,
  });
</script>
