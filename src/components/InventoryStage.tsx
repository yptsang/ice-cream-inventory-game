import { useState } from 'react';
import type { GameRun, GameSettings } from '../game/types';
import { useAccessibleDialog } from '../hooks/useAccessibleDialog';
import { useI18n } from '../i18n';
import { InventoryTrendChart, buildTrendChartModel } from './InventoryTrendChart';

interface InventoryStageProps {
  draftOrderQuantity: number;
  settings: GameSettings;
  run: GameRun;
}

export const InventoryStage = ({
  draftOrderQuantity,
  settings,
  run
}: InventoryStageProps) => {
  const { formatCurrency, formatNumber, formatPercent, t } = useI18n();
  const [isChartExpanded, setIsChartExpanded] = useState(false);
  const [isLogicOpen, setIsLogicOpen] = useState(false);
  const logicDialogRef = useAccessibleDialog<HTMLElement>({
    isOpen: isLogicOpen,
    onClose: () => setIsLogicOpen(false)
  });
  const expandedChartDialogRef = useAccessibleDialog<HTMLElement>({
    isOpen: isChartExpanded,
    onClose: () => setIsChartExpanded(false)
  });
  const latestEntry = run.history.at(-1);
  const todayDemand = latestEntry?.demand ?? 0;
  const todaySoldUnits = latestEntry?.soldUnits ?? 0;
  const inTransitUnits = run.incomingOrders.reduce(
    (total, incomingOrder) => total + incomingOrder.quantity,
    0
  );
  const chartModel = buildTrendChartModel(run, t, formatNumber);

  return (
    <section aria-labelledby="inventory-stage-title" className="inventory-stage supply-stage">
      <div className="stage-copy stage-copy-row">
        <div>
          <p className="eyebrow">{t('inventorySupplyChain')}</p>
          <h2 id="inventory-stage-title">{t('inventorySupplyChainTitle')}</h2>
        </div>
        <button className="ghost-button" type="button" onClick={() => setIsLogicOpen(true)}>
          {t('inventoryGameLogic')}
        </button>
      </div>

      <div className="supply-chain-board" role="presentation">
        <article className="supply-node supply-node-supplier">
          <div aria-hidden="true" className="node-icon">
            🏭
          </div>
          <h3>{t('inventorySupplier')}</h3>
          <dl className="node-stats node-stats-vertical">
            <div>
              <dt>{t('inventoryInTransit')}</dt>
              <dd>{formatNumber(inTransitUnits)}</dd>
            </div>
            <div>
              <dt>{t('inventoryTodayOrder')}</dt>
              <dd>{formatNumber(draftOrderQuantity)}</dd>
            </div>
            <div className="config-block">
              <dt>{t('inventoryLeadTime')}</dt>
              <dd>{t('commonDay', { count: formatNumber(settings.leadTimeDays) })}</dd>
            </div>
            <div className="config-block">
              <dt>{t('inventoryOrderCost')}</dt>
              <dd>{t('inventoryOrderingCostValue', { cost: formatCurrency(settings.orderingCostPer250Units) })}</dd>
            </div>
          </dl>
        </article>

        <div aria-hidden="true" className="flow-arrow flow-arrow-left">
          →
        </div>

        <article className="supply-node supply-node-store">
          <div aria-hidden="true" className="node-icon">
            🏪
          </div>
          <h3>{t('inventoryStore')}</h3>
          <div className="store-chart-wrap">
            <div className="chart-toolbar">
              <span className="chart-title">{t('chartInventoryTrend')}</span>
              <button
                className="ghost-button chart-expand-button"
                type="button"
                onClick={() => setIsChartExpanded(true)}
              >
                {t('inventoryEnlargeChart')}
              </button>
            </div>
            <InventoryTrendChart
              ariaLabel={t('inventoryChartAria')}
              chartDescription={chartModel.chartDescription}
              chartHeight={chartModel.chartHeight}
              chartPadding={chartModel.chartPadding}
              chartWidth={chartModel.chartWidth}
              descriptionId="inventory-chart-description"
              series={chartModel.series}
              t={t}
              xTicks={chartModel.xTicks}
              yTicks={chartModel.yTicks}
            />
          </div>
          <dl className="node-stats">
            <div>
              <dt>{t('inventoryOnHand')}</dt>
              <dd>{formatNumber(run.currentInventory)}</dd>
            </div>
            <div className="config-block">
              <dt>{t('inventoryHolding')}</dt>
              <dd>{formatCurrency(settings.holdingCostPerUnit)}</dd>
            </div>
          </dl>
        </article>

        <div aria-hidden="true" className="flow-arrow flow-arrow-right">
          →
        </div>

        <article className="supply-node supply-node-customers">
          <div aria-hidden="true" className="node-icon">
            🧑‍🤝‍🧑
          </div>
          <h3>{t('inventoryCustomers')}</h3>
          <dl className="node-stats node-stats-vertical">
            <div>
              <dt>{t('inventoryTodayDemand')}</dt>
              <dd>{formatNumber(todayDemand)}</dd>
            </div>
            <div>
              <dt>{t('inventoryTodaySales')}</dt>
              <dd>{formatNumber(todaySoldUnits)}</dd>
            </div>
            <div>
              <dt>{t('inventoryFillRate')}</dt>
              <dd>{formatPercent(run.fillRate)}</dd>
            </div>
            <div className="config-block">
              <dt>{t('inventoryStockout')}</dt>
              <dd>{formatCurrency(settings.stockoutCostPerUnit)}</dd>
            </div>
          </dl>
        </article>
      </div>

      {isLogicOpen ? (
        <div className="overlay overlay-top-sheet">
          <section
            aria-labelledby="logic-title"
            aria-modal="true"
            className="sheet logic-modal"
            ref={logicDialogRef}
            role="dialog"
            tabIndex={-1}
          >
            <div className="sheet-header">
              <div>
                <p className="eyebrow">{t('inventoryGameLogic')}</p>
                <h2 id="logic-title">{t('inventoryHowGameWorks')}</h2>
              </div>
              <button className="ghost-button" type="button" onClick={() => setIsLogicOpen(false)}>
                {t('commonClose')}
              </button>
            </div>

            <div className="stack-md">
              <p className="support-copy">
                {t('inventoryLogicIntro')}
              </p>

              <div className="logic-two-col">
                <div className="logic-block">
                  <h3 className="logic-subtitle">{t('inventoryYourDecision')}</h3>
                  <ul className="logic-list">
                    <li>{t('inventoryYouChooseTodayOrder')}</li>
                    <li>{t('inventoryOrderArrivesAfterLeadTime')}</li>
                  </ul>
                </div>

                <div className="logic-block">
                  <h3 className="logic-subtitle">{t('inventoryWhatUpdatesEachDay')}</h3>
                  <ul className="logic-list">
                    <li>{t('inventoryInventoryLevelInStore')}</li>
                    <li>{t('inventoryInventoryPositionInStoreOnOrder')}</li>
                    <li>{t('inventorySalesAndFillRate')}</li>
                  </ul>
                </div>
              </div>

              <div className="logic-block">
                <h3 className="logic-subtitle">{t('inventoryParametersFromSettings')}</h3>
                <div className="logic-table-wrap">
                  <table className="logic-table">
                    <thead>
                      <tr>
                        <th scope="col">{t('inventoryParameter')}</th>
                        <th scope="col">{t('inventoryValue')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <th scope="row">{t('inventoryLeadTime')}</th>
                        <td>{t('commonDay', { count: formatNumber(settings.leadTimeDays) })}</td>
                      </tr>
                      <tr>
                        <th scope="row">{t('inventoryHolding')}</th>
                        <td>{t('inventoryHoldingValue', { cost: formatCurrency(settings.holdingCostPerUnit) })}</td>
                      </tr>
                      <tr>
                        <th scope="row">{t('inventoryStockout')}</th>
                        <td>{t('inventoryStockoutValue', { cost: formatCurrency(settings.stockoutCostPerUnit) })}</td>
                      </tr>
                      <tr>
                        <th scope="row">{t('inventoryOrderCost')}</th>
                        <td>{t('inventoryOrderCostDetail', { cost: formatCurrency(settings.orderingCostPer250Units) })}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>
        </div>
      ) : null}

      {isChartExpanded ? (
        <div className="overlay overlay-top-sheet">
          <section
            aria-labelledby="expanded-chart-title"
            aria-modal="true"
            className="sheet chart-modal"
            ref={expandedChartDialogRef}
            role="dialog"
            tabIndex={-1}
          >
            <div className="sheet-header">
              <div>
                <p className="eyebrow">{t('inventoryStoreChart')}</p>
                <h2 id="expanded-chart-title">{t('inventoryExpandedChartTitle')}</h2>
              </div>
              <button className="ghost-button" type="button" onClick={() => setIsChartExpanded(false)}>
                {t('commonClose')}
              </button>
            </div>
            <div
              className="store-chart-wrap"
            >
              <InventoryTrendChart
                ariaLabel={t('inventoryChartAriaExpanded')}
                chartDescription={chartModel.chartDescription}
                chartHeight={chartModel.chartHeight}
                chartPadding={chartModel.chartPadding}
                chartWidth={chartModel.chartWidth}
                className="store-chart-expanded"
                descriptionId="expanded-chart-description"
                series={chartModel.series}
                t={t}
                xTicks={chartModel.xTicks}
                yTicks={chartModel.yTicks}
              />
            </div>
          </section>
        </div>
      ) : null}
    </section>
  );
};
