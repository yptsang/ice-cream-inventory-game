import type { MonthSummary } from '../game/types';

const formatMoney = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2
  }).format(value);

interface MonthResultSheetProps {
  summary: MonthSummary;
  onNewGame: () => void;
}

export const MonthResultSheet = ({ summary, onNewGame }: MonthResultSheetProps) => (
  <div className="overlay">
    <section
      aria-describedby="month-result-description"
      aria-labelledby="month-result-title"
      aria-modal="true"
      className="sheet result-sheet"
      role="dialog"
    >
      <p className="eyebrow">30-day result</p>
      <h2 id="month-result-title">{summary.evaluation.label}</h2>
      <p id="month-result-description">{summary.evaluation.description}</p>

      <dl className="sheet-grid">
        <div>
          <dt>Total fill rate</dt>
          <dd>{Math.round(summary.fillRate * 100)}%</dd>
        </div>
        <div>
          <dt>Total sold units</dt>
          <dd>{summary.totalUnitsSold}</dd>
        </div>
        <div>
          <dt>Total inventory cost</dt>
          <dd>{formatMoney(summary.totalInventoryManagementCost)}</dd>
        </div>
        <div>
          <dt>Cost per unit sold</dt>
          <dd>{Number.isFinite(summary.performanceRatio) ? formatMoney(summary.performanceRatio) : 'N/A'}</dd>
        </div>
      </dl>

      <button className="primary-button full-width" type="button" onClick={onNewGame}>
        Start a New 30-Day Run
      </button>
    </section>
  </div>
);
