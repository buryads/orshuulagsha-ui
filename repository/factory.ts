import { AxiosInstance } from 'axios';

class HttpFactory {
  private readonly $fetch: AxiosInstance;

  constructor(fetcher: AxiosInstance) {
    this.$fetch = fetcher;
  }

  async call<T>(method: string, url: string, extras = {}): Promise<T> {
    return await this.$fetch({ url, method, ...extras });
  }
}

export default HttpFactory;
