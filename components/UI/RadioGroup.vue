<template>
  <RadioGroup v-model="selected">
    <RadioGroupLabel v-if="label" class="text-sm font-medium text-gray-700">{{
      label
    }}</RadioGroupLabel>

    <div class="mt-1.5 flex flex-wrap items-center gap-2">
      <RadioGroupOption
        as="template"
        v-for="option in options"
        :key="option.id"
        :value="option.value"
        :disabled="option.disabled"
        v-slot="{ active, checked }"
      >
        <div
          :class="[
            'border',
            !option.disabled
              ? 'cursor-pointer focus:outline-none'
              : 'cursor-not-allowed opacity-25',
            checked
              ? 'border-transparent bg-bur-navy text-white hover:bg-bur-navy'
              : 'border-neutral-200 bg-white hover:bg-neutral-100',
            'flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium text-gray-700',
          ]"
        >
          <RadioGroupLabel as="span">{{ option.title }}</RadioGroupLabel>
        </div>
      </RadioGroupOption>
    </div>
  </RadioGroup>
</template>

<script setup lang="ts">
  import {
    RadioGroup,
    RadioGroupLabel,
    RadioGroupOption,
  } from '@headlessui/vue';

  interface Option {
    id: number;
    title: string;
    value: string;
    disabled?: boolean;
  }

  interface Props {
    options: Option[];
    modelValue: string;
    label?: string;
  }

  const emit = defineEmits(['update:modelValue']);
  const props = defineProps<Props>();

  const selected = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value),
  });
</script>
