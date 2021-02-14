<template>
  <div class="container mx-auto px-10">
    <h1 class="text-6xl py-10">
      Русско-Бурятский переводчик
    </h1>
    <div class="block md:flex">
      <div class="flex-auto">
        <textarea
          placeholder="Введите текст" name="" id="first" rows="10"
          class="p-5 w-full border-b-2 border-fuchsia-600"
        ></textarea>
      </div>
      <div class="my-5">
        <svg class="inline" style="width: 30px;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" />
        </svg>
      </div>
      <div class="flex-auto">
        <label for="second"></label>
        <textarea
          placeholder="Мэдуулэл бэшэшгты" name="" id="second" rows="10"
          class="p-5 w-full border-b-2 border-fuchsia-600"
        ></textarea>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({})
</script>

<style>
</style>
