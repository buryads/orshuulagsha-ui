<template>
  <UIModal :visible="visible" @close="visible = false" :title="$t('add word')">
    <template #content>
      <div class="mt-2">
        <div class="relative">
          <UIInput
            v-model="input"
            :disabled="isAttaching"
            @input="onInputChange"
          />

          <span class="absolute right-2 top-1/2 -translate-y-1/2">
            <IconsSpinner
              v-if="isLoading"
              class="ml-1.5 h-3.5 w-3.5 animate-spin"
            />
          </span>
        </div>

        <ul
          class="mt-3 flex max-h-96 flex-col gap-1 overflow-y-auto font-medium text-gray-900"
        >
          <li
            v-for="word in foundWords"
            class="group flex cursor-pointer items-center justify-between rounded-md px-2 py-1 hover:bg-neutral-100"
            :key="word.id"
            @click="attachWord(word.id)"
          >
            <span>{{ word.name }}</span>
            <PlusIcon class="hidden h-4 w-4 fill-gray-900 group-hover:block" />
          </li>
        </ul>
      </div>
    </template>
  </UIModal>
</template>

<script setup lang="ts">
  import { Ref } from 'vue';
  import { foundWord } from '~/repository/modules/user/types';
  import { PlusIcon } from '@heroicons/vue/20/solid';

  interface Props {
    visible: boolean;
    packId: number;
  }

  const emit = defineEmits(['close', 'attached']);
  const props = defineProps<Props>();
  const { $api } = useNuxtApp();

  const input = ref('');
  const foundWords: Ref<foundWord[]> = ref([]);
  const isLoading = ref(false);
  const isAttaching = ref(false);

  async function onInputChange() {
    let lastInputValue = input.value;
    if (isLoading.value) {
      return;
    }

    try {
      isLoading.value = true;
      foundWords.value = await $api.user.findWordsByInput(lastInputValue);
    } catch (error) {
      console.error(error);
    } finally {
      isLoading.value = false;
      if (lastInputValue !== input.value) {
        await onInputChange();
      }
    }
  }

  async function attachWord(wordId: number) {
    try {
      isAttaching.value = true;
      isLoading.value = true;
      await $api.user.attachWordToPack(props.packId, wordId);
      emit('attached', wordId);
    } catch (error) {
      console.error(error);
    } finally {
      isAttaching.value = false;
      isLoading.value = false;
    }
  }
</script>
