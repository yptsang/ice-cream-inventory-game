import { describe, expect, it } from 'vitest';
import { DEFAULT_SETTINGS } from './config';
import { calculatePerformanceRatio, evaluateMonthPerformance } from './scoring';

describe('evaluateMonthPerformance', () => {
  it('returns the lowest band when total sold units are below the configured minimum', () => {
    const result = evaluateMonthPerformance(120, 200, DEFAULT_SETTINGS);

    expect(result.label).toBe(DEFAULT_SETTINGS.thresholds[2].label);
    expect(result.enforcedMinimum).toBe(true);
  });

  it('returns the first threshold band when the ratio is within the first limit', () => {
    const result = evaluateMonthPerformance(400, 300, {
      ...DEFAULT_SETTINGS,
      minTotalUnitsSold: 100
    });

    expect(result.label).toBe(DEFAULT_SETTINGS.thresholds[0].label);
  });

  it('returns the middle threshold band when the ratio is above the first limit but below the second', () => {
    const result = evaluateMonthPerformance(480, 250, {
      ...DEFAULT_SETTINGS,
      minTotalUnitsSold: 100
    });

    expect(result.label).toBe(DEFAULT_SETTINGS.thresholds[1].label);
  });

  it('returns the last threshold band when the ratio is above the prior thresholds', () => {
    const result = evaluateMonthPerformance(900, 250, {
      ...DEFAULT_SETTINGS,
      minTotalUnitsSold: 100
    });

    expect(result.label).toBe(DEFAULT_SETTINGS.thresholds[2].label);
  });

  it('handles zero sold units safely', () => {
    expect(calculatePerformanceRatio(100, 0)).toBe(Number.POSITIVE_INFINITY);
  });
});
