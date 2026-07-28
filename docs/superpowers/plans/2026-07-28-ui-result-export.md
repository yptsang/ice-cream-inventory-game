# UI Result Export Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Hide the language/settings footer panel by default, add the full trend chart to the 30-day result sheet, and let players download the result sheet as a PNG.

**Architecture:** Keep the app state changes minimal by only changing the initial footer visibility in `App.tsx` and preserving the current language persistence behavior in `i18n.tsx`. Extract the existing inventory chart calculations and SVG renderer into shared UI helpers so both `InventoryStage.tsx` and `MonthResultSheet.tsx` render the same chart, then add a small client-side PNG export helper that snapshots the completed result sheet container for download.

**Tech Stack:** React 18, TypeScript, Vite, Vitest, Testing Library, Zustand, browser DOM/canvas APIs

---

## File Map

- Create: `src/components/InventoryTrendChart.tsx`
- Create: `src/utils/exportResultSheet.ts`
- Create: `src/components/MonthResultSheet.test.tsx`
- Modify: `src/App.tsx`
- Modify: `src/components/InventoryStage.tsx`
- Modify: `src/components/MonthResultSheet.tsx`
- Modify: `src/App.test.tsx`
- Modify: `src/i18n.tsx`
- Modify: `src/styles/app.css`
- Optional Modify: `src/test/setup.ts` if browser API mocks are shared across tests

