<template>
  <div>
    <slot name="header"></slot>
    <div class="grid grid-flow-row-dense grid-cols-4">
      <div
        v-for="pack in packs"
        class="relative col-span-4 mx-2 mb-5 overflow-hidden rounded shadow-lg md:col-span-2 lg:col-span-1"
      >
        <a
          v-if="pack.user_id === user.id || $authUtils().isUserA('admin')"
          :href="
            localePath(`/packs/${pack.id}/edit`).replace(
              '/pack/create',
              `/packs/${pack.id}/edit`,
            )
          "
          class="absolute m-5 w-5 cursor-pointer rounded hover:bg-gray-300"
        >
          <outline-pencil-icon />
        </a>
        <outline-check-icon
          v-if="pack.is_attached"
          class="absolute right-0 m-5 w-5 cursor-pointer rounded hover:bg-gray-300"
        />
        <div
          v-if="
            pack.burWords &&
            pack.burWords.length &&
            pack.burWords[0].images &&
            pack.burWords[0].images.length
          "
          class="w-full"
          src=""
          :style="`max-height: 10rem; background: url(${extractDefaultBurImageFromBurWord(
            pack.burWords[0],
          )});`"
          style="height: 10rem"
        />
        <div
          v-else
          class="w-full"
          :style="`height: 10rem; background: url(/card-top.jpeg)`"
        />
        <div class="px-6 py-4">
          <div class="mb-2 text-xl font-bold">{{ pack.name }}</div>
          <p class="text-base text-gray-700">
            {{ pack.description }}
          </p>
        </div>
        <div class="w-full px-6 py-4">
          <Button
            :label="$t('open')"
            class="lg:w-full"
            @click="$router.push(localePath(`/packs/${pack.slug}/cards`))"
          />
        </div>
      </div>
    </div>
    <slot name="footer">
      <PublicPagination
        :pagination="pagination"
        @paginate="$emit('loadPage', $event)"
        class="pb-10"
      />
    </slot>
  </div>
</template>

<script>
  import PublicPagination from '~/_components/PublicPagination.vue';
  import Button from '~/_components/Button.vue';
  import extractDefaultBurImageFromBurWord from '~/utils/extractDefaultBurImageFromBurWord';

  export default {
    name: 'Packs',
    components: { Button, PublicPagination },
    props: ['packs', 'pagination'],
    computed: {
      user() {
        return this.$auth?.user?.data ?? {};
      },
    },
    methods: {
      extractDefaultBurImageFromBurWord,
    },
  };
</script>

<style scoped></style>
