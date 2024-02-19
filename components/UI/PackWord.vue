<template>
  <component
    :is="props.tag"
    class="flex items-center justify-between gap-x-6 py-5"
  >
    <div class="flex gap-x-4">
      <div
        @click="$emit('imageClick', props.word)"
        :title="editingImageAvailable && 'Select image'"
        class="group h-12 w-12 flex-none overflow-hidden rounded-full bg-gray-50 bg-cover bg-center bg-no-repeat"
        :class="editingImageAvailable && 'cursor-pointer'"
        :style="{
          backgroundImage: `url(${getWordImage(props.word)})`,
        }"
      >
        <div
          class="flex h-full w-full bg-black/70 opacity-0 transition-opacity"
          :class="[editingImageAvailable && 'group-hover:opacity-100']"
        >
          <CameraIcon class="m-auto h-8 w-8 fill-white" />
        </div>
      </div>

      <div class="min-w-0 flex-auto">
        <p class="text-sm font-semibold leading-6 text-gray-900">
          {{ props.word.name }}
        </p>

        <p class="mt-1 text-xs leading-5 text-gray-500">
          <template v-if="props.word.ru_words?.length">
            {{ props.word.ru_words.map((v) => v.name)[0] }}
          </template>
          <template v-else-if="props.word.translations?.length">
            {{ props.word.translations.map((v) => v.name)[0] }}
          </template>
        </p>
      </div>
    </div>

    <TrashIcon
      v-if="props.showDeleteButton"
      class="ml-auto h-4 w-4 shrink-0 cursor-pointer"
      @click="$emit('delete', props.word.id)"
    />

    <Speech
      v-if="props.word.speechs?.length > 0"
      :speech="props.word.speechs[0]"
    />
  </component>
</template>

<script setup lang="ts">
  import getWordImage from '~/utils/getWordImage';
  import { CameraIcon, TrashIcon } from '@heroicons/vue/24/outline';
  import type { Word } from '~/repository/modules/types';

  interface Props {
    showDeleteButton?: boolean;
    editingImageAvailable?: boolean;
    tag?: string;
    word: Word;
  }

  const emit = defineEmits(['delete', 'imageClick']);
  const props = withDefaults(defineProps<Props>(), {
    tag: 'li',
    showDeleteButton: false,
    editingImageAvailable: false,
  });
</script>
