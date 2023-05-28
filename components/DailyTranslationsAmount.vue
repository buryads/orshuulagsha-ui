<template>
  <div class="font-medium text-neutral-600">
    {{ $t('todayTranslated') }}: {{ data?.count }}
  </div>
</template>

<script setup lang="ts">
  import useMyFetch from '~/composables/useMyFetch';

  const { $api } = useNuxtApp();

  const { data } = useMyFetch($api.statistic.RESOURCE);
</script>
