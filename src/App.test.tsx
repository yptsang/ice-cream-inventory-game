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

  it('renders a hero summary card while keeping the utility panel hidden until reopened', async () => {
    const user = userEvent.setup();

    render(
      <I18nProvider>
        <App />
      </I18nProvider>
    );

    expect(
      screen.getByRole('heading', { level: 2, name: /choose today’s ordering quantity/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/today’s demand/i)).toBeInTheDocument();
    expect(screen.queryByRole('group', { name: /language|語言/i })).not.toBeInTheDocument();

    await user.click(
      screen.getByRole('button', {
        name: /show language & settings|显示语言与设置|顯示語言與設定/i
      })
    );

    expect(screen.getByRole('group', { name: /language|語言/i })).toBeInTheDocument();
  });
});
