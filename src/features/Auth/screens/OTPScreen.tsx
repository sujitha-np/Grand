/**
 * OTP Screen - Matches Figma Design
 */
import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Keyboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { AuthStackScreenProps } from '../../../navigation/types';
import { spacing, typography } from '../../../theme';
import { useTheme } from '../../../hooks/useTheme';
import { Button, Input } from '../../../components/common';
import { BackIcon } from '../../../components/icons';
import { useVerifyOtpMutation } from '../../../services/api/authApi';
import { useToast } from '../../../components/common/ToastProvider';
import { storage } from '../../../utils/storage';
import { STORAGE_KEYS } from '../../../config/constants';
import { navigateRoot } from '../../../navigation/navigationRef';
import { useTranslation } from 'react-i18next';
import { useRTL } from '../../../hooks/useRTL';

export const OTPScreen = ({
  navigation,
  route,
}: AuthStackScreenProps<'OTP'>) => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { isRTL, textAlign, flexDirection } = useRTL();
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const inputsRef = [
    useRef<any>(null),
    useRef<any>(null),
    useRef<any>(null),
    useRef<any>(null),
    useRef<any>(null),
    useRef<any>(null),
  ];

  const code = digits.join('');
  const [verifyOtp, verifyState] = useVerifyOtpMutation();
  const toast = useToast();
  const getErrorMessage = (e: any): string => {
    const data = e?.data;
    if (typeof data?.message === 'string') return data.message;
    const err = data?.error ?? e?.error;
    if (typeof err === 'string') return err;
    if (err && typeof err === 'object') {
      const firstKey = Object.keys(err)[0];
      const arr = (err as any)[firstKey];
      if (Array.isArray(arr) && arr.length) return String(arr[0]);
      return String(JSON.stringify(err));
    }
    return e?.message || 'Verification failed. Please try again.';
  };
  const handleContinue = async () => {
    if (code.length !== 6) return;
    const identifier = route.params?.identifier;
    const isEmail = /@/.test(identifier);
    try {
      const res: any = await verifyOtp({
        otp: code,
        ...(isEmail ? { email: identifier } : { phone: identifier }),
        employee_id: route.params?.employeeId,
      }).unwrap();

      const success = res?.success !== undefined ? !!res.success : true;
      if (success) {
        const token = res?.token || res?.data?.token;
        if (token) {
          await storage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
        }
        toast.showSuccess('Verification successful');
        // Navigate to Root Main stack (Home)
        navigateRoot('Main');
      } else {
        const msg = res?.message || 'Verification failed. Please try again.';
        toast.showError(String(msg));
      }
    } catch (e) {
      const msg = getErrorMessage(e as any);
      toast.showError(String(msg));
    }
  };

  const handleChangeDigit = (index: number, value: string) => {
    const only = value.replace(/\D/g, '');

    // Paste handling: if multiple digits are pasted, spread them across boxes
    if (only.length > 1) {
      const next = [...digits];
      let pos = index;
      for (let i = 0; i < only.length && pos < 6; i += 1, pos += 1) {
        next[pos] = only[i];
      }
      setDigits(next);
      if (pos < 6) {
        inputsRef[pos].current?.focus?.();
      } else {
        inputsRef[5].current?.blur?.();
        Keyboard.dismiss();
      }
      return;
    }

    // Single digit typing
    const v = only.slice(0, 1);
    const next = [...digits];
    next[index] = v;
    setDigits(next);
    if (v && index < 5) {
      inputsRef[index + 1].current?.focus?.();
    }
  };

  const handleKeyPress = (index: number, e: any) => {
    if (e.nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
      inputsRef[index - 1].current?.focus?.();
    }
  };

  return (
    <KeyboardAvoidingView
      style={[
        styles.container,
        { paddingTop: insets.top, backgroundColor: colors.white },
      ]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Top Bar */}
      <View style={[styles.topBar, { flexDirection }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <BackIcon size={32} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text
          style={[styles.topBarTitle, { textAlign, color: colors.textPrimary }]}
        >
          {t('auth.otp.label')}
        </Text>
      </View>

      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { textAlign, color: colors.textPrimary }]}>
          {t('auth.otp.title')}
        </Text>
      </View>

      {/* OTP Field Label */}
      <Text
        style={[styles.otpLabel, { textAlign, color: colors.textSecondary }]}
      >
        {t('auth.otp.label')}
      </Text>
      {/* OTP Field Container with 6 boxes */}
      <View
        style={[
          styles.otpField,
          {
            flexDirection: isRTL ? 'row-reverse' : 'row',
            borderColor: colors.border,
            backgroundColor: colors.backgroundSecondary,
          },
        ]}
      >
        {[0, 1, 2, 3, 4, 5].map(i => (
          <TextInput
            key={i}
            ref={inputsRef[i]}
            style={[styles.otpInput, { color: colors.textPrimary }]}
            value={digits[i]}
            onChangeText={val => handleChangeDigit(i, val)}
            keyboardType="number-pad"
            maxLength={6}
            onKeyPress={e => handleKeyPress(i, e)}
            textAlign="center"
            placeholder="0"
            placeholderTextColor={colors.textPlaceholder}
            {...(i === 0 ? { textContentType: 'oneTimeCode' as any } : {})}
          />
        ))}
      </View>

      {/* Continue Button */}
      <View style={styles.footer}>
        <Button
          title={t('auth.otp.continue')}
          onPress={handleContinue}
          fullWidth
          style={styles.button}
          disabled={code.length !== 6 || verifyState.isLoading}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing[6],
    paddingBottom: spacing[10],
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing[2],
  },
  topBarTitle: {
    fontSize: 20,
    marginLeft: spacing[3],
    marginRight: spacing[3],
  },
  backButton: {
    padding: spacing[1],
  },
  header: {
    marginTop: spacing[6],
    marginBottom: spacing[10],
  },
  otpLabel: {
    fontSize: typography.fontSize.sm,
    marginBottom: spacing[2],
  },
  otpField: {
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 28,
    height: 56,
    paddingHorizontal: spacing[4],
  },
  otpInput: {
    width: 32,
    height: 56,
    fontSize: typography.fontSize['xl'],
    fontFamily: typography.fontFamily.interLight,
    textAlignVertical: 'center',
    paddingTop: 0,
    paddingBottom: 0,
  },
  title: {
    fontSize: 30,
    fontWeight: '600',
    lineHeight: 40,
    fontFamily: typography.fontFamily.medium,
  },
  button: {
    marginTop: spacing[2],
  },
  footer: {
    position: 'absolute',
    left: spacing[6],
    right: spacing[6],
    bottom: spacing[8],
  },
});

export default OTPScreen;
