<template>
  <header class="h-80 bg-[#1a202c]">
    <div
      class="h-72 bg-[url(/images/soyombo-names.png)] bg-contain bg-center bg-no-repeat"
    />
  </header>

  <div class="container mt-4">
    <h1 class="text-xl font-bold text-gray-900 md:text-3xl">
      {{ $t('buryadNames') }}
    </h1>

    <UIInput
      class="mt-4 w-96"
      :placeholder="$t('inputNameToSearch')"
      v-model="searchName"
      @keydown="filter"
    />

    <div class="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <div
        v-for="item in filteredNames"
        :key="item.name"
        class="relative flex items-center space-x-3 rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:border-gray-400"
      >
        <div class="min-w-0 flex-1" :id="item.name">
          <a :href="`#${item.name}`" class="focus:outline-none">
            <span class="absolute inset-0" aria-hidden="true" />
            <p class="text-sm font-medium text-gray-900">{{ item.name }}</p>
            <p class="text-sm text-gray-500">{{ item.description }}</p>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import names from '../constants/names.json';

  const searchName = ref('');
  const filteredNames = ref([...names]);

  const filter = () => {
    if (!searchName.value) {
      filteredNames.value = [...names];
      return;
    }

    filteredNames.value = names.filter((item) => {
      return item.name.toLowerCase().includes(searchName.value.toLowerCase());
    });
  };
</script>
