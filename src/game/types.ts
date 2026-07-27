export type BandLabel = 'Excellent' | 'Balanced' | 'Needs Attention' | string;

export interface ThresholdBand {
  label: BandLabel;
  maxRatio: number;
  description: string;
}

export interface GameSettings {
  holdingCostPerUnit: number;
  orderingCostPer250Units: number;
  stockoutCostPerUnit: number;
  leadTimeDays: number;
  minTotalUnitsSold: number;
  thresholds: [ThresholdBand, ThresholdBand, ThresholdBand];
}

export interface IncomingOrder {
  quantity: number;
  arrivalDay: number;
}

export interface DailyLedgerEntry {
  day: number;
  receivedQuantity: number;
  demand: number;
  orderQuantity: number;
  availableInventory: number;
  inventoryPosition: number;
  soldUnits: number;
  stockoutUnits: number;
  endingInventory: number;
  holdingCost: number;
  orderingCost: number;
  stockoutCost: number;
  dailyTotalCost: number;
  cashBefore: number;
  cashAfter: number;
  cumulativeDemand: number;
  cumulativeSoldUnits: number;
  runningFillRate: number;
}

export interface MonthEvaluation {
  label: string;
  description: string;
  ratio: number;
  enforcedMinimum: boolean;
}

export interface MonthSummary {
  totalDemand: number;
  totalUnitsSold: number;
  totalStockoutUnits: number;
  totalHoldingCost: number;
  totalOrderingCost: number;
  totalStockoutCost: number;
  totalInventoryManagementCost: number;
  fillRate: number;
  performanceRatio: number;
  evaluation: MonthEvaluation;
}

export type RunStatus = 'in_progress' | 'completed';

export interface GameRun {
  day: number;
  currentInventory: number;
  incomingOrders: IncomingOrder[];
  cash: number;
  history: DailyLedgerEntry[];
  cumulativeDemand: number;
  cumulativeSoldUnits: number;
  cumulativeStockoutUnits: number;
  totalHoldingCost: number;
  totalOrderingCost: number;
  totalStockoutCost: number;
  fillRate: number;
  status: RunStatus;
  seed: number;
  summary: MonthSummary | null;
}

export interface PersistedEnvelope<T> {
  version: number;
  savedAt: string;
  value: T;
}

export interface SimulationResult {
  run: GameRun;
  latestEntry: DailyLedgerEntry;
}
