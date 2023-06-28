<template>
  <Disclosure as="nav" class="bg-white shadow" v-slot="{ open }">
    <div class="container">
      <div class="relative flex h-16 justify-between">
        <div class="absolute inset-y-0 left-0 flex items-center sm:hidden">
          <!-- Mobile menu button -->
          <DisclosureButton
            class="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
          >
            <span class="sr-only">Open main menu</span>
            <Bars3Icon v-if="!open" class="block h-6 w-6" aria-hidden="true" />
            <XMarkIcon v-else class="block h-6 w-6" aria-hidden="true" />
          </DisclosureButton>
        </div>

        <div
          class="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start"
        >
          <div class="flex flex-shrink-0 items-center">
            <NuxtLink :to="localePath('/')">
              <img
                class="block h-8 w-auto lg:hidden"
                src="/images/logo.png"
                alt="buryads.com"
              />
              <img
                class="hidden h-8 w-auto lg:block"
                src="/images/logo.png"
                alt="buryads.com"
              />
            </NuxtLink>
          </div>

          <div class="hidden w-full sm:ml-6 sm:flex sm:gap-8">
            <UINavbarLink :to="localePath('/')">
              {{ $t('dictionary') }}
            </UINavbarLink>
            <UINavbarLink :to="localePath('/games')">
              {{ $t('games') }}
            </UINavbarLink>
            <UINavbarLink :to="localePath('/names')">
              {{ $t('names') }}
            </UINavbarLink>
            <UINavbarLink :to="localePath('/quiz')">
              {{ $t('quiz') }}
            </UINavbarLink>
            <UINavbarLink :to="localePath('/words')">
              {{ $t('words') }}
            </UINavbarLink>

            <LangSwitcher class="inline-flex items-center" />

            <UINavbarLink
              v-if="!user"
              :to="localePath('/signin')"
              class="ml-auto pr-0"
            >
              {{ $t('login') }}
            </UINavbarLink>
          </div>
        </div>

        <div
          v-if="user"
          class="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0"
        >
          <!-- Profile dropdown -->
          <UIDropdown dropdown-class="mt-0.5 w-32" class="flex h-full">
            <template #toggle>
              <div class="flex items-center gap-1.5">
                <UserIcon class="h-5 w-5" />
                <span
                  class="max-w-[50px] overflow-hidden text-ellipsis text-sm font-medium text-gray-500 group-hover:text-gray-600"
                >
                  {{ user.name }}
                </span>
              </div>
            </template>

            <template #content="{ close }">
              <div class="p-3">
                <UIDropdownItem>
                  <NuxtLink
                    :to="localePath('/profile')"
                    class="my-2 flex items-center gap-2 first:mt-0 last:mb-0"
                  >
                    {{ $t('profile') }}
                  </NuxtLink>
                </UIDropdownItem>
                <UIDropdownItem>
                  <NuxtLink
                    :to="localePath('/packs')"
                    class="my-2 flex items-center gap-2 first:mt-0 last:mb-0"
                  >
                    {{ $t('packs') }}
                  </NuxtLink>
                </UIDropdownItem>
                <UIDropdownItem>
                  <a
                    href="#"
                    class="my-2 flex items-center gap-2 first:mt-0 last:mb-0"
                    @click.prevent="logout"
                  >
                    {{ $t('logout') }}
                  </a>
                </UIDropdownItem>
              </div>
            </template>
          </UIDropdown>
        </div>
      </div>
    </div>

    <DisclosurePanel class="sm:hidden" v-slot="{ close }">
      <div class="flex flex-col pb-4 pt-2">
        <!--        <DisclosureButton
          as="a"
          :href="localePath('/')"
          class="block border-l-4 border-indigo-500 bg-indigo-50 py-2 pl-3 pr-4 text-base font-medium text-indigo-700"
        >
          {{ $t('dictionary') }}
        </DisclosureButton>
        <DisclosureButton
          as="a"
          :href="localePath('/games')"
          class="block border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-medium text-gray-500 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700"
        >
          {{ $t('games') }}
        </DisclosureButton>-->
        <UINavbarLink
          :to="localePath('/')"
          class="border-l-4 border-transparent !py-2 pl-3 pr-4"
          active-class="bg-indigo-50 !border-b-0 !border-indigo-500 !text-indigo-700"
          @click="close"
        >
          {{ $t('dictionary') }}
        </UINavbarLink>
        <UINavbarLink
          :to="localePath('/games')"
          class="border-l-4 border-transparent !py-2 pl-3 pr-4"
          active-class="bg-indigo-50 !border-b-0 !border-indigo-500 !text-indigo-700"
          @click="close"
        >
          {{ $t('games') }}
        </UINavbarLink>
        <UINavbarLink
          :to="localePath('/names')"
          class="border-l-4 border-transparent !py-2 pl-3 pr-4"
          active-class="bg-indigo-50 !border-b-0 !border-indigo-500 !text-indigo-700"
          @click="close"
        >
          {{ $t('names') }}
        </UINavbarLink>
        <UINavbarLink
          :to="localePath('/quiz')"
          class="border-l-4 border-transparent !py-2 pl-3 pr-4"
          active-class="bg-indigo-50 !border-b-0 !border-indigo-500 !text-indigo-700"
          @click="close"
        >
          {{ $t('quiz') }}
        </UINavbarLink>
        <UINavbarLink
          :to="localePath('/words')"
          class="border-l-4 border-transparent !py-2 pl-3 pr-4"
          active-class="bg-indigo-50 !border-b-0 !border-indigo-500 !text-indigo-700"
          @click="close"
        >
          {{ $t('words') }}
        </UINavbarLink>

        <LangSwitcher
          class="ml-4 mt-2 inline-flex items-center"
          dropdown-class="mt-4 w-44 -left-2"
        />
      </div>
    </DisclosurePanel>
  </Disclosure>
</template>

<script setup lang="ts">
  import {
    Disclosure,
    DisclosureButton,
    DisclosurePanel,
  } from '@headlessui/vue';
  import { Bars3Icon, XMarkIcon } from '@heroicons/vue/24/outline';
  import { UserIcon } from '@heroicons/vue/24/solid';
  import { useUserStore } from '~/store/user';
  import { IUser } from '~/repository/modules/user/types';
  import { Ref } from 'vue';

  const localePath = useLocalePath();
  const user: Ref<IUser | null> = ref(useUserStore().user);

  useUserStore().$subscribe((mutation, state) => {
    user.value = state.user as IUser;
  });

  function logout() {
    useCookie('token').value = null;
    useUserStore().$patch({
      user: null,
    });
    navigateTo('/');
  }
</script>
