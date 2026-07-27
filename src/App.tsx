import { useEffect, useState } from 'react';
import { ActionBar } from './components/ActionBar';
import { InventoryStage } from './components/InventoryStage';
import { MonthResultSheet } from './components/MonthResultSheet';
import { SettingsGate } from './components/SettingsGate';
import { SettingsPanel } from './components/SettingsPanel';
import { TopBar } from './components/TopBar';
import { DAYS_IN_RUN } from './game/config';
import { useI18n } from './i18n';
import { useGameStore } from './state/gameStore';

const App = () => {
  const [isTopBarMinimized, setIsTopBarMinimized] = useState(false);
  const { formatCurrency, t } = useI18n();
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
        {t('appLoadingGame')}
      </div>
    );
  }

  const totalCost = run.totalHoldingCost + run.totalOrderingCost + run.totalStockoutCost;
  const latestUpdate = latestEntry
    ? t('latestRecordedUpdate', {
        cost: formatCurrency(latestEntry.dailyTotalCost),
        day: latestEntry.day,
        demand: latestEntry.demand,
        endingInventory: latestEntry.endingInventory,
        received: latestEntry.receivedQuantity,
        sold: latestEntry.soldUnits
      })
    : t('latestReadyUpdate', { day: Math.min(run.day, DAYS_IN_RUN) });

  return (
    <>
      <a className="skip-link" href="#main-content">
        {t('appSkipToControls')}
      </a>

      <div className="app-shell">
        <p
          aria-atomic="true"
          aria-label={t('appGameStatus')}
          aria-live="polite"
          className="sr-only"
          id="game-status"
        >
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
          <MonthResultSheet onNewGame={startNewGame} settings={settings} summary={run.summary} />
        ) : null}

        {isSettingsGateOpen ? (
          <SettingsGate onCancel={closeSettings} onUnlock={unlockSettings} />
        ) : null}

        {isSettingsPanelOpen ? (
          <SettingsPanel onCancel={closeSettings} onSave={saveSettings} settings={settings} />
        ) : null}

        <footer className="footer-settings" aria-label={t('footerEducatorControls')}>
          <button className="ghost-button footer-settings-button" type="button" onClick={openSettings}>
            {t('footerEducatorSettings')}
          </button>
        </footer>
      </div>
    </>
  );
};

export default App;
