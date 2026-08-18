# Playful Retail Phone-First UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rework the inventory game into the approved hero-first, phone-first playful retail layout without changing the simulation logic.

**Architecture:** Keep the existing React + Zustand game flow, but split the current top-heavy layout into a slim sticky header, a dedicated hero summary surface, stacked supply-flow cards, and a thumb-friendly bottom control dock. Reuse the current game state, chart component, and educator/settings flow so the work stays UI-focused and regression risk stays low.

**Tech Stack:** React 18, TypeScript, Zustand, plain CSS, Vitest, Testing Library, Vite

---

### Task 1: Create The Hero-First Shell

**Files:**
- Create: `src/components/GameHeroPanel.tsx`
- Modify: `src/App.tsx`
- Modify: `src/components/TopBar.tsx`
- Test: `src/App.test.tsx`
- Test: `src/components/TopBar.test.tsx`

- [ ] **Step 1: Create the working branch**

Run:

```bash
git switch -c feat/playful-retail-phone-first-ui
```

Expected: `Switched to a new branch 'feat/playful-retail-phone-first-ui'`

- [ ] **Step 2: Write the failing shell tests**

Update `src/App.test.tsx` with:

```tsx
it('renders a hero summary card while keeping the utility panel hidden until reopened', async () => {
  const user = userEvent.setup();

  render(
    <I18nProvider>
      <App />
    </I18nProvider>
  );

  expect(screen.getByRole('heading', { level: 2, name: /choose today’s ordering quantity/i })).toBeInTheDocument();
  expect(screen.getByText(/today’s demand/i)).toBeInTheDocument();
  expect(screen.queryByRole('group', { name: /language|語言/i })).not.toBeInTheDocument();

  await user.click(
    screen.getByRole('button', {
      name: /show language & settings|显示语言与设置|顯示語言與設定/i
    })
  );

  expect(screen.getByRole('group', { name: /language|語言/i })).toBeInTheDocument();
});
```

Update `src/components/TopBar.test.tsx` with:

```tsx
it('keeps the sticky header lightweight and removes embedded order controls', () => {
  const result = advanceDay(createNewRun(12), 18, DEFAULT_SETTINGS);

  render(
    <TopBar
      isMinimized={false}
      onToggleMinimized={vi.fn()}
      run={result.run}
    />
  );

  expect(screen.getByRole('heading', { level: 1, name: /day 2 of 30/i })).toBeInTheDocument();
  expect(screen.queryByRole('slider', { name: /order quantity slider/i })).not.toBeInTheDocument();
  expect(screen.queryByText(/today’s demand/i)).not.toBeInTheDocument();
});
```

- [ ] **Step 3: Run the focused tests and confirm they fail**

Run:

```bash
npm test -- src/App.test.tsx src/components/TopBar.test.tsx
```

Expected: FAIL because the current `TopBar` still renders metrics and compact order controls, and `App` does not yet render a dedicated hero summary section.

- [ ] **Step 4: Implement the slim header and new hero component**

Create `src/components/GameHeroPanel.tsx`:

```tsx
import type { GameRun } from '../game/types';
import { useI18n } from '../i18n';

interface GameHeroPanelProps {
  draftOrderQuantity: number;
  run: GameRun;
  totalCost: number;
}

export const GameHeroPanel = ({ draftOrderQuantity, run, totalCost }: GameHeroPanelProps) => {
  const { formatCurrency, formatNumber, formatPercent, t } = useI18n();
  const latestEntry = run.history.at(-1);
  const todayDemand = latestEntry?.demand ?? 0;
  const inTransitUnits = run.incomingOrders.reduce((sum, incomingOrder) => sum + incomingOrder.quantity, 0);

  return (
    <section className="game-hero" aria-labelledby="game-hero-title">
      <div className="game-hero-card">
        <p className="eyebrow">{t('orderControlsPlan')}</p>
        <h2 id="game-hero-title">{t('inventoryChooseTodayOrder')}</h2>
        <p className="support-copy">{t('latestReadyUpdate', { day: run.day })}</p>
        <dl className="hero-highlight-grid">
          <div>
            <dt>{t('inventoryInStore')}</dt>
            <dd>{formatNumber(run.currentInventory)}</dd>
          </div>
          <div>
            <dt>{t('inventoryTodayDemand')}</dt>
            <dd>{formatNumber(todayDemand)}</dd>
          </div>
        </dl>
        <div className="hero-status-row">
          <span className="hero-status-chip">{t('inventoryFillRate')}: {formatPercent(run.fillRate)}</span>
          <span className="hero-order-chip">{t('commonUnits', { count: formatNumber(draftOrderQuantity) })}</span>
        </div>
      </div>

      <dl className="hero-metrics-grid">
        <div>
          <dt>{t('topbarTotalCost')}</dt>
          <dd>{formatCurrency(totalCost)}</dd>
        </div>
        <div>
          <dt>{t('inventoryInTransit')}</dt>
          <dd>{formatNumber(inTransitUnits)}</dd>
        </div>
      </dl>
    </section>
  );
};
```