### Task 1: Hide the utility panel by default without changing language fallback

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/App.test.tsx`
- Verify: `src/i18n.tsx`

- [ ] **Step 1: Update the App test to assert the panel starts hidden**

```tsx
it('starts with the floating utility panel hidden and reopens it from the footer', async () => {
  const user = userEvent.setup();

  render(
    <I18nProvider>
      <App />
    </I18nProvider>
  );

  expect(screen.queryByRole('group', { name: /language/i })).not.toBeInTheDocument();

  const reopenButton = screen.getByRole('button', {
    name: /show language & settings|显示语言与设置|顯示語言與設定/i
  });

  await user.click(reopenButton);

  expect(
    screen.getByRole('group', { name: /language|語言/i })
  ).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the single App test and verify it fails**

Run: `npm test -- src/App.test.tsx`
Expected: FAIL because the utility panel still renders on initial load.

- [ ] **Step 3: Change the App initial state to hide the panel on first render**

```tsx
const [isFooterUtilityPanelVisible, setIsFooterUtilityPanelVisible] = useState(false);
```

Keep the existing footer button logic unchanged so users can still reopen the panel.

- [ ] **Step 4: Verify language fallback behavior stays English-only by default**

Check that `src/i18n.tsx` still uses the existing storage guard:

```tsx
const getStoredLanguage = (): AppLanguage => {
  if (typeof window === 'undefined') {
    return 'en';
  }

  const language = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  return language === 'zh-Hant' || language === 'zh-Hans' ? language : 'en';
};
```

Do not broaden the stored-language acceptance unless a test proves it is needed.

- [ ] **Step 5: Re-run the App test and verify it passes**

Run: `npm test -- src/App.test.tsx`
Expected: PASS with the panel hidden at startup and visible after clicking the footer button.

- [ ] **Step 6: Commit**

```bash
git add src/App.tsx src/App.test.tsx
git commit -m "feat: hide utility panel on initial load"
```

### Task 2: Extract the existing inventory chart into a reusable component

**Files:**
- Create: `src/components/InventoryTrendChart.tsx`
- Modify: `src/components/InventoryStage.tsx`
- Verify: `src/components/InventoryStage.test.tsx`

- [ ] **Step 1: Add a focused rendering test to keep chart reuse safe**

Append a test like this to `src/components/InventoryStage.test.tsx`:

```tsx
it('renders all three trend series through the shared chart component', () => {
  const result = advanceDay(createNewRun(12), 18, DEFAULT_SETTINGS);
  const { container } = render(
    <InventoryStage draftOrderQuantity={18} settings={DEFAULT_SETTINGS} run={result.run} />
  );

  expect(container.querySelector('.chart-line-level')).toBeInTheDocument();
  expect(container.querySelector('.chart-line-position')).toBeInTheDocument();
  expect(container.querySelector('.chart-line-demand')).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the inventory stage tests as a safety baseline**

Run: `npm test -- src/components/InventoryStage.test.tsx`
Expected: PASS before the extraction starts.

- [ ] **Step 3: Create a shared chart component and helpers**

Create `src/components/InventoryTrendChart.tsx` with the extracted chart types and rendering logic:

```tsx
export interface InventoryTrendChartSeries {
  key: string;
  label: string;
  lineClassName: string;
  pointClassName: string;
  points: ChartPoint[];
}

export const buildTrendChartModel = (run: GameRun, t: I18nContextValue['t'], formatNumber: I18nContextValue['formatNumber']) => {
  // move tick generation, points, x-ticks, and accessible description here
};

export const InventoryTrendChart = ({
  ariaLabel,
  chartDescription,
  chartHeight,
  chartPadding,
  chartWidth,
  series,
  t,
  xTicks,
  yTicks
}: InventoryTrendChartProps) => (
  <div aria-label={ariaLabel} aria-describedby={descriptionId} className="store-chart" role="img">
    <p className="sr-only" id={descriptionId}>
      {chartDescription}
    </p>
    <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} aria-hidden="true" preserveAspectRatio="xMidYMid meet">
      {/* extracted axes, ticks, polyline, and scatter-point markup */}
    </svg>
    <div className="chart-legend">
      <span><i className="legend-swatch legend-swatch-level" />{t('chartInventoryLevel')}</span>
      <span><i className="legend-swatch legend-swatch-position" />{t('chartInventoryPosition')}</span>
      <span><i className="legend-swatch legend-swatch-demand" />{t('chartDailyDemand')}</span>
    </div>
  </div>
);
```

- [ ] **Step 4: Replace the inline chart code in `InventoryStage.tsx` with the shared component**

Update the stage component to consume the shared model:

```tsx
const chartModel = buildTrendChartModel(run, t, formatNumber);

<InventoryTrendChart
  ariaLabel={t('inventoryChartAria')}
  chartDescription={chartModel.description}
  chartHeight={chartModel.chartHeight}
  chartPadding={chartModel.chartPadding}
  chartWidth={chartModel.chartWidth}
  descriptionId="inventory-chart-description"
  series={chartModel.series}
  t={t}
  xTicks={chartModel.xTicks}
  yTicks={chartModel.yTicks}
/>
```

Keep the enlarge modal behavior in `InventoryStage.tsx`; only the chart rendering should be shared.

- [ ] **Step 5: Run the inventory stage tests again**

Run: `npm test -- src/components/InventoryStage.test.tsx`
Expected: PASS with the same accessible description and the same three chart lines present.

- [ ] **Step 6: Commit**

```bash
git add src/components/InventoryTrendChart.tsx src/components/InventoryStage.tsx src/components/InventoryStage.test.tsx
git commit -m "refactor: share inventory trend chart rendering"
```

### Task 3: Add the full chart to the 30-day result sheet

**Files:**
- Modify: `src/components/MonthResultSheet.tsx`
- Create: `src/components/MonthResultSheet.test.tsx`
- Modify: `src/styles/app.css`

- [ ] **Step 1: Write a failing result-sheet test for the new chart block**

Create `src/components/MonthResultSheet.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DEFAULT_SETTINGS } from '../game/config';
import { advanceDay, createNewRun } from '../game/engine';
import { buildMonthSummary } from '../game/scoring';
import { I18nProvider } from '../i18n';
import { MonthResultSheet } from './MonthResultSheet';

const createCompletedRun = () => {
  let run = createNewRun(12);
  for (let day = 0; day < 30; day += 1) {
    run = advanceDay(run, 18, DEFAULT_SETTINGS).run;
  }
  return {
    run,
    summary: buildMonthSummary(
      {
        totalDemand: run.cumulativeDemand,
        totalUnitsSold: run.cumulativeSoldUnits,
        totalStockoutUnits: run.cumulativeStockoutUnits,
        totalHoldingCost: run.totalHoldingCost,
        totalOrderingCost: run.totalOrderingCost,
        totalStockoutCost: run.totalStockoutCost
      },
      DEFAULT_SETTINGS
    )
  };
};

