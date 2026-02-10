import { RawKeepaProduct } from '../../domain/types.js';

const KEEPA_ENDPOINT = 'https://api.keepa.com/product';
const DOMAIN_MAP = {
  ES: 9
} as const;

export class KeepaClient {
  constructor(private readonly apiKey: string) {}

  async fetchProduct(asin: string, marketplace: keyof typeof DOMAIN_MAP, historyDays = 90): Promise<RawKeepaProduct | null> {
    const url = new URL(KEEPA_ENDPOINT);
    url.searchParams.set('key', this.apiKey);
    url.searchParams.set('domain', String(DOMAIN_MAP[marketplace]));
    url.searchParams.set('asin', asin);
    url.searchParams.set('stats', String(historyDays));
    url.searchParams.set('buybox', '1');
    url.searchParams.set('offers', '20');
    url.searchParams.set('history', '1');

    const response = await fetch(url);
    if (!response.ok) {
      const details = await response.text();
      throw new Error(`Keepa request failed: ${response.status} ${details}`);
    }

    const json = (await response.json()) as { products?: RawKeepaProduct[]; tokensLeft?: number; error?: string };
    if (json.error) {
      throw new Error(`Keepa error: ${json.error}`);
    }

    return json.products?.[0] ?? null;
  }
}
