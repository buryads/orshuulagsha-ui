<template>
  <Menu as="div" v-slot="{ close }" class="relative">
    <div>
      <MenuButton
        class="flex items-center rounded-full text-gray-400 hover:text-gray-600 focus:outline-none"
      >
        <span class="sr-only">Open options</span>
        <slot name="toggle" />
      </MenuButton>
    </div>

    <Transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <MenuItems
        class="absolute right-0 top-full z-10 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
        :class="dropdownClass"
      >
        <slot name="content" :close="close" />
      </MenuItems>
    </Transition>
  </Menu>
</template>

<script setup lang="ts">
  import { Menu, MenuButton, MenuItems } from '@headlessui/vue';

  interface Props {
    dropdownClass: string;
  }

  const props = withDefaults(defineProps<Props>(), {
    dropdownClass: 'w-40',
  });
</script>
