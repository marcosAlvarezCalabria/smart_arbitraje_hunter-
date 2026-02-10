export type Market = 'ES';

export interface Money {
  amount: number;
  currency: 'EUR';
  isGross: boolean;
  vatRate: number;
}

export interface VatContext {
  isVatDeductible: boolean;
}

export interface ScoreBreakdown {
  factor: string;
  impact: number;
  reason: string;
}

export interface OpportunityScore {
  score: number;
  labelColor: 'red' | 'yellow' | 'green';
  reasons: ScoreBreakdown[];
}

export interface Opportunity {
  asin: string;
  title: string;
  market: Market;
  currentPrice: Money;
  bsrCurrent: number | null;
  bsrAvg30d: number | null;
  bsrAvg90d: number | null;
  sellersCount: number | null;
  netProfit: Money;
  roiPercent: number;
  score: OpportunityScore;
  warnings: string[];
}

export interface ProductSnapshot {
  asin: string;
  title: string;
  market: Market;
  buyBoxPriceGross: number | null;
  newPriceGross: number | null;
  avgPrice90dGross: number | null;
  referralFeePercent: number;
  fbaFeeGross: number;
  estimatedCostGross: number;
  bsrCurrent: number | null;
  bsrAvg30d: number | null;
  bsrAvg90d: number | null;
  sellersCount: number | null;
}

export interface ComputeFinanceInput {
  salePriceGross: number;
  purchasePriceGross: number;
  referralFeePercent: number;
  fbaFeeGross: number;
  vatRate: number;
  vatContext: VatContext;
}

export interface FinanceResult {
  netProfit: Money;
  roiPercent: number;
}

export interface FetchOptions {
  historyDays?: number;
  forceUpdateHours?: number;
}

export interface RawKeepaProduct {
  asin: string;
  title?: string;
  csv?: Array<number[] | null>;
  stats?: {
    current?: number[];
    avg30?: number[];
    avg90?: number[];
  };
  buyBoxSellerIdHistory?: string[];
  referralFeePercent?: number;
  fbaFees?: {
    pickAndPackFee?: number;
  };
}
