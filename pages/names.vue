<template>
  <header class="h-80 bg-[#1a202c]">
    <div
      class="h-72 bg-[url(/images/soyombo-names.png)] bg-contain bg-center bg-no-repeat"
    />
  </header>

  <div class="container mt-4">
    <h1 class="title">
      {{ $t('buryadNames') }}
    </h1>

    <UIInput
      class="mt-4 w-96"
      :placeholder="$t('inputNameToSearch')"
      v-model="searchName"
      @keydown="filter"
    />

    <div class="my-10 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <UICard v-for="item in filteredNames" :key="item.name" :id="item.name">
        <a :href="`#${item.name}`" class="focus:outline-none">
          <span class="absolute inset-0" aria-hidden="true" />
          <p class="text-sm font-medium text-gray-900">{{ item.name }}</p>
          <p class="text-sm text-gray-500">{{ item.description }}</p>
        </a>
      </UICard>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useI18n } from 'vue-i18n';

  const { t } = useI18n();
  useHead({
    title: t('buryadNames'),
    meta: [
      {
        property: 'description',
        name: 'description',
        content: t('buryadNames'),
      },
      {
        property: 'og:title',
        name: 'title',
        content: t('buryadNames'),
      },
      {
        property: 'og:description',
        name: 'description',
        content: t('buryadNames'),
      },
    ],
  });

  const { data } = await useFetch('/api/names');

  const searchName = ref('');
  const filteredNames = ref(data.value);

  const filter = () => {
    if (!searchName.value) {
      filteredNames.value = data.value;
      return;
    }

    filteredNames.value =
      data.value?.filter((item) => {
        return item.name.toLowerCase().includes(searchName.value.toLowerCase());
      }) || [];
  };
</script>
