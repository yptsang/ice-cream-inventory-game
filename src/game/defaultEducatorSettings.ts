import type { GameSettings } from './types';

/**
 * Developer note:
 * Edit this file to change the default values that appear in Educator Settings.
 * These values are used when the app has no saved settings in localStorage.
 */
export const DEFAULT_EDUCATOR_SETTINGS: GameSettings = {
  holdingCostPerUnit: 0.35,
  orderingCostPer250Units: 80,
  stockoutCostPerUnit: 1.4,
  leadTimeDays: 2,
  minTotalUnitsSold: 360,
  thresholds: [
    {
      label: 'Excellent',
      maxRatio: 1.55,
      description:
        'You balanced ordering, leftovers, and stockouts very well. Your cost per unit sold stayed lean.'
    },
    {
      label: 'Balanced',
      maxRatio: 2.25,
      description:
        'You kept the shop moving, but there is still room to reduce cost or improve availability.'
    },
    {
      label: 'Needs Attention',
      maxRatio: 3.4,
      description:
        'Your strategy created too much waste or too many stockouts. Review the trade-off between risk and buffer stock.'
    }
  ]
};