it('renders the full trend chart below the result metrics', () => {
  const { run, summary } = createCompletedRun();
  render(
    <I18nProvider>
      <MonthResultSheet onNewGame={() => undefined} run={run} settings={DEFAULT_SETTINGS} summary={summary} />
    </I18nProvider>
  );

  expect(screen.getByText(/30-day result/i)).toBeInTheDocument();
  expect(screen.getAllByText(/daily demand/i).length).toBeGreaterThan(0);
});
```

- [ ] **Step 2: Run the new result-sheet test and verify it fails**

Run: `npm test -- src/components/MonthResultSheet.test.tsx`
Expected: FAIL because `MonthResultSheet` does not yet accept `run` or render the shared chart.

- [ ] **Step 3: Update `MonthResultSheet.tsx` to accept `run` and render the shared chart**

Adjust the props and render flow:

```tsx
interface MonthResultSheetProps {
  run: GameRun;
  settings: GameSettings;
  summary: MonthSummary;
  onNewGame: () => void;
}

const { formatCurrency, formatPercent, formatNumber, language, t } = useI18n();
const chartModel = buildTrendChartModel(run, t, formatNumber);

<dl className="sheet-grid">
  {/* existing four metric blocks */}
</dl>

<section className="result-chart-block" aria-labelledby="month-result-chart-title">
  <h3 id="month-result-chart-title">{t('chartInventoryTrend')}</h3>
  <InventoryTrendChart
    ariaLabel={t('inventoryChartAriaExpanded')}
    chartDescription={chartModel.description}
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
```

- [ ] **Step 4: Pass the completed run through from `App.tsx`**

Update the result-sheet callsite:

```tsx
{run.status === 'completed' && run.summary ? (
  <MonthResultSheet
    onNewGame={startNewGame}
    run={run}
    settings={settings}
    summary={run.summary}
  />
) : null}
```

- [ ] **Step 5: Add layout styles for the result chart block**

In `src/styles/app.css`, add a block like:

```css
.result-chart-block {
  display: grid;
  gap: 0.75rem;
  margin-top: 1rem;
}

.result-chart-block .store-chart {
  width: 100%;
}

