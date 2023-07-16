<template>
  <input
    :type="type"
    :name="name"
    class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 disabled:bg-neutral-100 sm:text-sm sm:leading-6"
    :value="modelValue"
    :placeholder="placeholder"
    @keydown="keyDown"
    @input="$emit('update:modelValue', $event.target.value)"
  />
</template>

<script setup lang="ts">
  export interface InputProps {
    type?: string;
    name?: string;
    placeholder?: string;
    modelValue?: string;
  }

  const emit = defineEmits(['update:modelValue', 'change']);

  const props = withDefaults(defineProps<InputProps>(), {
    type: 'text',
    name: 'input',
  });

  const keyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      emit('change', props.modelValue);
    }
  };
</script>
