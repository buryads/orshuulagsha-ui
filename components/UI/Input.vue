<template>
  <input
    :type="type"
    :name="name"
    class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
</template>

<script setup lang="ts">
  interface Props {
    type?: string;
    name?: string;
  }

  const props = withDefaults(defineProps<Props>(), {
    type: 'text',
    name: 'input',
  });
</script>
