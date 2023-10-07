<template>
  <NuxtLink
    :to="localePath(props.packUrl)"
    class="aspect-h-7 aspect-w-10 group block w-full cursor-pointer overflow-hidden rounded-lg bg-gray-100"
  >
    <img
      :src="getPackImage(pack)"
      class="h-56 w-full object-cover xl:h-60"
      :alt="pack.name"
    />
    <!--    <div
      class="h-48 w-full bg-cover bg-center bg-no-repeat group-hover:opacity-80"
      :style="{
        backgroundImage: `url(${getPackImage(pack)})`,
      }"
    />-->
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

  function getPackImage(pack: PackInterface) {
    const burWordImageId = pack.burWords?.[0]?.pivot.bur_word_image_id;

    const image = pack.burWords?.[0]?.images?.find(
      (image) => image.id === burWordImageId,
    );

    if (image) {
      return image.url;
    }

    return pack.burWords?.[0]?.images?.[0]?.url || '/images/stub-image.jpg';
  }
</script>
