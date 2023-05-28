<template>
  <section
    class="rounded-lg border border-gray-200 bg-white p-4 shadow-md sm:p-6 lg:p-8"
    aria-label="Subscribe to the Flowbite newsletter"
  >
    <h3 class="mb-3 text-base font-medium text-gray-700 md:text-xl">
      {{ $t('failedTranslateSmth') }}
    </h3>
    <p class="mb-2 text-sm font-medium text-gray-500">
      {{ $t('discordHelp') }}
    </p>

    <a
      href="https://discord.gg/8KG84E6y8T"
      target="_blank"
      class="bg-white-100 flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-6 py-3 text-neutral-600 hover:bg-neutral-100 hover:text-blue-600"
    >
      <DiscordIcon class="h-8 w-8 shrink-0" />
      <span class="text-center text-base font-medium">
        {{ $t('openDiscord') }}
      </span>
    </a>
  </section>
</template>

<script setup lang="ts">
  import DiscordIcon from '~/components/Icons/Discord.vue';
</script>
