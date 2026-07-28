import type { TrendChartModel } from '../components/InventoryTrendChart';

interface ResultMetric {
  label: string;
  value: string;
}

interface ExportResultSheetOptions {
  axisDayLabel: string;
  axisUnitsLabel: string;
  chartTitle: string;
  description: string;
  evaluationLabel: string;
  eyebrow: string;
  fileName: string;
  metrics: ResultMetric[];
  trendChart: TrendChartModel;
}

const colors = {
  accent: '#d97757',
  axis: 'rgba(20, 20, 19, 0.2)',
  axisText: 'rgba(20, 20, 19, 0.82)',
  background: '#f3f0e7',
  border: 'rgba(20, 20, 19, 0.08)',
  cardBackground: '#ffffff',
  cool: '#6a9bcc',
  demand: 'rgba(93, 91, 85, 0.95)',
  muted: 'rgba(93, 91, 85, 0.95)',
  surface: '#faf9f5',
  title: '#141413'
};

const roundedRect = (
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) => {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.lineTo(x + width - radius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + radius);
  context.lineTo(x + width, y + height - radius);
  context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  context.lineTo(x + radius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - radius);
  context.lineTo(x, y + radius);
  context.quadraticCurveTo(x, y, x + radius, y);
  context.closePath();
};

const fillRoundedRect = (
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  fillStyle: string
) => {
  roundedRect(context, x, y, width, height, radius);
  context.fillStyle = fillStyle;
  context.fill();
};

const strokeRoundedRect = (
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  strokeStyle: string
) => {
  roundedRect(context, x, y, width, height, radius);
  context.strokeStyle = strokeStyle;
  context.stroke();
};

const wrapText = (
  context: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
) => {
  const words = text.includes(' ') ? text.split(/\s+/) : Array.from(text);
  const lines: string[] = [];
  let currentLine = '';

  words.forEach((word) => {
    const separator = text.includes(' ') && currentLine ? ' ' : '';
    const nextLine = `${currentLine}${separator}${word}`;

    if (context.measureText(nextLine).width <= maxWidth || !currentLine) {
      currentLine = nextLine;
      return;
    }

    lines.push(currentLine);
    currentLine = word;
  });

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
};

const drawWrappedText = (
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) => {
  const lines = wrapText(context, text, maxWidth);

  lines.forEach((line, index) => {
    context.fillText(line, x, y + index * lineHeight);
  });

  return lines.length;
};

const drawLegendSwatch = (
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  strokeStyle: string,
  dotted = false
) => {
  context.save();
  context.strokeStyle = strokeStyle;
  context.lineWidth = 3;
  context.setLineDash(dotted ? [6, 6] : []);
  context.beginPath();
  context.moveTo(x, y);
  context.lineTo(x + 32, y);
  context.stroke();
  context.setLineDash([]);
  context.fillStyle = strokeStyle;
  context.beginPath();
  context.arc(x + 16, y, 4, 0, Math.PI * 2);
  context.fill();
  context.restore();
};

const lineColorForSeries = (key: string) => {
  if (key === 'inventory-level') {
    return colors.accent;
  }

  if (key === 'inventory-position') {
    return colors.cool;
  }

  return colors.demand;
};

const drawChart = (
  context: CanvasRenderingContext2D,
  chart: TrendChartModel,
  axisDayLabel: string,
  axisUnitsLabel: string,
  x: number,
  y: number,
  width: number,
  height: number
) => {
  fillRoundedRect(context, x, y, width, height, 18, colors.surface);
  strokeRoundedRect(context, x, y, width, height, 18, 'rgba(106, 155, 204, 0.18)');

  const scaleX = width / chart.chartWidth;
  const scaleY = height / chart.chartHeight;
  const mapX = (pointX: number) => x + pointX * scaleX;
  const mapY = (pointY: number) => y + pointY * scaleY;

  context.save();
  context.strokeStyle = colors.axis;
  context.lineWidth = 1.5;
  context.beginPath();
  context.moveTo(mapX(chart.chartPadding), mapY(chart.chartPadding));
  context.lineTo(mapX(chart.chartPadding), mapY(chart.chartHeight - chart.chartPadding));
  context.lineTo(mapX(chart.chartWidth - chart.chartPadding), mapY(chart.chartHeight - chart.chartPadding));
  context.stroke();

  chart.yTicks.forEach((tick) => {
    const tickY =
      chart.chartHeight -
      chart.chartPadding -
      (tick.value / tick.ceiling) * (chart.chartHeight - chart.chartPadding * 2);
    const mappedY = mapY(tickY);

    context.save();
    context.strokeStyle = 'rgba(20, 20, 19, 0.08)';
    context.setLineDash([4, 6]);
    context.beginPath();
    context.moveTo(mapX(chart.chartPadding), mappedY);
    context.lineTo(mapX(chart.chartWidth - chart.chartPadding), mappedY);
    context.stroke();
    context.restore();

    context.fillStyle = colors.axisText;
    context.font = '600 16px Inter, Arial, sans-serif';
    context.textAlign = 'right';
    context.fillText(tick.label, mapX(chart.chartPadding) - 10, mappedY + 5);
  });

  chart.xTicks.forEach((tick) => {
    const mappedX = mapX(tick.x);
    const axisY = mapY(chart.chartHeight - chart.chartPadding);

    context.beginPath();
    context.moveTo(mappedX, axisY);
    context.lineTo(mappedX, axisY + 8);
    context.stroke();

    context.fillStyle = colors.axisText;
    context.font = '600 16px Inter, Arial, sans-serif';
    context.textAlign = 'center';
    context.fillText(String(tick.day), mappedX, axisY + 28);
  });

  chart.series.forEach((series) => {
    if (!series.points.length) {
      return;
    }

    context.save();
    context.strokeStyle = lineColorForSeries(series.key);
    context.lineWidth = 4;
    context.lineCap = 'round';
    context.lineJoin = 'round';

    if (series.key === 'inventory-position') {
      context.setLineDash([10, 10]);
    }

    context.beginPath();
    series.points.forEach((point, index) => {
      const pointX = mapX(point.x);
      const pointY = mapY(point.y);

      if (index === 0) {
        context.moveTo(pointX, pointY);
      } else {
        context.lineTo(pointX, pointY);
      }
    });
    context.stroke();
    context.setLineDash([]);

    series.points.forEach((point) => {
      context.fillStyle =
        series.key === 'inventory-level'
          ? 'rgba(217, 119, 87, 0.18)'
          : series.key === 'inventory-position'
            ? 'rgba(106, 155, 204, 0.16)'
            : 'rgba(250, 249, 245, 0.95)';
      context.strokeStyle = lineColorForSeries(series.key);
      context.lineWidth = 3;
      context.beginPath();
      context.arc(mapX(point.x), mapY(point.y), 6, 0, Math.PI * 2);
      context.fill();
      context.stroke();
    });

    context.restore();
  });

  context.fillStyle = colors.axisText;
  context.font = '700 18px Inter, Arial, sans-serif';
  context.textAlign = 'center';
  context.fillText(axisDayLabel, x + width / 2, y + height - 6);

  context.save();
  context.translate(x + 18, y + height / 2);
  context.rotate(-Math.PI / 2);
  context.fillText(axisUnitsLabel, 0, 0);
  context.restore();
};

