<template>
  <div class="container mt-5">
    <UIBreadcrumbs :pages="pages" />

    <div class="mt-6 max-w-xl">
      <UILabel>
        {{ $t('packName') }}
        <UIInput v-model="form.name" />
      </UILabel>

      <UILabel class="mt-4">
        {{ $t('packDescription') }}
        <UITextarea v-model="form.description" class="h-20 max-h-40" />
      </UILabel>

      <UICheckbox
        v-model="form.is_private"
        label-class="mt-4 flex items-center text-sm font-medium leading-6 text-gray-900"
      >
        {{ $t('private') }}
      </UICheckbox>

      <UIButton
        @click="createPack"
        class="mt-6 bg-bur-yellow px-6 text-white transition-opacity hover:opacity-90"
      >
        {{ $t('create') }}
      </UIButton>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { useI18n } from 'vue-i18n';
  import { definePageMeta } from '#imports';

  definePageMeta({
    middleware: 'auth',
  });

  const { t } = useI18n();
  const { $api } = useNuxtApp();
  const localePath = useLocalePath();

  const pages = [
    { name: t('packsTitle'), to: localePath('/packs'), current: false },
    { name: t('creating a pack'), to: '', current: true },
  ];

  const form = reactive({
    name: '',
    description: '',
    is_private: false,
  });

  async function createPack() {
    try {
      await $api.user.createPack(form);
      await navigateTo(localePath('/packs'));
    } catch (e) {
      console.error(e);
    }
  }
</script>
