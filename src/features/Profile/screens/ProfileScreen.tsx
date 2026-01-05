import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  StatusBar,
  ImageBackground,
  I18nManager,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { typography } from '../../../theme';
import { useAppSelector, useAppDispatch } from '../../../state/hooks';
import { useProfileQuery, useGetLoyaltyPointsQuery, useGetAllowancesQuery } from '../../../services/api/homeApi';
import { performLogout } from '../../../utils/auth';
import { BackIcon } from '../../../components/icons/BackIcon';
import { HelpIcon } from '../../../components/icons/HelpIcon';
import { WalletIcon } from '../../../components/icons/WalletIcon';
import { LoyaltyIcon } from '../../../components/icons/LoyaltyIcon';
import { ProfileFormIcon } from '../../../components/icons/FormIcons';
import ChevronRightIcon from '../../../components/icons/ChevronRightIcon';
import { OrderHistoryIcon } from '../../../components/icons/OrderHistoryIcon';
import { LanguageIcon } from '../../../components/icons/LanguageIcon';
import { SettingsIcon } from '../../../components/icons/SettingsIcon';
import { AboutIcon } from '../../../components/icons/AboutIcon';
import { HelpMenuIcon } from '../../../components/icons/HelpMenuIcon';
import { LogoutIcon } from '../../../components/icons/LogoutIcon';
import { FeedbackIcon } from '../../../components/icons/FeedbackIcon';
import { PrivacySecurityIcon } from '../../../components/icons/PrivacySecurityIcon';
import { useTheme } from '../../../hooks/useTheme';

