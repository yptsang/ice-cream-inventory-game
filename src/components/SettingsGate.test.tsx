import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_SETTINGS_PASSWORD } from '../game/config';
import {
  clearSettingsSessionUnlock,
  isSettingsSessionUnlocked,
  verifySettingsPassword
} from '../game/settingsAuth';
import { SettingsGate } from './SettingsGate';

describe('SettingsGate', () => {
  beforeEach(() => {
    sessionStorage.clear();
    clearSettingsSessionUnlock();
  });

  it('shows an error when the password is incorrect', async () => {
    const user = userEvent.setup();
    const onUnlock = vi.fn((password: string) => verifySettingsPassword(password));

    render(<SettingsGate onCancel={vi.fn()} onUnlock={onUnlock} />);

    await user.type(screen.getByLabelText(/^password$/i), 'wrong-password');
    await user.click(screen.getByRole('button', { name: /unlock/i }));

    expect(await screen.findByText(/did not unlock/i)).toBeInTheDocument();
    expect(isSettingsSessionUnlocked()).toBe(false);
  });

  it('accepts the correct password and unlocks the session', async () => {
    const user = userEvent.setup();
    const onUnlock = vi.fn((password: string) => verifySettingsPassword(password));

    render(<SettingsGate onCancel={vi.fn()} onUnlock={onUnlock} />);

    await user.type(screen.getByLabelText(/^password$/i), DEFAULT_SETTINGS_PASSWORD);
    await user.click(screen.getByRole('button', { name: /unlock/i }));

    await waitFor(() => {
      expect(onUnlock).toHaveBeenCalledWith(DEFAULT_SETTINGS_PASSWORD);
    });
    expect(isSettingsSessionUnlocked()).toBe(true);
  });

  it('reuses the existing session unlock state', async () => {
    sessionStorage.setItem('ice-cream-game/settings-unlocked', 'true');
    const onUnlock = vi.fn(async () => true);

    render(<SettingsGate onCancel={vi.fn()} onUnlock={onUnlock} />);

    await waitFor(() => {
      expect(onUnlock).toHaveBeenCalledWith(DEFAULT_SETTINGS_PASSWORD);
    });
  });
});
