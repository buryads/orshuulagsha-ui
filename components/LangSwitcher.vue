<template>
  <NuxtLink
    v-for="locale in availableLocales"
    :key="locale"
    @click="setLocale(locale)"
  >
    <img :src="`/flags/${locale}.svg`" class="h-4" :alt="locale" />
    {{ $t(locale) }}
  </NuxtLink>
</template>

<script setup>
  const { availableLocales, setLocale } = useI18n();
</script>
