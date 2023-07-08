import { quizQuestion } from '~/repository/modules/quiz/types';
import { word } from '~/repository/modules/types';

export type packType = {
  id: string;
  slug: string;
  user_id: number;
  is_private: number;
  name: string;
  description: string;
  is_attached: false;
  burWords: word[];
};

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
  getPacks: () => Promise<packType[] | undefined>;
  getPack: (slug: string) => Promise<packType | undefined>;
  getPackQuizQuestionsBySlug: (
    packSlug: string,
  ) => Promise<quizQuestion[] | undefined>;
}

export type foundWord = {
  id: number;
  name: string;
};
