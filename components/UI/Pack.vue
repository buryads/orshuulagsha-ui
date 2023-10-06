<template>
  <NuxtLink
    :to="localePath(props.packUrl)"
    class="aspect-h-7 aspect-w-10 group block w-full cursor-pointer overflow-hidden rounded-lg bg-gray-100"
  >
    <div
      class="h-48 w-full bg-cover bg-center bg-no-repeat group-hover:opacity-80"
      :style="{
        backgroundImage: `url(${
          props.pack.burWords[0]?.images[0]?.url || '/images/stub-image.jpg'
        })`,
      }"
    />
    <button type="button" class="absolute inset-0 focus:outline-none">
      <span class="sr-only">View details for {{ props.pack.name }}</span>
    </button>
  </NuxtLink>
  <p
    class="pointer-events-none mt-2 block truncate text-sm font-medium text-gray-900"
  >
    {{ props.pack.name }}
  </p>
  <p class="pointer-events-none block text-sm font-medium text-gray-500">
    {{ props.pack.description }}
  </p>
</template>

<script setup lang="ts">
  import type { Pack as PackInterface } from '~/repository/modules/user/types';

  interface Props {
    pack: PackInterface;
    packUrl: string;
  }

  const localePath = useLocalePath();
  const props = defineProps<Props>();
</script>
