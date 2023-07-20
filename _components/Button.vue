<template>
  <button @click="$emit('click', $event)" class=" w-full lg:w-2/12 inline bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded" :label="label">
    <span class="pr-5">{{ label }}</span>
  </button>
</template>

<script>
export default {
  name: "Button",
  props: {
    label: {
      type: String,
      required: true
    }
  }
}
</script>

<style scoped>

</style>
