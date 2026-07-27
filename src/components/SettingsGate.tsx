import { FormEvent, useEffect, useState } from 'react';
import { DEFAULT_SETTINGS_PASSWORD } from '../game/config';
import { useAccessibleDialog } from '../hooks/useAccessibleDialog';
import { isSettingsSessionUnlocked } from '../game/settingsAuth';

interface SettingsGateProps {
  onUnlock: (password: string) => Promise<boolean>;
  onCancel: () => void;
}

export const SettingsGate = ({ onUnlock, onCancel }: SettingsGateProps) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const dialogRef = useAccessibleDialog<HTMLElement>({
    isOpen: true,
    onClose: onCancel
  });

  useEffect(() => {
    if (isSettingsSessionUnlocked()) {
      void onUnlock(DEFAULT_SETTINGS_PASSWORD);
    }
  }, [onUnlock]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const accepted = await onUnlock(password);

    if (!accepted) {
      setError('That password did not unlock the settings panel.');
    } else {
      setError('');
    }
  };

  return (
    <div className="overlay">
      <section
        aria-describedby="settings-gate-description"
        aria-labelledby="settings-gate-title"
        aria-modal="true"
        className="sheet auth-sheet"
        ref={dialogRef}
        role="dialog"
        tabIndex={-1}
      >
        <p className="eyebrow">Educator access</p>
        <h2 id="settings-gate-title">Enter the settings password</h2>

        <form className="stack-sm" onSubmit={handleSubmit}>
          <label htmlFor="settings-password">Password</label>
          <input
            autoComplete="current-password"
            id="settings-password"
            name="settingsPassword"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          {error ? (
            <p className="error-text" role="alert">
              {error}
            </p>
          ) : null}
          <div className="inline-actions">
            <button className="secondary-button" type="button" onClick={onCancel}>
              Cancel
            </button>
            <button className="primary-button" type="submit">
              Unlock
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};
