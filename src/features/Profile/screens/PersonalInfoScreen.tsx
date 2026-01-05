import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { typography } from '../../../theme';
import { useTheme } from '../../../hooks/useTheme';
import { useTranslation } from 'react-i18next';
import { I18nManager } from 'react-native';
import { useAppSelector } from '../../../state/hooks';
import {
  useProfileQuery,
  useUpdateProfileMutation,
} from '../../../services/api/homeApi';
import { useEmployersQuery } from '../../../services/api/authApi';
import { useToast } from '../../../components/common/ToastProvider';
import { BackIcon } from '../../../components/icons/BackIcon';
import { EditIcon } from '../../../components/icons/EditIcon';
import DatePicker from '../../../components/common/DatePicker';
import {
  ProfileFormIcon,
  PhoneFormIcon,
  MailFormIcon,
  CalendarFormIcon,
  CompanyBuildingIcon,
  DesignationIcon,
  EmployeeCodeIcon,
  QIDIcon,
  MaleFormIcon,
  DropdownFormIcon,
} from '../../../components/icons/FormIcons';

export const PersonalInfoScreen = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const { employeeId } = useAppSelector(state => state.auth);

  const { data: profileResp, refetch: refetchProfile } = useProfileQuery(
    employeeId || 0
  );
  const { data: employersResp } = useEmployersQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const toast = useToast();
  const profile = profileResp?.data;
  const employers = employersResp?.data || [];

  const [isEditing, setIsEditing] = useState(false);
  const [showGenderDropdown, setShowGenderDropdown] = useState(false);
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [dobPickerOpen, setDobPickerOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    gender: '',
    dob: '',
    employer_id: 0,
    companyName: '',
    designation: '',
    employeeCode: '',
    qid: '',
  });

  // Update form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name_en || '',
        mobile: profile.mobile || '',
        email: profile.email || '',
        gender: profile.gender || '',
        dob: profile.dob || '',
        employer_id: profile.employer_id || 0,
        companyName: profile.employer?.employer_name || '',
        designation: profile.designation || '',
        employeeCode: profile.employee_code || '',
        qid: profile.qid || '',
      });
    }
  }, [profile]);

  const genderOptions = [
    { label: t('Male'), value: 'male' },
    { label: t('Female'), value: 'female' },
  ];

  const handleBack = () => navigation.goBack();

  const handleEdit = async () => {
    console.log('Edit button clicked, current isEditing:', isEditing);
    if (isEditing) {
      // Save logic - call API with only changed or existing values
      // Validate phone number
      const phoneToSave = formData.mobile || profile?.mobile || '';
      if (phoneToSave && phoneToSave.length !== 8) {
        toast.showError(t('Phone number must be exactly 8 digits'));
        return;
      }


      // Validate email
      const emailToSave = formData.email || profile?.email || '';
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (emailToSave && !emailRegex.test(emailToSave)) {
        toast.showError(t('Invalid email address'));
        return;
      }

      try {
        const formDataToSend = new FormData();
        formDataToSend.append('employee_id', String(employeeId));

        // Use changed values or fallback to profile defaults
        formDataToSend.append(
          'name_en',
          formData.name || profile?.name_en || ''
        );
        formDataToSend.append(
          'mobile',
          formData.mobile || profile?.mobile || ''
        );
        formDataToSend.append('email', formData.email || profile?.email || '');
        formDataToSend.append(
          'gender',
          formData.gender || profile?.gender || ''
        );
        formDataToSend.append('dob', formData.dob || profile?.dob || '');
        formDataToSend.append('qid', formData.qid || profile?.qid || '');
        formDataToSend.append(
          'designation',
          formData.designation || profile?.designation || ''
        );
        formDataToSend.append(
          'employer_id',
          String(formData.employer_id || profile?.employer_id || '')
        );
        // Note: photo field can be added when image upload is implemented

        console.log('Saving profile with data:', {
          name_en: formData.name || profile?.name_en,
          mobile: formData.mobile || profile?.mobile,
          email: formData.email || profile?.email,
          gender: formData.gender || profile?.gender,
          dob: formData.dob || profile?.dob,
        });

        const result = await updateProfile(formDataToSend).unwrap();
        console.log('Profile updated successfully:', result);

        // Refetch profile to get updated data
        await refetchProfile();

        // Show success toast and redirect to profile screen
        toast.showSuccess(t('Profile updated successfully!'));
        navigation.goBack();
      } catch (error: any) {
        console.error('Failed to update profile:', error);
        const errorMessage =
          error?.data?.message || t('Failed to update profile. Please try again.');
        toast.showError(errorMessage);
        return; // Don't toggle edit mode if save failed
      }
    }
    setIsEditing(!isEditing);
    console.log('New isEditing state will be:', !isEditing);
  };

  const handleGenderSelect = (value: string) => {
    setFormData({ ...formData, gender: value });
    setShowGenderDropdown(false);
  };

  const handleCompanySelect = (employer: any) => {
    setFormData({
      ...formData,
      employer_id: employer.id,
      companyName: employer.employer_name,
    });
    setShowCompanyModal(false);
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark
            ? colors.background
            : colors.backgroundSecondary,
        },
      ]}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor={
          isDark ? colors.background : colors.backgroundSecondary
        }
      />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 10 }, isRTL && { flexDirection: 'row-reverse' }]}>
          <View style={[styles.headerLeft, isRTL && { flexDirection: 'row-reverse' }]}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <BackIcon size={32} color={colors.textPrimary} />
            </TouchableOpacity>

            <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
              {t('Personal Info')}
            </Text>
          </View>

          <TouchableOpacity 
            style={[styles.editButton, isEditing && { opacity: 0 }]} 
            onPress={handleEdit}
            disabled={isEditing}
          >
            <EditIcon size={40} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Personal Information Section */}
        <View style={styles.section}>
          <View style={[styles.sectionTitleContainer, isRTL && { flexDirection: 'row-reverse' }]}>
            <Text
              style={[
                styles.sectionTitle, 
                { color: colors.textSecondary },
                isRTL && { marginRight: 0, marginLeft: 12 }
              ]}
            >
              {t('Personal Information')}
            </Text>
            <View
              style={[
                styles.sectionDivider,
                { backgroundColor: colors.border },
              ]}
            />
          </View>

          {/* Name */}
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.textSecondary }, isRTL && { textAlign: 'right' }]}>
              {t('Name')}
            </Text>
            <View
              style={[
                styles.inputWrapper,
                {
                  backgroundColor: colors.backgroundSecondary,
                  borderColor: colors.border,
                },
                isRTL && { flexDirection: 'row-reverse' }
              ]}
            >
              <ProfileFormIcon size={18} color={colors.gray600} />
              <TextInput
                style={[
                  styles.input, 
                  { color: colors.textPrimary },
                  isRTL && { textAlign: 'right', marginRight: 12, marginLeft: 0 }
                ]}
                value={formData.name}
                onChangeText={text => setFormData({ ...formData, name: text })}
                placeholder={t('Name')}
                placeholderTextColor={colors.gray400}
                editable={isEditing}
              />
            </View>
          </View>

          {/* Phone Number */}
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.textSecondary }, isRTL && { textAlign: 'right' }]}>
              {t('Phone Number')}
            </Text>
            <View
              style={[
                styles.inputWrapper,
                {
                  backgroundColor: colors.backgroundSecondary,
                  borderColor: colors.border,
                },
                isRTL && { flexDirection: 'row-reverse' }
              ]}
            >
              <PhoneFormIcon size={18} color={colors.gray600} />
              <TextInput
                style={[
                  styles.input, 
                  { color: colors.textPrimary },
                  isRTL && { textAlign: 'right', marginRight: 12, marginLeft: 0 }
                ]}
                value={formData.mobile}
                onChangeText={text =>
                  setFormData({ ...formData, mobile: text })
                }
                placeholder={t('Phone Number')}
                placeholderTextColor={colors.gray400}
                editable={isEditing}
                keyboardType="phone-pad"
                maxLength={8}
              />
            </View>
          </View>

          {/* Email */}
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.textSecondary }, isRTL && { textAlign: 'right' }]}>
              {t('Email')}
            </Text>
            <View
              style={[
                styles.inputWrapper,
                {
                  backgroundColor: colors.backgroundSecondary,
                  borderColor: colors.border,
                },
                isRTL && { flexDirection: 'row-reverse' }
              ]}
            >
              <MailFormIcon size={18} color={colors.gray600} />
              <TextInput
                style={[
                  styles.input, 
                  { color: colors.textPrimary },
                  isRTL && { textAlign: 'right', marginRight: 12, marginLeft: 0 }
                ]}
                value={formData.email}
                onChangeText={text => setFormData({ ...formData, email: text })}
                placeholder={t('Email')}
                placeholderTextColor={colors.gray400}
                editable={isEditing}
                keyboardType="email-address"
              />
            </View>
          </View>

          {/* Gender */}
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.textSecondary }, isRTL && { textAlign: 'right' }]}>
              {t('Gender')}
            </Text>
            <TouchableOpacity
              style={[
                styles.inputWrapper,
                {
                  backgroundColor: colors.backgroundSecondary,
                  borderColor: colors.border,
                },
                isRTL && { flexDirection: 'row-reverse' }
              ]}
              onPress={() =>
                isEditing && setShowGenderDropdown(!showGenderDropdown)
              }
              disabled={!isEditing}
            >
              <MaleFormIcon size={18} color={colors.gray600} />
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.inputText,
                    {
                      color: formData.gender
                        ? colors.textPrimary
                        : colors.gray400,
                    },
                    isRTL && { textAlign: 'right', marginRight: 12, marginLeft: 0 }
                  ]}
                >
                  {formData.gender
                    ? genderOptions.find(o => o.value === formData.gender)?.label || formData.gender
                    : t('Gender')}
                </Text>
              </View>
              {isEditing && (
                <DropdownFormIcon size={18} color={colors.textPrimary} />
              )}
            </TouchableOpacity>

            {/* Gender Dropdown */}
            {showGenderDropdown && isEditing && (
              <View
                style={[
                  styles.dropdown,
                  {
                    backgroundColor: colors.backgroundSecondary,
                    borderColor: colors.border,
                  },
                ]}
              >
                {genderOptions.map(option => (
                  <TouchableOpacity
                    key={option.value}
                    style={styles.dropdownItem}
                    onPress={() => handleGenderSelect(option.value)}
                  >
                    <Text
                      style={[
                        styles.dropdownItemText,
                        { color: colors.textPrimary },
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* DOB */}
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.textSecondary }, isRTL && { textAlign: 'right' }]}>
              {t('DOB')}
            </Text>
            <TouchableOpacity
              style={[
                styles.inputWrapper,
                {
                  backgroundColor: colors.backgroundSecondary,
                  borderColor: colors.border,
                },
                isRTL && { flexDirection: 'row-reverse' }
              ]}
              onPress={() => isEditing && setDobPickerOpen(true)}
              disabled={!isEditing}
            >
              <CalendarFormIcon size={18} color={colors.gray600} />
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.inputText,
                    {
                      color: formData.dob ? colors.textPrimary : colors.gray400,
                    },
                    isRTL && { textAlign: 'right', marginRight: 12, marginLeft: 0 }
                  ]}
                >
                  {formData.dob || t('DOB')}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Date Picker */}
          <DatePicker
            visible={dobPickerOpen}
            value={formData.dob ? new Date(formData.dob) : undefined}
            maximumDate={new Date()}
            onConfirm={date => {
              const yyyy = date.getFullYear();
              const mm = `${date.getMonth() + 1}`.padStart(2, '0');
              const dd = `${date.getDate()}`.padStart(2, '0');
              const formatted = `${yyyy}-${mm}-${dd}`;
              setFormData({ ...formData, dob: formatted });
              setDobPickerOpen(false);
            }}
            onCancel={() => setDobPickerOpen(false)}
          />
        </View>

        {/* Company Information Section */}
        <View style={styles.section}>
          <View style={[styles.sectionTitleContainer, isRTL && { flexDirection: 'row-reverse' }]}>
            <Text
              style={[
                styles.sectionTitle, 
                { color: colors.textSecondary },
                isRTL && { marginRight: 0, marginLeft: 12 }
              ]}
            >
              {t('Company Information')}
            </Text>
            <View
              style={[
                styles.sectionDivider,
                { backgroundColor: colors.border },
              ]}
            />
          </View>

          {/* Company Name */}
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.textSecondary }, isRTL && { textAlign: 'right' }]}>
              {t('Company Name')}
            </Text>
            <TouchableOpacity
              style={[
                styles.inputWrapper,
                {
                  backgroundColor: colors.backgroundSecondary,
                  borderColor: colors.border,
                },
                isRTL && { flexDirection: 'row-reverse' }
              ]}
              onPress={() => isEditing && setShowCompanyModal(true)}
              disabled={!isEditing}
            >
              <CompanyBuildingIcon size={18} color={colors.gray600} />
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.inputText,
                    {
                      color: formData.companyName
                        ? colors.textPrimary
                        : colors.gray400,
                    },
                    isRTL && { textAlign: 'right', marginRight: 12, marginLeft: 0 }
                  ]}
                >
                  {formData.companyName || t('Company Name')}
                </Text>
              </View>
              {isEditing && (
                <DropdownFormIcon size={18} color={colors.textPrimary} />
              )}
            </TouchableOpacity>
          </View>

          {/* Designation */}
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.textSecondary }, isRTL && { textAlign: 'right' }]}>
              {t('Designation')}
            </Text>
            <View
              style={[
                styles.inputWrapper,
                {
                  backgroundColor: colors.backgroundSecondary,
                  borderColor: colors.border,
                },
                isRTL && { flexDirection: 'row-reverse' }
              ]}
            >
              <DesignationIcon size={18} color={colors.gray600} />
              <TextInput
                style={[
                  styles.input, 
                  { color: colors.textPrimary },
                  isRTL && { textAlign: 'right', marginRight: 12, marginLeft: 0 }
                ]}
                value={formData.designation}
                onChangeText={text =>
                  setFormData({ ...formData, designation: text })
                }
                placeholder={t('Designation')}
                placeholderTextColor={colors.gray400}
                editable={isEditing}
              />
            </View>
          </View>

          {/* Employee Code */}
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.textSecondary }, isRTL && { textAlign: 'right' }]}>
              {t('Employee Code')}
            </Text>
            <View
              style={[
                styles.inputWrapper,
                {
                  backgroundColor: colors.backgroundSecondary,
                  borderColor: colors.border,
                },
                isRTL && { flexDirection: 'row-reverse' }
              ]}
            >
              <EmployeeCodeIcon size={18} color={colors.gray600} />
              <TextInput
                style={[
                  styles.input, 
                  { color: colors.textPrimary },
                  isRTL && { textAlign: 'right', marginRight: 12, marginLeft: 0 }
                ]}
                value={formData.employeeCode}
                onChangeText={text =>
                  setFormData({ ...formData, employeeCode: text })
                }
                placeholder={t('Code')}
                placeholderTextColor={colors.gray400}
                editable={isEditing}
              />
            </View>
          </View>

          {/* QID (Optional) */}
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.textSecondary }, isRTL && { textAlign: 'right' }]}>
              {t('QID')}{' '}
              <Text style={[styles.optional, { color: colors.gray500 }]}>
                {t('Optional')}
              </Text>
            </Text>
            <View
              style={[
                styles.inputWrapper,
                {
                  backgroundColor: colors.backgroundSecondary,
                  borderColor: colors.border,
                },
                isRTL && { flexDirection: 'row-reverse' }
              ]}
            >
              <QIDIcon size={18} color={colors.gray600} />
              <TextInput
                style={[
                  styles.input, 
                  { color: colors.textPrimary },
                  isRTL && { textAlign: 'right', marginRight: 12, marginLeft: 0 }
                ]}
                value={formData.qid}
                onChangeText={text => setFormData({ ...formData, qid: text })}
                placeholder={t('Code')}
                placeholderTextColor={colors.gray400}
                editable={isEditing}
              />
            </View>
          </View>
        </View>

        {/* Save Button - Shows when editing */}
        {isEditing && (
          <View style={styles.saveButtonContainer}>
            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: colors.primary }]}
              onPress={handleEdit}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={[styles.saveButtonText, { color: colors.white }]}>
                  {t('Save Changes')}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Company Modal */}
      <Modal
        visible={showCompanyModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCompanyModal(false)}
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
                {t('Select Company')}
              </Text>
              <TouchableOpacity onPress={() => setShowCompanyModal(false)}>
                <Text style={[styles.modalClose, { color: colors.gray600 }]}>
                  ✕
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalList}>
              {employers.map((employer: any) => (
                <TouchableOpacity
                  key={employer.id}
                  style={[
                    styles.modalItem,
                    { borderBottomColor: colors.border },
                  ]}
                  onPress={() => handleCompanySelect(employer)}
                >
                  <Text
                    style={[
                      styles.modalItemText,
                      { color: colors.textPrimary },
                    ]}
                  >
                    {employer.employer_name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: typography.fontFamily.semiBold,
  },
  editButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: typography.fontFamily.interSemiBold,
    marginRight: 12,
  },
  sectionDivider: {
    flex: 1,
    height: 1,
  },
  inputContainer: {
    marginBottom: 16,
    position: 'relative',
  },
  label: {
    fontSize: 14,
    fontFamily: typography.fontFamily.interSemiBold,
    marginBottom: 8,
  },
  optional: {
    fontFamily: typography.fontFamily.interRegular,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 100,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: typography.fontFamily.interRegular,
    padding: 0,
  },
  inputText: {
    fontSize: 16,
    fontFamily: typography.fontFamily.interRegular,
  },
  placeholder: {},
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    borderWidth: 1,
    borderRadius: 12,
    marginTop: 4,
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  dropdownItemText: {
    fontSize: 16,
    fontFamily: typography.fontFamily.interRegular,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: typography.fontFamily.semiBold,
  },
  modalClose: {
    fontSize: 24,
  },
  modalList: {
    maxHeight: 400,
  },
  modalItem: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  modalItemText: {
    fontSize: 16,
    fontFamily: typography.fontFamily.interRegular,
  },
  saveButtonContainer: {
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 16,
  },
  saveButton: {
    paddingVertical: 16,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: typography.fontFamily.semiBold,
  },
});
