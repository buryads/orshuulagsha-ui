<template>
  <div class="font-medium text-neutral-600">
    {{ $t('todayTranslated') }}: {{ count }}
  </div>
</template>

<script setup lang="ts">
  const { $api } = useNuxtApp();

  const count = await $api.statistic.getTranslationsAmount();
</script>