export const exportResultSheet = async ({
  axisDayLabel,
  axisUnitsLabel,
  chartTitle,
  description,
  evaluationLabel,
  eyebrow,
  fileName,
  metrics,
  trendChart
}: ExportResultSheetOptions) => {
  const canvas = document.createElement('canvas');
  const scale = Math.max(window.devicePixelRatio || 1, 2);
  const width = 1280;
  const height = 1480;

  canvas.width = width * scale;
  canvas.height = height * scale;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Canvas context unavailable');
  }

  context.scale(scale, scale);
  context.fillStyle = colors.background;
  context.fillRect(0, 0, width, height);

  fillRoundedRect(context, 60, 48, width - 120, height - 96, 32, 'rgba(255, 255, 255, 0.92)');
  strokeRoundedRect(context, 60, 48, width - 120, height - 96, 32, colors.border);

  context.fillStyle = colors.cool;
  context.font = '700 18px Inter, Arial, sans-serif';
  context.textAlign = 'left';
  context.fillText(eyebrow.toUpperCase(), 112, 116);

  context.fillStyle = colors.title;
  context.font = '700 50px Inter, Arial, sans-serif';
  context.fillText(evaluationLabel, 112, 174);

  context.fillStyle = colors.muted;
  context.font = '400 26px Inter, Arial, sans-serif';
  const descriptionLines = drawWrappedText(context, description, 112, 224, width - 224, 38);

  const metricsTop = 224 + descriptionLines * 38 + 48;
  const metricWidth = (width - 224 - 24) / 2;
  const metricHeight = 128;

  metrics.forEach((metric, index) => {
    const column = index % 2;
    const row = Math.floor(index / 2);
    const metricX = 112 + column * (metricWidth + 24);
    const metricY = metricsTop + row * (metricHeight + 20);

    fillRoundedRect(context, metricX, metricY, metricWidth, metricHeight, 22, colors.cardBackground);
    strokeRoundedRect(context, metricX, metricY, metricWidth, metricHeight, 22, colors.border);

    context.fillStyle = colors.muted;
    context.font = '600 20px Inter, Arial, sans-serif';
    drawWrappedText(context, metric.label, metricX + 24, metricY + 36, metricWidth - 48, 28);

    context.fillStyle = colors.title;
    context.font = '700 34px Inter, Arial, sans-serif';
    context.fillText(metric.value, metricX + 24, metricY + 92);
  });

  const chartBlockTop = metricsTop + metricHeight * 2 + 80;
  context.fillStyle = colors.title;
  context.font = '700 28px Inter, Arial, sans-serif';
  context.fillText(chartTitle, 112, chartBlockTop);

  drawChart(context, trendChart, axisDayLabel, axisUnitsLabel, 112, chartBlockTop + 28, width - 224, 520);

  const legendY = chartBlockTop + 592;
  let legendX = 132;
  trendChart.series.forEach((series) => {
    drawLegendSwatch(
      context,
      legendX,
      legendY,
      lineColorForSeries(series.key),
      series.key === 'inventory-position'
    );
    context.fillStyle = colors.muted;
    context.font = '500 20px Inter, Arial, sans-serif';
    context.textAlign = 'left';
    context.fillText(series.label, legendX + 44, legendY + 6);
    legendX += context.measureText(series.label).width + 96;
  });

  const link = document.createElement('a');
  link.href = canvas.toDataURL('image/png');
  link.download = fileName;
  link.click();
};