Update `src/components/TopBar.tsx`:

```tsx
import { DAYS_IN_RUN } from '../game/config';
import { useI18n } from '../i18n';
import type { GameRun } from '../game/types';

interface TopBarProps {
  isMinimized: boolean;
  onToggleMinimized: () => void;
  run: GameRun;
}

export const TopBar = ({ isMinimized, onToggleMinimized, run }: TopBarProps) => {
  const { t } = useI18n();

  return (
    <header className={`top-bar ${isMinimized ? 'top-bar-compact' : 'top-bar-slim'}`}>
      <div className="top-bar-headline-row">
        <div className="top-bar-header">
          <p className="eyebrow">{t('appTitle')}</p>
          <h1>{t('commonDayOf', { day: Math.min(run.day, DAYS_IN_RUN), total: DAYS_IN_RUN })}</h1>
        </div>
        <div className="top-bar-actions">
          <button
            aria-expanded={!isMinimized}
            aria-label={isMinimized ? t('topbarResumePanelAria') : t('topbarMinimizePanelAria')}
            className="ghost-button"
            type="button"
            onClick={onToggleMinimized}
          >
            {isMinimized ? t('topbarResumePanel') : t('topbarMinimise')}
          </button>
        </div>
      </div>
    </header>
  );
};
```

Update `src/App.tsx`:

```tsx
import { GameHeroPanel } from './components/GameHeroPanel';

// inside the component body
<TopBar
  isMinimized={isTopBarMinimized}
  onToggleMinimized={() => setIsTopBarMinimized((value) => !value)}
  run={run}
/>

<main className="content-shell" id="main-content" tabIndex={-1}>
  {!isTopBarMinimized ? (
    <GameHeroPanel
      draftOrderQuantity={draftOrderQuantity}
      run={run}
      totalCost={totalCost}
    />
  ) : null}
  <InventoryStage draftOrderQuantity={draftOrderQuantity} settings={settings} run={run} />
</main>
```

- [ ] **Step 5: Run the focused tests and confirm they pass**

Run:

```bash
npm test -- src/App.test.tsx src/components/TopBar.test.tsx
```

Expected: PASS with the new hero section present and the sticky header reduced to day/title/minimize controls.

- [ ] **Step 6: Commit the shell refactor**

Run:

```bash
git add src/App.tsx src/components/GameHeroPanel.tsx src/components/TopBar.tsx src/App.test.tsx src/components/TopBar.test.tsx
git commit -m "feat: add hero-first game shell"
```

Expected: a clean commit on `feat/playful-retail-phone-first-ui`

### Task 2: Refactor The Supply Flow Into Retail Cards

**Files:**
- Modify: `src/components/InventoryStage.tsx`
- Modify: `src/styles/app.css`
- Test: `src/components/InventoryStage.test.tsx`

- [ ] **Step 1: Write the failing supply-card test**

Add this test to `src/components/InventoryStage.test.tsx`:

