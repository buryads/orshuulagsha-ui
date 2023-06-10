interface IAuthModule {
  login: (email: string, password: string) => Promise<any>;
}
