import HttpFactory from '~/repository/factory';
import { IPacksModule, packType } from '~/repository/modules/packs/types';

class PacksModule extends HttpFactory implements IPacksModule {
  public RESOURCE = '/api/user/packs';

  async getPacks() {
    try {
      const {
        data: { data },
      }: { data: { data: packType[] } } = await this.call('GET', this.RESOURCE);

      return data;
    } catch (error) {
      console.error(error);

      throw error;
    }
  }

  async getPack(slug: string) {
    try {
      const {
        data: { data },
      }: { data: { data: packType } } = await this.call(
        'GET',
        `${this.RESOURCE}/${slug}/by-slug`,
      );

      return data;
    } catch (error) {
      console.error(error);

      throw error;
    }
  }
}

export default PacksModule;
