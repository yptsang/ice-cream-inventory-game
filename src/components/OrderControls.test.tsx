import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MAX_ORDER_QUANTITY } from '../game/config';
import { OrderControls } from './OrderControls';

describe('OrderControls', () => {
  it('renders a compact order input with the 1000-unit cap', () => {
    render(<OrderControls compact onChange={vi.fn()} value={0} />);

    expect(screen.getByRole('slider', { name: /order quantity slider/i })).toHaveAttribute(
      'max',
      String(MAX_ORDER_QUANTITY)
    );
    expect(screen.getByRole('spinbutton', { name: /order quantity/i })).toHaveAttribute(
      'max',
      String(MAX_ORDER_QUANTITY)
    );
  });

  it('removes the extra explanatory paragraphs from the order panel', () => {
    render(<OrderControls compact onChange={vi.fn()} value={7} />);

    expect(screen.queryByText(/lead time/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/order fee/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/arrive on day/i)).not.toBeInTheDocument();
  });
});