```tsx
it('renders supplier, store, and customer sections as stacked supply cards with the store emphasized', () => {
  const result = advanceDay(createNewRun(12), 18, DEFAULT_SETTINGS);

  render(
    <InventoryStage
      draftOrderQuantity={18}
      settings={DEFAULT_SETTINGS}
      run={result.run}
    />
  );

  const supplier = screen.getByRole('heading', { level: 3, name: /supplier/i }).closest('article');
  const store = screen.getByRole('heading', { level: 3, name: /store/i }).closest('article');
  const customers = screen.getByRole('heading', { level: 3, name: /customers/i }).closest('article');

  expect(supplier).toHaveClass('supply-card');
  expect(store).toHaveClass('supply-card', 'supply-card-primary');
  expect(customers).toHaveClass('supply-card');
  expect(screen.getByRole('button', { name: /game logic/i })).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the inventory-stage test and confirm it fails**

Run:

```bash
npm test -- src/components/InventoryStage.test.tsx
```

Expected: FAIL because the current markup still uses `supply-node` classes and does not expose the new retail-card hooks.

- [ ] **Step 3: Update the stage markup to match the approved layout**

Update `src/components/InventoryStage.tsx`:

```tsx
<section aria-labelledby="inventory-stage-title" className="inventory-stage supply-stage">
  <div className="inventory-stage-header">
    <div>
      <p className="eyebrow">{t('inventorySupplyChain')}</p>
      <h2 id="inventory-stage-title">{t('inventorySupplyChainTitle')}</h2>
      <p className="support-copy">{t('inventoryLogicIntro')}</p>
    </div>
    <button className="ghost-button inventory-logic-button" type="button" onClick={() => setIsLogicOpen(true)}>
      {t('inventoryGameLogic')}
    </button>
  </div>

  <div className="supply-flow-stack" role="presentation">
    <article className="supply-card supply-card-secondary">
      <div className="supply-card-header">
        <div aria-hidden="true" className="node-icon">🏭</div>
        <div>
          <h3>{t('inventorySupplier')}</h3>
          <p className="support-copy">{t('inventoryOrderArrivesAfterLeadTime')}</p>
        </div>
      </div>
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
      </dl>
    </article>

    <article className="supply-card supply-card-primary">
      <div className="supply-card-header">
        <div aria-hidden="true" className="node-icon">🏪</div>
        <div>
          <h3>{t('inventoryStore')}</h3>
          <p className="support-copy">{t('inventoryInventoryPositionInStoreOnOrder')}</p>
        </div>
      </div>
      <div className="store-chart-wrap">
        <div className="chart-toolbar">
          <span className="chart-title">{t('chartInventoryTrend')}</span>
          <button className="ghost-button chart-expand-button" type="button" onClick={() => setIsChartExpanded(true)}>
            {t('inventoryEnlargeChart')}
          </button>
        </div>
        <InventoryTrendChart
          ariaLabel={t('inventoryChartAria')}
          chartDescription={chartModel.chartDescription}
          chartHeight={chartModel.chartHeight}
          chartPadding={chartModel.chartPadding}
          chartWidth={chartModel.chartWidth}
          descriptionId="inventory-chart-description"
          series={chartModel.series}
          t={t}
          xTicks={chartModel.xTicks}
          yTicks={chartModel.yTicks}
        />
      </div>
      <dl className="node-stats">
        <div>
          <dt>{t('inventoryOnHand')}</dt>
          <dd>{formatNumber(run.currentInventory)}</dd>
        </div>
        <div>
          <dt>{t('inventoryTodayDemand')}</dt>
          <dd>{formatNumber(todayDemand)}</dd>
        </div>
        <div>
          <dt>{t('inventoryTodaySales')}</dt>
          <dd>{formatNumber(todaySoldUnits)}</dd>
        </div>
      </dl>
    </article>

    <article className="supply-card supply-card-secondary">
      <div className="supply-card-header">
        <div aria-hidden="true" className="node-icon">🧑‍🤝‍🧑</div>
        <div>
          <h3>{t('inventoryCustomers')}</h3>
          <p className="support-copy">{t('inventorySalesAndFillRate')}</p>
        </div>
      </div>
      <dl className="node-stats node-stats-vertical">
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
</section>
```

- [ ] **Step 4: Add the supply-card layout styles**

Append these selectors to `src/styles/app.css`:

```css
.inventory-stage-header {
  display: grid;
  gap: var(--space-3);
}

.supply-flow-stack {
  display: grid;
  gap: var(--space-3);
}

.supply-card {
  display: grid;
  gap: var(--space-3);
  padding: var(--space-3);
  border-radius: var(--radius-xl);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.94), rgba(255, 247, 250, 0.88));
  border: 1px solid rgba(20, 20, 19, 0.08);
  box-shadow: var(--shadow-soft);
}

.supply-card-primary {
  background: linear-gradient(180deg, rgba(248, 255, 253, 0.98), rgba(236, 248, 244, 0.96));
  border-color: rgba(31, 174, 135, 0.22);
  box-shadow: 0 18px 36px rgba(31, 174, 135, 0.16);
}

.supply-card-secondary {
  background: linear-gradient(180deg, rgba(255, 250, 244, 0.96), rgba(255, 244, 248, 0.9));
}

.supply-card-header {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: var(--space-2);
  align-items: start;
}
```

- [ ] **Step 5: Run the inventory-stage suite and confirm it passes**

Run:

```bash
npm test -- src/components/InventoryStage.test.tsx
```

Expected: PASS with the existing chart assertions preserved and the new class-based retail-card assertions passing.

- [ ] **Step 6: Commit the supply-flow refactor**

Run:

```bash
git add src/components/InventoryStage.tsx src/styles/app.css src/components/InventoryStage.test.tsx
git commit -m "feat: restyle the supply flow as stacked cards"
```

Expected: a commit that changes only the stage markup, stage styles, and the focused test file

### Task 3: Move Order Entry Into A Thumb-Friendly Control Dock

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/components/ActionBar.tsx`
- Modify: `src/components/OrderControls.tsx`
- Modify: `src/styles/app.css`
- Create: `src/components/ActionBar.test.tsx`

