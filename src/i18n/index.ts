import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { I18nManager, DevSettings, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import en from './locales/en.json';
import ar from './locales/ar.json';

// Detect if RTL language is active to set I18nManager elsewhere if needed
export const supportedLanguages = {
  en: 'English',
  ar: 'العربية',
};

const RTL_LANGUAGES = ['ar'];
const LANGUAGE_KEY = '@app_language';

export async function getStoredLanguage(): Promise<'en' | 'ar'> {
  try {
    const stored = await AsyncStorage.getItem(LANGUAGE_KEY);
    return (stored as 'en' | 'ar') || 'en';
  } catch {
    return 'en';
  }
}

export async function hasLanguageBeenSelected(): Promise<boolean> {
  try {
    const stored = await AsyncStorage.getItem(LANGUAGE_KEY);
    // If no language is stored, set English as default
    if (stored === null) {
      await AsyncStorage.setItem(LANGUAGE_KEY, 'en');
      return true; // Return true so we skip language selection
    }
    return true; // Always return true since we have a default
  } catch {
    return false;
  }
}

export async function setupI18n(defaultLng?: 'en' | 'ar') {
  // Get stored language or use default (English)
  const storedLng = await getStoredLanguage();
  const lng = defaultLng || storedLng;
  
  console.log('🌐 setupI18n - Stored language:', storedLng);
  console.log('🌐 setupI18n - Using language:', lng);
  
  // If no language was stored, save the default (English)
  if (!await AsyncStorage.getItem(LANGUAGE_KEY)) {
    await AsyncStorage.setItem(LANGUAGE_KEY, lng);
    console.log('✅ setupI18n - Saved default language:', lng);
  }

  // Set RTL based on the language
  const isRTL = lng === 'ar';
  console.log('🌐 setupI18n - Setting RTL to:', isRTL);
  console.log('🌐 setupI18n - Current I18nManager.isRTL:', I18nManager.isRTL);
  
  I18nManager.allowRTL(true);
  I18nManager.forceRTL(isRTL);
  
  console.log('✅ setupI18n - I18nManager.forceRTL set to:', isRTL);

  if (!i18n.isInitialized) {
    i18n.use(initReactI18next).init({
      compatibilityJSON: 'v3',
      resources: {
        en: { translation: en },
        ar: { translation: ar },
      },
      lng,
      fallbackLng: 'en',
      interpolation: { escapeValue: false },
    });
    console.log('✅ setupI18n - i18n initialized with language:', lng);
  } else {
    // If already initialized, just change language
    i18n.changeLanguage(lng);
    console.log('✅ setupI18n - i18n language changed to:', lng);
  }

  return i18n;
}

export async function changeLanguage(lng: 'en' | 'ar') {
  // Store language preference
  await AsyncStorage.setItem(LANGUAGE_KEY, lng);

  // Update i18n language
  i18n.changeLanguage(lng);

  // We're handling RTL manually in components, so no need to force it at native level
  // This avoids the need for app reload
  return false;
}

export default i18n;
