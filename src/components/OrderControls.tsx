import { MAX_ORDER_QUANTITY } from '../game/config';
import { useI18n } from '../i18n';

interface OrderControlsProps {
  compact?: boolean;
  value: number;
  onChange: (value: number) => void;
}

const clamp = (next: number) => Math.max(0, Math.min(MAX_ORDER_QUANTITY, Math.floor(next)));

export const OrderControls = ({ compact = false, value, onChange }: OrderControlsProps) => {
  const { formatNumber, t } = useI18n();

  return (
    <section
      aria-label={t('orderControlsAria')}
      className={compact ? 'order-controls order-controls-compact' : 'order-controls supply-order-panel'}
    >
      {compact ? null : (
        <div className="section-heading">
          <div>
            <p className="eyebrow">{t('orderControlsPlan')}</p>
            <h2 id="order-controls-title">{t('inventoryChooseTodayOrder')}</h2>
          </div>
          <div aria-live="polite" aria-atomic="true" className="order-pill">
            {t('orderControlsPill', { count: formatNumber(value) })}
          </div>
        </div>
      )}

      <div className="order-quick" role="group" aria-label={t('orderControlsQuantityControls')}>
        <label className="sr-only" htmlFor="order-quantity-range">
          {t('orderControlsSlider')}
        </label>
        <input
          id="order-quantity-range"
          max={MAX_ORDER_QUANTITY}
          min={0}
          name="orderQuantityRange"
          step={1}
          type="range"
          value={value}
          onChange={(event) => onChange(clamp(Number(event.target.value)))}
        />

        <label className="sr-only" htmlFor="order-quantity-input">
          {t('orderControlsLabel')}
        </label>
        <input
          autoComplete="off"
          id="order-quantity-input"
          inputMode="numeric"
          max={MAX_ORDER_QUANTITY}
          min={0}
          name="orderQuantity"
          type="number"
          value={value}
          onChange={(event) => onChange(clamp(Number(event.target.value)))}
        />
      </div>
    </section>
  );
};
