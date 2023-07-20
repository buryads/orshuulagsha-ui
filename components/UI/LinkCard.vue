<template>
  <div
    :class="[
      index === 0 ? 'rounded-tl-lg rounded-tr-lg sm:rounded-tr-none' : '',
      index === 1 ? 'sm:rounded-tr-lg' : '',
      'group relative bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500',
    ]"
  >
    <div v-if="icon">
      <span class="inline-flex rounded-lg ring-4 ring-white">
        <component :is="icon" class="h-10 w-10" aria-hidden="true" />
      </span>
    </div>

    <div class="mt-2">
      <h3 class="text-xl font-semibold leading-6 text-gray-900">
        <a :href="link" class="focus:outline-none">
          <span class="absolute inset-0" aria-hidden="true" />
          {{ title }}
        </a>
      </h3>

      <p class="mt-2 text-sm text-gray-500">
        {{ text }}
      </p>
    </div>

    <div
      class="pointer-events-none absolute right-6 top-6 text-gray-300 group-hover:text-gray-400"
      aria-hidden="true"
    >
      <IconsArrow class="h-6 w-6" />
    </div>
  </div>
</template>

<script setup lang="ts">
  interface Props {
    index: number;
    link: string;
    title: string;
    text: string;
    icon?: any; // @todo find out what type is it for vue component
  }

  const props = defineProps<Props>();
</script>
