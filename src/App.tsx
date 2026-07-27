import { useEffect, useState } from 'react';
import { ActionBar } from './components/ActionBar';
import { InventoryStage } from './components/InventoryStage';
import { MonthResultSheet } from './components/MonthResultSheet';
import { SettingsGate } from './components/SettingsGate';
import { SettingsPanel } from './components/SettingsPanel';
import { TopBar } from './components/TopBar';
import { DAYS_IN_RUN } from './game/config';
import { useGameStore } from './state/gameStore';

const formatMoney = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2
  }).format(value);

const App = () => {
  const [isTopBarMinimized, setIsTopBarMinimized] = useState(false);
  const {
    advanceToNextDay,
    closeSettings,
    draftOrderQuantity,
    hasHydrated,
    isSettingsGateOpen,
    isSettingsPanelOpen,
    latestEntry,
    openSettings,
    restore,
    run,
    saveSettings,
    settings,
    setDraftOrderQuantity,
    startNewGame,
    unlockSettings
  } = useGameStore();

  useEffect(() => {
    restore();
  }, [restore]);

  if (!hasHydrated) {
    return (
      <div aria-live="polite" className="loading-shell" role="status">
        Loading game…
      </div>
    );
  }

  const totalCost = run.totalHoldingCost + run.totalOrderingCost + run.totalStockoutCost;
  const latestUpdate = latestEntry
    ? `Day ${latestEntry.day} recorded. Received ${latestEntry.receivedQuantity}, demand ${latestEntry.demand}, sold ${latestEntry.soldUnits}, ending inventory ${latestEntry.endingInventory}, daily cost ${formatMoney(latestEntry.dailyTotalCost)}.`
    : `Day ${Math.min(run.day, DAYS_IN_RUN)} ready. Set today’s ordering quantity.`;

  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to game controls
      </a>

      <div className="app-shell">
        <p aria-atomic="true" aria-live="polite" className="sr-only" id="game-status">
          {latestUpdate}
        </p>

        <TopBar
          draftOrderQuantity={draftOrderQuantity}
          isMinimized={isTopBarMinimized}
          onOrderChange={setDraftOrderQuantity}
          onToggleMinimized={() => setIsTopBarMinimized((value) => !value)}
          run={run}
          totalCost={totalCost}
        />

        <main className="content-shell" id="main-content" tabIndex={-1}>
          <InventoryStage
            draftOrderQuantity={draftOrderQuantity}
            settings={settings}
            run={run}
          />
        </main>

        <ActionBar isCompleted={run.status === 'completed'} onAdvance={advanceToNextDay} onNewGame={startNewGame} />

        {run.status === 'completed' && run.summary ? (
          <MonthResultSheet summary={run.summary} onNewGame={startNewGame} />
        ) : null}

        {isSettingsGateOpen ? (
          <SettingsGate onCancel={closeSettings} onUnlock={unlockSettings} />
        ) : null}

        {isSettingsPanelOpen ? (
          <SettingsPanel onCancel={closeSettings} onSave={saveSettings} settings={settings} />
        ) : null}

        <footer className="footer-settings" aria-label="Educator controls">
          <button className="ghost-button footer-settings-button" type="button" onClick={openSettings}>
            Educator Settings
          </button>
        </footer>
      </div>
    </>
  );
};

export default App;
