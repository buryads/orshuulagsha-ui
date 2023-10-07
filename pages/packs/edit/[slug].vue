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

      <div class="flex gap-3">
        <UIButton
          @click="updatePack"
          class="mt-6 bg-bur-yellow px-6 text-white transition-opacity hover:opacity-90"
        >
          {{ $t('update') }}
        </UIButton>

        <UIButton
          @click="deletePack"
          class="mt-6 bg-red-500 px-6 text-white transition-opacity hover:opacity-90"
        >
          {{ $t('delete') }}
        </UIButton>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { useI18n } from 'vue-i18n';
  import { Ref } from 'vue';
  import { Pack } from '~/repository/modules/user/types';
  import { useUserStore } from '~/store/user';
  import { definePageMeta } from '#imports';
  import { useAsyncData } from '#app';

  definePageMeta({
    middleware: 'auth',
  });

  const { t } = useI18n();
  const user = useUserStore().user;
  const { $api } = useNuxtApp();
  const localePath = useLocalePath();

  const pages = [
    { name: t('packsTitle'), to: localePath('/packs'), current: false },
    { name: t('editing a pack'), to: '', current: true },
  ];

  const pack: Ref<Partial<Pack>> = ref({});
  const route = useRoute();

  const { data } = await useAsyncData('pack', () =>
    $api.user.getPack(route.params.slug.toString()),
  );
  pack.value = data.value;

  if (pack.value.user_id !== user?.id) {
    throw createError({
      statusMessage: 'Something went wrong',
      statusCode: 500,
    });
  }

  const form = reactive({
    name: pack.value.name || '',
    description: pack.value.description || '',
    is_private: !!pack.value.is_private,
  });

  async function updatePack() {
    try {
      if (pack.value.id) {
        const data = await $api.user.updatePack(+pack.value.id, form);
        navigateTo(`/packs/${data.slug}`);
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function deletePack() {
    try {
      if (pack.value.id) {
        await $api.user.deletePack(+pack.value.id);
        navigateTo('/packs');
      }
    } catch (e) {
      console.error(e);
    }
  }
</script>
