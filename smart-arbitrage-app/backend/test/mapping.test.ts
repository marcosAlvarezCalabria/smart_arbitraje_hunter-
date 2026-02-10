import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { mapKeepaRawToSnapshot } from '../src/application/mappers/keepaMapper.js';
import { RawKeepaProduct } from '../src/domain/types.js';

describe('mapKeepaRawToSnapshot', () => {
  it('maps keepa raw data into internal snapshot', () => {
    const fixturePath = path.resolve(process.cwd(), 'test/fixtures/keepaProduct.json');
    const raw = JSON.parse(readFileSync(fixturePath, 'utf8')) as RawKeepaProduct;

    const snapshot = mapKeepaRawToSnapshot(raw, 'ES', 90);

    expect(snapshot.asin).toBe('B07PGL2N7J');
    expect(snapshot.title).toBe('Sample Product');
    expect(snapshot.buyBoxPriceGross).toBe(25.99);
    expect(snapshot.newPriceGross).toBe(24.99);
    expect(snapshot.avgPrice90dGross).toBe(22.99);
    expect(snapshot.referralFeePercent).toBe(0.15);
    expect(snapshot.fbaFeeGross).toBe(3.75);
    expect(snapshot.bsrCurrent).toBe(2200);
    expect(snapshot.bsrAvg30d).toBe(2400);
    expect(snapshot.sellersCount).toBe(3);
  });
});
