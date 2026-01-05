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
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../hooks/useTheme';
import { typography } from '../../../theme';
import { useAppSelector } from '../../../state/hooks';
import { useGetLoyaltyPointsQuery, useProfileQuery } from '../../../services/api/homeApi';
import { BackIcon } from '../../../components/icons/BackIcon';
import { UserAvatarIcon } from '../../../components/icons/UserAvatarIcon';
import ChevronRightIcon from '@components/icons/ChevronRightIcon';
import { useTranslation } from 'react-i18next';

export const LoyaltyPointsScreen = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const { employeeId } = useAppSelector(state => state.auth);
  const { i18n, t } = useTranslation();

  const { data: loyaltyResp, isLoading } = useGetLoyaltyPointsQuery(2,
    // employeeId || 0
  );
  const loyaltyData = loyaltyResp?.data;

  const { data: profileResp } = useProfileQuery(employeeId || 0);
  const profile = profileResp?.data;

  const isRTL = i18n.language === 'ar';
  const profileName = isRTL
    ? profile?.name_ar || profile?.name_en || 'User'
    : profile?.name_en || 'User';

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

  const totalPoints = loyaltyData?.total_loyalty_points || '0';
  const pointsHistory = loyaltyData?.points_history || [];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? colors.background : colors.bgLight,
        },
      ]}
    >
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
            <Text style={styles.headerTitle}>{t('Loyalty Points')}</Text>
          </View>

          {/* Loyalty Points Card */}
          <View style={styles.pointsCard}>
            <View style={styles.amountRow}>
              <Text style={styles.pointsAmount}>{totalPoints}</Text>
              <Text style={styles.pointsCurrency}>{t('Points')}</Text>
            </View>
            {/* <Text style={styles.pointsSubtext}>
              Lorem ipsum dolor sit amet, consectetur
            </Text> */}
            {/* <Text style={styles.pointsSubtext}>adipiscing elit, sed do eiusmod.</Text> */}
          </View>
        </ImageBackground>

        {/* Point History Section */}
        <View
          style={[
            styles.historySection,
            { backgroundColor: colors.backgroundSecondary },
          ]}
        >
          <View style={styles.historyTitleContainer}>
            <Text style={[styles.historyTitle, { color: colors.textPrimary }]}>
              {t('Point History')}
            </Text>
          </View>

          {/* Point History List */}
          {pointsHistory.length > 0 ? (
            pointsHistory.map((item: any) => {
              const points = item.points_earned || 0;
              const isPositive = points >= 0;
              const orderUniqueId = item.order?.unique_id || '';
              
              return (
                <View
                  key={item.id}
                  style={[
                    styles.historyItem,
                    { backgroundColor: colors.backgroundSecondary },
                  ]}
                >
                  <View style={styles.historyLeft}>
                    <UserAvatarIcon size={45} />
                    <View style={styles.historyInfo}>
                      <Text
                        style={[styles.historyName, { color: colors.textPrimary }]}
                      >
                        {profileName}
                      </Text>
                      <Text
                        style={[
                          styles.historyDate,
                          { color: colors.textSecondary },
                        ]}
                      >
                        {formatDate(item.created_at)}
                      </Text>
                    </View>
                  </View>
                  <Text
                    style={[
                      styles.historyPoints,
                      {
                        color: isPositive ? colors.successDark : '#EF4444',
                      },
                    ]}
                  >
                    {isPositive ? '+' : ''}{points} {t('Points')}
                  </Text>
                </View>
              );
            })
          ) : (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                {t('No point history')}
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
  pointsCard: {
    borderRadius: 24,
    alignItems: 'center',
    marginBottom: 10,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  pointsAmount: {
    fontSize: 64,
    fontFamily: typography.fontFamily.interBold,
    color: '#FFFFFF',
    letterSpacing: -2,
    fontWeight: '500',
  },
  pointsCurrency: {
    fontSize: 36,
    fontFamily: typography.fontFamily.interBold,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  pointsSubtext: {
    fontSize: 15,
    fontFamily: typography.fontFamily.interRegular,
    color: '#FFFFFF',
    marginTop: 4,
  },
  historySection: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 40,
  },
  historyTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  historyTitle: {
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
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  historyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  historyInfo: {
    flex: 1,
  },
  historyName: {
    fontSize: 15,
    fontFamily: typography.fontFamily.medium,
    marginBottom: 4,
  },
  historyDate: {
    fontSize: 13,
    fontFamily: typography.fontFamily.interRegular,
  },
  historyPoints: {
    fontSize: 15,
    fontFamily: typography.fontFamily.interRegular,
    fontWeight: '500',
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
