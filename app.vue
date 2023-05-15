<template>
  <div>
    <Navbar />

    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
  useHead({
    titleTemplate: '%s - buryads.com',
    bodyAttrs: {
      class: 'bg-neutral-100',
    },
  });
</script>
