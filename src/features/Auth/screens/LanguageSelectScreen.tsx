import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  I18nManager,
  Image,
} from 'react-native';
import type { AuthStackScreenProps } from '../../../navigation/types';
import { colors, spacing, typography } from '../../../theme';
import { changeLanguage } from '../../../i18n';
import { Button } from '../../../components/common';
import { Alert } from 'react-native';

export const LanguageSelectScreen = ({
  navigation,
}: AuthStackScreenProps<'LanguageSelect'>) => {
  const setLanguage = async (lng: 'en' | 'ar') => {
    const needsRestart = await changeLanguage(lng);

    if (needsRestart) {
      // RTL mode changed, inform user to restart app
      Alert.alert(
        'Restart Required',
        'Please close and reopen the app for the language change to take full effect.',
        [
          {
            text: 'OK',
            onPress: () => navigation.replace('Entry'),
          },
        ]
      );
    } else {
      // Just navigate to entry
      navigation.replace('Entry');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <Image
        source={require('../../../assets/images/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.title}>Choose Language</Text>
      <Text style={styles.caption}>You can change this later in Settings.</Text>

      <View style={styles.actions}>
        <Button
          title="English"
          variant="primary"
          style={styles.btn}
          onPress={() => setLanguage('en')}
        />
        <Button
          title="العربية"
          variant="outline"
          style={styles.btnOutline}
          onPress={() => setLanguage('ar')}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[6],
  },
  title: {
    fontSize: typography.fontSize['3xl'],
    fontFamily: typography.fontFamily.bold,
    color: colors.textSecondary,
    marginBottom: spacing[2],
    textAlign: 'center',
  },
  caption: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: colors.textTertiary,
    marginBottom: spacing[10],
    textAlign: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: spacing[4],
  },
  actions: {
    width: '84%',
  },
  btn: {
    minHeight: 56,
    marginBottom: spacing[4],
  },
  btnOutline: {
    minHeight: 56,
  },
});

export default LanguageSelectScreen;
