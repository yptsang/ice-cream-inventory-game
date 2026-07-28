import type { GameRun } from '../game/types';

type I18nApi = ReturnType<typeof import('../i18n').useI18n>;

export interface ChartPoint {
  day: number;
  value: number;
  x: number;
  y: number;
}

export interface ChartSeries {
  key: string;
  label: string;
  lineClassName: string;
  pointClassName: string;
  points: ChartPoint[];
}

interface ChartTick {
  day: number;
  x: number;
}

interface YTick {
  label: string;
  value: number;
  ceiling: number;
}

export interface TrendChartModel {
  chartDescription: string;
  chartHeight: number;
  chartPadding: number;
  chartWidth: number;
  series: ChartSeries[];
  xTicks: ChartTick[];
  yTicks: YTick[];
}

interface InventoryTrendChartProps {
  ariaLabel: string;
  chartDescription: string;
  chartHeight: number;
  chartPadding: number;
  chartWidth: number;
  className?: string;
  descriptionId: string;
  series: ChartSeries[];
  t: I18nApi['t'];
  xTicks: ChartTick[];
  yTicks: YTick[];
}

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

const createChartPoints = (
  days: number[],
  values: number[],
  width: number,
  height: number,
  padding: number,
  maxValue: number
) => {
  const safeMax = Math.max(1, maxValue);
  const stepX = values.length <= 1 ? 0 : (width - padding * 2) / (values.length - 1);

  return values.map((value, index) => ({
    day: days[index] ?? index + 1,
    value,
    x: padding + index * stepX,
    y: height - padding - (value / safeMax) * (height - padding * 2)
  }));
};

const toPolylinePoints = (points: ChartPoint[]) =>
  points.map((point) => `${point.x},${point.y}`).join(' ');

export const buildTrendChartModel = (
  run: GameRun,
  t: I18nApi['t'],
  formatNumber: I18nApi['formatNumber']
): TrendChartModel => {
  const inventoryLevels = run.history.map((entry) => entry.endingInventory);
  const inventoryPositions = run.history.map((entry) => entry.inventoryPosition);
  const dailyDemand = run.history.map((entry) => entry.demand);
  const chartDays = run.history.map((entry) => entry.day);
  const yMax = Math.max(1, ...inventoryLevels, ...inventoryPositions, ...dailyDemand);
  const yTicks = buildTicks(yMax, 4);
  const chartWidth = 880;
  const chartHeight = 420;
  const chartPadding = 64;
  const inventoryLevelPoints = createChartPoints(
    chartDays,
    inventoryLevels,
    chartWidth,
    chartHeight,
    chartPadding,
    yMax
  );
  const inventoryPositionPoints = createChartPoints(
    chartDays,
    inventoryPositions,
    chartWidth,
    chartHeight,
    chartPadding,
    yMax
  );
  const dailyDemandPoints = createChartPoints(
    chartDays,
    dailyDemand,
    chartWidth,
    chartHeight,
    chartPadding,
    yMax
  );
  const series: ChartSeries[] = [
    {
      key: 'inventory-level',
      label: t('chartInventoryLevel'),
      lineClassName: 'chart-line-level',
      pointClassName: 'chart-point-level',
      points: inventoryLevelPoints
    },
    {
      key: 'inventory-position',
      label: t('chartInventoryPosition'),
      lineClassName: 'chart-line-position',
      pointClassName: 'chart-point-position',
      points: inventoryPositionPoints
    },
    {
      key: 'daily-demand',
      label: t('chartDailyDemand'),
      lineClassName: 'chart-line-demand',
      pointClassName: 'chart-point-demand',
      points: dailyDemandPoints
    }
  ];
  const xTickEvery = 5;
  const xTicks = run.history.length
    ? run.history
        .filter((entry) => entry.day === 1 || entry.day % xTickEvery === 0 || entry.day === 30)
        .map((entry) => {
          const index = Math.max(0, run.history.findIndex((historyEntry) => historyEntry.day === entry.day));
          const stepX =
            run.history.length <= 1
              ? 0
              : (chartWidth - chartPadding * 2) / (run.history.length - 1);

          return {
            day: entry.day,
            x: chartPadding + index * stepX
          };
        })
    : [];
  const chartDescription = run.history.length
    ? t('inventoryChartDescription', {
        count: formatNumber(run.history.length),
        endDemand: formatNumber(dailyDemand[dailyDemand.length - 1]),
        endInventory: formatNumber(inventoryLevels[inventoryLevels.length - 1]),
        endPosition: formatNumber(inventoryPositions[inventoryPositions.length - 1]),
        startDemand: formatNumber(dailyDemand[0]),
        startInventory: formatNumber(inventoryLevels[0]),
        startPosition: formatNumber(inventoryPositions[0])
      })
    : t('inventoryChartPlaceholder');

  return {
    chartDescription,
    chartHeight,
    chartPadding,
    chartWidth,
    series,
    xTicks,
    yTicks
  };
};

export const InventoryTrendChart = ({
  ariaLabel,
  chartDescription,
  chartHeight,
  chartPadding,
  chartWidth,
  className = '',
  descriptionId,
  series,
  t,
  xTicks,
  yTicks
}: InventoryTrendChartProps) => (
  <div
    aria-describedby={descriptionId}
    aria-label={ariaLabel}
    className={`store-chart${className ? ` ${className}` : ''}`}
    role="img"
  >
    <p className="sr-only" id={descriptionId}>
      {chartDescription}
    </p>
    <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} aria-hidden="true" preserveAspectRatio="xMidYMid meet">
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
      {xTicks.map((tick) => (
        <g key={`x-${tick.day}`}>
          <line
            className="chart-tick-mark"
            x1={tick.x}
            x2={tick.x}
            y1={chartHeight - chartPadding}
            y2={chartHeight - chartPadding + 6}
          />
          <text className="chart-tick" x={tick.x} y={chartHeight - chartPadding + 18} textAnchor="middle">
            {tick.day}
          </text>
        </g>
      ))}
      {series.map((chartSeries) =>
        chartSeries.points.length ? (
          <g key={chartSeries.key} aria-label={chartSeries.label}>
            <polyline
              className={chartSeries.lineClassName}
              fill="none"
              points={toPolylinePoints(chartSeries.points)}
            />
            {chartSeries.points.map((point) => (
              <circle
                key={`${chartSeries.key}-${point.day}`}
                className={chartSeries.pointClassName}
                cx={point.x}
                cy={point.y}
                r="6"
              />
            ))}
          </g>
        ) : null
      )}
    </svg>
    <div className="chart-legend">
      <span>
        <i className="legend-swatch legend-swatch-level" />
        {t('chartInventoryLevel')}
      </span>
      <span>
        <i className="legend-swatch legend-swatch-position" />
        {t('chartInventoryPosition')}
      </span>
      <span>
        <i className="legend-swatch legend-swatch-demand" />
        {t('chartDailyDemand')}
      </span>
    </div>
  </div>
);
