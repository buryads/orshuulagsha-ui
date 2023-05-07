<template>
  <div>
    <slot name="header"></slot>
    <div class="grid grid-flow-row-dense grid-cols-4">
      <div v-for="pack in packs" class="rounded overflow-hidden shadow-lg mx-2 mb-5 lg:col-span-1 md:col-span-2 col-span-4 relative">
        <a
          v-if="pack.user_id === user.id || $authUtils().isUserA('admin')"
          :href="localePath(`/packs/${pack.id}/edit`).replace('/pack/create', `/packs/${pack.id}/edit`)"
          class="absolute w-5 m-5 hover:bg-gray-300 rounded cursor-pointer"
        >
          <outline-pencil-icon/>
        </a>
        <outline-check-icon v-if="pack.is_attached" class="absolute right-0 w-5 m-5 hover:bg-gray-300 rounded cursor-pointer"/>

        <div v-else class="w-full"  :style="`height: 10rem; background: url(/card-top.jpeg)`"/>
        <div class="px-6 py-4">
          <div class="font-bold text-xl mb-2">{{ pack.name }}</div>
          <p class="text-gray-700 text-base">
            {{ pack.description }}
          </p>
        </div>
        <div class="px-6 py-4 w-full">
          <Button :label="$t('open')" class="lg:w-full" @click="$router.push(localePath(`/packs/${pack.slug}/cards`))"/>
        </div>
      </div>
    </div>
    <slot name="footer">
      <PublicPagination :pagination="pagination" @paginate="$emit('loadPage', $event)" class="pb-10"/>
    </slot>
  </div>
</template>

<script>
import PublicPagination from "~/components/PublicPagination.vue";
import Button from "~/components/Button.vue";

export default {
  name: "Packs",
  components: {Button, PublicPagination},
  props: [
    'packs',
    'pagination'
  ],
  computed: {
    user () {
      return this.$auth?.user?.data ?? {};
    }
  }
}
</script>

<style scoped>

</style>
