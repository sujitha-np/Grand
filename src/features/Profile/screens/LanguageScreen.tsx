import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, I18nManager, Alert } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import { colors, typography } from '../../../theme';
import { useTranslation } from 'react-i18next';
import { CheckmarkIcon } from '../../../components/icons/CheckmarkIcon';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNRestart from 'react-native-restart';
import { Header } from '../../../components/common/Header';

const LANGUAGE_KEY = '@app_language';

export const LanguageScreen = () => {
  const { colors, isDark } = useTheme();
  const { t, i18n } = useTranslation();
  
  const [currentLang, setCurrentLang] = useState(i18n.language);

  const languages = [
      { code: 'en', label: 'English', nativeLabel: 'English' },
      { code: 'ar', label: 'Arabic', nativeLabel: 'العربية' }
  ];

  const performLanguageChange = async (langCode: string) => {
      try {
          console.log('🌐 Changing language to:', langCode);
          
          await AsyncStorage.setItem(LANGUAGE_KEY, langCode);
          await i18n.changeLanguage(langCode);
          
          const isRTL = langCode === 'ar';
          const needsRestart = I18nManager.isRTL !== isRTL;
          
          if (needsRestart) {
              I18nManager.allowRTL(true);
              I18nManager.forceRTL(isRTL);
              RNRestart.restart();
          } else {
              setCurrentLang(langCode);
          }
      } catch (error) {
          console.error('❌ Error changing language:', error);
      }
  };

  const handleLanguageChange = (langCode: string) => {
      if (langCode === currentLang) return;

      const isRTL = langCode === 'ar';
      const needsRestart = I18nManager.isRTL !== isRTL;

      if (needsRestart) {
          Alert.alert(
              t('Language'),
              t('Changing language will restart the app...'),
              [
                  {
                      text: t('No'),
                      style: 'cancel',
                  },
                  {
                      text: t('Yes'),
                      onPress: () => performLanguageChange(langCode),
                  },
              ],
              { cancelable: true }
          );
      } else {
          performLanguageChange(langCode);
      }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? colors.background : colors.white }]}>
      {/* Header */}
      <Header 
        title={t('Language')}
        backgroundColor={colors.backgroundSecondary}
      />

      <View style={styles.content}>
          {languages.map((lang) => (
              <TouchableOpacity
                  key={lang.code}
                  style={[styles.languageItem, { backgroundColor: colors.backgroundSecondary, borderColor: colors.borderLight }]}
                  onPress={() => handleLanguageChange(lang.code)}
              >
                  <View>
                      <Text style={[styles.langLabel, { color: colors.textPrimary }]}>{lang.label}</Text>
                      <Text style={[styles.langNative, { color: colors.textTertiary }]}>{lang.nativeLabel}</Text>
                  </View>
                  
                  {currentLang === lang.code && (
                      <View style={[styles.checkCircle, { backgroundColor: colors.success }]}>
                          <CheckmarkIcon size={14} color="#FFFFFF" />
                      </View>
                  )}
              </TouchableOpacity>
          ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
      padding: 20,
  },
  languageItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 16,
      borderRadius: 16,
      marginBottom: 12,
      borderWidth: 1,
  },
  langLabel: {
      fontSize: 16,
      fontFamily: typography.fontFamily.semiBold,
      marginBottom: 4,
  },
  langNative: {
      fontSize: 14,
      fontFamily: typography.fontFamily.medium,
  },
  checkCircle: {
      width: 24,
      height: 24,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
  }
});
