export type tokenType = {
  token_type: string;
  token: string;
  expires_at: Date;
};

export interface IAuthModule {
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
}
