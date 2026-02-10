import path from 'node:path';
import { ProductDataProvider } from '../../application/ports.js';
import { FetchOptions, Market, RawKeepaProduct } from '../../domain/types.js';
import { FileCache } from '../cache/FileCache.js';
import { KeepaClient } from './KeepaClient.js';

const MAX_CONCURRENCY = 3;

export class KeepaProductAdapter implements ProductDataProvider {
  private readonly cache: FileCache;

  constructor(private readonly client: KeepaClient) {
    this.cache = new FileCache(path.resolve(process.cwd(), '.cache/keepa'));
  }

  async getProducts(asins: string[], marketplace: Market, options: FetchOptions): Promise<RawKeepaProduct[]> {
    const ttl = options.forceUpdateHours ?? 12;
    const historyDays = options.historyDays ?? 90;
    const queue = [...asins];
    const output: RawKeepaProduct[] = [];

    const workers = Array.from({ length: Math.min(MAX_CONCURRENCY, asins.length) }, async () => {
      while (queue.length) {
        const asin = queue.shift();
        if (!asin) {
          return;
        }

        const cacheKey = `${marketplace}_${asin}_${historyDays}_${ttl}`;
        const cached = await this.cache.get<RawKeepaProduct>(cacheKey, ttl);
        if (cached) {
          output.push(cached);
          continue;
        }

        try {
          const product = await this.client.fetchProduct(asin, marketplace, historyDays);
          if (product) {
            output.push(product);
            await this.cache.set(cacheKey, product);
          }
        } catch {
          // Partial failures are handled by returning collected items only.
        }
      }
    });

    await Promise.all(workers);
    return output;
  }
}
