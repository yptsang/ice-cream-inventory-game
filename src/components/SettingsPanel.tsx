import { FormEvent, useMemo, useState } from 'react';
import type { GameSettings } from '../game/types';
import { useAccessibleDialog } from '../hooks/useAccessibleDialog';
import { useI18n } from '../i18n';

interface SettingsPanelProps {
  settings: GameSettings;
  onSave: (settings: GameSettings) => void;
  onCancel: () => void;
}

export const SettingsPanel = ({ settings, onSave, onCancel }: SettingsPanelProps) => {
  const { t } = useI18n();
  const [holdingCost, setHoldingCost] = useState(settings.holdingCostPerUnit);
  const [orderingCost, setOrderingCost] = useState(settings.orderingCostPer250Units);
  const [stockoutCost, setStockoutCost] = useState(settings.stockoutCostPerUnit);
  const [leadTimeDays, setLeadTimeDays] = useState(settings.leadTimeDays);
  const [minSold, setMinSold] = useState(settings.minTotalUnitsSold);
  const [bandA, setBandA] = useState(settings.thresholds[0]);
  const [bandB, setBandB] = useState(settings.thresholds[1]);
  const [bandC, setBandC] = useState(settings.thresholds[2]);
  const [error, setError] = useState('');
  const dialogRef = useAccessibleDialog<HTMLElement>({
    isOpen: true,
    onClose: onCancel
  });

  const isOrdered = useMemo(
    () => bandA.maxRatio < bandB.maxRatio && bandB.maxRatio < bandC.maxRatio,
    [bandA.maxRatio, bandB.maxRatio, bandC.maxRatio]
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isOrdered) {
      setError(t('settingsThresholdError'));
      return;
    }

    if (minSold < 0) {
      setError(t('settingsMinimumSoldError'));
      return;
    }

    if (holdingCost < 0 || orderingCost < 0 || stockoutCost < 0) {
      setError(t('settingsCostValuesError'));
      return;
    }

    if (leadTimeDays < 1) {
      setError(t('settingsLeadTimeError'));
      return;
    }

    setError('');
    onSave({
      holdingCostPerUnit: holdingCost,
      orderingCostPer250Units: orderingCost,
      stockoutCostPerUnit: stockoutCost,
      leadTimeDays: Math.max(1, Math.floor(leadTimeDays)),
      minTotalUnitsSold: Math.floor(minSold),
      thresholds: [
        {
          ...bandA,
          description: `${bandA.label} applies when the cost per unit sold is at or below ${bandA.maxRatio.toFixed(2)}.`
        },
        {
          ...bandB,
          description: `${bandB.label} applies when the cost per unit sold is at or below ${bandB.maxRatio.toFixed(2)}.`
        },
        {
          ...bandC,
          description: `${bandC.label} applies when the cost per unit sold is above ${bandB.maxRatio.toFixed(2)}.`
        }
      ]
    });
  };

  return (
    <div className="overlay">
      <section
        aria-describedby="settings-panel-description"
        aria-labelledby="settings-panel-title"
        aria-modal="true"
        className="sheet"
        ref={dialogRef}
        role="dialog"
        tabIndex={-1}
      >
        <div className="sheet-header">
          <div>
            <p className="eyebrow">{t('settingsScoringSettings')}</p>
            <h2 id="settings-panel-title">{t('settingsAdjustGame')}</h2>
            <p className="support-copy" id="settings-panel-description">
              {t('settingsDescription')}
            </p>
          </div>
          <button className="ghost-button" type="button" onClick={onCancel}>
            {t('settingsClose')}
          </button>
        </div>

        <form className="stack-md" onSubmit={handleSubmit}>
          <div className="settings-grid">
            <label className="stack-sm" htmlFor="holding-cost">
              <span>{t('settingsHoldingCostPerUnit')}</span>
              <input
                autoComplete="off"
                id="holding-cost"
                min={0}
                name="holdingCostPerUnit"
                step="0.01"
                type="number"
                value={holdingCost}
                onChange={(event) => setHoldingCost(Number(event.target.value))}
              />
            </label>

            <label className="stack-sm" htmlFor="ordering-cost">
              <span>{t('settingsOrderingCostPer250')}</span>
              <input
                autoComplete="off"
                id="ordering-cost"
                min={0}
                name="orderingCostPer250Units"
                step="0.01"
                type="number"
                value={orderingCost}
                onChange={(event) => setOrderingCost(Number(event.target.value))}
              />
            </label>

            <label className="stack-sm" htmlFor="stockout-cost">
              <span>{t('settingsStockoutCostPerUnit')}</span>
              <input
                autoComplete="off"
                id="stockout-cost"
                min={0}
                name="stockoutCostPerUnit"
                step="0.01"
                type="number"
                value={stockoutCost}
                onChange={(event) => setStockoutCost(Number(event.target.value))}
              />
            </label>

            <label className="stack-sm" htmlFor="lead-time-days">
              <span>{t('settingsLeadTimeDays')}</span>
              <input
                autoComplete="off"
                id="lead-time-days"
                min={0}
                name="leadTimeDays"
                step="1"
                type="number"
                value={leadTimeDays}
                onChange={(event) => setLeadTimeDays(Number(event.target.value))}
              />
            </label>
          </div>

          <label className="stack-sm" htmlFor="min-sold">
            <span>{t('settingsMinimumTotalUnitsSold')}</span>
            <input
              autoComplete="off"
              id="min-sold"
              min={0}
              name="minTotalUnitsSold"
              type="number"
              value={minSold}
              onChange={(event) => setMinSold(Number(event.target.value))}
            />
          </label>

          {[bandA, bandB, bandC].map((band, index) => (
            <fieldset className="band-fieldset" key={band.label + index}>
              <legend>{t('settingsBand', { index: index + 1 })}</legend>
              <label className="stack-sm">
                <span>{t('settingsLabel')}</span>
                <input
                  autoComplete="off"
                  name={`band-${index + 1}-label`}
                  type="text"
                  value={band.label}
                  onChange={(event) => {
                    const next = { ...band, label: event.target.value };
                    if (index === 0) setBandA(next);
                    if (index === 1) setBandB(next);
                    if (index === 2) setBandC(next);
                  }}
                />
              </label>
              <label className="stack-sm">
                <span>{t('settingsMaximumCostRatio')}</span>
                <input
                  autoComplete="off"
                  min={0}
                  name={`band-${index + 1}-max-ratio`}
                  step="0.01"
                  type="number"
                  value={band.maxRatio}
                  onChange={(event) => {
                    const next = { ...band, maxRatio: Number(event.target.value) };
                    if (index === 0) setBandA(next);
                    if (index === 1) setBandB(next);
                    if (index === 2) setBandC(next);
                  }}
                />
              </label>
            </fieldset>
          ))}

          {error ? (
            <p className="error-text" role="alert">
              {error}
            </p>
          ) : null}

          <div className="inline-actions">
            <button className="secondary-button" type="button" onClick={onCancel}>
              {t('commonCancel')}
            </button>
            <button className="primary-button" type="submit">
              {t('settingsSave')}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};
