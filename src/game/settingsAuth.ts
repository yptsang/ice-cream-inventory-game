import {
  DEFAULT_SETTINGS_PASSWORD_HASH,
  SETTINGS_UNLOCK_SESSION_KEY
} from './config';

const toHex = (buffer: ArrayBuffer) =>
  Array.from(new Uint8Array(buffer))
    .map((value) => value.toString(16).padStart(2, '0'))
    .join('');

export const hashText = async (value: string) => {
  const encoder = new TextEncoder();
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(value));
  return toHex(digest);
};

export const unlockSettingsSession = () => {
  sessionStorage.setItem(SETTINGS_UNLOCK_SESSION_KEY, 'true');
};

export const clearSettingsSessionUnlock = () => {
  sessionStorage.removeItem(SETTINGS_UNLOCK_SESSION_KEY);
};

export const isSettingsSessionUnlocked = () =>
  sessionStorage.getItem(SETTINGS_UNLOCK_SESSION_KEY) === 'true';

export const verifySettingsPassword = async (candidate: string) => {
  const candidateHash = await hashText(candidate.trim());
  const matched = candidateHash === DEFAULT_SETTINGS_PASSWORD_HASH;

  if (matched) {
    unlockSettingsSession();
  }

  return matched;
};
