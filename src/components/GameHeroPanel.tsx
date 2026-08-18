import type { GameRun } from '../game/types';
import { useI18n } from '../i18n';

interface GameHeroPanelProps {
  draftOrderQuantity: number;
  run: GameRun;
  totalCost: number;
}

export const GameHeroPanel = ({ draftOrderQuantity, run, totalCost }: GameHeroPanelProps) => {
  const { formatCurrency, formatNumber, formatPercent, t } = useI18n();
  const latestEntry = run.history.at(-1);
  const todayDemand = latestEntry?.demand ?? 0;
  const inTransitUnits = run.incomingOrders.reduce(
    (sum, incomingOrder) => sum + incomingOrder.quantity,
    0
  );

  return (
    <section aria-labelledby="game-hero-title" className="game-hero">
      <div className="game-hero-card">
        <p className="eyebrow">{t('orderControlsPlan')}</p>
        <h2 id="game-hero-title">{t('inventoryChooseTodayOrder')}</h2>
        <p className="support-copy">{t('latestReadyUpdate', { day: run.day })}</p>
        <dl className="hero-highlight-grid">
          <div>
            <dt>{t('inventoryInStore')}</dt>
            <dd>{formatNumber(run.currentInventory)}</dd>
          </div>
          <div>
            <dt>{t('inventoryTodayDemand')}</dt>
            <dd>{formatNumber(todayDemand)}</dd>
          </div>
        </dl>
        <div className="hero-status-row">
          <span className="hero-status-chip">
            {t('inventoryFillRate')}: {formatPercent(run.fillRate)}
          </span>
          <span className="hero-order-chip">
            {t('commonUnits', { count: formatNumber(draftOrderQuantity) })}
          </span>
        </div>
      </div>

      <dl className="hero-metrics-grid">
        <div>
          <dt>{t('topbarTotalCost')}</dt>
          <dd>{formatCurrency(totalCost)}</dd>
        </div>
        <div>
          <dt>{t('inventoryInTransit')}</dt>
          <dd>{formatNumber(inTransitUnits)}</dd>
        </div>
      </dl>
    </section>
  );
};
