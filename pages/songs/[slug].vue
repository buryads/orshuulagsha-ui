<template>
  <div class="container my-6 flex flex-col items-center">
    <audio v-if="data.srt" ref="audioElement" preload="auto" controls>
      <source :src="`/songs/${slug}/${data.webm}`" type="audio/webm" />
      <source :src="`/songs/${slug}/${data.mp3}`" type="audio/mp3" />
    </audio>

    <div
      class="whitespace-pre-wrap text-xl font-medium text-gray-400 transition"
      v-if="Array.isArray(data.parsedSrt)"
    >
      <div
        v-for="(item, i) in data.parsedSrt"
        :key="i"
        @click="handleSubtitleClick(item.data.start)"
        class="desktop:hover:text-gray-600 my-2 cursor-pointer"
        :class="item.data.start === activeLine && 'text-gray-700'"
      >
        {{ item.data.text }}
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref } from 'vue';

  const route = useRoute();
  const slug = route.params.slug;

  const { data } = await useFetch(`/api/songs/${slug}`);

  if (!data.value) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Page Not Found',
    });
  }

  const audioElement = ref(null);
  const subtitles = data.value.parsedSrt || [];
  const activeLine = ref(null);
  const metaDataReady = ref(false);

  const handleSubtitleClick = (startTime) => {
    console.log(metaDataReady.value);
    if (!audioElement.value || !metaDataReady.value) return;

    const subtitleIndex = subtitles.findIndex(
      (subtitle) => subtitle.data.start === startTime,
    );
    if (subtitleIndex !== -1) {
      audioElement.value.currentTime =
        subtitles[subtitleIndex].data.start / 1000;
      audioElement.value.play();
    }
  };

  const updateSubtitles = () => {
    if (!audioElement.value) return;

    const currentTime = audioElement.value.currentTime * 1000; // Convert to milliseconds
    const currentSubtitle = subtitles.find((subtitle) => {
      return (
        currentTime >= subtitle.data.start && currentTime <= subtitle.data.end
      );
    });

    activeLine.value = currentSubtitle?.data?.start || null;
  };

  const onMetaDataReady = () => {
    metaDataReady.value = true;
  };

  onMounted(() => {
    audioElement.value.addEventListener('timeupdate', updateSubtitles);
    audioElement.value.addEventListener('loadedmetadata', onMetaDataReady);
  });

  onUnmounted(() => {
    audioElement.value.removeEventListener('timeupdate', updateSubtitles);
    audioElement.value.removeEventListener('loadedmetadata', onMetaDataReady);
  });
</script>
