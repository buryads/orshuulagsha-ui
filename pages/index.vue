<template>
  <div class="container">
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
      <Input :placeholder="$t('inputText')" />
    </Label>
  </div>
</template>

<script setup lang="ts">
  import Label from '~/components/UI/Label.vue';
  import Input from '~/_components/Input.vue';

  useHead({
    title: 'Словарь',
  });

  type translationLanguage = 'bur' | 'ru';
  const sourceLanguage: Ref<translationLanguage> = ref('ru');

  const toggleLanguage = () => {
    sourceLanguage.value = sourceLanguage.value === 'bur' ? 'ru' : 'bur';
  };
</script>