.result-sheet-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  flex-wrap: wrap;
}
```

- [ ] **Step 6: Re-run the result-sheet test**

Run: `npm test -- src/components/MonthResultSheet.test.tsx`
Expected: PASS with the chart title and trend content rendered under the metric grid.

- [ ] **Step 7: Commit**

```bash
git add src/components/MonthResultSheet.tsx src/components/MonthResultSheet.test.tsx src/App.tsx src/styles/app.css
git commit -m "feat: show trend chart in 30-day result sheet"
```

### Task 4: Add PNG export for the result sheet

**Files:**
- Create: `src/utils/exportResultSheet.ts`
- Modify: `src/components/MonthResultSheet.tsx`
- Modify: `src/i18n.tsx`
- Optional Modify: `src/test/setup.ts`

- [ ] **Step 1: Write a failing test for the save button**

Extend `src/components/MonthResultSheet.test.tsx`:

```tsx
it('shows a save button beside the new run action', () => {
  const { run, summary } = createCompletedRun();
  render(
    <I18nProvider>
      <MonthResultSheet onNewGame={() => undefined} run={run} settings={DEFAULT_SETTINGS} summary={summary} />
    </I18nProvider>
  );

  expect(screen.getByRole('button', { name: /save result|儲存結果|保存结果/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /start a new 30-day run|開始新的 30 天回合|开始新的 30 天回合/i })).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the result-sheet tests and verify the new save assertion fails**

Run: `npm test -- src/components/MonthResultSheet.test.tsx`
Expected: FAIL because there is no save button yet.

- [ ] **Step 3: Add localized strings for save/export UI**

In `src/i18n.tsx`, add these keys to all three language maps:

```tsx
monthResultSaveImage: 'Save Result',
monthResultSaveImageError: 'Could not save the result image. Please try again.',
monthResultSaveImageSuccess: 'Result image download started.',
```

Use Traditional and Simplified Chinese translations in the other language maps with the same key names.

- [ ] **Step 4: Create a small export helper**

Create `src/utils/exportResultSheet.ts`:

```ts
export const exportResultSheet = async (element: HTMLElement, fileName: string) => {
  const svg = new XMLSerializer().serializeToString(element);
  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  try {
    const image = await loadImage(url);
    const canvas = document.createElement('canvas');
    canvas.width = Math.ceil(element.getBoundingClientRect().width * window.devicePixelRatio);
    canvas.height = Math.ceil(element.getBoundingClientRect().height * window.devicePixelRatio);

    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Canvas context unavailable');
    }

    context.scale(window.devicePixelRatio, window.devicePixelRatio);
    context.drawImage(image, 0, 0);

    const href = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = href;
    link.download = fileName;
    link.click();
  } finally {
    URL.revokeObjectURL(url);
  }
};
```

If raw HTML-to-SVG serialization proves unreliable, replace the helper with a same-scope DOM-to-canvas utility, but keep the public signature:

```ts
export const exportResultSheet = async (element: HTMLElement, fileName: string) => Promise<void>;
```

- [ ] **Step 5: Wire the save button into `MonthResultSheet.tsx`**

Add a ref, export handler, and action row:

```tsx
const resultSheetRef = useRef<HTMLElement | null>(null);
const [saveError, setSaveError] = useState<string | null>(null);

const handleSave = async () => {
  if (!resultSheetRef.current) {
    return;
  }

  try {
    setSaveError(null);
    await exportResultSheet(resultSheetRef.current, 'ice-cream-30-day-result.png');
  } catch {
    setSaveError(t('monthResultSaveImageError'));
  }
};

<section className="sheet result-sheet" ref={mergeRefs(dialogRef, resultSheetRef)} />

<div className="result-sheet-actions">
  <button className="ghost-button" type="button" onClick={handleSave}>
    {t('monthResultSaveImage')}
  </button>
  <button className="primary-button" type="button" onClick={onNewGame}>
    {t('monthResultStartNewRun')}
  </button>
</div>
{saveError ? <p role="alert">{saveError}</p> : null}
```

Use a callback ref instead of `mergeRefs` if the project does not already have a ref helper:

```tsx
ref={(node) => {
  dialogRef.current = node;
  resultSheetRef.current = node;
}}
```

- [ ] **Step 6: Re-run the result-sheet tests**

Run: `npm test -- src/components/MonthResultSheet.test.tsx`
Expected: PASS with the save button rendered beside the new-run button.

- [ ] **Step 7: Commit**

```bash
git add src/components/MonthResultSheet.tsx src/components/MonthResultSheet.test.tsx src/utils/exportResultSheet.ts src/i18n.tsx
git commit -m "feat: export 30-day result sheet as png"
```

### Task 5: Run the relevant test suite, diagnostics, and final cleanup

**Files:**
- Verify: `src/App.test.tsx`
- Verify: `src/components/InventoryStage.test.tsx`
- Verify: `src/components/MonthResultSheet.test.tsx`
- Verify: `src/components/MonthResultSheet.tsx`
- Verify: `src/components/InventoryTrendChart.tsx`

- [ ] **Step 1: Run the focused test files together**

Run: `npm test -- src/App.test.tsx src/components/InventoryStage.test.tsx src/components/MonthResultSheet.test.tsx`
Expected: PASS for the startup panel behavior, shared chart rendering, and result-sheet actions.

- [ ] **Step 2: Run the full test suite**

Run: `npm test`
Expected: PASS with no regressions in existing inventory, settings, and persistence behavior.

- [ ] **Step 3: Run the production build**

Run: `npm run build`
Expected: PASS with TypeScript and Vite completing successfully.

- [ ] **Step 4: Check diagnostics on edited files**

Use diagnostics on:

- `src/App.tsx`
- `src/App.test.tsx`
- `src/components/InventoryStage.tsx`
- `src/components/InventoryTrendChart.tsx`
- `src/components/MonthResultSheet.tsx`
- `src/components/MonthResultSheet.test.tsx`
- `src/utils/exportResultSheet.ts`
- `src/i18n.tsx`
- `src/styles/app.css`

Expected: no new errors introduced by the change set.

- [ ] **Step 5: Commit the verification pass**

```bash
git add src/App.tsx src/App.test.tsx src/components/InventoryStage.tsx src/components/InventoryTrendChart.tsx src/components/MonthResultSheet.tsx src/components/MonthResultSheet.test.tsx src/utils/exportResultSheet.ts src/i18n.tsx src/styles/app.css
git commit -m "test: verify result sheet export updates"
```

## Self-Review

- Spec coverage: the plan covers the hidden initial language panel, the reused chart, the 30-day result chart placement, the PNG save flow, localization, styling, and focused verification.
- Placeholder scan: all tasks include concrete files, commands, and code examples; no `TODO` or deferred implementation markers remain.
- Type consistency: `MonthResultSheet` is updated to accept `run`, the shared chart consumes `GameRun`, and the export helper exposes a single async `exportResultSheet(element, fileName)` signature across the plan.
