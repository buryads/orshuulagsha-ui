<template>
  <textarea
    :name="name"
    :value="modelValue"
    :placeholder="placeholder"
    class="block min-h-[50px] w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
    @keydown="keyDown"
    @input="$emit('update:modelValue', $event.target.value)"
  />
</template>

<script setup lang="ts">
  import Input from '~/components/UI/Input.vue';

  interface Props {
    name?: string;
    placeholder?: string;
    modelValue?: string;
  }

  const emit = defineEmits(['update:modelValue', 'change']);

  const props = withDefaults(defineProps<Props>(), {
    type: 'text',
    name: 'input',
  });

  const keyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      emit('change', props.modelValue);
    }
  };
</script>