- [ ] **Step 1: Write the failing dock test**

Create `src/components/ActionBar.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ActionBar } from './ActionBar';

describe('ActionBar', () => {
  it('renders the order controls and both game actions inside the bottom dock', () => {
    render(
      <ActionBar
        draftOrderQuantity={250}
        isCompleted={false}
        onAdvance={vi.fn()}
        onNewGame={vi.fn()}
        onOrderChange={vi.fn()}
      />
    );

    expect(screen.getByText(/250 units/i)).toBeInTheDocument();
    expect(screen.getByRole('slider', { name: /order quantity slider/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /new game/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /next day/i })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the dock test and confirm it fails**

Run:

```bash
npm test -- src/components/ActionBar.test.tsx
```

Expected: FAIL because `ActionBar` does not yet accept `draftOrderQuantity` or `onOrderChange`, and it does not render order controls.

- [ ] **Step 3: Refactor the bottom dock markup and wire it through `App`**

Update `src/components/ActionBar.tsx`:

```tsx
import { useI18n } from '../i18n';
import { OrderControls } from './OrderControls';

interface ActionBarProps {
  draftOrderQuantity: number;
  isCompleted: boolean;
  onAdvance: () => void;
  onNewGame: () => void;
  onOrderChange: (value: number) => void;
}

export const ActionBar = ({
  draftOrderQuantity,
  isCompleted,
  onAdvance,
  onNewGame,
  onOrderChange
}: ActionBarProps) => {
  const { formatNumber, t } = useI18n();

  return (
    <nav aria-label={t('actionGameActions')} className="action-bar control-dock">
      <section className="control-dock-card" aria-label={t('orderControlsAria')}>
        <div className="control-dock-header">
          <div>
            <p className="eyebrow">{t('orderControlsPlan')}</p>
            <strong className="control-dock-value">{t('commonUnits', { count: formatNumber(draftOrderQuantity) })}</strong>
          </div>
        </div>
        <OrderControls compact onChange={onOrderChange} value={draftOrderQuantity} />
      </section>

      <div className="control-dock-actions">
        <button className="secondary-button" type="button" onClick={onNewGame}>
          {t('actionNewGame')}
        </button>
        <button className="primary-button" disabled={isCompleted} type="button" onClick={onAdvance}>
          {isCompleted ? t('actionRunComplete') : t('actionNextDay')}
        </button>
      </div>
    </nav>
  );
};
```

Update the `ActionBar` call site in `src/App.tsx`:

```tsx
<ActionBar
  draftOrderQuantity={draftOrderQuantity}
  isCompleted={run.status === 'completed'}
  onAdvance={advanceToNextDay}
  onNewGame={startNewGame}
  onOrderChange={setDraftOrderQuantity}
/>
```

Update `src/components/OrderControls.tsx` to give the dock a stronger summary row:

```tsx
{compact ? (
  <div className="topbar-order-meta control-dock-meta">
    <span>{t('topbarTodayOrderingQuantity')}</span>
    <strong>{t('commonUnits', { count: formatNumber(value) })}</strong>
  </div>
) : (
  <div className="section-heading">
    <div>
      <p className="eyebrow">{t('orderControlsPlan')}</p>
      <h2 id="order-controls-title">{t('inventoryChooseTodayOrder')}</h2>
    </div>
    <div aria-live="polite" aria-atomic="true" className="order-pill">
      {t('orderControlsPill', { count: formatNumber(value) })}
    </div>
  </div>
)}
```

- [ ] **Step 4: Add the dock-specific styles**

Append these selectors to `src/styles/app.css`:

```css
.control-dock {
  display: grid;
  gap: var(--space-2);
  padding: var(--space-2);
}

.control-dock-card {
  display: grid;
  gap: var(--space-2);
  padding: var(--space-3);
  border-radius: var(--radius-xl);
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(16px);
}

.control-dock-value {
  display: block;
  margin-top: var(--space-1);
  font-family: var(--font-heading);
  font-size: var(--text-lg);
  color: var(--surface-strong);
}

.control-dock-actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-2);
}

