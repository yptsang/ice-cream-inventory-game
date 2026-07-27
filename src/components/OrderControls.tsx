import { MAX_ORDER_QUANTITY } from '../game/config';

interface OrderControlsProps {
  compact?: boolean;
  value: number;
  onChange: (value: number) => void;
}

const clamp = (next: number) => Math.max(0, Math.min(MAX_ORDER_QUANTITY, Math.floor(next)));

export const OrderControls = ({ compact = false, value, onChange }: OrderControlsProps) => (
  <section
    aria-label="Order controls"
    className={compact ? 'order-controls order-controls-compact' : 'order-controls supply-order-panel'}
  >
    {compact ? null : (
      <div className="section-heading">
        <div>
          <p className="eyebrow">Order Plan</p>
          <h2 id="order-controls-title">Set today’s order.</h2>
        </div>
        <div aria-live="polite" aria-atomic="true" className="order-pill">
          {value} units
        </div>
      </div>
    )}

    <div className="order-quick" role="group" aria-label="Order quantity controls">
      <label className="sr-only" htmlFor="order-quantity-range">
        Order quantity slider
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
        Order quantity
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
