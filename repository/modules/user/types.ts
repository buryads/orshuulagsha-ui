import { trainingPackQuiz, Word } from '~/repository/modules/types';

export interface Pack {
  id: number;
  slug: string;
  user_id: number;
  is_private: number;
  name: string;
  description: string;
  is_attached: false;
  burWords: Word[];
}

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
  roles: IRole[];
}

export interface IUserModule {
  getUser: (id: number) => Promise<IUser>;
  getPacks: () => Promise<Pack[] | undefined>;
  getPack: (slug: string) => Promise<Pack | undefined>;
  getPackQuizQuestionsBySlug: (packSlug: string) => Promise<trainingPackQuiz[]>;
}

export type FoundWord = {
  id: number;
  name: string;
};
