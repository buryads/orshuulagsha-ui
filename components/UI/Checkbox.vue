<template>
  <label
    :class="[
      'relative flex cursor-pointer select-none gap-x-3',
      labelClass || 'inline-flex items-center font-medium text-neutral-500',
    ]"
    @click="$event.stopPropagation()"
  >
    <input
      type="checkbox"
      v-model="value"
      :name="name"
      :class="[
        'h-5 w-5 cursor-pointer rounded-md border-2 border-neutral-300 transition',
        checkboxClass,
      ]"
      readOnly
    />

    <slot />
  </label>
</template>

<script lang="ts" setup>
  interface Props {
    name?: string;
    checkboxClass?: string;
    labelClass?: string;
    modelValue: boolean;
    change?: () => void;
  }

  const emit = defineEmits(['update:modelValue']);

  const props = withDefaults(defineProps<Props>(), {
    name: 'checkbox',
  });

  const value = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value),
  });
</script>
