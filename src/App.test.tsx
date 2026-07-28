import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import { createNewRun } from './game/engine';
import { DEFAULT_SETTINGS } from './game/config';
import { I18nProvider } from './i18n';
import { useGameStore } from './state/gameStore';

vi.mock('./state/gameStore', () => ({
  useGameStore: vi.fn()
}));

const mockedUseGameStore = vi.mocked(useGameStore);

describe('App', () => {
  beforeEach(() => {
    window.localStorage.clear();
    mockedUseGameStore.mockReturnValue({
      advanceToNextDay: vi.fn(),
      closeSettings: vi.fn(),
      draftOrderQuantity: 0,
      hasHydrated: true,
      isSettingsGateOpen: false,
      isSettingsPanelOpen: false,
      latestEntry: null,
      openSettings: vi.fn(),
      restore: vi.fn(),
      run: createNewRun(12),
      saveSettings: vi.fn(),
      settings: DEFAULT_SETTINGS,
      setDraftOrderQuantity: vi.fn(),
      startNewGame: vi.fn(),
      unlockSettings: vi.fn()
    });
  });

  it('starts with the floating utility panel hidden and reopens it from the footer', async () => {
    const user = userEvent.setup();

    render(
      <I18nProvider>
        <App />
      </I18nProvider>
    );

    expect(screen.queryByRole('group', { name: /language|語言/i })).not.toBeInTheDocument();

    const reopenButton = screen.getByRole('button', {
      name: /show language & settings|显示语言与设置|顯示語言與設定/i
    });

    await user.click(reopenButton);

    expect(screen.getByRole('group', { name: /language|語言/i })).toBeInTheDocument();
  });
});
