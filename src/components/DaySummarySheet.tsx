import type { DailyLedgerEntry } from '../game/types';
import { useAccessibleDialog } from '../hooks/useAccessibleDialog';

const formatMoney = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2
  }).format(value);

interface DaySummarySheetProps {
  entry: DailyLedgerEntry;
  onClose: () => void;
}

export const DaySummarySheet = ({ entry, onClose }: DaySummarySheetProps) => (
  <DaySummaryDialog entry={entry} onClose={onClose} />
);

const DaySummaryDialog = ({ entry, onClose }: DaySummarySheetProps) => {
  const dialogRef = useAccessibleDialog<HTMLElement>({
    isOpen: true,
    onClose
  });

  return (
    <div className="overlay">
      <section
        aria-describedby="day-summary-description"
        aria-labelledby="day-summary-title"
        aria-modal="true"
        className="sheet"
        ref={dialogRef}
        role="dialog"
        tabIndex={-1}
      >
        <div className="sheet-header">
          <div>
            <p className="eyebrow">Daily feedback</p>
            <h2 id="day-summary-title">Day {entry.day} summary</h2>
            <p className="support-copy" id="day-summary-description">
              Review demand, inventory, and today’s cost outcome.
            </p>
          </div>
          <button className="ghost-button" type="button" onClick={onClose}>
            Close
          </button>
        </div>

        <dl className="sheet-grid">
          <div>
            <dt>Received</dt>
            <dd>{entry.receivedQuantity}</dd>
          </div>
          <div>
            <dt>Demand</dt>
            <dd>{entry.demand}</dd>
          </div>
          <div>
            <dt>Sold units</dt>
            <dd>{entry.soldUnits}</dd>
          </div>
          <div>
            <dt>Ending inventory</dt>
            <dd>{entry.endingInventory}</dd>
          </div>
          <div>
            <dt>Stockouts</dt>
            <dd>{entry.stockoutUnits}</dd>
          </div>
          <div>
            <dt>Holding cost</dt>
            <dd>{formatMoney(entry.holdingCost)}</dd>
          </div>
          <div>
            <dt>Order fee</dt>
            <dd>{formatMoney(entry.orderingCost)}</dd>
          </div>
          <div>
            <dt>Stockout cost</dt>
            <dd>{formatMoney(entry.stockoutCost)}</dd>
          </div>
          <div>
            <dt>Daily total cost</dt>
            <dd>{formatMoney(entry.dailyTotalCost)}</dd>
          </div>
          <div>
            <dt>Fill rate</dt>
            <dd>{Math.round(entry.runningFillRate * 100)}%</dd>
          </div>
        </dl>
      </section>
    </div>
  );
};
