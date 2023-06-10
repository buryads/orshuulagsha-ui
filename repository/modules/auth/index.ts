import HttpFactory from '~/repository/factory';

class AuthModule extends HttpFactory implements IAuthModule {
  public RESOURCE_LOGIN = '/api/login';

  async login(email: string, password: string) {
    return await this.call('POST', this.RESOURCE_LOGIN, {
      body: {
        email,
        password,
      },
    });
  }
}

export default AuthModule;
