import HttpFactory from '~/repository/factory';

class AuthModule extends HttpFactory implements IAuthModule {
  public RESOURCE_LOGIN = '/api/jwt/login';
  public RESOURCE_REGISTER = '/api/jwt/signup';

  async login(email: string, password: string) {
    try {
      // await this.call('GET', '/sanctum/csrf-cookie');
      return await this.call('POST', this.RESOURCE_LOGIN, {
        data: {
          email,
          password,
        },
      });
    } catch (error) {
      console.error(error);

      throw error;
    }
  }

  async register(name: string, email: string, password: string) {
    try {
      return await this.call('POST', this.RESOURCE_REGISTER, {
        body: {
          name,
          email,
          password,
        },
      });
    } catch (error) {
      console.error(error);

      throw error;
    }
  }
}

export default AuthModule;
