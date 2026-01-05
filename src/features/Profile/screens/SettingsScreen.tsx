import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../../hooks/useTheme';
import { typography } from '../../../theme';
import { ChevronRightIcon } from '../../../components/icons/ChevronRightIcon';
import { DarkThemeIcon } from '../../../components/icons/DarkThemeIcon';
import { PrivacySecurityIcon } from '../../../components/icons/PrivacySecurityIcon';
import { useTranslation } from 'react-i18next';
import { Header } from '../../../components/common/Header';

export const SettingsScreen = () => {
  const navigation = useNavigation<any>();
  const { isDark, colors, toggleTheme } = useTheme();
  const { t } = useTranslation();

  const settingsItems = [
    {
      customIcon: <DarkThemeIcon size={18} color={colors.textPrimary} />,
      label: t('Dark Theme'),
      type: 'toggle',
      value: isDark,
      onToggle: toggleTheme,
    },
    {
      customIcon: <PrivacySecurityIcon size={18} color={colors.textPrimary} />,
      label: t('Privacy & Security'),
      type: 'navigation',
      onPress: () => navigation.navigate('Terms'),
    },
  ];

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? colors.background : colors.white },
      ]}
    >
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <Header 
          title={t('Settings')}
          backgroundColor={isDark ? colors.background : colors.white}
          backIconSize={32}
        />

        {/* Settings Items */}
        <View style={styles.settingsSection}>
          {settingsItems.map((item, index) => (
            <View key={index}>
              {item.type === 'toggle' ? (
                <View
                  style={[
                    styles.settingItem,
                    {
                      backgroundColor: colors.backgroundSecondary,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <View style={styles.settingItemLeft}>
                    {item.customIcon}
                    <Text
                      style={[
                        styles.settingItemText,
                        { color: colors.textPrimary },
                      ]}
                    >
                      {item.label}
                    </Text>
                  </View>
                  <Switch
                    value={item.value}
                    onValueChange={item.onToggle}
                    trackColor={{ false: colors.gray300, true: colors.primary }}
                    thumbColor={colors.white}
                    ios_backgroundColor={colors.gray300}
                  />
                </View>
              ) : (
                <TouchableOpacity
                  style={[
                    styles.settingItem,
                    {
                      backgroundColor: colors.backgroundSecondary,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={item.onPress}
                >
                  <View style={styles.settingItemLeft}>
                    {item.customIcon}
                    <Text
                      style={[
                        styles.settingItemText,
                        { color: colors.textPrimary },
                      ]}
                    >
                      {item.label}
                    </Text>
                  </View>
                  <ChevronRightIcon size={20} color={colors.textPrimary} />
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  settingsSection: {
    paddingHorizontal: 20,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 100,
    marginBottom: 12,
    borderWidth: 1,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingItemText: {
    fontSize: 16,
    fontFamily: typography.fontFamily.interRegular,
  },
});
