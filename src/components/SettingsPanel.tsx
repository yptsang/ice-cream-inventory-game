import { FormEvent, useMemo, useState } from 'react';
import type { GameSettings } from '../game/types';

interface SettingsPanelProps {
  settings: GameSettings;
  onSave: (settings: GameSettings) => void;
  onCancel: () => void;
}

export const SettingsPanel = ({ settings, onSave, onCancel }: SettingsPanelProps) => {
  const [holdingCost, setHoldingCost] = useState(settings.holdingCostPerUnit);
  const [orderingCost, setOrderingCost] = useState(settings.orderingCostPer250Units);
  const [stockoutCost, setStockoutCost] = useState(settings.stockoutCostPerUnit);
  const [leadTimeDays, setLeadTimeDays] = useState(settings.leadTimeDays);
  const [minSold, setMinSold] = useState(settings.minTotalUnitsSold);
  const [bandA, setBandA] = useState(settings.thresholds[0]);
  const [bandB, setBandB] = useState(settings.thresholds[1]);
  const [bandC, setBandC] = useState(settings.thresholds[2]);
  const [error, setError] = useState('');

  const isOrdered = useMemo(
    () => bandA.maxRatio < bandB.maxRatio && bandB.maxRatio < bandC.maxRatio,
    [bandA.maxRatio, bandB.maxRatio, bandC.maxRatio]
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isOrdered) {
      setError('Thresholds must rise from band 1 to band 3.');
      return;
    }

    if (minSold < 0) {
      setError('Minimum sold units must be zero or greater.');
      return;
    }

    if (holdingCost < 0 || orderingCost < 0 || stockoutCost < 0) {
      setError('Cost values must be zero or greater.');
      return;
    }

    if (leadTimeDays < 1) {
      setError('Lead time must be at least 1 day.');
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
        role="dialog"
      >
        <div className="sheet-header">
          <div>
            <p className="eyebrow">Scoring settings</p>
            <h2 id="settings-panel-title">Adjust game settings</h2>
            <p className="support-copy" id="settings-panel-description">
              Update the cost parameters, lead time, and end-of-run evaluation bands.
            </p>
          </div>
          <button className="ghost-button" type="button" onClick={onCancel}>
            Close
          </button>
        </div>

        <form className="stack-md" onSubmit={handleSubmit}>
          <div className="settings-grid">
            <label className="stack-sm" htmlFor="holding-cost">
              <span>Holding cost per unit</span>
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
              <span>Ordering cost per 250 units</span>
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
              <span>Stockout cost per unit</span>
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
              <span>Lead time in days</span>
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
            <span>Minimum total units sold</span>
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
              <legend>Band {index + 1}</legend>
              <label className="stack-sm">
                <span>Label</span>
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
                <span>Maximum cost-per-unit ratio</span>
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
              Cancel
            </button>
            <button className="primary-button" type="submit">
              Save Settings
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};
