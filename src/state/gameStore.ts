import { create } from 'zustand';
import { DEFAULT_SETTINGS, MAX_ORDER_QUANTITY } from '../game/config';
import { advanceDay, createNewRun } from '../game/engine';
import { loadRun, loadSettings, saveRun, saveSettings as persistSettings } from '../game/persistence';
import { buildMonthSummary } from '../game/scoring';
import { isSettingsSessionUnlocked, verifySettingsPassword } from '../game/settingsAuth';
import type { DailyLedgerEntry, GameRun, GameSettings } from '../game/types';

interface GameStoreState {
  run: GameRun;
  settings: GameSettings;
  draftOrderQuantity: number;
  latestEntry: DailyLedgerEntry | null;
  isSettingsGateOpen: boolean;
  isSettingsPanelOpen: boolean;
  hasHydrated: boolean;
  restore: () => void;
  startNewGame: () => void;
  setDraftOrderQuantity: (quantity: number) => void;
  advanceToNextDay: () => void;
  openSettings: () => void;
  closeSettings: () => void;
  unlockSettings: (password: string) => Promise<boolean>;
  saveSettings: (settings: GameSettings) => void;
}

const clampOrder = (quantity: number) =>
  Math.max(0, Math.min(MAX_ORDER_QUANTITY, Math.floor(Number.isFinite(quantity) ? quantity : 0)));

const recalculateSummary = (run: GameRun, settings: GameSettings): GameRun => {
  if (run.status !== 'completed') {
    return run;
  }

  return {
    ...run,
    summary: buildMonthSummary(
      {
        totalDemand: run.cumulativeDemand,
        totalUnitsSold: run.cumulativeSoldUnits,
        totalStockoutUnits: run.cumulativeStockoutUnits,
        totalHoldingCost: run.totalHoldingCost,
        totalOrderingCost: run.totalOrderingCost,
        totalStockoutCost: run.totalStockoutCost
      },
      settings
    )
  };
};

export const useGameStore = create<GameStoreState>((set, get) => ({
  run: createNewRun(123456789),
  settings: DEFAULT_SETTINGS,
  draftOrderQuantity: 0,
  latestEntry: null,
  isSettingsGateOpen: false,
  isSettingsPanelOpen: false,
  hasHydrated: false,
  restore: () => {
    const settings = loadSettings();
    const persistedRun = loadRun();
    const restoredRun = persistedRun ? recalculateSummary(persistedRun, settings) : createNewRun();

    if (!persistedRun) {
      saveRun(restoredRun);
    }

    set({
      settings,
      run: restoredRun,
      draftOrderQuantity: 0,
      latestEntry: restoredRun.history.at(-1) ?? null,
      isSettingsGateOpen: false,
      isSettingsPanelOpen: false,
      hasHydrated: true
    });
  },
  startNewGame: () => {
    const newRun = createNewRun();
    saveRun(newRun);
    set({
      run: newRun,
      draftOrderQuantity: 0,
      latestEntry: null,
      isSettingsGateOpen: false,
      isSettingsPanelOpen: false
    });
  },
  setDraftOrderQuantity: (quantity) => {
    set({ draftOrderQuantity: clampOrder(quantity) });
  },
  advanceToNextDay: () => {
    const { draftOrderQuantity, run, settings } = get();
    const { run: updatedRun, latestEntry } = advanceDay(run, draftOrderQuantity, settings);
    saveRun(updatedRun);
    set({
      run: updatedRun,
      latestEntry,
      draftOrderQuantity: 0,
      isSettingsGateOpen: false,
      isSettingsPanelOpen: false
    });
  },
  openSettings: () => {
    const unlocked = isSettingsSessionUnlocked();
    set({
      isSettingsGateOpen: !unlocked,
      isSettingsPanelOpen: unlocked
    });
  },
  closeSettings: () =>
    set({
      isSettingsGateOpen: false,
      isSettingsPanelOpen: false
    }),
  unlockSettings: async (password) => {
    const matched = await verifySettingsPassword(password);
    set({
      isSettingsGateOpen: !matched,
      isSettingsPanelOpen: matched
    });
    return matched;
  },
  saveSettings: (settings) => {
    persistSettings(settings);
    set((state) => {
      const updatedRun = recalculateSummary(state.run, settings);
      saveRun(updatedRun);

      return {
        settings,
        run: updatedRun,
        isSettingsGateOpen: false,
        isSettingsPanelOpen: false
      };
    });
  }
}));