.control-dock-meta {
  margin-bottom: var(--space-2);
}
```

- [ ] **Step 5: Run the dock test and the existing order-control regression suite**

Run:

```bash
npm test -- src/components/ActionBar.test.tsx src/components/OrderControls.test.tsx
```

Expected: PASS with the dock test green and the existing order-control behavior still intact.

- [ ] **Step 6: Commit the bottom-dock refactor**

Run:

```bash
git add src/App.tsx src/components/ActionBar.tsx src/components/OrderControls.tsx src/components/ActionBar.test.tsx src/styles/app.css
git commit -m "feat: move ordering into the bottom control dock"
```

Expected: a commit that wires order entry into the fixed bottom dock without changing simulation behavior

### Task 4: Apply The Playful Retail Polish And Verify Publish Readiness

**Files:**
- Modify: `src/styles/tokens.css`
- Modify: `src/styles/app.css`
- Verify: `src/App.test.tsx`
- Verify: `src/components/InventoryStage.test.tsx`
- Verify: `src/components/ActionBar.test.tsx`
- Verify: `src/components/MonthResultSheet.test.tsx`

- [ ] **Step 1: Add the cheerful color tokens**

Update `src/styles/tokens.css`:

```css
:root {
  --accent-berry: #ff7aa2;
  --accent-sun: #ffd978;
  --accent-mint: #7dd3c9;
  --surface-hero: linear-gradient(135deg, #ff8fb1 0%, #ffd978 100%);
  --surface-card-warm: linear-gradient(180deg, rgba(255, 250, 244, 0.96), rgba(255, 244, 248, 0.9));
  --surface-card-cool: linear-gradient(180deg, rgba(248, 255, 253, 0.98), rgba(236, 248, 244, 0.96));
}
```

- [ ] **Step 2: Replace the remaining dashboard-heavy layout selectors with the approved phone-first polish**

Update `src/styles/app.css` with these blocks:

```css
.top-bar-slim {
  padding: 0.95rem 1rem;
}

.top-bar-compact {
  padding-block: 0.9rem;
}

.game-hero {
  display: grid;
  gap: var(--space-3);
}

.game-hero-card {
  padding: clamp(1.25rem, 4vw, 1.6rem);
  border-radius: var(--radius-xl);
  background: var(--surface-hero);
  color: #3c2740;
  box-shadow: 0 18px 32px rgba(255, 143, 177, 0.24);
}

.hero-highlight-grid,
.hero-metrics-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-2);
}

.hero-highlight-grid div,
.hero-metrics-grid div {
  padding: var(--space-2);
  border-radius: var(--radius-lg);
  background: rgba(255, 255, 255, 0.72);
}

.hero-status-row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-top: var(--space-2);
}

.hero-status-chip,
.hero-order-chip {
  padding: 0.55rem 0.9rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.52);
  font-weight: 700;
}

@media (min-width: 760px) {
  .game-hero {
    grid-template-columns: minmax(0, 1.35fr) minmax(18rem, 0.85fr);
    align-items: start;
  }

  .supply-flow-stack {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .control-dock {
    grid-template-columns: minmax(0, 1.2fr) minmax(18rem, 0.8fr);
    align-items: end;
  }
}

@media (max-width: 480px) {
  .hero-highlight-grid,
  .hero-metrics-grid,
  .control-dock-actions {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 3: Run the targeted regression suite**

Run:

```bash
npm test -- src/App.test.tsx src/components/InventoryStage.test.tsx src/components/ActionBar.test.tsx src/components/MonthResultSheet.test.tsx
```

Expected: PASS with the updated main-screen layout green and the existing result-sheet coverage still green.

- [ ] **Step 4: Run the full automated verification**

Run:

```bash
npm test
npm run build
```

Expected:

```text
✓ all Vitest suites pass
✓ TypeScript checks pass
✓ Vite build completes successfully
```

- [ ] **Step 5: Commit the styling pass and push the branch**

Run:

```bash
git add src/styles/tokens.css src/styles/app.css
git commit -m "style: polish the playful retail phone-first layout"
git push -u origin feat/playful-retail-phone-first-ui
```

Expected: the branch is published to GitHub and ready for review or deployment through the existing repository workflow

## Manual Verification Checklist

- [ ] Open the app in a phone-sized viewport and confirm the sticky header stays compact while the hero card remains readable.
- [ ] Drag the order slider, edit the numeric input, and confirm the bottom dock keeps the primary action obvious.
- [ ] Verify the supplier, store, and customer cards stack vertically on phones and expand into columns on larger screens.
- [ ] Open the game-logic modal and expanded chart modal to confirm the redesign does not break overlays or focus management.
- [ ] Switch between English, Traditional Chinese, and Simplified Chinese to confirm the redesigned cards still fit translated text.
- [ ] Complete a full 30-day run and confirm the result sheet still appears and the existing export flow still works.
