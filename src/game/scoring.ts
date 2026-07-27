import type { GameSettings, MonthEvaluation, MonthSummary, ThresholdBand } from './types';

const lowestBand = (thresholds: readonly ThresholdBand[]) => thresholds[thresholds.length - 1];

export const calculatePerformanceRatio = (totalInventoryManagementCost: number, totalUnitsSold: number) => {
  if (totalUnitsSold <= 0) {
    return Number.POSITIVE_INFINITY;
  }

  return totalInventoryManagementCost / totalUnitsSold;
};

export const evaluateMonthPerformance = (
  totalInventoryManagementCost: number,
  totalUnitsSold: number,
  settings: GameSettings
): MonthEvaluation => {
  const ratio = calculatePerformanceRatio(totalInventoryManagementCost, totalUnitsSold);
  const fallbackBand = lowestBand(settings.thresholds);

  if (totalUnitsSold < settings.minTotalUnitsSold) {
    return {
      label: fallbackBand.label,
      description: `You sold ${totalUnitsSold} units, which is below the required minimum of ${settings.minTotalUnitsSold}.`,
      ratio,
      enforcedMinimum: true
    };
  }

  const matchingBand =
    settings.thresholds.find((threshold) => ratio <= threshold.maxRatio) ?? fallbackBand;

  return {
    label: matchingBand.label,
    description: matchingBand.description,
    ratio,
    enforcedMinimum: false
  };
};

export const buildMonthSummary = (
  totals: Omit<
    MonthSummary,
    'totalInventoryManagementCost' | 'fillRate' | 'performanceRatio' | 'evaluation'
  >,
  settings: GameSettings
): MonthSummary => {
  const totalInventoryManagementCost =
    totals.totalHoldingCost + totals.totalOrderingCost + totals.totalStockoutCost;
  const fillRate = totals.totalDemand > 0 ? totals.totalUnitsSold / totals.totalDemand : 0;
  const performanceRatio = calculatePerformanceRatio(totalInventoryManagementCost, totals.totalUnitsSold);
  const evaluation = evaluateMonthPerformance(
    totalInventoryManagementCost,
    totals.totalUnitsSold,
    settings
  );

  return {
    ...totals,
    totalInventoryManagementCost,
    fillRate,
    performanceRatio,
    evaluation
  };
};
