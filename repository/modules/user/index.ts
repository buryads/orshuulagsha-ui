import HttpFactory from '~/repository/factory';
import { IUser, IUserModule } from '~/repository/modules/user/types';
import { useUserStore } from '~/store/user';

class UserModule extends HttpFactory implements IUserModule {
  public RESOURCE = '/api/jwt/user';

  async getUser() {
    const {
      data: { data },
    }: { data: { data: IUser } } = await this.call('GET', this.RESOURCE, {
      headers: {
        Authorization: 'Bearer ' + useCookie('token').value,
      },
    });
    console.log(data);
    useUserStore().$patch({
      user: data,
    });

    return data;
  }
}

export default UserModule;
