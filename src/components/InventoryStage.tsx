import { useState } from 'react';
import type { GameRun, GameSettings } from '../game/types';
import { useAccessibleDialog } from '../hooks/useAccessibleDialog';

interface InventoryStageProps {
  draftOrderQuantity: number;
  settings: GameSettings;
  run: GameRun;
}

const formatPercent = (value: number) => `${Math.round(value * 100)}%`;

const formatMoney = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2
  }).format(value);

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
    ? `Inventory trend chart covering ${run.history.length} recorded day${
        run.history.length === 1 ? '' : 's'
      }. Inventory level starts at ${inventoryLevels[0]} units and ends at ${
        inventoryLevels[inventoryLevels.length - 1]
      } units. Inventory position starts at ${inventoryPositions[0]} units and ends at ${
        inventoryPositions[inventoryPositions.length - 1]
      } units.`
    : 'Inventory trend chart will appear after the first day is recorded.';

  return (
    <section aria-labelledby="inventory-stage-title" className="inventory-stage supply-stage">
      <div className="stage-copy stage-copy-row">
        <div>
          <p className="eyebrow">Supply Chain</p>
          <h2 id="inventory-stage-title">Supplier, store, customers.</h2>
        </div>
        <button className="ghost-button" type="button" onClick={() => setIsLogicOpen(true)}>
          Game Logic
        </button>
      </div>

      <div className="supply-chain-board" role="presentation">
        <article className="supply-node supply-node-supplier">
          <div aria-hidden="true" className="node-icon">
            🏭
          </div>
          <h3>Supplier</h3>
          <dl className="node-stats node-stats-vertical">
            <div>
              <dt>Today’s Order</dt>
              <dd>{draftOrderQuantity}</dd>
            </div>
            <div className="config-block">
              <dt>Lead Time</dt>
              <dd>{settings.leadTimeDays} days</dd>
            </div>
            <div className="config-block">
              <dt>Order Cost</dt>
              <dd>{formatMoney(settings.orderingCostPer250Units)} / 250</dd>
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
          <h3>Store</h3>
          <div
            aria-describedby="inventory-chart-description"
            aria-label="Inventory level and inventory position over time"
            className="store-chart"
            role="img"
          >
            <div className="chart-toolbar">
              <span className="chart-title">Inventory Trend</span>
              <button
                className="ghost-button chart-expand-button"
                type="button"
                onClick={() => setIsChartExpanded(true)}
              >
                Enlarge Chart
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
                Day
              </text>
              <text
                className="chart-axis-label"
                x="12"
                y={chartHeight / 2}
                textAnchor="middle"
                transform={`rotate(-90 12 ${chartHeight / 2})`}
              >
                Units
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
                Inventory Level
              </span>
              <span>
                <i className="legend-dot legend-dot-position" />
                Inventory Position
              </span>
            </div>
          </div>
          <dl className="node-stats">
            <div>
              <dt>On Hand</dt>
              <dd>{run.currentInventory}</dd>
            </div>
            <div className="config-block">
              <dt>Holding</dt>
              <dd>{formatMoney(settings.holdingCostPerUnit)}</dd>
            </div>
            <div className="config-block">
              <dt>Stockout</dt>
              <dd>{formatMoney(settings.stockoutCostPerUnit)}</dd>
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
          <h3>Customers</h3>
          <dl className="node-stats node-stats-vertical">
            <div>
              <dt>Today’s Demand</dt>
              <dd>{todayDemand}</dd>
            </div>
            <div>
              <dt>Today’s Sales</dt>
              <dd>{todaySoldUnits}</dd>
            </div>
            <div>
              <dt>Fill Rate</dt>
              <dd>{formatPercent(run.fillRate)}</dd>
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
                <p className="eyebrow">Game Logic</p>
                <h2 id="logic-title">How the game works</h2>
              </div>
              <button className="ghost-button" type="button" onClick={() => setIsLogicOpen(false)}>
                Close
              </button>
            </div>

            <div className="stack-md">
              <p className="support-copy">
                You manage the store’s inventory for 30 days. Each day, customers arrive with random demand (10–20 units).
                Your goal is to keep service high while controlling costs.
              </p>

              <div className="logic-two-col">
                <div className="logic-block">
                  <h3 className="logic-subtitle">Your decision</h3>
                  <ul className="logic-list">
                    <li>Choose today’s ordering quantity.</li>
                    <li>The order arrives after the lead time.</li>
                  </ul>
                </div>

                <div className="logic-block">
                  <h3 className="logic-subtitle">What updates each day</h3>
                  <ul className="logic-list">
                    <li>Inventory Level (in store).</li>
                    <li>Inventory Position (in store + on order).</li>
                    <li>Sales and fill rate.</li>
                  </ul>
                </div>
              </div>

              <div className="logic-block">
                <h3 className="logic-subtitle">Parameters (from Educator Settings)</h3>
                <div className="logic-table-wrap">
                  <table className="logic-table">
                    <thead>
                      <tr>
                        <th scope="col">Parameter</th>
                        <th scope="col">Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <th scope="row">Lead time</th>
                        <td>{settings.leadTimeDays} days</td>
                      </tr>
                      <tr>
                        <th scope="row">Holding cost</th>
                        <td>{formatMoney(settings.holdingCostPerUnit)} per unit per day</td>
                      </tr>
                      <tr>
                        <th scope="row">Stockout cost</th>
                        <td>{formatMoney(settings.stockoutCostPerUnit)} per unit</td>
                      </tr>
                      <tr>
                        <th scope="row">Ordering cost</th>
                        <td>{formatMoney(settings.orderingCostPer250Units)} per 250 units (charged in blocks)</td>
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
                <p className="eyebrow">Store Chart</p>
                <h2 id="expanded-chart-title">Inventory Level & Inventory Position</h2>
              </div>
              <button className="ghost-button" type="button" onClick={() => setIsChartExpanded(false)}>
                Close
              </button>
            </div>
            <div
              aria-describedby="expanded-chart-description"
              aria-label="Expanded inventory level and inventory position over time"
              className="store-chart store-chart-expanded"
              role="img"
            >
              <p className="sr-only" id="expanded-chart-description">
                {chartDescription}
              </p>
              <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="xMidYMid meet">
                <text className="chart-axis-label" x={chartWidth / 2} y={chartHeight - 6} textAnchor="middle">
                  Day
                </text>
                <text
                  className="chart-axis-label"
                  x="12"
                  y={chartHeight / 2}
                  textAnchor="middle"
                  transform={`rotate(-90 12 ${chartHeight / 2})`}
                >
                  Units
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
                  Inventory Level
                </span>
                <span>
                  <i className="legend-dot legend-dot-position" />
                  Inventory Position
                </span>
              </div>
            </div>
          </section>
        </div>
      ) : null}
    </section>
  );
};
