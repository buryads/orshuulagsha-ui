import HttpFactory from '~/repository/factory';

class ImageModule extends HttpFactory {
  public readonly RESOURCE = 'api/images/jwt/burwords';

  async uploadImageForBurword(wordId: number, image) {
    try {
      const formData = new FormData();
      formData.append('image', image);

      const {
        data: { data },
      } = await this.call('POST', `${this.RESOURCE}/${wordId}`, {
        data: formData,
      });

      return data;
    } catch (error) {
      console.error(error);

      throw error;
    }
  }
}

export default ImageModule;
