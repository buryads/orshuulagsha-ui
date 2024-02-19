import type { Word as wordType } from '~/repository/modules/types';

export default function getWordImage(word: wordType) {
  if (word.pivot.bur_word_image_id) {
    return word.images.find(
      (image) => image.id === word.pivot.bur_word_image_id,
    )?.url;
  }

  return word.images[0]?.url;
}
