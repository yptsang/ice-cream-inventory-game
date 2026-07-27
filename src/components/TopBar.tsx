import { DAYS_IN_RUN } from '../game/config';
import { availableLanguages, useI18n } from '../i18n';
import type { AppLanguage } from '../i18n';
import type { GameRun } from '../game/types';
import { OrderControls } from './OrderControls';

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
  const { formatCurrency, formatPercent, formatNumber, language, setLanguage, t } = useI18n();
  const todayDemand = run.history.at(-1)?.demand ?? 0;

  if (isMinimized) {
    return (
      <header className="top-bar top-bar-minimized">
        <div className="top-bar-minimized-row">
          <div className="top-bar-header">
            <p className="eyebrow">{t('appTitle')}</p>
            <strong className="top-bar-minimized-title">
              {t('commonDayWithOrder', {
                day: Math.min(run.day, DAYS_IN_RUN),
                order: formatNumber(draftOrderQuantity)
              })}
            </strong>
          </div>
          <div className="top-bar-actions">
            <LanguageButtons language={language} onChange={setLanguage} />
            <button
              aria-expanded="false"
              aria-label={t('topbarResumePanelAria')}
              className="ghost-button"
              type="button"
              onClick={onToggleMinimized}
            >
              {t('topbarResumePanel')}
            </button>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="top-bar">
      <div className="top-bar-headline-row">
        <div className="top-bar-header">
          <p className="eyebrow">{t('appTitle')}</p>
          <h1>{t('commonDayOf', { day: Math.min(run.day, DAYS_IN_RUN), total: DAYS_IN_RUN })}</h1>
        </div>
        <div className="top-bar-actions">
          <LanguageButtons language={language} onChange={setLanguage} />
          <button
            aria-expanded="true"
            aria-label={t('topbarMinimizePanelAria')}
            className="ghost-button"
            type="button"
            onClick={onToggleMinimized}
          >
            {t('topbarMinimise')}
          </button>
        </div>
      </div>

      <div className="metrics-grid">
        <div>
          <span>{t('inventoryInStore')}</span>
          <strong>{formatNumber(run.currentInventory)}</strong>
        </div>
        <div>
          <span>{t('inventoryTodayDemand')}</span>
          <strong>{formatNumber(todayDemand)}</strong>
        </div>
        <div>
          <span>{t('topbarTotalCost')}</span>
          <strong>{formatCurrency(totalCost)}</strong>
        </div>
        <div>
          <span>{t('inventoryFillRate')}</span>
          <strong>{formatPercent(run.fillRate)}</strong>
        </div>
      </div>

      <div className="topbar-order-row" aria-label={t('orderControlsAria')}>
        <div className="topbar-order-meta">
          <span>{t('topbarTodayOrderingQuantity')}</span>
          <strong>{t('commonUnits', { count: formatNumber(draftOrderQuantity) })}</strong>
        </div>
        <OrderControls compact onChange={onOrderChange} value={draftOrderQuantity} />
      </div>
    </header>
  );
};

interface LanguageButtonsProps {
  language: AppLanguage;
  onChange: (language: AppLanguage) => void;
}

const LanguageButtons = ({ language, onChange }: LanguageButtonsProps) => {
  const { t } = useI18n();

  return (
    <div aria-label={t('languageLabel')} className="language-switcher" role="group">
      {availableLanguages.map((option) => (
        <button
          key={option.value}
          aria-pressed={language === option.value}
          className={`ghost-button language-button${language === option.value ? ' language-button-active' : ''}`}
          type="button"
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};
