export type translationImage = {
  id: number;
  filepath: string;
  ruword_id?: number;
  burword_id?: number;
  url: string;
};

export type voiceActing = {
  id: number;
  filepath: string;
  ruword_id?: number;
  burword_id?: number;
  url: string;
};

export type word = {
  id: number;
  name: string;
};

export type translationItem = {
  id: number;
  slug: string | null;
  images: translationImage[];
  speechs: voiceActing[];
  name: string;
  translations: word[];
};

export type translation = {
  exactTranslations: translationItem[];
  occurrences: translationItem[];
  possibleTranslations: translationItem[];
};

export type translationApiResponse = {
  data: {
    data: {
      result: translationItem[];
      includes: translationItem[];
      fuzzy: translationItem[];
    };
  };
};

export interface ITranslateModule {
  translateWord(
    translationType: 'bur2ru' | 'ru2bur',
    value: string,
  ): Promise<translation>;
}
