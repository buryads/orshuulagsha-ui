<template>
  <NuxtLink
    v-if="to"
    :to="to"
    :class="{ '!bg-gray-300': disabled }"
    class="rounded-md px-3 py-2 text-sm font-semibold shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
  >
    <slot />
  </NuxtLink>

  <button
    v-else
    type="button"
    :class="{ '!bg-gray-300': disabled }"
    class="rounded-md px-3 py-2 text-sm font-semibold shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
  interface Props {
    disabled?: boolean;
    to?: string;
  }

  const props = defineProps<Props>();
</script>
