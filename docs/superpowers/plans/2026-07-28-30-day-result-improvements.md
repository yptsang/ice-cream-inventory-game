# 30-Day Result Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the language panel visible on first load, show the full inventory scatter-line chart inside the 30-day result dialog, and add a PNG save action beside the new-run button.

**Architecture:** Keep the existing UI flow intact while extracting the inventory trend chart into a shared component that both the store card and 30-day result dialog can render. Use a DOM-to-image PNG export path for the result sheet so the player downloads exactly the visible summary card, including the four metrics and chart.

**Tech Stack:** React 18, TypeScript, Zustand, Vite, Vitest, Testing Library, `html-to-image`

---

## File Structure

- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `src/components/InventoryTrendChart.tsx`
- Modify: `src/components/InventoryStage.tsx`
- Modify: `src/components/MonthResultSheet.tsx`
- Modify: `src/App.tsx`
- Modify: `src/i18n.tsx`
- Modify: `src/styles/app.css`
- Modify: `src/App.test.tsx`
- Create: `src/components/MonthResultSheet.test.tsx`

### Task 1: Make the language utility panel visible by default

**Files:**
- Modify: `src/App.tsx`
- Test: `src/App.test.tsx`

- [ ] **Step 1: Update the existing app test to express the new default visibility**

```tsx
it('shows the floating utility panel on first load', () => {
  render(
    <I18nProvider>
      <App />
    </I18nProvider>
  );

  expect(screen.getByRole('group', { name: /language/i })).toBeInTheDocument();
  expect(
    screen.getByRole('button', {
      name: /educator settings|教師設定|教师设置/i
    })
  ).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the focused test and verify the current baseline**

Run: `npm test -- src/App.test.tsx`
Expected: PASS before the change, confirming the current panel is rendered during initial hydration.

- [ ] **Step 3: Change the panel visibility state to start open**

```tsx
const [isFooterUtilityPanelVisible, setIsFooterUtilityPanelVisible] = useState(true);
```

- [ ] **Step 4: Keep the existing hide-after-language-selection behavior unchanged**

```tsx
<FooterUtilityPanel
  onDismiss={() => setIsFooterUtilityPanelVisible(false)}
  onOpenSettings={openSettings}
