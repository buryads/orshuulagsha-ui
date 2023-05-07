export default function (burword) {
  return burword.images.find(img => burword.pivot.bur_word_image_id === img.id)?.url;
}
