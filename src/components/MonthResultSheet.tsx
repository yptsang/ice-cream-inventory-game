import { useI18n, getTranslatedMonthEvaluation } from '../i18n';
import type { MonthSummary } from '../game/types';
import type { GameSettings } from '../game/types';
import { useAccessibleDialog } from '../hooks/useAccessibleDialog';

interface MonthResultSheetProps {
  settings: GameSettings;
  summary: MonthSummary;
  onNewGame: () => void;
}

export const MonthResultSheet = ({ settings, summary, onNewGame }: MonthResultSheetProps) => (
  <MonthResultDialog onNewGame={onNewGame} settings={settings} summary={summary} />
);

const MonthResultDialog = ({ settings, summary, onNewGame }: MonthResultSheetProps) => {
  const { formatCurrency, formatPercent, language, t } = useI18n();
  const dialogRef = useAccessibleDialog<HTMLElement>({
    isOpen: true,
    onClose: onNewGame
  });
  const evaluation = getTranslatedMonthEvaluation(language, summary, settings);

  return (
    <div className="overlay">
      <section
        aria-describedby="month-result-description"
        aria-labelledby="month-result-title"
        aria-modal="true"
        className="sheet result-sheet"
        ref={dialogRef}
        role="dialog"
        tabIndex={-1}
      >
        <p className="eyebrow">{t('monthResult30Day')}</p>
        <h2 id="month-result-title">{evaluation.label}</h2>
        <p id="month-result-description">{evaluation.description}</p>

        <dl className="sheet-grid">
          <div>
            <dt>{t('monthResultTotalFillRate')}</dt>
            <dd>{formatPercent(summary.fillRate)}</dd>
          </div>
          <div>
            <dt>{t('monthResultTotalSoldUnits')}</dt>
            <dd>{summary.totalUnitsSold}</dd>
          </div>
          <div>
            <dt>{t('monthResultTotalInventoryCost')}</dt>
            <dd>{formatCurrency(summary.totalInventoryManagementCost)}</dd>
          </div>
          <div>
            <dt>{t('monthResultCostPerUnitSold')}</dt>
            <dd>{Number.isFinite(summary.performanceRatio) ? formatCurrency(summary.performanceRatio) : t('commonNA')}</dd>
          </div>
        </dl>

        <button className="primary-button full-width" type="button" onClick={onNewGame}>
          {t('monthResultStartNewRun')}
        </button>
      </section>
    </div>
  );
};