/>
```

- [ ] **Step 5: Re-run the app test**

Run: `npm test -- src/App.test.tsx`
Expected: PASS and still confirms the panel can be hidden and reopened.

- [ ] **Step 6: Commit**

```bash
git add src/App.tsx src/App.test.tsx
git commit -m "feat: show utility panel on first load"
```

### Task 2: Extract the inventory trend chart into a reusable component

**Files:**
- Create: `src/components/InventoryTrendChart.tsx`
- Modify: `src/components/InventoryStage.tsx`
- Test: `src/components/MonthResultSheet.test.tsx`

- [ ] **Step 1: Write a failing component test for the result dialog chart**

```tsx
it('renders the shared inventory trend chart inside the month result dialog', () => {
  render(
    <I18nProvider>
      <MonthResultSheet
        onNewGame={vi.fn()}
        run={completedRun}
        settings={DEFAULT_SETTINGS}
        summary={completedRun.summary!}
      />
    </I18nProvider>
  );

  expect(screen.getByText(/inventory trend|库存趋势|庫存趨勢/i)).toBeInTheDocument();
  expect(screen.getByText(/inventory level|库存水平|庫存水位/i)).toBeInTheDocument();
  expect(screen.getByText(/daily demand|每日需求/i)).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the new test to verify it fails because the chart is not in the dialog**

Run: `npm test -- src/components/MonthResultSheet.test.tsx`
Expected: FAIL with the chart title or legend text missing.

- [ ] **Step 3: Move chart-only logic from `InventoryStage.tsx` into a dedicated component**

```tsx
export interface InventoryTrendChartProps {
  history: DailyLedgerEntry[];
  ariaLabel: string;
  description: string;
  title: string;
  expanded?: boolean;
  toolbarAction?: ReactNode;
}

export const InventoryTrendChart = ({
  history,
  ariaLabel,
  description,
  title,
  expanded = false,
  toolbarAction
}: InventoryTrendChartProps) => {
  // reuse buildTicks/createChartPoints/toPolylinePoints
  // derive chartSeries and xTicks from history
  // render the existing SVG and legend
};
```

- [ ] **Step 4: Replace the inline chart block in `InventoryStage.tsx` with the shared component**

```tsx
<InventoryTrendChart
  ariaLabel={t('inventoryChartAria')}
  description={chartDescription}
  title={t('chartInventoryTrend')}
  toolbarAction={
    <button
      className="ghost-button chart-expand-button"
      type="button"
      onClick={() => setIsChartExpanded(true)}
    >
      {t('inventoryEnlargeChart')}
    </button>
  }
  history={run.history}
/>
```

- [ ] **Step 5: Reuse the same component in the expanded chart dialog**

```tsx
<InventoryTrendChart
  ariaLabel={t('inventoryChartAriaExpanded')}
  description={chartDescription}
  expanded
  history={run.history}
  title={t('chartInventoryTrend')}
/>
```

- [ ] **Step 6: Run the focused month-result test**

Run: `npm test -- src/components/MonthResultSheet.test.tsx`
Expected: still FAIL, but now only because `MonthResultSheet` has not yet been updated to render the new shared chart.

- [ ] **Step 7: Commit**

```bash
git add src/components/InventoryTrendChart.tsx src/components/InventoryStage.tsx src/components/MonthResultSheet.test.tsx
git commit -m "refactor: share inventory trend chart"
```

### Task 3: Add the 30-day result chart and PNG export action

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `src/components/MonthResultSheet.tsx`
- Modify: `src/i18n.tsx`
- Modify: `src/styles/app.css`
- Test: `src/components/MonthResultSheet.test.tsx`

- [ ] **Step 1: Add a failing test that expects both result actions and the save trigger**

```tsx
it('shows save and new-run actions in the month result dialog', () => {
  render(
    <I18nProvider>
      <MonthResultSheet
        onNewGame={vi.fn()}
        run={completedRun}
        settings={DEFAULT_SETTINGS}
        summary={completedRun.summary!}
      />
    </I18nProvider>
  );

  expect(
    screen.getByRole('button', { name: /save png|保存 png|儲存 png/i })
  ).toBeInTheDocument();
  expect(
    screen.getByRole('button', { name: /start a new 30-day run|开始新的 30 天回合|開始新的 30 天回合/i })
  ).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the focused result-sheet test to verify it fails**

Run: `npm test -- src/components/MonthResultSheet.test.tsx`
Expected: FAIL because the save button is not rendered.

- [ ] **Step 3: Install the PNG export dependency**

Run: `npm install html-to-image --save`
Expected: package added to `package.json` and `package-lock.json`.

- [ ] **Step 4: Expand `MonthResultSheet` props so the dialog can render the chart from run history**

```tsx
interface MonthResultSheetProps {
  settings: GameSettings;
  summary: MonthSummary;
  run: GameRun;
  onNewGame: () => void;
}
```

- [ ] **Step 5: Add the chart and PNG export flow inside `MonthResultSheet.tsx`**

```tsx
const exportRef = useRef<HTMLElement | null>(null);
const [isSaving, setIsSaving] = useState(false);

const handleSave = async () => {
  if (!exportRef.current || isSaving) {
    return;
  }

  setIsSaving(true);

  try {
    const dataUrl = await toPng(exportRef.current, {
      cacheBust: true,
      pixelRatio: 2
    });
    const link = document.createElement('a');
    link.download = `30-day-result-day-${run.day}.png`;
    link.href = dataUrl;
    link.click();
  } finally {
    setIsSaving(false);
  }
};
```

- [ ] **Step 6: Render the shared chart below the four metrics and place the save button beside the new-run button**

```tsx
<section className="result-sheet-export" ref={dialogRef} role="dialog" tabIndex={-1}>
  <div ref={exportRef}>
    <p className="eyebrow">{t('monthResult30Day')}</p>
    <h2 id="month-result-title">{evaluation.label}</h2>
    <p id="month-result-description">{evaluation.description}</p>
    <dl className="sheet-grid">{/* existing four metrics */}</dl>
    <InventoryTrendChart
      ariaLabel={t('inventoryChartAriaExpanded')}
      description={chartDescription}
      expanded
      history={run.history}
      title={t('chartInventoryTrend')}
    />
  </div>
  <div className="result-sheet-actions">
    <button className="secondary-button" type="button" onClick={handleSave}>
      {isSaving ? t('monthResultSavingPng') : t('monthResultSavePng')}
    </button>
    <button className="primary-button" type="button" onClick={onNewGame}>
      {t('monthResultStartNewRun')}
    </button>
  </div>
</section>
```

- [ ] **Step 7: Add translation keys for the new button states**

```ts
monthResultSavePng: 'Save PNG',
monthResultSavingPng: 'Saving PNG...',
monthResultChartTitle: '30-day inventory trend'
```

- [ ] **Step 8: Add layout styles for the result chart and side-by-side actions**

```css
.result-sheet-export {
  display: grid;
  gap: var(--space-3);
}

.result-sheet-chart {
  margin-top: var(--space-3);
}

.result-sheet-actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-2);
}
```

- [ ] **Step 9: Re-run the focused result-sheet test**

Run: `npm test -- src/components/MonthResultSheet.test.tsx`
Expected: PASS, confirming the chart and both actions render.

- [ ] **Step 10: Commit**

```bash
git add package.json package-lock.json src/components/MonthResultSheet.tsx src/i18n.tsx src/styles/app.css src/components/MonthResultSheet.test.tsx
git commit -m "feat: add chart and png export to month result"
```

### Task 4: Wire the completed run into the result dialog and verify the app

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/App.test.tsx`
- Test: `src/components/MonthResultSheet.test.tsx`

