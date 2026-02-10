import { OpportunityScorer } from '../domain/scoring.js';
import { computeProfitAndRoi } from '../domain/finance.js';
import { FetchOptions, Market, Opportunity } from '../domain/types.js';
import { mapKeepaRawToSnapshot } from './mappers/keepaMapper.js';
import { ProductDataProvider } from './ports.js';

export interface ListOpportunitiesInput {
  asins: string[];
  marketplace: Market;
  options?: FetchOptions;
}

export interface ListOpportunitiesOutput {
  opportunities: Opportunity[];
  warnings: string[];
}

const ASIN_REGEX = /^[A-Z0-9]{10}$/;

export class ListOpportunities {
  constructor(private readonly provider: ProductDataProvider, private readonly scorer = new OpportunityScorer()) {}

  async execute(input: ListOpportunitiesInput): Promise<ListOpportunitiesOutput> {
    const historyDays = input.options?.historyDays ?? 90;
    const forceUpdateHours = input.options?.forceUpdateHours ?? 12;
    const warnings: string[] = [];

    const normalizedAsins = [...new Set(input.asins.map((asin) => asin.trim().toUpperCase()).filter(Boolean))];
    const validAsins = normalizedAsins.filter((asin) => ASIN_REGEX.test(asin));
    const invalidAsins = normalizedAsins.filter((asin) => !ASIN_REGEX.test(asin));

    if (invalidAsins.length > 0) {
      warnings.push(`Invalid ASINs skipped: ${invalidAsins.join(', ')}`);
    }

    if (validAsins.length === 0) {
      return { opportunities: [], warnings: warnings.length ? warnings : ['No valid ASINs provided.'] };
    }

    const products = await this.provider.getProducts(validAsins, input.marketplace, {
      historyDays,
      forceUpdateHours
    });

    const opportunities = products.map((raw) => {
      const snapshot = mapKeepaRawToSnapshot(raw, input.marketplace, historyDays);
      const salePrice = snapshot.buyBoxPriceGross ?? snapshot.newPriceGross ?? 0;
      const finance = computeProfitAndRoi({
        salePriceGross: salePrice,
        purchasePriceGross: snapshot.estimatedCostGross,
        referralFeePercent: snapshot.referralFeePercent,
        fbaFeeGross: snapshot.fbaFeeGross,
        vatRate: 0.21,
        vatContext: { isVatDeductible: true }
      });

      const score = this.scorer.score({
        roiPercent: finance.roiPercent,
        netProfit: finance.netProfit.amount,
        snapshot
      });

      const itemWarnings: string[] = [];
      if (!snapshot.buyBoxPriceGross && !snapshot.newPriceGross) {
        itemWarnings.push('No current price available.');
      }

      return {
        asin: snapshot.asin,
        title: snapshot.title,
        market: input.marketplace,
        currentPrice: {
          amount: salePrice,
          currency: 'EUR',
          isGross: true,
          vatRate: 0.21
        },
        bsrCurrent: snapshot.bsrCurrent,
        bsrAvg30d: snapshot.bsrAvg30d,
        bsrAvg90d: snapshot.bsrAvg90d,
        sellersCount: snapshot.sellersCount,
        netProfit: finance.netProfit,
        roiPercent: finance.roiPercent,
        score,
        warnings: itemWarnings
      } satisfies Opportunity;
    });

    opportunities.sort((a, b) => b.score.score - a.score.score);
    return { opportunities, warnings };
  }
}
