<template>
  <div>
    <PlayIcon v-if="!isPlaying" class="h-5 w-5 cursor-pointer" @click="play" />
    <PauseIcon v-else class="h-5 w-5 cursor-pointer" @click="pause" />
  </div>
</template>

<script setup lang="ts">
  import { wordVoiceActing } from '~/repository/modules/types';
  import { PlayIcon, PauseIcon } from '@heroicons/vue/24/outline';

  interface Props {
    speech: wordVoiceActing;
  }

  const props = defineProps<Props>();

  const isPlaying = ref(false);
  const audio = ref();

  function play() {
    pause();
    isPlaying.value = true;
    audio.value = new Audio(props.speech.url);
    audio.value.play();
    audio.value.onended = pause;
  }

  function playWithoutPause() {
    pause();
    audio.value = new Audio(props.speech.url);
    audio.value.play();
    audio.value.onended = pause;
  }

  function pause() {
    isPlaying.value = false;
    if (audio.value) {
      audio.value.pause();
      audio.value.currentTime = 0;
    }
  }

  defineExpose({
    playWithoutPause,
  });
</script>
