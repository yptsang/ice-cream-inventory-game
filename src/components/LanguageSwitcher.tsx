import { availableLanguages, useI18n } from '../i18n';
import type { AppLanguage } from '../i18n';

interface LanguageSwitcherProps {
  className?: string;
  language: AppLanguage;
  onChange: (language: AppLanguage) => void;
}

export const LanguageSwitcher = ({ className = '', language, onChange }: LanguageSwitcherProps) => {
  const { t } = useI18n();

  return (
    <div
      aria-label={t('languageLabel')}
      className={`language-switcher${className ? ` ${className}` : ''}`}
      role="group"
    >
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
