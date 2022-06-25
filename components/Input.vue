<template>
  <input
    :placeholder="placeholder" :name="name" :id="id" :rows="rows" :type="type"
    class="p-2 mb-2 lg:w-9/12 w-full border-2 border-fuchsia-600 rounded"
    :value="modelValue"
    @input="input"
  >
</template>

<script>
export default {
  name: "Input",
  props: {
    modelValue: {
      required: false,
      default: null
    },
    id: {
      required: false,
      type: String,
      default: null
    },
    rows: {
      required: false,
      type: Number,
      default: null
    },
    name: {
      required: false,
      type: String,
      default: null
    },
    placeholder: {
      required: false,
      type: String,
      default: null
    },
    type: {
      required: false,
      type: String,
      default: 'text'
    }
  },
  methods: {
    input ($event) {
      this.$emit('input', $event.target.value);
    }
  }
}
</script>

<style scoped>

</style>
