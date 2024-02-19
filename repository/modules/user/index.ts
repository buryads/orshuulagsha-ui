import HttpFactory from '~/repository/factory';
import type {
  FoundWord,
  IUser,
  IUserModule,
  Pack,
} from '~/repository/modules/user/types';
import { useUserStore } from '~/store/user';
// @todo don't use axios here
import type { AxiosError } from 'axios';
import type { trainingPackQuiz } from '~/repository/modules/types';

class UserModule extends HttpFactory implements IUserModule {
  public RESOURCE = '/api/jwt/user';
  public PUBLIC_RESOURCE = '/api/user';

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

  async getPublicPacks({
    per_page = 4,
    rand,
  }: { per_page?: number; rand?: number } = {}) {
    try {
      const {
        data: { data },
      }: { data: { data: Pack[] } } = await this.call(
        'GET',
        `${this.PUBLIC_RESOURCE}/packs`,
        {
          params: {
            per_page,
            rand,
          },
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

  async getPacks() {
    try {
      const {
        data: { data },
      }: { data: { data: Pack[] } } = await this.call(
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

  async getPublicPack(slug: string) {
    try {
      const {
        data: { data },
      }: { data: { data: Pack } } = await this.call(
        'GET',
        `${this.PUBLIC_RESOURCE}/packs/${slug}/by-slug`,
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
      }: { data: { data: Pack } } = await this.call(
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
      }: { data: { data: trainingPackQuiz[] } } = await this.call(
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

  async findWordsByInput(str: string, wordType: 'ru' | 'bur' = 'bur') {
    const url =
      wordType === 'bur'
        ? `${this.RESOURCE}/words-matcher/ru/bur`
        : `${this.RESOURCE}/words-matcher/bur/ru`;

    try {
      const { data }: { data: FoundWord[] } = await this.call('GET', url, {
        params: {
          word: str,
          limit: 1000,
        },
        headers: {
          Authorization: 'Bearer ' + useCookie('token').value,
        },
      });

      return data;
    } catch (error) {
      console.error(error);

      throw error;
    }
  }

  async attachWordToPack(packId: number, wordId: number) {
    try {
      await this.call('POST', `${this.RESOURCE}/packs/${packId}/${wordId}`, {
        headers: {
          Authorization: 'Bearer ' + useCookie('token').value,
        },
      });
    } catch (error) {
      console.error(error);

      throw error;
    }
  }

  async deleteAttachedWordFromPack(packId: number, wordId: number) {
    try {
      await this.call('DELETE', `${this.RESOURCE}/packs/${packId}/${wordId}`, {
        headers: {
          Authorization: 'Bearer ' + useCookie('token').value,
        },
      });
    } catch (error) {
      console.error(error);

      throw error;
    }
  }

  async attachImageToBurWord(packId: number, wordId: number, imageId: number) {
    try {
      await this.call(
        'POST',
        `${this.RESOURCE}/packs/${packId}/burwords/${wordId}`,
        {
          data: {
            bur_word_image_id: imageId,
          },
          headers: {
            Authorization: 'Bearer ' + useCookie('token').value,
          },
        },
      );
    } catch (error) {
      console.error(error);

      throw error;
    }
  }
}

export default UserModule;
