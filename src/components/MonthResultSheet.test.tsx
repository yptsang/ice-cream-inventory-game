import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DEFAULT_SETTINGS } from '../game/config';
import { advanceDay, createNewRun } from '../game/engine';
import { I18nProvider } from '../i18n';
import { MonthResultSheet } from './MonthResultSheet';

const createCompletedRun = () => {
  let run = createNewRun(12);

  for (let day = 0; day < 30; day += 1) {
    run = advanceDay(run, 18, DEFAULT_SETTINGS).run;
  }

  if (!run.summary) {
    throw new Error('Expected completed run to include a month summary.');
  }

  return run;
};

describe('MonthResultSheet', () => {
  it('renders the full trend chart below the result metrics', () => {
    const run = createCompletedRun();

    render(
      <I18nProvider>
        <MonthResultSheet
          onNewGame={() => undefined}
          run={run}
          settings={DEFAULT_SETTINGS}
          summary={run.summary!}
        />
      </I18nProvider>
    );

    expect(screen.getByText(/30-day result/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: /inventory trend/i })).toBeInTheDocument();
    expect(screen.getAllByText(/daily demand/i).length).toBeGreaterThan(0);
  });

  it('shows a save button beside the new run action', () => {
    const run = createCompletedRun();

    render(
      <I18nProvider>
        <MonthResultSheet
          onNewGame={() => undefined}
          run={run}
          settings={DEFAULT_SETTINGS}
          summary={run.summary!}
        />
      </I18nProvider>
    );

    expect(screen.getByRole('button', { name: /save result/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /start a new 30-day run/i })).toBeInTheDocument();
  });
});
