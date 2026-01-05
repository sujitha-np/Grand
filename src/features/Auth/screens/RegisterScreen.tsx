/**
 * Register Screen - Matches Figma Design
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
  Modal,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Formik } from 'formik';
import * as Yup from 'yup';
import type { AuthStackScreenProps } from '@navigation/types';
import { Button, Input } from '../../../components/common';
import DatePicker from '../../../components/common/DatePicker';
import { typography, spacing } from '../../../theme';
import { useAppDispatch, useAppSelector } from '../../../state/hooks';
import { useRTL } from '../../../hooks/useRTL';
import { useTheme } from '../../../hooks/useTheme';
import {
  BackIcon,
  ProfileFormIcon,
  PhoneFormIcon,
  MailFormIcon,
  CalendarFormIcon,
  DropdownFormIcon,
  MaleFormIcon,
} from '../../../components/icons';

const RegisterSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  phone: Yup.string()
    .matches(/^[0-9]{8}$/, 'Phone number must be 8 digits')
    .required('Phone number is required'),
  email: Yup.string()
    .matches(
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      'Please enter a valid email address'
    )
    .email('Invalid email address')
    .required('Email is required'),
  gender: Yup.string().oneOf(['male', 'female']).required('Gender is required'),
  dob: Yup.string().required('DOB is required'),
});

export const RegisterScreen = ({
  navigation,
}: AuthStackScreenProps<'Register'>) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { isRTL, textAlign, flexDirection } = useRTL();
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const [genderMenuOpen, setGenderMenuOpen] = useState(false);
  const [dobPickerOpen, setDobPickerOpen] = useState(false);
  const { isLoading, error } = useAppSelector(state => state.auth);

  const handleBackPress = () => {
    // Use goBack which will pop to the previous screen in the stack
    // Since EntryScreen uses reset(), this will go back to Entry
    navigation.goBack();
  };

  const handleRegister = async (values: {
    name: string;
    phone: string;
    email: string;
    gender: string;
    dob: string;
  }) => {
    // Map UI fields to backend payload keys, pass to Confirm screen
    const payload = {
      employer_id: '1', // TODO: replace with actual employer selection if needed
      employee_code: '', // TODO: collect or generate employee_code
      name_en: values.name,
      mobile: values.phone,
      email: values.email,
      gender: values.gender,
      dob: values.dob,
      designation: '', // TODO: collect designation in form
      qid: '', // TODO: collect QID in form
    };
    navigation.navigate('ConfirmRegister', payload);
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
            {t('common.register')}
          </Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View
            style={[styles.progressBar, { backgroundColor: colors.gray300 }]}
          />
          <View style={styles.progressBarEmpty} />
          <View
            style={[styles.progressFill, { backgroundColor: colors.primary }]}
          />
        </View>

        {/* Header */}
        <View style={styles.header}>
          <Text
            style={[styles.title, { textAlign, color: colors.textPrimary }]}
          >
            {t('auth.register.title')}
          </Text>
        </View>

        {/* Form */}
        <Formik
          initialValues={{
            name: '',
            phone: '',
            email: '',
            gender: 'male',
            dob: '',
          }}
          validationSchema={RegisterSchema}
          onSubmit={handleRegister}
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
              {/* Name Input */}
              <Input
                label={t('auth.register.nameLabel')}
                placeholder={t('auth.register.namePlaceholder')}
                value={values.name}
                onChangeText={handleChange('name')}
                onBlur={handleBlur('name')}
                error={touched.name ? errors.name : undefined}
                leftIcon={
                  <ProfileFormIcon size={18} color={colors.textPrimary} />
                }
              />

              {/* Phone Input */}
              <Input
              maxLength={8}
                label={t('auth.register.phoneLabel')}
                placeholder={t('auth.register.phonePlaceholder')}
                value={values.phone}
                onChangeText={handleChange('phone')}
                onBlur={handleBlur('phone')}
                error={touched.phone ? errors.phone : undefined}
                keyboardType="phone-pad"
                leftIcon={
                  <PhoneFormIcon size={18} color={colors.textPrimary} />
                }
              />

              {/* Email Input */}
              <Input
                label={t('auth.register.emailLabel')}
                placeholder={t('auth.register.emailPlaceholder')}
                value={values.email}
                onChangeText={handleChange('email')}
                onBlur={handleBlur('email')}
                error={touched.email ? errors.email : undefined}
                keyboardType="email-address"
                autoCapitalize="none"
                leftIcon={<MailFormIcon size={18} color={colors.textPrimary} />}
              />

              {/* Gender Dropdown (non-editable input with modal) */}
              {/* Gender Input (opens modal) */}
              <TouchableOpacity
                onPress={() => setGenderMenuOpen(true)}
                activeOpacity={0.8}
              >
                <Input
                  label={t('auth.register.genderLabel')}
                  placeholder={t('auth.register.genderPlaceholder')}
                  value={
                    values.gender === 'male'
                      ? t('auth.register.genderMale', { defaultValue: 'Male' })
                      : t('auth.register.genderFemale', {
                          defaultValue: 'Female',
                        })
                  }
                  onChangeText={handleChange('gender')}
                  onBlur={handleBlur('gender')}
                  error={touched.gender ? errors.gender : undefined}
                  leftIcon={
                    <MaleFormIcon size={18} color={colors.textPrimary} />
                  }
                  rightIcon={
                    <DropdownFormIcon size={20} color={colors.textPrimary} />
                  }
                  editable={false}
                />
              </TouchableOpacity>

              <Modal
                visible={genderMenuOpen}
                transparent
                animationType="fade"
                onRequestClose={() => setGenderMenuOpen(false)}
              >
                <View
                  style={[
                    styles.modalOverlay,
                    { backgroundColor: colors.overlayLight },
                  ]}
                >
                  <View
                    style={[
                      styles.modalCard,
                      { backgroundColor: colors.backgroundSecondary },
                    ]}
                  >
                    <TouchableOpacity
                      style={styles.optionRow}
                      onPress={() => {
                        handleChange('gender')('male');
                        setGenderMenuOpen(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          { color: colors.textPrimary },
                        ]}
                      >
                        {t('auth.register.genderMale', {
                          defaultValue: 'Male',
                        })}
                      </Text>
                    </TouchableOpacity>
                    <View
                      style={[
                        styles.optionDivider,
                        { backgroundColor: colors.border },
                      ]}
                    />
                    <TouchableOpacity
                      style={styles.optionRow}
                      onPress={() => {
                        handleChange('gender')('female');
                        setGenderMenuOpen(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          { color: colors.textPrimary },
                        ]}
                      >
                        {t('auth.register.genderFemale', {
                          defaultValue: 'Female',
                        })}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>

              {/* DOB Input */}
              <TouchableOpacity
                onPress={() => setDobPickerOpen(true)}
                activeOpacity={0.8}
              >
                <Input
                  label={t('auth.register.dobLabel')}
                  placeholder={t('auth.register.dobPlaceholder')}
                  value={values.dob}
                  onChangeText={handleChange('dob')}
                  onBlur={handleBlur('dob')}
                  error={touched.dob ? (errors as any).dob : undefined}
                  leftIcon={
                    <CalendarFormIcon size={18} color={colors.textPrimary} />
                  }
                  editable={false}
                />
              </TouchableOpacity>

              <DatePicker
                visible={dobPickerOpen}
                value={values.dob ? new Date(values.dob) : undefined}
                maximumDate={new Date()}
                onConfirm={date => {
                  const yyyy = date.getFullYear();
                  const mm = `${date.getMonth() + 1}`.padStart(2, '0');
                  const dd = `${date.getDate()}`.padStart(2, '0');
                  const formatted = `${yyyy}-${mm}-${dd}`;
                  handleChange('dob')(formatted);
                  setDobPickerOpen(false);
                }}
                onCancel={() => setDobPickerOpen(false)}
              />

              {/* Remove password for this step to match UI */}

              {/* Error Message */}
              {error && (
                <Text style={[styles.errorText, { color: colors.error }]}>
                  {error}
                </Text>
              )}

              {/* Next Button */}
              <Button
                title={t('common.next')}
                onPress={handleSubmit as any}
                loading={isLoading}
                fullWidth
                style={styles.button}
              />
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
    flexGrow: 1,
    paddingHorizontal: spacing[6],
    paddingBottom: spacing[8],
  },
  topBarTitle: {
    fontSize: 20,
    marginLeft: spacing[3],
    marginRight: spacing[3],
  },
  topBar: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: spacing[2],
  },
  backButton: {
    marginTop: 0,
    marginBottom: 0,
    padding: spacing[1],
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressContainer: {
    marginTop: spacing[4],
    marginBottom: spacing[4],
    position: 'relative',
    height: 6,
  },
  progressBar: {
    width: '100%',
    height: 6,
    borderRadius: 3,
  },
  progressBarEmpty: { display: 'none' },
  progressTrack: { display: 'none' },
  progressFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '50%',
    height: 6,
    borderRadius: 3,
  },
  header: {
    marginBottom: spacing[6],
  },
  title: {
    fontSize: 34,
    fontWeight: '600',
    lineHeight: 40,
    fontFamily: 'PlayfairDisplay-Bold',
    marginBottom: spacing[2],
  },
  form: {
    flex: 1,
  },
  errorText: {
    fontSize: typography.fontSize.sm,
    marginBottom: spacing[4],
    textAlign: 'center',
  },
  button: {
    marginTop: spacing[6],
    minHeight: 56,
    borderRadius: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing[6],
  },
  footerText: {
    fontSize: typography.fontSize.base,
  },
  linkText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semiBold,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    width: '80%',
    borderRadius: 12,
    paddingVertical: spacing[2],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  optionRow: {
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
  },
  optionText: {
    fontSize: typography.fontSize.base,
  },
  optionDivider: {
    height: StyleSheet.hairlineWidth,
  },
});
