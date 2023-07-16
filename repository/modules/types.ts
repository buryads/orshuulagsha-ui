export type wordImage = {
  id: number;
  filepath: string;
  ruword_id?: number;
  burword_id?: number;
  url: string;
};

export type wordVoiceActing = {
  id: number;
  filepath: string;
  ruword_id?: number;
  burword_id?: number;
  url: string;
};

export type translation = {
  id: number;
  name: string;
};

type ruWord = {
  name: string;
};

export type word = {
  id: number;
  slug: string | null;
  name: string;
  images: wordImage[];
  speechs: wordVoiceActing[];
  translations: translation[];
  ru_words: ruWord[];
  pivot: {
    bur_word_image_id: number | null;
    burword_id: number;
    pack_id: number;
  };
};

export type metaResponse = {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
};
