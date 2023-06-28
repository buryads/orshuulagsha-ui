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

export interface IPacksModule {
  getPacks: () => Promise<packType[]>;
  getPack: (slug: string) => Promise<packType>;
}
