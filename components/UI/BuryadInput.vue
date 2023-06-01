<template>
  <div class="flex">
    <UIInput
      id="buryad-input"
      ref="input"
      type="search"
      :class="{ 'rounded-r-none': showBuryadLetters }"
      v-model="inputValue"
      :placeholder="placeholder"
      autofocus
      @change="$emit('change')"
    />

    <div v-if="showBuryadLetters" class="flex divide-x pr-px">
      <UIButton
        class="rounded-none bg-neutral-200 text-gray-700 hover:bg-bur-blue hover:text-white"
        @click="clickOnLetter('ө')"
      >
        ө
      </UIButton>
      <UIButton
        class="rounded-none bg-neutral-200 text-gray-700 hover:bg-bur-blue hover:text-white"
        @click="clickOnLetter('h')"
      >
        h
      </UIButton>
      <UIButton
        class="rounded-none bg-neutral-200 text-gray-700 hover:bg-bur-blue hover:text-white"
        @click="clickOnLetter('ү')"
      >
        ү
      </UIButton>
    </div>
  </div>
</template>

<script setup lang="ts">
  interface Props {
    showBuryadLetters?: boolean;
    modelValue: string;
    placeholder?: string;
  }

  const props = defineProps<Props>();
  const emit = defineEmits(['update:modelValue', 'change']);
  const input = ref(null);

  const inputValue = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value),
  });

  const clickOnLetter = (letter: string) => {
    inputValue.value = inputValue.value + letter;
    input.value?.$el?.focus();
  };
</script>
