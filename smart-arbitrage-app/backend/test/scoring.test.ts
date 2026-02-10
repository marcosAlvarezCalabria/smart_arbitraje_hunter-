import { describe, expect, it } from 'vitest';
import { OpportunityScorer } from '../src/domain/scoring.js';

const scorer = new OpportunityScorer();

describe('OpportunityScorer', () => {
  it('returns deterministic score and reasons', () => {
    const result = scorer.score({
      roiPercent: 32.5,
      netProfit: 9.4,
      snapshot: {
        asin: 'B07PGL2N7J',
        title: 'Example',
        market: 'ES',
        buyBoxPriceGross: 24.99,
        newPriceGross: 25.3,
        avgPrice90dGross: 22.5,
        referralFeePercent: 0.15,
        fbaFeeGross: 3.1,
        estimatedCostGross: 12,
        bsrCurrent: 2200,
        bsrAvg30d: 2500,
        bsrAvg90d: 2800,
        sellersCount: 2
      }
    });

    expect(result.score).toBe(73);
    expect(result.labelColor).toBe('green');
    expect(result.reasons).toHaveLength(4);
    expect(result.reasons[0].factor).toBe('ROI');
  });
});
