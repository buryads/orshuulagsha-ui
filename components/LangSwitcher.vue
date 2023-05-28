<template>
  <UIDropdown dropdown-class="mt-0.5 w-44">
    <template #toggle>
      <div class="flex items-center">
        <img
          :src="`/flags/${$i18n.locale}.svg`"
          class="h-4"
          :alt="$i18n.locale"
        />
        <span class="ml-2 text-sm font-medium text-gray-700 dark:text-gray-200">
          {{
            $i18n.locales.find((locale) => locale.code === $i18n.locale).name
          }}
        </span>
      </div>
    </template>

    <template #content="{ close }">
      <div class="p-3">
        <UIDropdownItem v-for="locale in $i18n.locales" :key="locale.code">
          <NuxtLink
            :to="switchLocalePath(locale.code)"
            class="my-2 flex items-center gap-2 first:mt-0 last:mb-0"
            @click="close"
          >
            <img
              :src="`/flags/${locale.code}.svg`"
              class="h-4"
              :alt="locale.name"
            />
            {{ locale.name }}
          </NuxtLink>
        </UIDropdownItem>
      </div>
    </template>
  </UIDropdown>
</template>

<script setup>
  const switchLocalePath = useSwitchLocalePath();
</script>
