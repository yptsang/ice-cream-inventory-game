import type { GameSettings } from './types';

/**
 * Developer note:
 * Edit this file to change the default values that appear in Educator Settings.
 * These values are used when the app has no saved settings in localStorage.
 */
export const DEFAULT_EDUCATOR_SETTINGS: GameSettings = {
  holdingCostPerUnit: 0.50,
  orderingCostPer250Units: 80,
  stockoutCostPerUnit: 1.4,
  leadTimeDays: 2,
  minTotalUnitsSold: 360,
  thresholds: [
    {
      label: 'Excellent',
      maxRatio: 2.4,
      description:
        'You balanced ordering, leftovers, and stockouts very well. Your cost per unit sold stayed lean.'
    },
    {
      label: 'Not Bad',
      maxRatio: 2.8,
      description:
        'You kept the shop moving, but there is still room to reduce cost or improve availability.'
    },
    {
      label: 'Needs A Good Strategy',
      maxRatio: 3.6,
      description:
        'Your strategy created too much waste or too many stockouts. Review the trade-off between risk and buffer stock.'
    }
  ]
};

