<template>
  <div class="font-sans">
    <SectionNavbar />

    <div class="mt-3">
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </div>
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
