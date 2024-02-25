import { defineStore } from 'pinia';
import type { IUser } from '~/repository/modules/user/types';

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null as IUser | null,
  }),
});
