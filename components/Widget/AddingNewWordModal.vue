<template>
  <UIModal :visible="visible" @close="visible = false" :title="$t('add word')">
    <template #content>
      <div class="mt-2">
        <div class="relative">
          <UIInput v-model="input" @input="onInputChange" />

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
          <li v-for="word in foundWords" :key="word.id">
            {{ word.name }}
          </li>
        </ul>
      </div>
    </template>
  </UIModal>
</template>

<script setup lang="ts">
  import { Ref } from 'vue';
  import { foundWord } from '~/repository/modules/user/types';

  interface Props {
    visible: boolean;
  }

  defineEmits(['close']);
  const props = defineProps<Props>();
  const { $api } = useNuxtApp();

  const input = ref('');
  const foundWords: Ref<foundWord[]> = ref([]);
  const isLoading = ref(false);

  async function onInputChange() {
    try {
      isLoading.value = true;
      foundWords.value = await $api.user.findWordsByInput(input.value, 'ru');
    } catch (error) {
      console.error(error);
    } finally {
      isLoading.value = false;
    }
  }
</script>
