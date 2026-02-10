import { Market, ProductSnapshot, RawKeepaProduct } from '../../domain/types.js';

const PRICE_INDEX_NEW = 1;
const PRICE_INDEX_BSR = 3;

const fromCents = (value: number | undefined): number | null => {
  if (typeof value !== 'number' || value <= 0) {
    return null;
  }
  return value / 100;
};

export const mapKeepaRawToSnapshot = (
  raw: RawKeepaProduct,
  market: Market,
  historyDays: number
): ProductSnapshot => {
  const current = raw.stats?.current ?? [];
  const avg30 = raw.stats?.avg30 ?? [];
  const avg90 = raw.stats?.avg90 ?? [];

  const fallbackCostFromHistory = raw.csv?.[PRICE_INDEX_NEW]?.slice(-Math.max(historyDays, 30));
  const validHistoryPrices = fallbackCostFromHistory?.filter((v): v is number => typeof v === 'number' && v > 0) ?? [];
  const avgHistoryGross = validHistoryPrices.length
    ? validHistoryPrices.reduce((acc, value) => acc + value, 0) / validHistoryPrices.length / 100
    : null;

  return {
    asin: raw.asin,
    title: raw.title ?? `Unknown title ${raw.asin}`,
    market,
    buyBoxPriceGross: fromCents(current[0]),
    newPriceGross: fromCents(current[PRICE_INDEX_NEW]),
    avgPrice90dGross: fromCents(avg90[PRICE_INDEX_NEW]),
    referralFeePercent: raw.referralFeePercent ?? 0.15,
    fbaFeeGross: ((raw.fbaFees?.pickAndPackFee ?? 350) / 100),
    estimatedCostGross: avgHistoryGross ?? fromCents(avg30[PRICE_INDEX_NEW]) ?? fromCents(current[PRICE_INDEX_NEW]) ?? 0,
    bsrCurrent: current[PRICE_INDEX_BSR] ?? null,
    bsrAvg30d: avg30[PRICE_INDEX_BSR] ?? null,
    bsrAvg90d: avg90[PRICE_INDEX_BSR] ?? null,
    sellersCount: raw.buyBoxSellerIdHistory?.length ?? null
  };
};
