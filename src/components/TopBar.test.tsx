import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DEFAULT_SETTINGS } from '../game/config';
import { advanceDay, createNewRun } from '../game/engine';
import { TopBar } from './TopBar';

describe('TopBar', () => {
  it('keeps the sticky header lightweight and removes embedded order controls', () => {
    const result = advanceDay(createNewRun(12), 18, DEFAULT_SETTINGS);

    render(
      <TopBar
        isMinimized={false}
        onToggleMinimized={vi.fn()}
        run={result.run}
      />
    );

    expect(screen.getByRole('heading', { level: 1, name: /day 2 of 30/i })).toBeInTheDocument();
    expect(screen.queryByRole('slider', { name: /order quantity slider/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/today’s demand/i)).not.toBeInTheDocument();
  });
});
