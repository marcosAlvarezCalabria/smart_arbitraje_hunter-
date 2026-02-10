import { describe, expect, it } from 'vitest';
import { computeProfitAndRoi } from '../src/domain/finance.js';

describe('computeProfitAndRoi', () => {
  it('calculates profit and ROI with VAT deductible context', () => {
    const result = computeProfitAndRoi({
      salePriceGross: 36.3,
      purchasePriceGross: 12.1,
      referralFeePercent: 0.15,
      fbaFeeGross: 3.63,
      vatRate: 0.21,
      vatContext: { isVatDeductible: true }
    });

    expect(result.netProfit.amount).toBe(14.5);
    expect(result.roiPercent).toBe(145);
  });

  it('calculates lower profitability when VAT is non-deductible', () => {
    const result = computeProfitAndRoi({
      salePriceGross: 36.3,
      purchasePriceGross: 12.1,
      referralFeePercent: 0.15,
      fbaFeeGross: 3.63,
      vatRate: 0.21,
      vatContext: { isVatDeductible: false }
    });

    expect(result.netProfit.amount).toBe(10.87);
    expect(result.roiPercent).toBe(89.83);
  });

  it('returns negative ROI when opportunity loses money', () => {
    const result = computeProfitAndRoi({
      salePriceGross: 15,
      purchasePriceGross: 18,
      referralFeePercent: 0.2,
      fbaFeeGross: 3,
      vatRate: 0.21,
      vatContext: { isVatDeductible: true }
    });

    expect(result.netProfit.amount).toBeLessThan(0);
    expect(result.roiPercent).toBeLessThan(0);
  });
});
