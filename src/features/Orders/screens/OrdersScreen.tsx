import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../../hooks/useTheme';
import { colors, typography } from '../../../theme';
import ChevronLeftIcon from '../../../components/icons/ChevronLeftIcon';
import ChevronRightIcon from '../../../components/icons/ChevronRightIcon';
import { CalendarFormIcon } from '../../../components/icons/FormIcons';
import { BASE_URL } from '../../../services/api/baseUrl';
import { useAppSelector } from '../../../state/hooks';
import { useGetOrdersByDateMutation } from '../../../services/api/ordersApi';
import { useGetPreorderSettingsQuery } from '../../../services/api/homeApi';
import { CalendarDropdown } from '../../../components/common/CalendarDropdown';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';

export const OrdersScreen = () => {
  const navigation = useNavigation();
  const { colors,isDark } = useTheme();
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const { employeeId } = useAppSelector(state => state.auth);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch preorder settings to get max preorder date
  const { data: preorderSettingsResp } = useGetPreorderSettingsQuery();
  
  // Parse max_preorder_date correctly (format: YYYY-MM-DD)
  const maxDateForCalendar = preorderSettingsResp?.max_preorder_date
    ? (() => {
        const dateStr = preorderSettingsResp.max_preorder_date;
        const [year, month, day] = dateStr.split('-').map(Number);
        return new Date(year, month - 1, day); // month is 0-indexed
      })()
    : undefined;

  // Format date for API (using local timezone, not UTC)
  const formatDateForAPI = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formattedDate = formatDateForAPI(selectedDate);

  // Fetch orders from API using mutation
  const [getOrders, { data: ordersResponse, isLoading }] = useGetOrdersByDateMutation();

  // Fetch orders when component mounts or date changes
  useEffect(() => {
    if (employeeId) {
      getOrders({
        employee_id: employeeId,
        order_date: formattedDate,
      });
    }
  }, [employeeId, formattedDate]);

  const ordersData = ordersResponse?.data;
  const orders = ordersData?.orders || [];

  // Handle pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    if (employeeId) {
      await getOrders({
        employee_id: employeeId,
        order_date: formattedDate,
      });
    }
    setRefreshing(false);
  };

  // Status color mapping
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid':
        return colors.skyBlue;
      case 'Pending':
        return colors.amber;
      case 'Out for Delivery':
        return colors.skyBlue;
      case 'Processing':
        return colors.orengeDeep;
      case 'Ready for Pickup':
        return colors.greenDeep;
      case 'Cancelled':
        return colors.red;
      default:
        return colors.amber; // Default fallback
    }
  };

  // Status background color mapping (light/pastel versions)
  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'Paid':
        return colors.skyBlueBg;
      case 'Pending':
        return colors.amberBg;
      case 'Out for Delivery':
        return colors.skyBlueBg;
      case 'Processing':
        return colors.orengeDeepBg;
      case 'Ready for Pickup':
        return colors.greenDeepBg;
      case 'Cancelled':
        return colors.redBg;
      default:
        return colors.amberBg;
    }
  };


  // Get display text for status
  const getStatusDisplayText = (status: string) => {
    switch (status) {
      case 'Pending':
        return t('Pending');
      case 'Paid':
        return t('Paid');
      case 'Processing':
        return t('Processed');
      case 'Out for Delivery':
        return t('Delivered');
      case 'Ready for Pickup':
        return t('Ready');
      case 'Cancelled':
        return t('Cancelled');
      default:
        return status;
    }
  };



  return (
    <SafeAreaView style={[styles.container,{ backgroundColor: isDark ? colors.background : colors.white },]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          {t('My Orders')}
        </Text>

        {/* Date Selector */}
        <View style={styles.dateSelector}>
          <TouchableOpacity
            style={styles.dateArrow}
            onPress={() => {
              const newDate = new Date(selectedDate);
              newDate.setDate(newDate.getDate() - 1);
              setSelectedDate(newDate);
            }}
          >
            <ChevronLeftIcon size={20} color={colors.textPrimary} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.dateTodayButton, { backgroundColor: colors.backgroundSecondary }]}
            onPress={() => setShowDatePicker(!showDatePicker)}
          >
            <CalendarFormIcon size={20} color={colors.textPrimary} />
            <Text style={[styles.dateTodayText, { color: colors.textPrimary }]}>
              {(() => {
                const today = new Date();
                const isToday =
                  selectedDate.getDate() === today.getDate() &&
                  selectedDate.getMonth() === today.getMonth() &&
                  selectedDate.getFullYear() === today.getFullYear();

                if (isToday) {
                  return t('Today');
                }

                const options: Intl.DateTimeFormatOptions = {
                  month: 'short',
                  day: 'numeric',
                };
                return selectedDate.toLocaleDateString('en-US', options);
              })()}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.dateArrow}
            onPress={() => {
              const newDate = new Date(selectedDate);
              newDate.setDate(newDate.getDate() + 1);
              setSelectedDate(newDate);
            }}
          >
            <ChevronRightIcon size={20} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Inline Calendar Dropdown */}
      {showDatePicker && (
        <CalendarDropdown
          selectedDate={selectedDate}
          onSelectDate={(date) => setSelectedDate(date)}
          onClose={() => setShowDatePicker(false)}
          allowPastDates={true}
          maxDate={maxDateForCalendar}
        />
      )}

      {/* Orders List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textTertiary }]}>{t('Loading orders...')}</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
        >
          {orders.length > 0 ? (
            orders.flatMap((order: any) =>
              order.items?.map((item: any) => {
                const productImage = item?.product?.image || '';
                const productName = item?.item_name || '';
                const itemTotal = item?.item_grand_total || 0;
                return (
                  <View key={`${order.id}-${item.id}`} style={[styles.orderCard, { backgroundColor: colors.backgroundSecondary }]}>
                  <Image
                    source={{ uri: productImage ? `${BASE_URL}${productImage}` : '' }}
                    style={[styles.orderImage, { backgroundColor: colors.gray200 }]}
                  />
                  <View style={styles.orderInfo}>
                    <Text style={[styles.orderName, { color: colors.textPrimary }]}>{
                      isArabic && item?.product?.name_ar ? item.product.name_ar : productName
                    }</Text>
                      <Text style={[styles.orderDepartment, { color: colors.textTertiary }]}>{
                        isArabic && item?.product?.department?.name_ar 
                          ? item.product.department.name_ar 
                          : (item?.product?.department?.name_en || '')
                      }</Text>
                      <Text style={[styles.orderPrice, { color: colors.textPrimary }]}>{itemTotal} QAR</Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      { 
                        backgroundColor: getStatusBgColor(order.tracking_status_text),
                         borderWidth: 1,
                         borderColor: getStatusColor(order.tracking_status_text),
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        { color: getStatusColor(order.tracking_status_text) },
                      ]}
                    >
                      {getStatusDisplayText(order.tracking_status_text) || 'Unknown'}
                    </Text>
                  </View>
                </View>
                );
              }) || []
            )
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: colors.textTertiary }]}>{t('No orders for this date')}</Text>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 25,
    fontFamily: typography.fontFamily.medium,
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  dateArrow: {
    padding: 8,
  },
  dateTodayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  dateTodayText: {
    fontSize: 16,
    fontFamily: typography.fontFamily.medium,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  orderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 0,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200, 
    backgroundColor: 'transparent', 
  },
  orderImage: {
    width: 90,
    height: 90,
    borderRadius: 12,
  },
  orderInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  orderName: {
    fontSize: 16,
    fontFamily: typography.fontFamily.interSemiBold,
    marginBottom: 4,
  },
  orderDepartment: {
    fontSize: 11,
    fontFamily: typography.fontFamily.interRegular,
    marginBottom: 6,
  },
  orderPrice: {
    fontSize: 16,
    fontFamily: typography.fontFamily.interSemiBold,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 24,
    minWidth: 80,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  statusText: {
    fontSize: 14,
    fontFamily: typography.fontFamily.interRegular,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontFamily: typography.fontFamily.regular,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: typography.fontFamily.regular,
  },
});
