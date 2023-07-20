<template>
  <nuxt-link v-if="!active" :to="link" :class="`text-blue-500 hover:text-blue-800`">{{ name }}</nuxt-link>
  <span v-else :class="`text-green-500`">{{ name }}</span>
</template>

<script>
export default {
  name: "WordMatchLink",
  props: {
    link: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    active: {
      type: Boolean,
      default: () => false
    }
  }
}
</script>

<style scoped>

</style>
