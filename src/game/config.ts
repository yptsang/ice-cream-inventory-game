import type { GameSettings } from './types';
import { DEFAULT_EDUCATOR_SETTINGS } from './defaultEducatorSettings';

export const GAME_VERSION = 1;
export const DAYS_IN_RUN = 30;
export const DEMAND_MIN = 10;
export const DEMAND_MAX = 20;
export const MAX_ORDER_QUANTITY = 1000;
export const DEFAULT_STARTING_INVENTORY = 100;
export const DEFAULT_INITIAL_CASH = 320;
export const SALE_PRICE_PER_UNIT = 6;
export const ORDER_BLOCK_UNITS = 250;
export const DEFAULT_ORDER_COST_PER_250_UNITS = 80;
export const DEFAULT_HOLDING_COST_PER_UNIT = 0.35;
export const DEFAULT_STOCKOUT_COST_PER_UNIT = 1.4;
export const DEFAULT_LEAD_TIME_DAYS = 2;
export const STORAGE_KEYS = {
  run: 'ice-cream-game/run',
  settings: 'ice-cream-game/settings'
} as const;
export const SETTINGS_UNLOCK_SESSION_KEY = 'ice-cream-game/settings-unlocked';
export const DEFAULT_SETTINGS_PASSWORD_HASH =
  '0cc5c07b5977e740e79aaab090146ab3c21afceda974af2617faf7327790f45c';
export const DEFAULT_SETTINGS_PASSWORD = 'teacher-icecream';

export const DEFAULT_SETTINGS: GameSettings = {
  ...DEFAULT_EDUCATOR_SETTINGS,
  // Keep these constants here so other parts of the codebase can still import defaults.
  holdingCostPerUnit: DEFAULT_EDUCATOR_SETTINGS.holdingCostPerUnit ?? DEFAULT_HOLDING_COST_PER_UNIT,
  orderingCostPer250Units:
    DEFAULT_EDUCATOR_SETTINGS.orderingCostPer250Units ?? DEFAULT_ORDER_COST_PER_250_UNITS,
  stockoutCostPerUnit: DEFAULT_EDUCATOR_SETTINGS.stockoutCostPerUnit ?? DEFAULT_STOCKOUT_COST_PER_UNIT,
  leadTimeDays: DEFAULT_EDUCATOR_SETTINGS.leadTimeDays ?? DEFAULT_LEAD_TIME_DAYS
};
