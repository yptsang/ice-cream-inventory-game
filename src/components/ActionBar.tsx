import { useI18n } from '../i18n';

interface ActionBarProps {
  isCompleted: boolean;
  onAdvance: () => void;
  onNewGame: () => void;
}

export const ActionBar = ({ isCompleted, onAdvance, onNewGame }: ActionBarProps) => {
  const { t } = useI18n();

  return (
    <nav aria-label={t('actionGameActions')} className="action-bar">
      <button className="secondary-button" type="button" onClick={onNewGame}>
        {t('actionNewGame')}
      </button>
      <button className="primary-button" disabled={isCompleted} type="button" onClick={onAdvance}>
        {isCompleted ? t('actionRunComplete') : t('actionNextDay')}
      </button>
    </nav>
  );
};
