<template>
  <MenuItem v-slot="{ active }">
    <span
      :class="[
        active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
        'block px-4 py-2 text-sm',
      ]"
    >
      <slot />
    </span>
  </MenuItem>
</template>

<script setup lang="ts">
  import { MenuItem } from '@headlessui/vue';
</script>
