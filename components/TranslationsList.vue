<template>
  <div v-if="items?.length > 0">
    <div class="mb-2.5 mt-5 border-b border-neutral-200 pb-1">
      <h3 class="text-xl font-medium text-neutral-600">{{ title }}</h3>
    </div>

    <div v-for="(item, i) in items" :key="item.id" class="mb-2">
      <span class="font-bold">{{ item.name }}</span>

      <div v-for="translation in items[i].translations" :key="translation.id">
        {{ translation.name }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { word } from '~/repository/modules/translate/types';

  interface Props {
    items: word[] | [];
    title: string;
  }

  defineProps<Props>();
</script>
