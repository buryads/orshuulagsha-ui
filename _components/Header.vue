<template>
  <header id="header" class="relative z-20">
    <div>
      <div class="flex items-center">
        <h1 class="inline-block text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight dark:text-slate-200">
          <slot></slot>
        </h1>
        <slot name="controls"></slot>
      </div>
    </div>
  </header>
</template>

<script>
export default {
  name: "Header"
}
</script>

<style scoped>

</style>
