<template>
  <div class="inline-block" :key="update">
    <a v-if="!isPlaying" href="#" @click.prevent="playSpeech"><outline-play-icon class="cursor-pointer w-5 h-5 inline-block" /></a>
    <a v-else href="#" @click.prevent="pauseSpeech"><outline-pause-icon class="cursor-pointer w-5 h-5 inline-block" /></a>
  </div>
</template>

<script>
export default {
  name: "Speech",
  props: [
    'speech'
  ],
  data () {
    return {
      isPlaying: false,
      audio: null,
      update: 0,
    };
  },
  methods: {
    playSpeech () {
      console.log(this.speech)
      this.isPlaying = true;
      this.audio = new Audio(this.speech.url);
      this.audio.play();
      this.audio.addEventListener('pause', (event) => {
        this.pauseSpeech();
      });
      this.update++;
    },
    pauseSpeech () {
      this.isPlaying = false;
      if (!this.audio) {
        return;
      }
      this.audio.pause();
      this.update++;
    }
  }
}
</script>

<style scoped>

</style>
