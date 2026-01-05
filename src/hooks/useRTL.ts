/**
 * RTL Detection Hook
 * Centralized RTL detection based on current language
 */
import { useTranslation } from 'react-i18next';

export const useRTL = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar' || i18n.language.startsWith('ar');

  return {
    isRTL,
    textAlign: isRTL ? 'right' : 'left',
    flexDirection: isRTL ? 'row-reverse' : 'row',
  } as const;
};
