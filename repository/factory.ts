// @ts-ignore
import { $Fetch } from 'ohmyfetch';

class HttpFactory {
  private readonly $fetch: $Fetch;

  constructor(fetcher: $Fetch) {
    this.$fetch = fetcher;
  }

  async call<T>(method: string, url: string, extras = {}): Promise<T> {
    return await this.$fetch(url, { method, ...extras });
  }
}

export default HttpFactory;
