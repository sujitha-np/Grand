/**
 * Login Screen - Matches Figma Design
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { Button, Input } from '../../../components/common';
import {
  EmailIcon,
  PhoneIcon,
  LockIcon,
  EyeOffIcon,
  BackIcon,
} from '../../../components/icons';
import { typography, spacing, borderRadius } from '../../../theme';
import { useAppDispatch, useAppSelector } from '../../../state/hooks';
import { useRTL } from '../../../hooks/useRTL';
import { useTheme } from '../../../hooks/useTheme';
import { useSendOtpMutation } from '../../../services/api/authApi';
import type { AuthStackScreenProps } from '../../../navigation/types';
import { useToast } from '../../../components/common/ToastProvider';

const LoginSchema = Yup.object().shape({
  emailOrPhone: Yup.string().required('Email or phone number is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

export const LoginScreen = ({ navigation }: AuthStackScreenProps<'Login'>) => {
  const dispatch = useAppDispatch();
  const { colors } = useTheme();
  const { isLoading, error } = useAppSelector(state => state.auth);
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  const [showPassword, setShowPassword] = useState(false);
  const insets = useSafeAreaInsets();
  const [sendOtp, sendOtpState] = useSendOtpMutation();
  const toast = useToast();
  const { t } = useTranslation();
  const { isRTL, textAlign, flexDirection } = useRTL();

  const handleBackPress = () => {
    // Use goBack which will pop to the previous screen in the stack
    // Since EntryScreen uses reset(), this will go back to Entry
    navigation.goBack();
  };

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
    return e?.message || 'Please try again.';
  };

  const handleLogin = async (values: {
    emailOrPhone: string;
    password: string;
  }) => {
    try {
      const identifier = values.emailOrPhone.trim();
      if (loginMethod === 'phone') {
        const phoneRegex = /^\d{8}$/;
        if (!phoneRegex.test(identifier)) {
          toast.showError('Phone number must be 8 digits.');
          return;
        }
      }
      const payload = {
        login_id: identifier,
        password: values.password,
      };
      const res = await sendOtp(payload).unwrap();
      if ((res as any)?.success) {
        toast.showSuccess('OTP sent successfully');
        navigation.navigate('OTP', {
          identifier,
          employeeId: (res as any)?.employee_id,
        });
      } else {
        toast.showError((res as any)?.message || 'Send OTP failed.');
      }
    } catch (e) {
      const msg = getErrorMessage(e as any);

      toast.showError(String(msg));
    }
  };

  return (
    <KeyboardAvoidingView
      style={[
        styles.container,
        { paddingTop: insets.top, backgroundColor: colors.backgroundSecondary },
      ]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor={colors.backgroundSecondary}
      />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Top Bar */}
        <View style={[styles.topBar, { flexDirection }]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBackPress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <BackIcon size={32} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text
            style={[
              styles.topBarTitle,
              { textAlign, color: colors.textPrimary },
            ]}
          >
            {t('common.login')}
          </Text>
        </View>

        {/* Header */}
        <View style={styles.header}>
          <Text
            style={[styles.title, { textAlign, color: colors.textPrimary }]}
          >
            {t('auth.login.title')}
          </Text>
        </View>

        {/* Form */}
        <Formik
          initialValues={{ emailOrPhone: '', password: '' }}
          validationSchema={LoginSchema}
          onSubmit={handleLogin}
        >
          {({
            handleChange,
            handleBlur,
            handleSubmit,
            values,
            errors,
            touched,
          }) => (
            <View style={styles.form}>
              {/* Email Input */}
              <Input
                label={t('auth.login.emailLabel')}
                placeholder={t('auth.login.emailPlaceholder')}
                value={loginMethod === 'email' ? values.emailOrPhone : ''}
                onChangeText={text => {
                  setLoginMethod('email');
                  handleChange('emailOrPhone')(text);
                }}
                onBlur={handleBlur('emailOrPhone')}
                error={
                  touched.emailOrPhone && loginMethod === 'email'
                    ? errors.emailOrPhone
                    : undefined
                }
                keyboardType="email-address"
                autoCapitalize="none"
                leftIcon={<EmailIcon size={20} color={colors.primary} />}
                inputStyle={
                  isRTL ? ({ writingDirection: 'rtl' } as any) : undefined
                }
              />

              {/* Or Divider */}
              <View style={styles.divider}>
                <View
                  style={[
                    styles.dividerLine,
                    { backgroundColor: colors.border },
                  ]}
                />
                <Text
                  style={[styles.dividerText, { color: colors.textSecondary }]}
                >
                  {t('common.or', { defaultValue: 'Or' })}
                </Text>
                <View
                  style={[
                    styles.dividerLine,
                    { backgroundColor: colors.border },
                  ]}
                />
              </View>

              {/* Phone Input */}
              <Input
                label={t('auth.login.phoneLabel')}
                placeholder={t('auth.login.phonePlaceholder')}
                value={loginMethod === 'phone' ? values.emailOrPhone : ''}
                onChangeText={text => {
                  setLoginMethod('phone');
                  handleChange('emailOrPhone')(text);
                }}
                onBlur={handleBlur('emailOrPhone')}
                error={
                  touched.emailOrPhone && loginMethod === 'phone'
                    ? errors.emailOrPhone
                    : undefined
                }
                keyboardType="phone-pad"
                leftIcon={<PhoneIcon size={20} color={colors.primary} />}
                inputStyle={
                  isRTL ? ({ writingDirection: 'rtl' } as any) : undefined
                }
              />

              {/* Password Input */}
              <Input
                label={t('auth.login.passwordLabel')}
                placeholder="********"
                value={values.password}
                onChangeText={handleChange('password')}
                onBlur={handleBlur('password')}
                error={touched.password ? errors.password : undefined}
                secureTextEntry={!showPassword}
                leftIcon={<LockIcon size={20} color={colors.primary} />}
                rightIcon={
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <EyeOffIcon size={20} color={colors.primary} />
                  </TouchableOpacity>
                }
                inputStyle={
                  isRTL ? ({ writingDirection: 'rtl' } as any) : undefined
                }
              />

              {/* Error Message */}
              {error && (
                <Text
                  style={[styles.errorText, { textAlign, color: colors.error }]}
                >
                  {error}
                </Text>
              )}

              {/* Continue Button */}
              <Button
                title={t('auth.login.continue')}
                onPress={handleSubmit as any}
                loading={sendOtpState.isLoading}
                fullWidth
                style={styles.button}
              />

              {/* Footer link omitted to match Figma */}
            </View>
          )}
        </Formik>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
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
    lineHeight: 24,
  },
  backButton: {
    marginTop: 0,
    marginBottom: 0,
    padding: spacing[1],
  },
  header: {
    marginTop: spacing[6],
    marginBottom: spacing[10],
  },
  title: {
    fontSize: 34,
    fontWeight: '400',
    lineHeight: 40,
    fontFamily: typography.fontFamily.regular,
  },
  form: {
    marginBottom: spacing[8],
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing[5],
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: spacing[4],
    fontSize: typography.fontSize.sm,
  },
  errorText: {
    fontSize: typography.fontSize.sm,
    marginBottom: spacing[4],
    textAlign: 'center',
  },
  button: {
    marginTop: spacing[12],
    marginBottom: spacing[6],
  },
});
