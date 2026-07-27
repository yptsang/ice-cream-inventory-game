import { DAYS_IN_RUN } from '../game/config';
import type { GameRun } from '../game/types';
import { OrderControls } from './OrderControls';

const formatMoney = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2
  }).format(value);

const formatPercent = (value: number) => `${Math.round(value * 100)}%`;

interface TopBarProps {
  draftOrderQuantity: number;
  isMinimized: boolean;
  onToggleMinimized: () => void;
  onOrderChange: (value: number) => void;
  run: GameRun;
  totalCost: number;
}

export const TopBar = ({
  draftOrderQuantity,
  isMinimized,
  onOrderChange,
  onToggleMinimized,
  run,
  totalCost
}: TopBarProps) => {
  const todayDemand = run.history.at(-1)?.demand ?? 0;
  const inTransitUnits = run.incomingOrders.reduce(
    (total, incomingOrder) => total + incomingOrder.quantity,
    0
  );

  if (isMinimized) {
    return (
      <header className="top-bar top-bar-minimized">
        <div className="top-bar-minimized-row">
          <div className="top-bar-header">
            <p className="eyebrow">Ice-Cream Inventory Game</p>
            <strong className="top-bar-minimized-title">
              Day {Math.min(run.day, DAYS_IN_RUN)} | Order {draftOrderQuantity}
            </strong>
          </div>
          <button
            aria-expanded="false"
            aria-label="Resume order and status panel"
            className="ghost-button"
            type="button"
            onClick={onToggleMinimized}
          >
            Resume Panel
          </button>
        </div>
      </header>
    );
  }

  return (
    <header className="top-bar">
      <div className="top-bar-headline-row">
        <div className="top-bar-header">
          <p className="eyebrow">Ice-Cream Inventory Game</p>
          <h1>
            Day {Math.min(run.day, DAYS_IN_RUN)} of {DAYS_IN_RUN}
          </h1>
        </div>
        <button
          aria-expanded="true"
          aria-label="Minimize order and status panel"
          className="ghost-button"
          type="button"
          onClick={onToggleMinimized}
        >
          Minimise
        </button>
      </div>

      <div className="metrics-grid">
        <div>
          <span>In Store</span>
          <strong>{run.currentInventory}</strong>
        </div>
        <div>
          <span>In Transit</span>
          <strong>{inTransitUnits}</strong>
        </div>
        <div>
          <span>Today&apos;s Demand</span>
          <strong>{todayDemand}</strong>
        </div>
        <div>
          <span>Total Cost</span>
          <strong>{formatMoney(totalCost)}</strong>
        </div>
        <div>
          <span>Fill Rate</span>
          <strong>{formatPercent(run.fillRate)}</strong>
        </div>
      </div>

      <div className="topbar-order-row" aria-label="Order input">
        <div className="topbar-order-meta">
          <span>Today’s Ordering Quantity</span>
          <strong>{draftOrderQuantity} units</strong>
        </div>
        <OrderControls compact onChange={onOrderChange} value={draftOrderQuantity} />
      </div>
    </header>
  );
};
