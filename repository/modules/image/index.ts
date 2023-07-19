import HttpFactory from '~/repository/factory';

class ImageModule extends HttpFactory {
  public readonly RESOURCE = 'api/jwt/images/burwords';

  async uploadImageForBurword(wordId: number, image) {
    try {
      const formData = new FormData();
      formData.append('image', image);

      const {
        data: { data },
      } = await this.call('POST', `${this.RESOURCE}/${wordId}`, {
        data: formData,
        headers: {
          Authorization: 'Bearer ' + useCookie('token').value,
        },
      });

      return data;
    } catch (error) {
      console.error(error);

      throw error;
    }
  }
}

export default ImageModule;
