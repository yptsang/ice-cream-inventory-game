import {
  DAYS_IN_RUN,
  DEFAULT_INITIAL_CASH,
  DEFAULT_STARTING_INVENTORY,
  DEMAND_MAX,
  DEMAND_MIN,
  ORDER_BLOCK_UNITS,
  SALE_PRICE_PER_UNIT
} from './config';
import { createSeed, uniformIntFromSeed } from './random';
import { buildMonthSummary } from './scoring';
import type { DailyLedgerEntry, GameRun, GameSettings, SimulationResult } from './types';

const roundCurrency = (value: number) => Math.round(value * 100) / 100;

export const createNewRun = (seed = createSeed()): GameRun => ({
  day: 1,
  currentInventory: DEFAULT_STARTING_INVENTORY,
  incomingOrders: [],
  cash: DEFAULT_INITIAL_CASH,
  history: [],
  cumulativeDemand: 0,
  cumulativeSoldUnits: 0,
  cumulativeStockoutUnits: 0,
  totalHoldingCost: 0,
  totalOrderingCost: 0,
  totalStockoutCost: 0,
  fillRate: 0,
  status: 'in_progress',
  seed,
  summary: null
});

const createFinalSummary = (run: GameRun, settings: GameSettings) =>
  buildMonthSummary(
    {
      totalDemand: run.cumulativeDemand,
      totalUnitsSold: run.cumulativeSoldUnits,
      totalStockoutUnits: run.cumulativeStockoutUnits,
      totalHoldingCost: roundCurrency(run.totalHoldingCost),
      totalOrderingCost: roundCurrency(run.totalOrderingCost),
      totalStockoutCost: roundCurrency(run.totalStockoutCost)
    },
    settings
  );

export const advanceDay = (
  run: GameRun,
  orderQuantity: number,
  settings: GameSettings
): SimulationResult => {
  if (run.status === 'completed') {
    throw new Error('The run is already complete.');
  }

  const normalizedOrder = Math.max(0, Math.floor(orderQuantity));
  const effectiveLeadTimeDays = Math.max(1, Math.floor(settings.leadTimeDays));
  const arrivingToday = run.incomingOrders.filter((incomingOrder) => incomingOrder.arrivalDay === run.day);
  const receivedQuantity = arrivingToday.reduce(
    (total, incomingOrder) => total + incomingOrder.quantity,
    0
  );
  const availableInventory = run.currentInventory + receivedQuantity;
  const { seed, value: demand } = uniformIntFromSeed(run.seed, DEMAND_MIN, DEMAND_MAX);
  const soldUnits = Math.min(availableInventory, demand);
  const stockoutUnits = Math.max(0, demand - availableInventory);
  const endingInventory = Math.max(0, availableInventory - soldUnits);
  const orderPlacedToday = normalizedOrder > 0;
  const orderingCost = orderPlacedToday
    ? Math.ceil(normalizedOrder / ORDER_BLOCK_UNITS) * settings.orderingCostPer250Units
    : 0;
  const holdingCost = roundCurrency(endingInventory * settings.holdingCostPerUnit);
  const stockoutCost = roundCurrency(stockoutUnits * settings.stockoutCostPerUnit);
  const dailyTotalCost = roundCurrency(orderingCost + holdingCost + stockoutCost);
  const cashBefore = run.cash;
  const revenue = roundCurrency(soldUnits * SALE_PRICE_PER_UNIT);
  const cashAfter = roundCurrency(cashBefore + revenue - dailyTotalCost);
  const cumulativeDemand = run.cumulativeDemand + demand;
  const cumulativeSoldUnits = run.cumulativeSoldUnits + soldUnits;
  const cumulativeStockoutUnits = run.cumulativeStockoutUnits + stockoutUnits;
  const runningFillRate = cumulativeDemand > 0 ? cumulativeSoldUnits / cumulativeDemand : 0;
  const projectedInventoryPosition =
    endingInventory +
    run.incomingOrders
      .filter((incomingOrder) => incomingOrder.arrivalDay > run.day)
      .reduce((total, incomingOrder) => total + incomingOrder.quantity, 0) +
    normalizedOrder;

  const latestEntry: DailyLedgerEntry = {
    day: run.day,
    receivedQuantity,
    demand,
    orderQuantity: normalizedOrder,
    availableInventory,
    inventoryPosition: projectedInventoryPosition,
    soldUnits,
    stockoutUnits,
    endingInventory,
    holdingCost,
    orderingCost,
    stockoutCost,
    dailyTotalCost,
    cashBefore,
    cashAfter,
    cumulativeDemand,
    cumulativeSoldUnits,
    runningFillRate
  };

  const nextIncomingOrders = run.incomingOrders
    .filter((incomingOrder) => incomingOrder.arrivalDay > run.day)
    .concat(
      normalizedOrder > 0
        ? [
            {
              quantity: normalizedOrder,
              arrivalDay: run.day + effectiveLeadTimeDays
            }
          ]
        : []
    );

  const nextRun: GameRun = {
    day: run.day + 1,
    currentInventory: endingInventory,
    incomingOrders: nextIncomingOrders,
    cash: cashAfter,
    history: [...run.history, latestEntry],
    cumulativeDemand,
    cumulativeSoldUnits,
    cumulativeStockoutUnits,
    totalHoldingCost: roundCurrency(run.totalHoldingCost + holdingCost),
    totalOrderingCost: roundCurrency(run.totalOrderingCost + orderingCost),
    totalStockoutCost: roundCurrency(run.totalStockoutCost + stockoutCost),
    fillRate: runningFillRate,
    status: run.day >= DAYS_IN_RUN ? 'completed' : 'in_progress',
    seed,
    summary: null
  };

  if (nextRun.status === 'completed') {
    nextRun.summary = createFinalSummary(nextRun, settings);
  }

  return {
    run: nextRun,
    latestEntry
  };
};