- [ ] **Step 1: Update the app render path to pass the full run into the result dialog**

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

- [ ] **Step 2: Extend the app test with a completed-run assertion**

```tsx
it('passes the completed run into the month result dialog', () => {
  const completedRun = {
    ...createNewRun(12),
    history: [
      {
        day: 1,
        receivedQuantity: 0,
        demand: 12,
        orderQuantity: 10,
        availableInventory: 20,
        inventoryPosition: 30,
        soldUnits: 12,
        stockoutUnits: 0,
        endingInventory: 8,
        holdingCost: 1,
        orderingCost: 2,
        stockoutCost: 0,
        dailyTotalCost: 3,
        cashBefore: 0,
        cashAfter: -3,
        cumulativeDemand: 12,
        cumulativeSoldUnits: 12,
        runningFillRate: 1
      }
    ],
    status: 'completed' as const,
    summary: {
      totalDemand: 12,
      totalUnitsSold: 12,
      totalStockoutUnits: 0,
      totalHoldingCost: 1,
      totalOrderingCost: 2,
      totalStockoutCost: 0,
      totalInventoryManagementCost: 3,
      fillRate: 1,
      performanceRatio: 0.25,
      evaluation: {
        label: 'Excellent',
        description: 'Balanced run',
        enforcedMinimum: false,
        ratio: 0.25
      }
    }
  };

  mockedUseGameStore.mockReturnValue({
    ...mockedStore,
    run: completedRun
  });

  render(
    <I18nProvider>
      <App />
    </I18nProvider>
  );

  expect(screen.getByRole('dialog')).toBeInTheDocument();
});
```

- [ ] **Step 3: Run both focused test files**

Run: `npm test -- src/App.test.tsx src/components/MonthResultSheet.test.tsx`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/App.tsx src/App.test.tsx src/components/MonthResultSheet.test.tsx
git commit -m "feat: wire completed run into result export dialog"
```

### Task 5: Validate build, tests, and diagnostics

**Files:**
- Modify: `src/components/MonthResultSheet.tsx`
- Modify: `src/components/InventoryTrendChart.tsx`
- Modify: `src/styles/app.css`

- [ ] **Step 1: Run the full test suite**

Run: `npm test`
Expected: PASS.

- [ ] **Step 2: Run the production build**

Run: `npm run build`
Expected: PASS with Vite build output and no TypeScript errors.

- [ ] **Step 3: Check diagnostics on edited source files**

Files to inspect:
- `src/App.tsx`
- `src/components/InventoryStage.tsx`
- `src/components/InventoryTrendChart.tsx`
- `src/components/MonthResultSheet.tsx`
- `src/i18n.tsx`
- `src/styles/app.css`
- `src/App.test.tsx`
- `src/components/MonthResultSheet.test.tsx`

Expected: no new diagnostics.

- [ ] **Step 4: Commit**

```bash
git add src/App.tsx src/components/InventoryStage.tsx src/components/InventoryTrendChart.tsx src/components/MonthResultSheet.tsx src/i18n.tsx src/styles/app.css src/App.test.tsx src/components/MonthResultSheet.test.tsx package.json package-lock.json
git commit -m "chore: verify 30-day result improvements"
```

## Self-Review

- Spec coverage: covers initial language-panel visibility, 30-day result chart placement, and PNG export action.
- Placeholder scan: no `TODO`, `TBD`, or deferred implementation placeholders remain.
- Type consistency: `MonthResultSheet` explicitly receives `run`, `summary`, `settings`, and `onNewGame`; chart data always comes from `run.history`.
