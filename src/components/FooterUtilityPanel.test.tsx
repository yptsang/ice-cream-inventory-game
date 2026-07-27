import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { I18nProvider } from '../i18n';
import { FooterUtilityPanel } from './FooterUtilityPanel';

describe('FooterUtilityPanel', () => {
  it('renders language buttons above educator settings and dismisses after a language selection', async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    const onOpenSettings = vi.fn();

    render(
      <I18nProvider>
        <FooterUtilityPanel onDismiss={onDismiss} onOpenSettings={onOpenSettings} />
      </I18nProvider>
    );

    const languageGroup = screen.getByRole('group', { name: /language/i });
    expect(languageGroup).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'English' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '繁體中文' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '简体中文' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /educator settings/i }));

    expect(onOpenSettings).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole('button', { name: '简体中文' }));

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
