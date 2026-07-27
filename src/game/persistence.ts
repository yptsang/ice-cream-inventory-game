import { DEFAULT_SETTINGS, GAME_VERSION, STORAGE_KEYS } from './config';
import type { GameRun, GameSettings, PersistedEnvelope } from './types';

const canUseStorage = () => typeof window !== 'undefined';

const parseEnvelope = <T>(raw: string | null): PersistedEnvelope<T> | null => {
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as PersistedEnvelope<T>;
  } catch {
    return null;
  }
};

const saveEnvelope = <T>(key: string, value: T) => {
  if (!canUseStorage()) {
    return;
  }

  const payload: PersistedEnvelope<T> = {
    version: GAME_VERSION,
    savedAt: new Date().toISOString(),
    value
  };
  window.localStorage.setItem(key, JSON.stringify(payload));
};

export const saveRun = (run: GameRun) => {
  saveEnvelope(STORAGE_KEYS.run, run);
};

export const loadRun = (): GameRun | null => {
  if (!canUseStorage()) {
    return null;
  }

  const envelope = parseEnvelope<GameRun>(window.localStorage.getItem(STORAGE_KEYS.run));
  if (!envelope || envelope.version !== GAME_VERSION || !envelope.value) {
    return null;
  }

  return {
    ...envelope.value,
    history: Array.isArray(envelope.value.history)
      ? envelope.value.history.map((entry) => ({
          ...entry,
          receivedQuantity: entry.receivedQuantity ?? 0
        }))
      : [],
    incomingOrders: Array.isArray(envelope.value.incomingOrders) ? envelope.value.incomingOrders : []
  };
};

export const clearRun = () => {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEYS.run);
};

export const saveSettings = (settings: GameSettings) => {
  saveEnvelope(STORAGE_KEYS.settings, settings);
};

export const loadSettings = (): GameSettings => {
  if (!canUseStorage()) {
    return DEFAULT_SETTINGS;
  }

  const envelope = parseEnvelope<GameSettings>(window.localStorage.getItem(STORAGE_KEYS.settings));
  if (!envelope || envelope.version !== GAME_VERSION || !envelope.value) {
    return DEFAULT_SETTINGS;
  }

  const { minTotalUnitsSold, thresholds } = envelope.value;
  if (
    !Array.isArray(thresholds) ||
    thresholds.length !== 3 ||
    typeof minTotalUnitsSold !== 'number' ||
    typeof envelope.value.holdingCostPerUnit !== 'number' ||
    typeof envelope.value.orderingCostPer250Units !== 'number' ||
    typeof envelope.value.stockoutCostPerUnit !== 'number' ||
    typeof envelope.value.leadTimeDays !== 'number'
  ) {
    return DEFAULT_SETTINGS;
  }

  return {
    holdingCostPerUnit: envelope.value.holdingCostPerUnit,
    orderingCostPer250Units: envelope.value.orderingCostPer250Units,
    stockoutCostPerUnit: envelope.value.stockoutCostPerUnit,
    leadTimeDays: Math.max(1, Math.floor(envelope.value.leadTimeDays)),
    minTotalUnitsSold,
    thresholds: [thresholds[0], thresholds[1], thresholds[2]]
  };
};
