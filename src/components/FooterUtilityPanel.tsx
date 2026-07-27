import { useI18n } from '../i18n';
import { LanguageSwitcher } from './LanguageSwitcher';

interface FooterUtilityPanelProps {
  onOpenSettings: () => void;
}

export const FooterUtilityPanel = ({ onOpenSettings }: FooterUtilityPanelProps) => {
  const { language, setLanguage, t } = useI18n();

  return (
    <aside className="footer-utility-panel" aria-label={t('footerEducatorControls')}>
      <LanguageSwitcher className="language-switcher-footer" language={language} onChange={setLanguage} />
      <button className="ghost-button footer-settings-button" type="button" onClick={onOpenSettings}>
        {t('footerEducatorSettings')}
      </button>
    </aside>
  );
};
