// @ts-ignore
import { $Fetch } from 'ohmyfetch';

class HttpFactory {
  private readonly $fetch: $Fetch;

  constructor(fetcher: $Fetch) {
    this.$fetch = fetcher;
  }

  async call<T>(
    method: string,
    url: string,
    data?: object,
    extras = {},
  ): Promise<T> {
    return await this.$fetch(url, { method, body: data, ...extras });
  }
}

export default HttpFactory;
