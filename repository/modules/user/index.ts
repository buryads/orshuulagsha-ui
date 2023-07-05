import HttpFactory from '~/repository/factory';
import { IUser, IUserModule, packType } from '~/repository/modules/user/types';
import { useUserStore } from '~/store/user';
import { quizQuestion } from '~/repository/modules/quiz/types';
// @todo don't use axios here
import { AxiosError } from 'axios';

class UserModule extends HttpFactory implements IUserModule {
  public RESOURCE = '/api/jwt/user';

  async getUser() {
    try {
      const {
        data: { data },
      }: { data: { data: IUser } } = await this.call('GET', this.RESOURCE, {
        headers: {
          Authorization: 'Bearer ' + useCookie('token').value,
        },
      });

      useUserStore().$patch({
        user: data,
      });

      return data;
    } catch (error) {
      console.error(error);

      throw error;
    }
  }

  async createPack(data: {
    name: string;
    description: string;
    is_private: boolean;
  }) {
    try {
      await this.call('POST', `${this.RESOURCE}/packs`, {
        data,
        headers: {
          Authorization: 'Bearer ' + useCookie('token').value,
        },
      });
    } catch (error) {
      console.error(error);

      throw error;
    }
  }

  async updatePack(
    id: number,
    data: {
      name: string;
      description: string;
      is_private: boolean;
    },
  ) {
    try {
      const {
        data: { data: response },
      } = await this.call('PUT', `${this.RESOURCE}/packs/${id}`, {
        data,
        headers: {
          Authorization: 'Bearer ' + useCookie('token').value,
        },
      });

      return response;
    } catch (error) {
      console.error(error);

      throw error;
    }
  }

  async deletePack(id: number) {
    try {
      await this.call('DELETE', `${this.RESOURCE}/packs/${id}`, {
        headers: {
          Authorization: 'Bearer ' + useCookie('token').value,
        },
      });
    } catch (error) {
      console.error(error);

      throw error;
    }
  }

  async getPacks() {
    try {
      const {
        data: { data },
      }: { data: { data: packType[] } } = await this.call(
        'GET',
        `${this.RESOURCE}/packs`,
        {
          headers: {
            Authorization: 'Bearer ' + useCookie('token').value,
          },
        },
      );

      return data;
    } catch (error) {
      if (error instanceof AxiosError && error?.response?.status === 401) {
        navigateTo('/signin');
        return;
      }
      console.error(error);

      throw error;
    }
  }

  async getPack(slug: string) {
    try {
      const {
        data: { data },
      }: { data: { data: packType } } = await this.call(
        'GET',
        `${this.RESOURCE}/packs/${slug}/by-slug`,
        {
          headers: {
            Authorization: 'Bearer ' + useCookie('token').value,
          },
        },
      );

      return data;
    } catch (error) {
      if (error instanceof AxiosError && error?.response?.status === 401) {
        navigateTo('/signin');
        return;
      }
      console.error(error);

      throw error;
    }
  }

  async getPackQuizQuestionsBySlug(packSlug: string) {
    try {
      const {
        data: { data },
      }: { data: { data: quizQuestion[] } } = await this.call(
        'GET',
        `/api/jwt/user/packs/${packSlug}/by-slug/questions`,
        {
          headers: {
            Authorization: 'Bearer ' + useCookie('token').value,
          },
        },
      );

      return data;
    } catch (error) {
      if (error instanceof AxiosError && error?.response?.status) {
        navigateTo('/signin');
        return;
      }
      console.error(error);

      throw error;
    }
  }

  async attachWordToPack(packId: number, wordId: number) {
    try {
      await this.call('POST', `${this.RESOURCE}/packs/${packId}/${wordId}`);
    } catch (error) {
      console.error(error);

      throw error;
    }
  }
}

export default UserModule;