export const ProfileScreen = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const { i18n, t } = useTranslation();
  const { employeeId } = useAppSelector(state => state.auth);
  const { colors, isDark } = useTheme();

  const { data: profileResp } = useProfileQuery(employeeId || 0);
  const profile = profileResp?.data;

  // Fetch loyalty points
  const { data: loyaltyResp } = useGetLoyaltyPointsQuery(employeeId || 0);
  const loyaltyPoints = loyaltyResp?.data?.total_loyalty_points || 0;

  // Helper to format today's date for API (YYYY-MM-DD)
  const getTodayFormatted = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Fetch allowance for accurate wallet balance (same API as HomeScreen)
  const { data: allowanceResp } = useGetAllowancesQuery(
    {
      employee_id: employeeId || 0,
      Preorder_date: getTodayFormatted(),
    },
    {
      skip: !employeeId,
    }
  );
  const remainingAllowance = allowanceResp?.data?.remaining_allowance ?? 0;

  const isRTL = i18n.language === 'ar';
  const profileName = isRTL
    ? profile?.name_ar || profile?.name_en || ''
    : profile?.name_en || '';
  
  const profileDesignation = isRTL
    ? profile?.designation_ar || profile?.designation
    : profile?.designation_en || profile?.designation

  const handleLogout = async () => {
    Alert.alert(
      t('Logout'),
      t('Are you sure you want to logout?'),
      [
        {
          text: t('No'),
          style: 'cancel',
        },
        {
          text: t('Yes'),
          onPress: async () => {
            await performLogout(dispatch);
          },
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
  };

  const handleBack = () => navigation.goBack();

  const menuItems = [
    {
      icon: 'person-outline',
      customIcon: <ProfileFormIcon size={24} color={colors.textPrimary} />,
      label: t('Personal Info'),
      onPress: () => navigation.navigate('PersonalInfo'),
    },
    {
      icon: 'receipt-outline',
      customIcon: <OrderHistoryIcon size={24} color={colors.textPrimary} />,
      label: t('Order History'),
      onPress: () => navigation.navigate('OrderHistory'),
    },
    {
      icon: 'settings-outline',
      customIcon: <SettingsIcon size={24} color={colors.textPrimary} />,
      label: t('Settings'),
      onPress: () => navigation.navigate('Settings'),
    },
    {
      icon: 'globe-outline',
      customIcon: <LanguageIcon size={24} color={colors.textPrimary} />,
      label: t('Language'),
      onPress: () => navigation.navigate('Language'),
    },
    {
      icon: 'information-circle-outline',
      customIcon: <AboutIcon size={24} color={colors.textPrimary} />,
      label: t('About'),
      onPress: () => navigation.navigate('About'),
    },

    {
      icon: 'help-circle-outline',
      customIcon: <HelpMenuIcon size={24} color={colors.textPrimary} />,
      label: t('Help'),
      onPress: () => navigation.navigate('Help'),
    },

  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header Section with Background Image */}
        <ImageBackground
          source={require('../../../assets/images/homeBg.png')}
          style={[styles.header, { paddingTop: insets.top + 10 }]}
          resizeMode="cover"
        >
          {/* Header Actions */}
          <View style={[styles.headerActions, isRTL && { flexDirection: 'row-reverse' }]}>
            <View style={[styles.headerLeft, isRTL && { flexDirection: 'row-reverse' }]}>
              <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                <BackIcon size={40} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={[styles.headerTitle, isRTL && { textAlign: 'right', writingDirection: 'rtl' }]}>
                {isRTL ? 'الملف الشخصي' : 'Profile'}
              </Text>
            </View>

            <TouchableOpacity 
              style={styles.helpButton}
              onPress={() => navigation.navigate('Feedback')}
            >
              <HelpIcon size={40} />
            </TouchableOpacity>
          </View>

          {/* Profile Info */}
          <View style={styles.profileSection}>
            <View
              style={[styles.profileContent, isRTL && styles.profileContentRTL]}
            >
              <View style={[
                styles.avatarContainer,
                isRTL && { marginRight: 0, marginLeft: 12 }
              ]}>
                {profile?.photo ? (
                  <Image
                    source={{ uri: profile.photo }}
                    style={styles.avatar}
                  />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarInitial}>
                      {profileName.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}
              </View>
              <View style={[
                styles.profileTextContainer,
                isRTL && { alignItems: 'flex-end' }
              ]}>
                <Text style={[
                  styles.name, 
                  isRTL && { textAlign: 'right', writingDirection: 'rtl' }
                ]}>{profileName}</Text>
                <Text style={[
                  styles.profession, 
                  isRTL && { textAlign: 'right', writingDirection: 'rtl' }
                ]}>
                  {profileDesignation}
                </Text>
              </View>
            </View>
          </View>

          {/* Wallet & Loyalty Points Card */}
          <View
            style={[
              styles.statsCard,
              { backgroundColor: colors.allowanceProgressBg },
            ]}
          >
            <TouchableOpacity
              style={styles.statItem}
              onPress={() => navigation.navigate('Allowance')}
              activeOpacity={0.7}
            >
              <View style={styles.iconContainer}>
                <WalletIcon size={32} />
              </View>
              <View style={styles.statTextContainer}>
                <Text
                  style={[
                    styles.statLabel,
                    { color: isDark ? '#D4A574' : colors.primary },
                  ]}
                >
                  {t('Wallet')}
                </Text>
                <Text
                  style={[
                    styles.statValue,
                    { color: isDark ? '#D4A574' : colors.primary },
                  ]}
                >
                  {remainingAllowance}{' '}
                  <Text
                    style={[
                      styles.statUnit,
                      { color: isDark ? '#D4A574' : colors.primary },
                    ]}
                  >
                    QAR
                  </Text>
                </Text>
              </View>
            </TouchableOpacity>

            <View
              style={[styles.divider, { backgroundColor: colors.border }]}
            />

            <TouchableOpacity
              style={styles.statItem}
              onPress={() => navigation.navigate('LoyaltyPoints')}
              activeOpacity={0.7}
            >
              <View style={styles.iconContainer}>
                <LoyaltyIcon size={32} />
              </View>
              <View style={styles.statTextContainer}>
                <Text
                  style={[
                    styles.statLabel,
                    { color: isDark ? '#D4A574' : colors.primary },
                  ]}
                >
                  {t('Loyalty Points')}
                </Text>
                <Text
                  style={[
                    styles.statValue,
                    { color: isDark ? '#D4A574' : colors.primary },
                  ]}
                >
                  {loyaltyPoints}{' '}
                  <Text
                    style={[
                      styles.statUnit,
                      { color: isDark ? '#D4A574' : colors.primary },
                    ]}
                  >
                    {t('Points')}
                  </Text>
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </ImageBackground>

        {/* Menu Section */}
        <View
          style={[
            styles.menuSection,
            { backgroundColor: isDark ? colors.background : colors.bgLight },
          ]}
        >
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.menuItem,
                {
                  backgroundColor: colors.backgroundSecondary,
                  shadowColor: isDark ? '#000' : '#000',
                  shadowOpacity: isDark ? 0.3 : 0.04,
                },
              ]}
              onPress={item.onPress}
            >
              <View style={styles.menuItemLeft}>
                {item.customIcon}
                <Text
                  style={[styles.menuItemText, { color: colors.textPrimary }]}
                >
                  {item.label}
                </Text>
              </View>
              <ChevronRightIcon size={16} color={colors.primary} />
            </TouchableOpacity>
          ))}

          {/* Logout Button */}
          <TouchableOpacity
            style={[
              styles.logoutButton,
            ]}
            onPress={handleLogout}
          >
            <LogoutIcon size={24} color={colors.error} />
            <Text style={styles.logoutText}>{t('Log out')}</Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </View>
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
  header: {
    paddingBottom: 30,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: typography.fontFamily.semiBold,
    color: '#FFFFFF',
  },
  helpButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
    marginTop: 5,
  },
  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileContentRTL: {
    flexDirection: 'row-reverse',
  },
  avatarContainer: {
    width: 68,
    height: 68,
    borderRadius: 35,
    backgroundColor: '#FFFFFF',
    padding: 3,
    marginRight: 12,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
    backgroundColor: '#8B7355',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontSize: 28,
    fontFamily: typography.fontFamily.semiBold,
    color: '#FFFFFF',
  },
  profileTextContainer: {
    flex: 1,
  },
  name: {
    fontSize: 24,
    fontFamily: typography.fontFamily.semiBold,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  profession: {
    fontSize: 14,
    fontFamily: typography.fontFamily.interRegular,
    color: 'rgba(255,255,255,0.8)',
  },
  statsCard: {
    borderRadius: 100,
    marginHorizontal: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginTop: 10,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statTextContainer: {
  },
  statLabel: {
    fontSize: 11,
    fontFamily: typography.fontFamily.regular,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontFamily: typography.fontFamily.interBold,
    fontWeight: '700',
  },
  statUnit: {
    fontSize: 11,
    fontFamily: typography.fontFamily.interRegular,
  },
  divider: {
    width: 1,
    height: 40,
    marginHorizontal: 16,
  },
  menuSection: {
    paddingTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 100,
    marginBottom: 12,
    borderBottomWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 0.5,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 14,
    fontFamily: typography.fontFamily.interRegular,
    marginLeft: 12,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 100,
    gap: 12,
    marginTop: 12,
    justifyContent:'center'
  },
  logoutText: {
    fontSize: 14,
    fontFamily: typography.fontFamily.medium,
    color: '#EF4444',
  },
});
