import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DEFAULT_SETTINGS } from '../game/config';
import { advanceDay, createNewRun } from '../game/engine';
import { InventoryStage } from './InventoryStage';

describe('InventoryStage', () => {
  it('provides a screen reader description for the inventory trend chart', () => {
    const result = advanceDay(createNewRun(12), 18, DEFAULT_SETTINGS);

    const { container } = render(
      <InventoryStage
        draftOrderQuantity={18}
        settings={DEFAULT_SETTINGS}
        run={result.run}
      />
    );

    expect(
      screen.getByText(/inventory trend chart covering 1 recorded day/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole('img', { name: /inventory level, inventory position, and daily demand over time/i })
    ).toHaveAccessibleDescription(/daily demand starts at/i);
    expect(screen.getAllByText(/daily demand/i)).toHaveLength(2);
    expect(container.querySelector('.chart-line-demand')).toBeInTheDocument();
    expect(container.querySelector('.chart-line-position')).toBeInTheDocument();
  });

  it('renders all three trend series in the store chart', () => {
    const result = advanceDay(createNewRun(12), 18, DEFAULT_SETTINGS);

    const { container } = render(
      <InventoryStage
        draftOrderQuantity={18}
        settings={DEFAULT_SETTINGS}
        run={result.run}
      />
    );

    expect(container.querySelector('.chart-line-level')).toBeInTheDocument();
    expect(container.querySelector('.chart-line-position')).toBeInTheDocument();
    expect(container.querySelector('.chart-line-demand')).toBeInTheDocument();
  });

  it('shows in-transit inventory under Supplier and stockout cost under Customers', () => {
    const result = advanceDay(createNewRun(12), 18, DEFAULT_SETTINGS);

    render(
      <InventoryStage
        draftOrderQuantity={18}
        settings={DEFAULT_SETTINGS}
        run={result.run}
      />
    );

    const supplier = screen.getByRole('heading', { level: 3, name: /supplier/i }).closest('article');
    const customers = screen.getByRole('heading', { level: 3, name: /customers/i }).closest('article');
    const store = screen.getByRole('heading', { level: 3, name: /store/i }).closest('article');

    expect(supplier).not.toBeNull();
    expect(customers).not.toBeNull();
    expect(store).not.toBeNull();

    expect(within(supplier as HTMLElement).getByText(/in transit/i)).toBeInTheDocument();
    expect(within(supplier as HTMLElement).getByText(/today.s order/i)).toBeInTheDocument();
    expect(within(customers as HTMLElement).getByText(/stockout/i)).toBeInTheDocument();
    expect(within(store as HTMLElement).queryByText(/stockout/i)).not.toBeInTheDocument();
  });
});
