import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DEFAULT_SETTINGS } from '../game/config';
import { advanceDay, createNewRun } from '../game/engine';
import { TopBar } from './TopBar';

describe('TopBar', () => {
  it("shows today's demand in the sticky metrics row", () => {
    const result = advanceDay(createNewRun(12), 18, DEFAULT_SETTINGS);

    render(
      <TopBar
        draftOrderQuantity={18}
        isMinimized={false}
        onOrderChange={vi.fn()}
        onToggleMinimized={vi.fn()}
        run={result.run}
        totalCost={result.run.totalHoldingCost + result.run.totalOrderingCost + result.run.totalStockoutCost}
      />
    );

    expect(screen.getByText("Today's Demand")).toBeInTheDocument();
    expect(screen.getByText(String(result.run.history.at(-1)?.demand ?? 0))).toBeInTheDocument();
  });
});
