import { FetchOptions, Market, RawKeepaProduct } from '../domain/types.js';

export interface ProductDataProvider {
  getProducts(asins: string[], marketplace: Market, options: FetchOptions): Promise<RawKeepaProduct[]>;
}
