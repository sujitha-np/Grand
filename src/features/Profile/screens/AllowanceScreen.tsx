import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  ImageBackground,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../hooks/useTheme';
import { typography } from '../../../theme';
import { useAppSelector } from '../../../state/hooks';
import { useGetAllowanceUsageQuery, useProfileQuery } from '../../../services/api/homeApi';
import { BackIcon } from '../../../components/icons/BackIcon';
import { UserAvatarIcon } from '../../../components/icons/UserAvatarIcon';
import Icon from 'react-native-vector-icons/Ionicons';
import ChevronRightIcon from '@components/icons/ChevronRightIcon';
import { useTranslation } from 'react-i18next';

export const AllowanceScreen = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const { employeeId } = useAppSelector(state => state.auth);
  const { i18n, t } = useTranslation();

  console.log('🔍 AllowanceScreen - employeeId:', employeeId);

  const { data: allowanceResp, isLoading, error, refetch } = useGetAllowanceUsageQuery(
    employeeId || 0,
    {
      skip: !employeeId, // Skip query if no employeeId
    }
  );
  const allowanceData = allowanceResp?.data;

  // Refetch data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      if (employeeId) {
        refetch();
      }
    }, [employeeId, refetch])
  );

  const { data: profileResp } = useProfileQuery(employeeId || 0);
  const profile = profileResp?.data;

  const isRTL = i18n.language === 'ar';
  const profileName = isRTL
    ? profile?.name_ar || profile?.name_en || 'User'
    : profile?.name_en || 'User';

  console.log('📊 AllowanceScreen - Query State:', {
    isLoading,
    hasData: !!allowanceResp,
    allowanceData,
    error,
  });

  const handleBack = () => navigation.goBack();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    
    // Check if the date is today
    const isToday = 
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
    
    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'short' });
    
    return isToday ? `Today ${day} ${month}` : `${day} ${month}`;
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: isDark ? colors.background : colors.bgLight },]}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header Section with Background Image */}
        <ImageBackground
          source={require('../../../assets/images/allowance.png')}
          style={[styles.header, { paddingTop: insets.top + 10 }]}
          resizeMode="cover"
        >
          {/* Back Button and Title Row */}
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <BackIcon size={32} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{t('Allowance')}</Text>
          </View>

          {/* Allowance Amount Card */}
          <View style={styles.allowanceCard}>
            <View style={styles.amountRow}>
              <Text style={styles.allowanceAmount}>
                {allowanceData?.remaining_allowance_today || '0'}
              </Text>
              <Text style={styles.allowanceCurrency}>QAR</Text>
            </View>
            <Text style={styles.allowanceSubtext}>
              {t('Daily Allowance')}: {allowanceData?.daily_meal_allowance || '0.00'}{' '}
              QAR
            </Text>
            <Text style={styles.allowanceSubtext}>
              {t('Used Today')}: {allowanceData?.total_allowance_used_today || '0'} QAR
            </Text>
          </View>
        </ImageBackground>

        {/* Allowance Usage Section */}
        <View
          style={[
            styles.usageSection,
            { backgroundColor: colors.backgroundSecondary },
          ]}
        >
          <View style={styles.usageTitleContainer}>
            <Text style={[styles.usageTitle, { color: colors.textPrimary }]}>
              {t('Allowance Usage')}
            </Text>
          </View>

          {/* Order List */}
          {allowanceData?.orders && allowanceData.orders.length > 0 ? (
            allowanceData.orders.map((order: any) => (
              <View
                key={order.id}
                style={[
                  styles.orderItem,
                  {
                    backgroundColor: colors.backgroundSecondary,
                  },
                ]}
              >
                <View style={styles.orderLeft}>
                  <UserAvatarIcon size={45} />
                  <View style={styles.orderInfo}>
                    <Text
                      style={[styles.orderName, { color: colors.textPrimary }]}
                    >
                      {profileName}
                    </Text>
                    <Text
                      style={[
                        styles.orderDate,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {formatDate(order.order_date)}
                    </Text>
                  </View>
                </View>
                <Text
                  style={[styles.orderAmount, { color: colors.textPrimary }]}
                >
                  {order.allowance_amount} QAR
                </Text>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                {t('No orders today')}
              </Text>
            </View>
          )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 60,
    gap: 12,
  },
  backButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 25,
    fontFamily: 'PlayfairDisplay-Bold',
    color: '#FFFFFF',
  },
  allowanceCard: {
    borderRadius: 24,
    alignItems: 'center',
    marginBottom: 10,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  allowanceAmount: {
    fontSize: 64,
    fontFamily: typography.fontFamily.interBold,
    color: '#FFFFFF',
    letterSpacing: -2,
    fontWeight: '500',

  },
  allowanceCurrency: {
    fontSize: 36,
    fontFamily: typography.fontFamily.interBold,
    color:'#FFFFFF',
    fontWeight:'500'
  },
  allowanceSubtext: {
    fontSize: 15,
    fontFamily: typography.fontFamily.interRegular,
    color: '#FFFFFF',
    marginTop: 4,
  },
  usageSection: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 40,
  },
  usageTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  usageTitle: {
    fontSize: 20,
    fontFamily: typography.fontFamily.interSemiBold,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  seeAllText: {
    fontSize: 14,
    fontFamily: typography.fontFamily.interRegular,
  },
  questionMark: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  questionText: {
    fontSize: 12,
    fontFamily: typography.fontFamily.semiBold,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  orderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  orderInfo: {
    flex: 1,
  },
  orderName: {
    fontSize: 15,
    fontFamily: typography.fontFamily.medium,
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 13,
    fontFamily: typography.fontFamily.interRegular,
  },
  orderAmount: {
    fontSize: 15,
    fontFamily: typography.fontFamily.interRegular,
    fontWeight:'500'
  },
  emptyState: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontFamily: typography.fontFamily.interRegular,
  },
});
