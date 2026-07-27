import { useState } from 'react';
import type { GameRun, GameSettings } from '../game/types';
import { useAccessibleDialog } from '../hooks/useAccessibleDialog';
import { useI18n } from '../i18n';

interface InventoryStageProps {
  draftOrderQuantity: number;
  settings: GameSettings;
  run: GameRun;
}

const createLinePoints = (values: number[], width: number, height: number, padding: number) => {
  if (values.length === 0) {
    return '';
  }

  const maxValue = Math.max(...values, 1);
  const stepX = values.length === 1 ? 0 : (width - padding * 2) / (values.length - 1);

  return values
    .map((value, index) => {
      const x = padding + index * stepX;
      const y = height - padding - (value / maxValue) * (height - padding * 2);
      return `${x},${y}`;
    })
    .join(' ');
};

const buildTicks = (maxValue: number, tickCount: number) => {
  const safeMax = Math.max(1, maxValue);
  const step = Math.ceil(safeMax / tickCount);
  const ceiling = step * tickCount;
  return Array.from({ length: tickCount + 1 }).map((_, index) => ({
    label: String(index * step),
    value: index * step,
    ceiling
  }));
};

export const InventoryStage = ({
  draftOrderQuantity,
  settings,
  run
}: InventoryStageProps) => {
  const { formatCurrency, formatNumber, formatPercent, t } = useI18n();
  const [isChartExpanded, setIsChartExpanded] = useState(false);
  const [isLogicOpen, setIsLogicOpen] = useState(false);
  const logicDialogRef = useAccessibleDialog<HTMLElement>({
    isOpen: isLogicOpen,
    onClose: () => setIsLogicOpen(false)
  });
  const expandedChartDialogRef = useAccessibleDialog<HTMLElement>({
    isOpen: isChartExpanded,
    onClose: () => setIsChartExpanded(false)
  });
  const latestEntry = run.history.at(-1);
  const todayDemand = latestEntry?.demand ?? 0;
  const todaySoldUnits = latestEntry?.soldUnits ?? 0;
  const inTransitUnits = run.incomingOrders.reduce(
    (total, incomingOrder) => total + incomingOrder.quantity,
    0
  );
  const inventoryLevels = run.history.map((entry) => entry.endingInventory);
  const inventoryPositions = run.history.map((entry) => entry.inventoryPosition);
  const yMax = Math.max(1, ...inventoryLevels, ...inventoryPositions);
  const yTicks = buildTicks(yMax, 4);
  const chartWidth = 880;
  const chartHeight = 420;
  const chartPadding = 64;
  const inventoryLevelPoints = createLinePoints(
    inventoryLevels,
    chartWidth,
    chartHeight,
    chartPadding
  );
  const inventoryPositionPoints = createLinePoints(
    inventoryPositions,
    chartWidth,
    chartHeight,
    chartPadding
  );
  const xTickEvery = 5;
  const xTicks = run.history.length
    ? run.history
        .filter((entry) => entry.day === 1 || entry.day % xTickEvery === 0 || entry.day === 30)
        .map((entry) => entry.day)
    : [];
  const chartDescription = run.history.length
    ? t('inventoryChartDescription', {
        count: formatNumber(run.history.length),
        endInventory: formatNumber(inventoryLevels[inventoryLevels.length - 1]),
        endPosition: formatNumber(inventoryPositions[inventoryPositions.length - 1]),
        startInventory: formatNumber(inventoryLevels[0]),
        startPosition: formatNumber(inventoryPositions[0])
      })
    : t('inventoryChartPlaceholder');

  return (
    <section aria-labelledby="inventory-stage-title" className="inventory-stage supply-stage">
      <div className="stage-copy stage-copy-row">
        <div>
          <p className="eyebrow">{t('inventorySupplyChain')}</p>
          <h2 id="inventory-stage-title">{t('inventorySupplyChainTitle')}</h2>
        </div>
        <button className="ghost-button" type="button" onClick={() => setIsLogicOpen(true)}>
          {t('inventoryGameLogic')}
        </button>
      </div>

      <div className="supply-chain-board" role="presentation">
        <article className="supply-node supply-node-supplier">
          <div aria-hidden="true" className="node-icon">
            🏭
          </div>
          <h3>{t('inventorySupplier')}</h3>
          <dl className="node-stats node-stats-vertical">
            <div>
              <dt>{t('inventoryInTransit')}</dt>
              <dd>{formatNumber(inTransitUnits)}</dd>
            </div>
            <div>
              <dt>{t('inventoryTodayOrder')}</dt>
              <dd>{formatNumber(draftOrderQuantity)}</dd>
            </div>
            <div className="config-block">
              <dt>{t('inventoryLeadTime')}</dt>
              <dd>{t('commonDay', { count: formatNumber(settings.leadTimeDays) })}</dd>
            </div>
            <div className="config-block">
              <dt>{t('inventoryOrderCost')}</dt>
              <dd>{t('inventoryOrderingCostValue', { cost: formatCurrency(settings.orderingCostPer250Units) })}</dd>
            </div>
          </dl>
        </article>

        <div aria-hidden="true" className="flow-arrow flow-arrow-left">
          →
        </div>

        <article className="supply-node supply-node-store">
          <div aria-hidden="true" className="node-icon">
            🏪
          </div>
          <h3>{t('inventoryStore')}</h3>
          <div
            aria-describedby="inventory-chart-description"
            aria-label={t('inventoryChartAria')}
            className="store-chart"
            role="img"
          >
            <div className="chart-toolbar">
              <span className="chart-title">{t('chartInventoryTrend')}</span>
              <button
                className="ghost-button chart-expand-button"
                type="button"
                onClick={() => setIsChartExpanded(true)}
              >
                {t('inventoryEnlargeChart')}
              </button>
            </div>
            <p className="sr-only" id="inventory-chart-description">
              {chartDescription}
            </p>
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              aria-hidden="true"
              preserveAspectRatio="xMidYMid meet"
            >
              <text className="chart-axis-label" x={chartWidth / 2} y={chartHeight - 6} textAnchor="middle">
                {t('chartAxisDay')}
              </text>
              <text
                className="chart-axis-label"
                x="12"
                y={chartHeight / 2}
                textAnchor="middle"
                transform={`rotate(-90 12 ${chartHeight / 2})`}
              >
                {t('chartAxisUnits')}
              </text>
              <line
                className="chart-axis"
                x1={chartPadding}
                x2={chartPadding}
                y1={chartPadding}
                y2={chartHeight - chartPadding}
              />
              <line
                className="chart-axis"
                x1={chartPadding}
                x2={chartWidth - chartPadding}
                y1={chartHeight - chartPadding}
                y2={chartHeight - chartPadding}
              />
              {yTicks.map((tick) => {
                const y =
                  chartHeight -
                  chartPadding -
                  (tick.value / tick.ceiling) * (chartHeight - chartPadding * 2);
                return (
                  <g key={`y-${tick.value}`}>
                    <line
                      className="chart-grid"
                      x1={chartPadding}
                      x2={chartWidth - chartPadding}
                      y1={y}
                      y2={y}
                    />
                    <text className="chart-tick" x={chartPadding - 8} y={y + 4} textAnchor="end">
                      {tick.label}
                    </text>
                  </g>
                );
              })}
              {xTicks.map((day) => {
                const index = Math.max(0, run.history.findIndex((entry) => entry.day === day));
                const stepX =
                  run.history.length <= 1
                    ? 0
                    : (chartWidth - chartPadding * 2) / (run.history.length - 1);
                const x = chartPadding + index * stepX;
                return (
                  <g key={`x-${day}`}>
                    <line
                      className="chart-tick-mark"
                      x1={x}
                      x2={x}
                      y1={chartHeight - chartPadding}
                      y2={chartHeight - chartPadding + 6}
                    />
                    <text className="chart-tick" x={x} y={chartHeight - chartPadding + 18} textAnchor="middle">
                      {day}
                    </text>
                  </g>
                );
              })}
              {inventoryPositionPoints ? (
                <polyline className="chart-line-position" fill="none" points={inventoryPositionPoints} />
              ) : null}
              {inventoryLevelPoints ? (
                <polyline className="chart-line-level" fill="none" points={inventoryLevelPoints} />
              ) : null}
            </svg>
            <div className="chart-legend">
              <span>
                <i className="legend-dot legend-dot-level" />
                {t('chartInventoryLevel')}
              </span>
              <span>
                <i className="legend-dot legend-dot-position" />
                {t('chartInventoryPosition')}
              </span>
            </div>
          </div>
          <dl className="node-stats">
            <div>
              <dt>{t('inventoryOnHand')}</dt>
              <dd>{formatNumber(run.currentInventory)}</dd>
            </div>
            <div className="config-block">
              <dt>{t('inventoryHolding')}</dt>
              <dd>{formatCurrency(settings.holdingCostPerUnit)}</dd>
            </div>
          </dl>
        </article>

        <div aria-hidden="true" className="flow-arrow flow-arrow-right">
          →
        </div>

        <article className="supply-node supply-node-customers">
          <div aria-hidden="true" className="node-icon">
            🧑‍🤝‍🧑
          </div>
          <h3>{t('inventoryCustomers')}</h3>
          <dl className="node-stats node-stats-vertical">
            <div>
              <dt>{t('inventoryTodayDemand')}</dt>
              <dd>{formatNumber(todayDemand)}</dd>
            </div>
            <div>
              <dt>{t('inventoryTodaySales')}</dt>
              <dd>{formatNumber(todaySoldUnits)}</dd>
            </div>
            <div>
              <dt>{t('inventoryFillRate')}</dt>
              <dd>{formatPercent(run.fillRate)}</dd>
            </div>
            <div className="config-block">
              <dt>{t('inventoryStockout')}</dt>
              <dd>{formatCurrency(settings.stockoutCostPerUnit)}</dd>
            </div>
          </dl>
        </article>
      </div>

      {isLogicOpen ? (
        <div className="overlay overlay-top-sheet">
          <section
            aria-labelledby="logic-title"
            aria-modal="true"
            className="sheet logic-modal"
            ref={logicDialogRef}
            role="dialog"
            tabIndex={-1}
          >
            <div className="sheet-header">
              <div>
                <p className="eyebrow">{t('inventoryGameLogic')}</p>
                <h2 id="logic-title">{t('inventoryHowGameWorks')}</h2>
              </div>
              <button className="ghost-button" type="button" onClick={() => setIsLogicOpen(false)}>
                {t('commonClose')}
              </button>
            </div>

            <div className="stack-md">
              <p className="support-copy">
                {t('inventoryLogicIntro')}
              </p>

              <div className="logic-two-col">
                <div className="logic-block">
                  <h3 className="logic-subtitle">{t('inventoryYourDecision')}</h3>
                  <ul className="logic-list">
                    <li>{t('inventoryYouChooseTodayOrder')}</li>
                    <li>{t('inventoryOrderArrivesAfterLeadTime')}</li>
                  </ul>
                </div>

                <div className="logic-block">
                  <h3 className="logic-subtitle">{t('inventoryWhatUpdatesEachDay')}</h3>
                  <ul className="logic-list">
                    <li>{t('inventoryInventoryLevelInStore')}</li>
                    <li>{t('inventoryInventoryPositionInStoreOnOrder')}</li>
                    <li>{t('inventorySalesAndFillRate')}</li>
                  </ul>
                </div>
              </div>

              <div className="logic-block">
                <h3 className="logic-subtitle">{t('inventoryParametersFromSettings')}</h3>
                <div className="logic-table-wrap">
                  <table className="logic-table">
                    <thead>
                      <tr>
                        <th scope="col">{t('inventoryParameter')}</th>
                        <th scope="col">{t('inventoryValue')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <th scope="row">{t('inventoryLeadTime')}</th>
                        <td>{t('commonDay', { count: formatNumber(settings.leadTimeDays) })}</td>
                      </tr>
                      <tr>
                        <th scope="row">{t('inventoryHolding')}</th>
                        <td>{t('inventoryHoldingValue', { cost: formatCurrency(settings.holdingCostPerUnit) })}</td>
                      </tr>
                      <tr>
                        <th scope="row">{t('inventoryStockout')}</th>
                        <td>{t('inventoryStockoutValue', { cost: formatCurrency(settings.stockoutCostPerUnit) })}</td>
                      </tr>
                      <tr>
                        <th scope="row">{t('inventoryOrderCost')}</th>
                        <td>{t('inventoryOrderCostDetail', { cost: formatCurrency(settings.orderingCostPer250Units) })}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>
        </div>
      ) : null}

      {isChartExpanded ? (
        <div className="overlay overlay-top-sheet">
          <section
            aria-labelledby="expanded-chart-title"
            aria-modal="true"
            className="sheet chart-modal"
            ref={expandedChartDialogRef}
            role="dialog"
            tabIndex={-1}
          >
            <div className="sheet-header">
              <div>
                <p className="eyebrow">{t('inventoryStoreChart')}</p>
                <h2 id="expanded-chart-title">{t('inventoryExpandedChartTitle')}</h2>
              </div>
              <button className="ghost-button" type="button" onClick={() => setIsChartExpanded(false)}>
                {t('commonClose')}
              </button>
            </div>
            <div
              aria-describedby="expanded-chart-description"
              aria-label={t('inventoryChartAriaExpanded')}
              className="store-chart store-chart-expanded"
              role="img"
            >
              <p className="sr-only" id="expanded-chart-description">
                {chartDescription}
              </p>
              <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="xMidYMid meet">
                <text className="chart-axis-label" x={chartWidth / 2} y={chartHeight - 6} textAnchor="middle">
                  {t('chartAxisDay')}
                </text>
                <text
                  className="chart-axis-label"
                  x="12"
                  y={chartHeight / 2}
                  textAnchor="middle"
                  transform={`rotate(-90 12 ${chartHeight / 2})`}
                >
                  {t('chartAxisUnits')}
                </text>
                <line className="chart-axis" x1={chartPadding} x2={chartPadding} y1={chartPadding} y2={chartHeight - chartPadding} />
                <line
                  className="chart-axis"
                  x1={chartPadding}
                  x2={chartWidth - chartPadding}
                  y1={chartHeight - chartPadding}
                  y2={chartHeight - chartPadding}
                />
                {yTicks.map((tick) => {
                  const y =
                    chartHeight -
                    chartPadding -
                    (tick.value / tick.ceiling) * (chartHeight - chartPadding * 2);
                  return (
                    <g key={`expanded-y-${tick.value}`}>
                      <line className="chart-grid" x1={chartPadding} x2={chartWidth - chartPadding} y1={y} y2={y} />
                      <text className="chart-tick" x={chartPadding - 8} y={y + 4} textAnchor="end">
                        {tick.label}
                      </text>
                    </g>
                  );
                })}
                {xTicks.map((day) => {
                  const index = Math.max(0, run.history.findIndex((entry) => entry.day === day));
                  const stepX =
                    run.history.length <= 1
                      ? 0
                      : (chartWidth - chartPadding * 2) / (run.history.length - 1);
                  const x = chartPadding + index * stepX;
                  return (
                    <g key={`expanded-x-${day}`}>
                      <line className="chart-tick-mark" x1={x} x2={x} y1={chartHeight - chartPadding} y2={chartHeight - chartPadding + 6} />
                      <text className="chart-tick" x={x} y={chartHeight - chartPadding + 18} textAnchor="middle">
                        {day}
                      </text>
                    </g>
                  );
                })}
                {inventoryPositionPoints ? <polyline className="chart-line-position" fill="none" points={inventoryPositionPoints} /> : null}
                {inventoryLevelPoints ? <polyline className="chart-line-level" fill="none" points={inventoryLevelPoints} /> : null}
              </svg>
              <div className="chart-legend">
                <span>
                  <i className="legend-dot legend-dot-level" />
                  {t('chartInventoryLevel')}
                </span>
                <span>
                  <i className="legend-dot legend-dot-position" />
                  {t('chartInventoryPosition')}
                </span>
              </div>
            </div>
          </section>
        </div>
      ) : null}
    </section>
  );
};
