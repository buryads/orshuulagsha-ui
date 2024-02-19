import HttpFactory from '~/repository/factory';
import type { IAuthModule, tokenType } from '~/repository/modules/auth/types';

class AuthModule extends HttpFactory implements IAuthModule {
  public RESOURCE_LOGIN = '/api/jwt/login';
  public RESOURCE_REGISTER = '/api/jwt/signup';

  async login(email: string, password: string) {
    try {
      const {
        data: { data },
      }: { data: { data: tokenType } } = await this.call(
        'POST',
        this.RESOURCE_LOGIN,
        {
          data: {
            email,
            password,
          },
        },
      );

      useCookie('token', {
        expires: new Date(data.expires_at),
      }).value = data.token;
    } catch (error) {
      console.error(error);

      throw error;
    }
  }

  async register(name: string, email: string, password: string) {
    try {
      const {
        data: { data },
      }: { data: { data: tokenType } } = await this.call(
        'POST',
        this.RESOURCE_REGISTER,
        {
          data: {
            name,
            email,
            password,
          },
        },
      );

      useCookie('token', {
        expires: new Date(data.expires_at),
      }).value = data.token;
    } catch (error) {
      console.error(error);

      throw error;
    }
  }
}

export default AuthModule;
