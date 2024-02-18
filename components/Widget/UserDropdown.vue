<template>
  <div
    v-if="user"
    class="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0"
  >
    <!-- Profile dropdown -->
    <UIDropdown dropdown-class="mt-0.5 w-44" class="flex h-full">
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
              :to="localePath('/packs')"
              class="my-2 flex items-center gap-2 first:mt-0 last:mb-0"
              @click="close"
            >
              {{ $t('packs') }}
            </NuxtLink>
          </UIDropdownItem>
          <template v-if="isAdmin">
            <UIDropdownItem>
              <NuxtLink
                :to="localePath('/admin/logs')"
                class="my-2 flex items-center gap-2 first:mt-0 last:mb-0"
                @click="close"
              >
                Logs
              </NuxtLink>
            </UIDropdownItem>
          </template>
          <UIDropdownItem>
            <a
              href="#"
              class="my-2 flex items-center gap-2 first:mt-0 last:mb-0"
              @click.prevent="
                () => {
                  logout();
                  close();
                }
              "
            >
              {{ $t('logout') }}
            </a>
          </UIDropdownItem>
        </div>
      </template>
    </UIDropdown>
  </div>
</template>

<script setup lang="ts">
  import { UserIcon } from '@heroicons/vue/24/solid';
  import type { Ref } from 'vue';
  import type { IUser } from '~/repository/modules/user/types';
  import { useUserStore } from '~/store/user';

  const localePath = useLocalePath();
  const user: Ref<IUser | null> = ref(useUserStore().user);
  const isAdmin = user.value?.roles?.find((role) => role.slug === 'admin');

  function logout() {
    useCookie('token').value = null;
    useUserStore().$patch({
      user: null,
    });
    navigateTo('/');
  }
</script>
