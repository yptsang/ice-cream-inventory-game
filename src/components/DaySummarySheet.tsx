import type { DailyLedgerEntry } from '../game/types';
import { useAccessibleDialog } from '../hooks/useAccessibleDialog';
import { useI18n } from '../i18n';

interface DaySummarySheetProps {
  entry: DailyLedgerEntry;
  onClose: () => void;
}

export const DaySummarySheet = ({ entry, onClose }: DaySummarySheetProps) => (
  <DaySummaryDialog entry={entry} onClose={onClose} />
);

const DaySummaryDialog = ({ entry, onClose }: DaySummarySheetProps) => {
  const { formatCurrency, formatNumber, formatPercent, t } = useI18n();
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
            <p className="eyebrow">{t('daySummaryDailyFeedback')}</p>
            <h2 id="day-summary-title">{t('commonDaySummary', { day: formatNumber(entry.day) })}</h2>
            <p className="support-copy" id="day-summary-description">
              {t('daySummaryDescription')}
            </p>
          </div>
          <button className="ghost-button" type="button" onClick={onClose}>
            {t('commonClose')}
          </button>
        </div>

        <dl className="sheet-grid">
          <div>
            <dt>{t('daySummaryReceived')}</dt>
            <dd>{formatNumber(entry.receivedQuantity)}</dd>
          </div>
          <div>
            <dt>{t('daySummaryDemand')}</dt>
            <dd>{formatNumber(entry.demand)}</dd>
          </div>
          <div>
            <dt>{t('daySummarySoldUnits')}</dt>
            <dd>{formatNumber(entry.soldUnits)}</dd>
          </div>
          <div>
            <dt>{t('daySummaryEndingInventory')}</dt>
            <dd>{formatNumber(entry.endingInventory)}</dd>
          </div>
          <div>
            <dt>{t('daySummaryStockouts')}</dt>
            <dd>{formatNumber(entry.stockoutUnits)}</dd>
          </div>
          <div>
            <dt>{t('daySummaryHoldingCost')}</dt>
            <dd>{formatCurrency(entry.holdingCost)}</dd>
          </div>
          <div>
            <dt>{t('daySummaryOrderFee')}</dt>
            <dd>{formatCurrency(entry.orderingCost)}</dd>
          </div>
          <div>
            <dt>{t('daySummaryStockoutCost')}</dt>
            <dd>{formatCurrency(entry.stockoutCost)}</dd>
          </div>
          <div>
            <dt>{t('daySummaryDailyTotalCost')}</dt>
            <dd>{formatCurrency(entry.dailyTotalCost)}</dd>
          </div>
          <div>
            <dt>{t('daySummaryFillRate')}</dt>
            <dd>{formatPercent(entry.runningFillRate)}</dd>
          </div>
        </dl>
      </section>
    </div>
  );
};
