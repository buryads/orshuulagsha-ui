import HttpFactory from '~/repository/factory';
import { IUserModule } from '~/repository/modules/user/types';

class UserModule extends HttpFactory implements IUserModule {
  public RESOURCE = '/user';

  async getUser(id: number) {
    return await this.call('GET', `${this.RESOURCE}`);
  }
}

export default UserModule;
