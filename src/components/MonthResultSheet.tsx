import { useState } from 'react';
import { useI18n, getTranslatedMonthEvaluation } from '../i18n';
import type { GameRun, MonthSummary } from '../game/types';
import type { GameSettings } from '../game/types';
import { useAccessibleDialog } from '../hooks/useAccessibleDialog';
import { InventoryTrendChart, buildTrendChartModel } from './InventoryTrendChart';
import { exportResultSheet } from '../utils/exportResultSheet';

interface MonthResultSheetProps {
  run: GameRun;
  settings: GameSettings;
  summary: MonthSummary;
  onNewGame: () => void;
}

export const MonthResultSheet = ({ run, settings, summary, onNewGame }: MonthResultSheetProps) => (
  <MonthResultDialog onNewGame={onNewGame} run={run} settings={settings} summary={summary} />
);

const MonthResultDialog = ({ run, settings, summary, onNewGame }: MonthResultSheetProps) => {
  const { formatCurrency, formatNumber, formatPercent, language, t } = useI18n();
  const dialogRef = useAccessibleDialog<HTMLElement>({
    isOpen: true,
    onClose: onNewGame
  });
  const evaluation = getTranslatedMonthEvaluation(language, summary, settings);
  const chartModel = buildTrendChartModel(run, t, formatNumber);
  const [saveError, setSaveError] = useState<string | null>(null);

  const metrics = [
    {
      label: t('monthResultTotalFillRate'),
      value: formatPercent(summary.fillRate)
    },
    {
      label: t('monthResultTotalSoldUnits'),
      value: formatNumber(summary.totalUnitsSold)
    },
    {
      label: t('monthResultTotalInventoryCost'),
      value: formatCurrency(summary.totalInventoryManagementCost)
    },
    {
      label: t('monthResultCostPerUnitSold'),
      value: Number.isFinite(summary.performanceRatio) ? formatCurrency(summary.performanceRatio) : t('commonNA')
    }
  ];

  const handleSave = async () => {
    try {
      setSaveError(null);
      await exportResultSheet({
        axisDayLabel: t('chartAxisDay'),
        axisUnitsLabel: t('chartAxisUnits'),
        chartTitle: t('chartInventoryTrend'),
        description: evaluation.description,
        evaluationLabel: evaluation.label,
        eyebrow: t('monthResult30Day'),
        fileName: 'ice-cream-30-day-result.png',
        metrics,
        trendChart: chartModel
      });
    } catch {
      setSaveError(t('monthResultSaveImageError'));
    }
  };

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
          {metrics.map((metric) => (
            <div key={metric.label}>
              <dt>{metric.label}</dt>
              <dd>{metric.value}</dd>
            </div>
          ))}
        </dl>

        <section className="result-chart-block" aria-labelledby="month-result-chart-title">
          <h3 className="result-chart-title" id="month-result-chart-title">
            {t('chartInventoryTrend')}
          </h3>
          <InventoryTrendChart
            ariaLabel={t('inventoryChartAriaExpanded')}
            chartDescription={chartModel.chartDescription}
            chartHeight={chartModel.chartHeight}
            chartPadding={chartModel.chartPadding}
            chartWidth={chartModel.chartWidth}
            descriptionId="month-result-chart-description"
            series={chartModel.series}
            t={t}
            xTicks={chartModel.xTicks}
            yTicks={chartModel.yTicks}
          />
        </section>

        <div className="result-sheet-actions">
          <button className="ghost-button" type="button" onClick={handleSave}>
            {t('monthResultSaveImage')}
          </button>
          <button className="primary-button result-sheet-primary-action" type="button" onClick={onNewGame}>
            {t('monthResultStartNewRun')}
          </button>
        </div>
        {saveError ? (
          <p className="result-sheet-error" role="alert">
            {saveError}
          </p>
        ) : null}
      </section>
    </div>
  );
};
