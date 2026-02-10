export interface ScoreBreakdown {
  factor: string;
  impact: number;
  reason: string;
}

export interface Opportunity {
  asin: string;
  title: string;
  currentPrice: { amount: number };
  bsrCurrent: number | null;
  bsrAvg30d: number | null;
  bsrAvg90d: number | null;
  sellersCount: number | null;
  netProfit: { amount: number };
  roiPercent: number;
  score: {
    score: number;
    labelColor: 'red' | 'yellow' | 'green';
    reasons: ScoreBreakdown[];
  };
  warnings: string[];
}

export interface OpportunitiesResponse {
  opportunities: Opportunity[];
  warnings: string[];
}
