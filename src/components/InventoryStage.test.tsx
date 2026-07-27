import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DEFAULT_SETTINGS } from '../game/config';
import { advanceDay, createNewRun } from '../game/engine';
import { InventoryStage } from './InventoryStage';

describe('InventoryStage', () => {
  it('provides a screen reader description for the inventory trend chart', () => {
    const result = advanceDay(createNewRun(12), 18, DEFAULT_SETTINGS);

    render(
      <InventoryStage
        draftOrderQuantity={18}
        settings={DEFAULT_SETTINGS}
        run={result.run}
      />
    );

    expect(
      screen.getByText(/inventory trend chart covering 1 recorded day/i)
    ).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /inventory level and inventory position over time/i })).toHaveAccessibleDescription(
      /inventory level starts at/i
    );
  });
});
