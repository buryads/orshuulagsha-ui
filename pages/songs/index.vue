<template>
  <div class="container my-6">
    <h1 class="title">{{ $t('buryadSongs') }}</h1>

    <div class="my-10 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <UICard v-for="item in songs" :key="item.slug" :id="item.slug">
        <NuxtLink
          :to="localePath(`/songs/${item.slug}`)"
          class="focus:outline-none"
        >
          <span class="absolute inset-0" aria-hidden="true" />
          <p class="text-sm font-medium text-gray-900">{{ item.slug }}</p>
        </NuxtLink>
      </UICard>
    </div>
  </div>
</template>

<script setup lang="ts">
  const localePath = useLocalePath();
  const { data: songs } = await useFetch(`/api/songs`);
</script>
