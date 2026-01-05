/**
 * Entry Screen - Marketing splash matching provided mock
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Image,
  ImageBackground,
  Dimensions,
  ScrollView,
} from 'react-native';
import { CommonActions } from '@react-navigation/native';
import { typography, spacing } from '../../../theme';
import { useTranslation } from 'react-i18next';
import { useRTL } from '../../../hooks/useRTL';
import { useTheme } from '../../../hooks/useTheme';
import { Button } from '../../../components/common';
import type { AuthStackScreenProps } from '../../../navigation/types';

const { width, height } = Dimensions.get('window');

export const EntryScreen = ({ navigation }: AuthStackScreenProps<'Entry'>) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { textAlign } = useRTL();
  
  const handleRegister = () => {
    // Reset navigation stack to ensure Entry is always the previous screen
    navigation.dispatch(
      CommonActions.reset({
        index: 1,
        routes: [
          { name: 'Entry' },
          { name: 'Register' },
        ],
      })
    );
  };
  
  const handleLogin = () => {
    // Reset navigation stack to ensure Entry is always the previous screen
    navigation.dispatch(
      CommonActions.reset({
        index: 1,
        routes: [
          { name: 'Entry' },
          { name: 'Login' },
        ],
      })
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { backgroundColor: colors.background },
        ]}
        showsVerticalScrollIndicator={false}
        bounces
      >
        {/* Hero section */}
        <ImageBackground
          source={require('../../../assets/images/bg.png')}
          style={styles.hero}
          resizeMode="cover"
        />

        {/* Content section */}
        <View
          style={[styles.bottomArea, { backgroundColor: colors.background }]}
        >
          <Image
            source={require('../../../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />

          {/* White title card */}
          <View
            style={[
              styles.titleCard,
              {
                backgroundColor: colors.backgroundSecondary,
                borderColor: colors.borderBeige,
              },
            ]}
          >
            <Text
              style={[
                styles.brandTitle,
                { textAlign, color: colors.textSecondary },
              ]}
            >
              {t('auth.entry.brandTitle')}
            </Text>
            <Text
              style={[
                styles.brandSubtitle,
                { textAlign, color: colors.textSecondary },
              ]}
            >
              {t('auth.entry.brandSubtitle')}
            </Text>
            {/* <Text
              style={[styles.cardCaption, { textAlign, color: colors.gray600 }]}
            >
              {t('auth.entry.caption')}
            </Text> */}
          </View>

          <View style={styles.actions}>
            <Button
              title={t('common.login')}
              onPress={handleLogin}
              variant="primary"
              style={styles.loginBtn}
            />
            <Button
              title={t('common.register')}
              onPress={handleRegister}
              variant="outline"
              style={styles.registerBtn}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const HERO_HEIGHT = Math.round(height * 0.42);

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
  },
  hero: {
    height: HERO_HEIGHT,
    width: '100%',
  },
  bottomArea: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing[6],
    paddingTop: spacing[10],
    paddingBottom: spacing[12],
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: spacing[6],
  },
  titleCard: {
    width: width * 0.84,
    borderRadius: 5,
    borderWidth: 1,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[6],
    alignItems: 'center',
    marginBottom: spacing[6],
  },
  brandTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize['5xl'],
    textAlign: 'center',
    marginBottom: 4,
  },
  brandSubtitle: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize['3xl'],
    textAlign: 'center',
  },
  cardCaption: {
    textAlign: 'center',
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.sm,
    marginTop: spacing[4],
    width: '100%',
  },
  actions: {
    width: width * 0.84,
    marginTop: spacing[10],
  },
  loginBtn: {
    minHeight: 56,
    marginBottom: spacing[4],
  },
  registerBtn: {
    minHeight: 56,
  },
});
