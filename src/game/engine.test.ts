import { describe, expect, it } from 'vitest';
import { DEFAULT_SETTINGS, DEFAULT_STARTING_INVENTORY } from './config';
import { advanceDay, createNewRun } from './engine';

describe('advanceDay', () => {
  it('keeps generated demand within the configured uniform bounds', () => {
    let run = createNewRun(1);

    for (let index = 0; index < 10; index += 1) {
      const result = advanceDay(run, 5, DEFAULT_SETTINGS);
      expect(result.latestEntry.demand).toBeGreaterThanOrEqual(10);
      expect(result.latestEntry.demand).toBeLessThanOrEqual(20);
      run = result.run;
    }
  });

  it('starts day 1 with 100 units in inventory', () => {
    expect(createNewRun(99).currentInventory).toBe(DEFAULT_STARTING_INVENTORY);
  });

  it('never sells more units than available inventory', () => {
    const run = {
      ...createNewRun(2),
      currentInventory: 1
    };
    const result = advanceDay(run, 0, DEFAULT_SETTINGS);

    expect(result.latestEntry.soldUnits).toBeLessThanOrEqual(result.latestEntry.availableInventory);
  });

  it('records stockout units when demand exceeds available inventory', () => {
    const run = {
      ...createNewRun(3),
      currentInventory: 0
    };
    const result = advanceDay(run, 1, DEFAULT_SETTINGS);

    expect(result.latestEntry.stockoutUnits).toBeGreaterThan(0);
    expect(result.latestEntry.soldUnits).toBe(0);
  });

  it('delays replenishment by 2 days before the ordered stock arrives', () => {
    const run = {
      ...createNewRun(31),
      currentInventory: 0
    };

    const dayOne = advanceDay(run, 10, DEFAULT_SETTINGS);
    const dayTwo = advanceDay(dayOne.run, 0, DEFAULT_SETTINGS);
    const dayThree = advanceDay(dayTwo.run, 0, DEFAULT_SETTINGS);

    expect(dayOne.latestEntry.receivedQuantity).toBe(0);
    expect(dayTwo.latestEntry.receivedQuantity).toBe(0);
    expect(dayThree.latestEntry.receivedQuantity).toBe(10);
    expect(dayOne.run.incomingOrders).toEqual([{ arrivalDay: 3, quantity: 10 }]);
  });

  it('applies holding cost to leftover inventory', () => {
    const run = {
      ...createNewRun(4),
      currentInventory: 25
    };
    const result = advanceDay(run, 0, DEFAULT_SETTINGS);

    expect(result.latestEntry.endingInventory).toBeGreaterThan(0);
    expect(result.latestEntry.holdingCost).toBe(
      Math.round(result.latestEntry.endingInventory * DEFAULT_SETTINGS.holdingCostPerUnit * 100) / 100
    );
  });

  it('charges the ordering fee once when any order is placed', () => {
    const result = advanceDay(createNewRun(5), 4, DEFAULT_SETTINGS);
    expect(result.latestEntry.orderingCost).toBe(DEFAULT_SETTINGS.orderingCostPer250Units);
  });

  it('charges ordering cost in 250-unit blocks', () => {
    const oneUnit = advanceDay(createNewRun(51), 1, DEFAULT_SETTINGS);
    const twoFifty = advanceDay(createNewRun(52), 250, DEFAULT_SETTINGS);
    const twoFiftyOne = advanceDay(createNewRun(53), 251, DEFAULT_SETTINGS);

    expect(oneUnit.latestEntry.orderingCost).toBe(DEFAULT_SETTINGS.orderingCostPer250Units);
    expect(twoFifty.latestEntry.orderingCost).toBe(DEFAULT_SETTINGS.orderingCostPer250Units);
    expect(twoFiftyOne.latestEntry.orderingCost).toBe(DEFAULT_SETTINGS.orderingCostPer250Units * 2);
  });

  it('does not charge an ordering fee when no order is placed', () => {
    const result = advanceDay(createNewRun(8), 0, DEFAULT_SETTINGS);
    expect(result.latestEntry.orderingCost).toBe(0);
  });

  it('does not store backlog when a stockout happens', () => {
    const run = {
      ...createNewRun(61),
      currentInventory: 0
    };
    const dayOne = advanceDay(run, 0, DEFAULT_SETTINGS);
    const dayTwo = advanceDay(dayOne.run, 0, DEFAULT_SETTINGS);

    expect(dayOne.latestEntry.stockoutUnits).toBeGreaterThanOrEqual(0);
    expect(dayOne.run.currentInventory).toBe(0);
    expect(dayTwo.run.currentInventory).toBe(0);
  });

  it('updates fill rate cumulatively after each simulated day', () => {
    const dayOne = advanceDay(createNewRun(6), 5, DEFAULT_SETTINGS);
    const dayTwo = advanceDay(dayOne.run, 2, DEFAULT_SETTINGS);
    const expectedFillRate =
      dayTwo.run.cumulativeSoldUnits / dayTwo.run.cumulativeDemand;

    expect(dayTwo.run.fillRate).toBeCloseTo(expectedFillRate, 10);
  });

  it('stops the run after day 30 and derives the month-end summary', () => {
    let run = createNewRun(7);

    for (let index = 0; index < 30; index += 1) {
      run = advanceDay(run, 5, DEFAULT_SETTINGS).run;
    }

    expect(run.status).toBe('completed');
    expect(run.summary).not.toBeNull();
    expect(run.history).toHaveLength(30);
  });
});
