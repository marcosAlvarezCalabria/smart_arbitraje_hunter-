import { ComputeFinanceInput, FinanceResult } from './types.js';

const round2 = (value: number): number => Math.round(value * 100) / 100;

export const grossToNet = (gross: number, vatRate: number): number => {
  return gross / (1 + vatRate);
};

export const computeProfitAndRoi = (input: ComputeFinanceInput): FinanceResult => {
  const saleNet = grossToNet(input.salePriceGross, input.vatRate);

  const purchaseNet = input.vatContext.isVatDeductible
    ? grossToNet(input.purchasePriceGross, input.vatRate)
    : input.purchasePriceGross;

  const fbaFeeNet = input.vatContext.isVatDeductible
    ? grossToNet(input.fbaFeeGross, input.vatRate)
    : input.fbaFeeGross;

  const referralFee = saleNet * input.referralFeePercent;

  const netProfitValue = round2(saleNet - purchaseNet - fbaFeeNet - referralFee);
  const roiBase = purchaseNet <= 0 ? 0 : purchaseNet;
  const roiPercent = roiBase === 0 ? 0 : round2((netProfitValue / roiBase) * 100);

  return {
    netProfit: {
      amount: netProfitValue,
      currency: 'EUR',
      isGross: false,
      vatRate: input.vatRate
    },
    roiPercent
  };
};
