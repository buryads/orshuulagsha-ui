import HttpFactory from '~/repository/factory';
// @ts-ignore
import Cookie from 'js-cookie';

class AuthModule extends HttpFactory implements IAuthModule {
  public RESOURCE_LOGIN = '/api/login';
  public RESOURCE_REGISTER = '/api/signup';

  async login(email: string, password: string) {
    try {
      await this.call('GET', '/sanctum/csrf-cookie');
      console.log(Cookie.get('XSRF-TOKEN'));
      return await this.call('POST', this.RESOURCE_LOGIN, {
        body: {
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
