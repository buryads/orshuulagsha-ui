<template>
  <nav class="flex" aria-label="Breadcrumb">
    <ol role="list" class="flex w-full max-w-screen-xl flex-wrap gap-4">
      <li class="flex">
        <div class="flex items-center">
          <NuxtLink to="/" class="text-gray-400 hover:text-gray-500">
            <HomeIcon class="h-5 w-5 flex-shrink-0" aria-hidden="true" />
            <span class="sr-only">Home</span>
          </NuxtLink>
        </div>
      </li>
      <li v-for="page in pages" :key="page.name" class="flex">
        <div class="flex items-center">
          <svg
            class="h-6 w-3 flex-shrink-0 text-gray-300 md:h-full md:w-6 md:text-gray-200"
            viewBox="0 0 24 44"
            preserveAspectRatio="none"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M.293 0l22 22-22 22h1.414l22-22-22-22H.293z" />
          </svg>
          <NuxtLink
            v-if="!page.current"
            :to="page.to"
            class="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700"
            :aria-current="page.current ? 'page' : undefined"
          >
            {{ page.name }}
          </NuxtLink>
          <span v-else class="ml-4 text-sm font-medium text-gray-700">
            {{ page.name }}
          </span>
        </div>
      </li>
    </ol>
  </nav>
</template>

<script setup lang="ts">
  import { HomeIcon } from '@heroicons/vue/20/solid';

  export type page = {
    name: string;
    to?: string;
    current: boolean;
  };

  interface Props {
    pages: page[];
  }

  defineProps<Props>();
</script>
