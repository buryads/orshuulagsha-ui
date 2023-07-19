<template>
  <UIModal
    :visible="visible"
    @close="$emit('close')"
    :title="`${$t('select image for word')} «${word?.name}»`"
    modal-class="!max-w-3xl"
  >
    <template #content>
      <div
        v-if="word?.images.length > 0"
        class="mt-4 flex max-h-[500px] flex-wrap justify-center gap-3 overflow-y-auto"
      >
        <div v-for="image in word?.images" :key="image.id">
          <label>
            <span
              class="relative block h-36 w-36 bg-cover bg-center bg-no-repeat"
              :class="[
                selectedImage && 'brightness-[.25]',
                selectedImage === image.id && '!brightness-[1.15]',
              ]"
              :style="{ backgroundImage: `url(${image.url})` }"
            >
              <a
                :href="image.url"
                target="_blank"
                title="Full image"
                class="absolute right-0 top-0 bg-white outline-none"
              >
                <ArrowTopRightOnSquareIcon class="h-4 w-4 fill-bur-blue" />
              </a>
            </span>
            <input
              type="radio"
              name="image"
              :value="image.id"
              v-model="selectedImage"
              @click="resetSelectedImage(image.id)"
              class="hidden"
            />
          </label>
        </div>
      </div>

      <div v-if="!word?.images.length" class="mt-2">
        {{ $t('no images found') }}
      </div>

      <!--      <UIFile
        class="mt-6"
        accept="image/png, image/jpeg"
        @change="uploadImage"
      />-->

      <div class="text-right">
        <UIButton
          @click="selectImage"
          :disabled="!selectedImage"
          class="mt-4 bg-bur-blue px-4 text-white transition-opacity hover:opacity-90"
        >
          {{ $t('select') }}
        </UIButton>
      </div>
    </template>
  </UIModal>
</template>

<script setup lang="ts">
  import { word as wordType } from '~/repository/modules/types';
  import { ArrowTopRightOnSquareIcon } from '@heroicons/vue/20/solid';

  interface Props {
    visible: boolean;
    packId: number;
    word: wordType;
  }

  const emit = defineEmits(['close', 'attached']);
  const props = defineProps<Props>();
  const { $api } = useNuxtApp();
  const selectedImage = ref();

  watchEffect(() => {
    selectedImage.value = props.word?.pivot?.bur_word_image_id;
  });

  function resetSelectedImage(imageId: number) {
    if (selectedImage.value === imageId) {
      selectedImage.value = null;
    }
  }

  async function selectImage() {
    if (!selectedImage.value) return;

    try {
      await $api.user.attachImageToBurWord(
        props.packId,
        props.word.id,
        selectedImage.value,
      );
      emit('close');
      emit('attached');
    } catch (error) {
      console.error(error);
    }
  }

  async function uploadImage(e) {
    try {
      await $api.image.uploadImageForBurword(props.word.id, e.target.files[0]);
    } catch (error) {
      console.error(error);
    }
  }
</script>
