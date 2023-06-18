<template>
  <div class="relative mt-10">
    <div class="absolute inset-0 flex items-center" aria-hidden="true">
      <div class="w-full border-t border-gray-200" />
    </div>
    <div class="relative flex justify-center text-sm font-medium leading-6">
      <span class="bg-white px-6 text-gray-900"> Or continue with </span>
    </div>
  </div>

  <div class="mt-6 grid grid-cols-2 gap-4">
    <a
      href="#"
      class="flex w-full items-center justify-center gap-3 rounded-md border bg-white px-3 py-1.5 text-gray-900"
    >
      <img src="/images/google.svg" class="h-4" alt="google" />
      <span class="text-sm font-semibold">Google</span>
    </a>

    <a
      href="#"
      class="flex w-full items-center justify-center gap-3 rounded-md bg-black px-3 py-1.5 text-white"
    >
      <img src="/images/apple.svg" class="mb-0.5 h-4" alt="apple" />
      <span class="text-sm font-semibold">Apple</span>
    </a>
  </div>
</template>
