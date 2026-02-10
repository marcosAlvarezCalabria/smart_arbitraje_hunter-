import { OpportunityScore, ProductSnapshot, ScoreBreakdown } from './types.js';

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

export class OpportunityScorer {
  score(input: { roiPercent: number; netProfit: number; snapshot: ProductSnapshot }): OpportunityScore {
    const reasons: ScoreBreakdown[] = [];
    let score = 0;

    const roiImpact = clamp(input.roiPercent, -20, 40);
    score += roiImpact;
    reasons.push({
      factor: 'ROI',
      impact: roiImpact,
      reason: `ROI contribution from ${input.roiPercent.toFixed(2)}%`
    });

    const profitImpact = clamp(input.netProfit * 2, -20, 25);
    score += profitImpact;
    reasons.push({
      factor: 'Profit',
      impact: profitImpact,
      reason: `Net profit contribution from €${input.netProfit.toFixed(2)}`
    });

    const bsrScore = input.snapshot.bsrAvg30d
      ? clamp(25 - Math.log10(input.snapshot.bsrAvg30d + 1) * 5, 0, 20)
      : 5;
    score += bsrScore;
    reasons.push({
      factor: 'BSR',
      impact: bsrScore,
      reason: input.snapshot.bsrAvg30d
        ? `Better rank improves confidence (avg30: ${input.snapshot.bsrAvg30d})`
        : 'Missing BSR average data adds conservative default'
    });

    const sellersPenalty = input.snapshot.sellersCount
      ? clamp((input.snapshot.sellersCount - 3) * -2, -15, 0)
      : -3;
    score += sellersPenalty;
    reasons.push({
      factor: 'Competition',
      impact: sellersPenalty,
      reason: input.snapshot.sellersCount
        ? `${input.snapshot.sellersCount} sellers lowers confidence`
        : 'Unknown seller count gives mild penalty'
    });

    const normalized = clamp(Math.round(score), 0, 100);
    const labelColor = normalized >= 70 ? 'green' : normalized >= 45 ? 'yellow' : 'red';

    return {
      score: normalized,
      labelColor,
      reasons
    };
  }
}
