/**
 * Confirm Register Screen - Matches Figma Company Details UI
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
  Modal,
  FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Formik } from 'formik';
import * as Yup from 'yup';
import type { AuthStackScreenProps } from '@navigation/types';
import { Button, Input } from '../../../components/common';
import { typography, spacing } from '../../../theme';
import { useRTL } from '../../../hooks/useRTL';
import { useTheme } from '../../../hooks/useTheme';
import {
  BackIcon,
  DropdownFormIcon,
  CompanyBuildingIcon,
  DesignationIcon,
  EmployeeCodeIcon,
  QIDIcon,
} from '../../../components/icons';
import {
  useRegisterMutation,
  useEmployersQuery,
} from '../../../services/api/authApi';
import { useToast } from '../../../components/common/ToastProvider';

const ConfirmSchema = Yup.object().shape({
  companyName: Yup.string().required('Company name is required'),
  designation: Yup.string().required('Designation is required'),
  employeeCode: Yup.string().required('Employee code is required'),
  qid: Yup.string()
    .nullable()
    .notRequired()
    .test('qid-format', 'QID must be exactly 11 digits', (value) => {
      // If value is empty/null/undefined, it's valid (optional)
      if (!value || value.trim() === '') return true;
      // If value is provided, it must be exactly 11 digits
      return /^[0-9]{11}$/.test(value);
    }),
});

export const ConfirmRegisterScreen = ({
  navigation,
  route,
}: AuthStackScreenProps<'ConfirmRegister'>) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { isRTL, textAlign, flexDirection } = useRTL();
  const insets = useSafeAreaInsets();
  const [registerMutation, registerState] = useRegisterMutation();
  const toast = useToast();

  // Employer selection state
  const [selectedEmployer, setSelectedEmployer] = useState<any>(null);
  const [showEmployerModal, setShowEmployerModal] = useState(false);

  // Fetch employers list
  const { data: employersResp, isLoading: employersLoading } =
    useEmployersQuery();

  // Handler for company selection
  const [formikSetFieldValue, setFormikSetFieldValue] =
    React.useState<any>(null);

  const handleEmployerSelect = (employer: any) => {
    setSelectedEmployer(employer);
    if (formikSetFieldValue) {
      formikSetFieldValue('companyName', employer.employer_name);
    }
    setShowEmployerModal(false);
  };

  const onSubmit = async (values: any) => {
    try {
      const payload = {
        employer_id: selectedEmployer?.id,
        employee_code: values.employeeCode,
        name_en: route.params.name_en,
        mobile: route.params.mobile,
        email: route.params.email,
        gender: route.params.gender,
        dob: route.params.dob,
        designation: values.designation,
        qid: values.qid || undefined,
      };
      const res: any = await registerMutation(payload).unwrap();
      const success = res?.success !== undefined ? !!res.success : true;
      if (success) {
        toast.showSuccess(res?.message || 'Registered successfully');
        navigation.navigate('Login');
      } else {
        toast.showError(res?.message || 'Registration failed');
      }
    } catch (e: any) {
      const msg =
        e?.data?.message ||
        (e?.data?.error && JSON.stringify(e.data.error)) ||
        e?.error ||
        e?.message ||
        'Please try again.';
      toast.showError(String(msg));
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

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
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
          <View
            style={[
              styles.progressFill,
              { backgroundColor: colors.primary },
              isRTL ? { right: 0 } : { left: 0 },
            ]}
          />
        </View>

        {/* Header */}
        <View style={styles.header}>
          <Text
            style={[styles.title, { textAlign, color: colors.textPrimary }]}
          >
            {t('auth.register.companyTitle')}
          </Text>
        </View>

        <Formik
          initialValues={{
            companyName: '',
            designation: '',
            employeeCode: '',
            qid: '',
          }}
          validationSchema={ConfirmSchema}
          onSubmit={onSubmit}
        >
          {({
            handleChange,
            handleBlur,
            handleSubmit,
            setFieldValue,
            values,
            errors,
            touched,
          }) => {
            // Store setFieldValue for use in modal
            React.useEffect(() => {
              setFormikSetFieldValue(() => setFieldValue);
            }, [setFieldValue]);

            return (
              <View style={styles.form}>
                {/* Company Name Dropdown */}
                <View style={styles.inputContainer}>
                  <Text style={[styles.label, { color: colors.textPrimary }]}>
                    {t('auth.register.companyName')}
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.dropdownButton,
                      {
                        backgroundColor: colors.backgroundSecondary,
                        borderColor: colors.border,
                      },
                      touched.companyName &&
                        errors.companyName && { borderColor: colors.error },
                    ]}
                    onPress={() => setShowEmployerModal(true)}
                  >
                    <CompanyBuildingIcon size={18} color={colors.textPrimary} />
                    <Text
                      style={[
                        styles.dropdownText,
                        {
                          color: selectedEmployer
                            ? colors.textPrimary
                            : colors.gray500,
                        },
                      ]}
                    >
                      {selectedEmployer?.employer_name ||
                        t('auth.register.companyName')}
                    </Text>
                    <DropdownFormIcon size={20} color={colors.textPrimary} />
                  </TouchableOpacity>

                  {touched.companyName && errors.companyName && (
                    <Text style={[styles.errorText, { color: colors.error }]}>
                      {errors.companyName}
                    </Text>
                  )}
                </View>

                {/* Designation */}
                <Input
                  label={t('auth.register.designation')}
                  placeholder={t('auth.register.designation')}
                  value={values.designation}
                  onChangeText={handleChange('designation')}
                  onBlur={handleBlur('designation')}
                  error={touched.designation ? errors.designation : undefined}
                  leftIcon={
                    <DesignationIcon size={18} color={colors.textPrimary} />
                  }
                />

                {/* Employee Code */}
                <Input
                  label={t('auth.register.employeeCode')}
                  placeholder={t('auth.register.code')}
                  value={values.employeeCode}
                  onChangeText={handleChange('employeeCode')}
                  onBlur={handleBlur('employeeCode')}
                  error={touched.employeeCode ? errors.employeeCode : undefined}
                  leftIcon={
                    <EmployeeCodeIcon size={18} color={colors.textPrimary} />
                  }
                />

                {/* QID (Required - 11 digits) */}
                <Input
                  label={t('auth.register.qid')}
                  placeholder="Code"
                  value={values.qid}
                  onChangeText={handleChange('qid')}
                  onBlur={handleBlur('qid')}
                  error={touched.qid ? errors.qid : undefined}
                  keyboardType="number-pad"
                  maxLength={11}
                  leftIcon={<QIDIcon size={18} color={colors.textPrimary} />}
                />

                <Button
                  title={t('common.register')}
                  onPress={handleSubmit as any}
                  fullWidth
                  style={styles.button}
                  loading={registerState.isLoading}
                />
              </View>
            );
          }}
        </Formik>
      </ScrollView>

      {/* Company Selection Modal */}
      <Modal
        visible={showEmployerModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEmployerModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: colors.backgroundSecondary },
            ]}
          >
            <View
              style={[styles.modalHeader, { borderBottomColor: colors.border }]}
            >
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                Select Company
              </Text>
              <TouchableOpacity onPress={() => setShowEmployerModal(false)}>
                <Text style={[styles.modalClose, { color: colors.gray600 }]}>
                  ✕
                </Text>
              </TouchableOpacity>
            </View>

            {employersLoading ? (
              <Text style={[styles.loadingText, { color: colors.gray600 }]}>
                Loading companies...
              </Text>
            ) : (
              <FlatList
                data={employersResp?.data || []}
                keyExtractor={item => item.id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.employerItem,
                      { borderBottomColor: colors.border },
                      selectedEmployer?.id === item.id && {
                        backgroundColor: colors.backgroundTertiary,
                      },
                    ]}
                    onPress={() => handleEmployerSelect(item)}
                  >
                    <Text
                      style={[
                        styles.employerName,
                        { color: colors.textPrimary },
                      ]}
                    >
                      {item.employer_name}
                    </Text>
                    {item.address && (
                      <Text
                        style={[
                          styles.employerAddress,
                          { color: colors.gray600 },
                        ]}
                      >
                        {item.address}
                      </Text>
                    )}
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <Text style={[styles.emptyText, { color: colors.gray600 }]}>
                    No companies available
                  </Text>
                }
              />
            )}
          </View>
        </View>
      </Modal>
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
  topBar: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: spacing[2],
  },
  topBarTitle: {
    fontSize: 20,
    marginLeft: spacing[3],
    marginRight: spacing[3],
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
  progressFill: {
    position: 'absolute',
    top: 0,
    width: '100%',
    height: 6,
    borderRadius: 3,
  },
  header: {
    marginBottom: spacing[6],
  },
  title: {
    fontSize: 34,
    lineHeight: 40,
    fontFamily: typography.fontFamily.medium,
    marginBottom: spacing[2],
  },
  form: {
    flex: 1,
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
  inputContainer: {
    marginBottom: spacing[4],
  },
  label: {
    fontSize: 14,
    fontFamily: typography.fontFamily.interSemiBold,
    marginBottom: spacing[2],
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 100,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    gap: spacing[2],
  },
  dropdownText: {
    flex: 1,
    fontSize: 16,
    fontFamily: typography.fontFamily.interRegular,
  },
  errorText: {
    fontSize: 12,
    marginTop: spacing[1],
    marginLeft: spacing[4],
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: spacing[6],
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing[5],
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: typography.fontFamily.semiBold,
  },
  modalClose: {
    fontSize: 24,
    fontWeight: '300',
  },
  employerItem: {
    padding: spacing[4],
    borderBottomWidth: 1,
  },
  employerName: {
    fontSize: 16,
    fontFamily: typography.fontFamily.interSemiBold,
    marginBottom: spacing[1],
  },
  employerAddress: {
    fontSize: 14,
    fontFamily: typography.fontFamily.interRegular,
  },
  loadingText: {
    textAlign: 'center',
    padding: spacing[6],
    fontSize: 14,
  },
  emptyText: {
    textAlign: 'center',
    padding: spacing[6],
    fontSize: 14,
  },
});

export default ConfirmRegisterScreen;
