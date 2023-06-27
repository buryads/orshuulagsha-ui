export interface IRole {
  id: number;
  level: number;
  name: string;
  slug: string;
  description: string;
}

export interface IUser {
  id: number;
  email: string;
  name: string;
  role: IRole[];
}

export interface IUserModule {
  getUser: (id: number) => Promise<IUser>;
}
