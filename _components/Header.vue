<template>
  <header id="header" class="relative z-20">
    <div>
      <div class="flex items-center">
        <h1
          class="inline-block text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl"
        >
          <slot></slot>
        </h1>
        <slot name="controls"></slot>
      </div>
    </div>
  </header>
</template>

<script>
  export default {
    name: 'Header',
  };
</script>

<style scoped></style>
