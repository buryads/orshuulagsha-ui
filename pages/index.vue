<template>
  <div class="container">
    <div class="max-w-4xl">
      <div class="flex flex-col gap-2">
        <Label>
          <span>
            {{ sourceLanguage === 'bur' ? $t('buryad') : $t('russian') }}
            <span
              class="inline-block h-5 w-5 cursor-pointer rounded-full text-center text-blue-300 hover:bg-gray-200 hover:text-blue-600"
              @click="toggleLanguage">
              ⇄
            </span>
            {{
              sourceLanguage === 'bur'
                ? $t('russianDictionary')
                : $t('buryadDictionary')
            }}
          </span>

          <Input v-model="inputValue" :placeholder="$t('inputText')" />
        </Label>

        <Button class="bg-bur-yellow" @click="translate">
          {{ $t('translate') }}
        </Button>
      </div>

      <div class="mt-3">
        {{ result }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import Label from '~/components/UI/Label.vue';
  import Input from '~/components/UI/Input.vue';
  import Button from '~/components/UI/Button.vue';
  import { Ref } from 'vue';

  const nuxtApp = useNuxtApp();

  console.log(nuxtApp);

  useHead({
    title: 'Словарь',
  });

  type translationLanguage = 'bur' | 'ru';
  const sourceLanguage: Ref<translationLanguage> = ref('ru');
  const inputValue = ref('');
  const result = ref({});

  const toggleLanguage = () => {
    sourceLanguage.value = sourceLanguage.value === 'bur' ? 'ru' : 'bur';
  };

  const translate = async () => {
    console.log(inputValue.value);
    result.value = await nuxtApp.$api.translate.translateWord(
      sourceLanguage.value,
      inputValue.value,
    );
  };
</script>
