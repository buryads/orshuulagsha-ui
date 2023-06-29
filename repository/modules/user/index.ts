import HttpFactory from '~/repository/factory';
import { IUser, IUserModule } from '~/repository/modules/user/types';
import { useUserStore } from '~/store/user';
import { quizQuestion } from '~/repository/modules/quiz/types';

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

  async getUserPackQuizQuestionsByPack(packSlug: string) {
    try {
      const {
        data: { data },
      }: { data: { data: quizQuestion[] } } = await this.call(
        'GET',
        `/api/user/packs/${packSlug}/by-slug/questions`,
        {
          headers: {
            Authorization: 'Bearer ' + useCookie('token').value,
          },
        },
      );

      return data;
    } catch (error) {
      console.error(error);

      throw error;
    }
  }
}

export default UserModule;
