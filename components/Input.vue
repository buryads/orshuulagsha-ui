<template>
  <input
    v-if="type !== 'textarea'"
    :placeholder="placeholder" :name="name" :rows="rows"
    class="p-2 mb-2 lg:w-9/12 w-full border-2 border-fuchsia-600 rounded"
    v-model="val"
    :type="type"
  />
  <textarea
    v-else
    :placeholder="placeholder"
    :name="name"
    :rows="rows"
    class="p-2 mb-2 lg:w-9/12 w-full border-2 border-fuchsia-600 rounded"
    v-model="val"
  />
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
  computed: {
    val: {
      set (value) {
        return this.input({}, value);
      },
      get () {
        return this.modelValue;
      }
    }
  },
  methods: {
    input ($event, value = null) {
      this.$emit('input', value || $event?.target?.value);
    }
  }
}
</script>

<style scoped>

</style>
