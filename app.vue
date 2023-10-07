<template>
  <div class="font-sans">
    <SectionNavbar />

    <NuxtLayout>
      <NuxtLoadingIndicator />
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
  import { useAsyncData } from '#app';

  useHead({
    titleTemplate: '%s - buryads.com',
    bodyAttrs: {
      class: 'bg-neutral-100',
    },
  });

  if (useCookie('token').value) {
    const { $api } = useNuxtApp();

    await useAsyncData('user', () => $api.user.getUser());
  }
</script>
