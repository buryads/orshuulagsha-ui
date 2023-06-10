import HttpFactory from '~/repository/factory';

class AuthModule extends HttpFactory implements IAuthModule {
  public RESOURCE_LOGIN = '/api/login';
  public RESOURCE_REGISTER = '/api/signup';

  async login(email: string, password: string) {
    try {
      await this.call('GET', '/sanctum/csrf-cookie', {
        headers: {
          'Accept': 'application/json'
        },
        credentials: 'include'
      });
      console.log(useCookie('XSRF-TOKEN'));
      return await this.call('POST', this.RESOURCE_LOGIN, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-XSRF-TOKEN': useCookie('XSRF-TOKEN').value,
        },
        credentials: 'include',
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
