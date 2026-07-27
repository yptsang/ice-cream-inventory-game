import { beforeEach, describe, expect, it } from 'vitest';
import { DEFAULT_SETTINGS, GAME_VERSION, STORAGE_KEYS } from './config';
import { createNewRun } from './engine';
import { clearRun, loadRun, loadSettings, saveRun, saveSettings } from './persistence';

describe('persistence', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('restores a valid saved run', () => {
    const run = createNewRun(12);
    saveRun(run);

    expect(loadRun()).toEqual(run);
  });

  it('falls back safely when saved state is malformed', () => {
    window.localStorage.setItem(STORAGE_KEYS.run, '{bad json');

    expect(loadRun()).toBeNull();
  });

  it('persists and restores settings', () => {
    const customSettings = {
      ...DEFAULT_SETTINGS,
      minTotalUnitsSold: 420,
      orderingCostPer250Units: 90
    };

    saveSettings(customSettings);

    expect(loadSettings()).toEqual(customSettings);
  });

  it('ignores settings with the wrong version metadata', () => {
    window.localStorage.setItem(
      STORAGE_KEYS.settings,
      JSON.stringify({
        version: GAME_VERSION + 1,
        savedAt: new Date().toISOString(),
        value: { minTotalUnitsSold: 999, thresholds: [], holdingCostPerUnit: 0.1 }
      })
    );

    expect(loadSettings()).toEqual(DEFAULT_SETTINGS);
  });

  it('clears the saved run', () => {
    saveRun(createNewRun(3));
    clearRun();

    expect(loadRun()).toBeNull();
  });
});
