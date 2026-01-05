import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../../hooks/useTheme';
import { colors, typography } from '../../../theme';
import ChevronLeftIcon from '../../../components/icons/ChevronLeftIcon';
import ChevronRightIcon from '../../../components/icons/ChevronRightIcon';
import { CalendarFormIcon } from '../../../components/icons/FormIcons';
import DeleteIcon from '../../../components/icons/DeleteIcon';
import { BASE_URL } from '../../../services/api/baseUrl';
import { useAppSelector } from '../../../state/hooks';
import { useGetAllowancesQuery, useGetPreorderSettingsQuery } from '../../../services/api/homeApi';
import { CalendarDropdown } from '../../../components/common/CalendarDropdown';
import { Button } from '../../../components/common/Button';
import { showSuccessToast, showErrorToast } from '../../../utils/toast';
import { useTranslation } from 'react-i18next';
import { useGetCartListQuery, useUpdateCartQuantityMutation, usePlaceOrderMutation, useRemoveFromCartMutation } from '../../../services/api/cartApi';

export const CartScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { colors,isDark } = useTheme();
  const { employeeId } = useAppSelector(state => state.auth);
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  
  // Helper to get tomorrow's date (users can only order for future dates)
  const getTomorrow = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  };

  // Min date is tomorrow (today and past dates are disabled)
  const minDateForCalendar = getTomorrow();
  
  // Get preorderDate from navigation params, or use tomorrow's date
  const getInitialDate = () => {
    const preorderDateParam = route.params?.preorderDate;
    if (preorderDateParam) {
      try {
        // Parse the date string (YYYY-MM-DD) to create a Date object
        const [year, month, day] = preorderDateParam.split('-').map(Number);
        if (year && month && day) {
          const parsedDate = new Date(year, month - 1, day);
          // Ensure the date is not before tomorrow
          const tomorrow = getTomorrow();
          if (parsedDate >= tomorrow) {
            return parsedDate;
          }
        }
      } catch (error) {
        console.error('Error parsing preorder date:', error);
      }
    }
    return getTomorrow(); // Default to tomorrow instead of today
  };

  const [selectedDate, setSelectedDate] = useState(getInitialDate());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Update selectedDate when screen gains focus (more reliable than just useEffect)
  // This ensures the date is always synced when navigating from Home screen
  useFocusEffect(
    React.useCallback(() => {
      const preorderDateParam = route.params?.preorderDate;
      if (preorderDateParam) {
        try {
          const [year, month, day] = preorderDateParam.split('-').map(Number);
          if (year && month && day) {
            const newDate = new Date(year, month - 1, day);
            // Ensure the date is not before tomorrow
            const tomorrow = getTomorrow();
            if (newDate >= tomorrow) {
              setSelectedDate(newDate);
            }
          }
        } catch (error) {
          console.error('Error parsing preorder date in useFocusEffect:', error);
        }
      }
    }, [route.params?.preorderDate])
  );

  // Format date for API (using local timezone, not UTC)
  const formatDateForAPI = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formattedDate = formatDateForAPI(selectedDate);

  // Fetch cart data from API
  const { data: cartResponse, isLoading, error, refetch } = useGetCartListQuery(
    {
      employee_id: employeeId || 0,
      preorder_date: formattedDate,
    },
    {
      skip: !employeeId,
    }
  );

  // Fetch allowance data from API
  const { data: allowanceResponse, refetch: refetchAllowance } = useGetAllowancesQuery(
    {
      employee_id: employeeId || 0,
      Preorder_date: formattedDate,
    },
    {
      skip: !employeeId,
    }
  );

  // Fetch preorder settings to get max preorder date
  const { data: preorderSettingsResp } = useGetPreorderSettingsQuery();
  
  // Parse max_preorder_date correctly (format: YYYY-MM-DD)
  // Using new Date(string) parses as UTC which can cause timezone issues
  // So we parse it manually to get local date
  const maxDateForCalendar = preorderSettingsResp?.max_preorder_date
    ? (() => {
        const dateStr = preorderSettingsResp.max_preorder_date;
        const [year, month, day] = dateStr.split('-').map(Number);
        return new Date(year, month - 1, day); // month is 0-indexed
      })()
    : undefined;

  const cartData = cartResponse?.data;
  const carts = cartData?.carts || [];
  const currentCart = carts[0];
  const cartItems = currentCart?.items || [];
  
  // Get allowance data - prioritize cart API (date-specific) over allowance API (always today)
  const allowanceData = allowanceResponse?.data;
  const dailyAllowanceStr = currentCart?.daily_allowance || allowanceData?.daily_meal_allowance || '0';
  const subtotalStr = currentCart?.subtotal || '0';
  const remainingAllowanceStr = currentCart?.remaining_allowance ?? allowanceData?.remaining_allowance ?? '0';
  const usedAllowanceStr = currentCart?.used_allowance ?? allowanceData?.used_allowance ?? '0';
  const extraPaymentStr = currentCart?.extra_payment || '0';
  
  // Keep numeric values for calculations (for progress bar)
  const dailyAllowance = parseFloat(String(dailyAllowanceStr));
  const usedAllowance = parseFloat(String(usedAllowanceStr));
  const remainingAllowance = parseFloat(String(remainingAllowanceStr));
  const subtotal = parseFloat(String(subtotalStr));

  const getDateDisplay = () => {
    const today = new Date();
    const isToday =
      selectedDate.getDate() === today.getDate() &&
      selectedDate.getMonth() === today.getMonth() &&
      selectedDate.getFullYear() === today.getFullYear();

    if (isToday) return t('Today');

    const options: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
    };
    return selectedDate.toLocaleDateString('en-US', options);
  };

  // Place order mutation
  const [placeOrder, { isLoading: isPlacingOrder }] = usePlaceOrderMutation();

  // Handle checkout
  const handleCheckout = async () => {
    if (!employeeId || !currentCart?.cart_id) {
      showErrorToast(t('Unable to process checkout. Please try again.'));
      return;
    }

    try {
      const result = await placeOrder({
        employee_id: employeeId,
        cart_id: currentCart.cart_id,
      }).unwrap();

      // Check if payment is required
      if (result.requires_payment && result.data?.payment_url) {
        // Payment is required - navigate to PaymentWebView
        // Pass cart data so we can restore it if payment is cancelled
        (navigation as any).navigate('PaymentWebView', {
          payment_url: result.data.payment_url,
          order_id: result.data.order_id,
          amount: result.data.extra_payment,
          cartItems: cartItems, // Pass current cart items for potential restoration
          cartData: currentCart, // Pass full cart data
        });
      } else {
        // No payment required - order is complete
        showSuccessToast(t('Order placed successfully!'));
        
        // Refetch allowance to get updated values after order placement
        await refetchAllowance();
        
        // Navigate to Home screen
        navigation.navigate('Home' as never);
      }
    } catch (error: any) {
      // Show error message - use translation for proper localization
      showErrorToast(t('Failed to place order. Please try again.'));
    }
  };


  // Update cart quantity mutation
  const [updateCartQuantity, { isLoading: isUpdatingQuantity }] = useUpdateCartQuantityMutation();
  const [updatingProductId, setUpdatingProductId] = useState<number | null>(null);

  const updateQuantity = async (item: any, delta: number) => {
    if (!employeeId || !currentCart?.cart_id) return;

    const newQuantity = item.quantity + delta;
    
    // Don't allow quantity to go below 1
    if (newQuantity < 1) {
      return;
    }

    try {
      setUpdatingProductId(item.product_id);

      await updateCartQuantity({
        employee_id: employeeId,
        cart_id: currentCart.cart_id,
        product_id: item.product_id,
        quantity: newQuantity,
      }).unwrap();
      
      // Refetch cart data to get updated quantities
      refetch();
    } catch (error: any) {
    } finally {
      setUpdatingProductId(null);
    }
  };

  // Remove from cart mutation
  const [removeFromCart, { isLoading: isRemovingItem }] = useRemoveFromCartMutation();

  const removeItem = async (productId: string) => {
    if (!employeeId || !currentCart?.cart_id) {
      showErrorToast(t('Unable to remove item. Please try again.'));
      return;
    }

    try {
      const result = await removeFromCart({
        employee_id: employeeId,
        cart_id: currentCart.cart_id,
        product_id: parseInt(productId),
      }).unwrap();

      // Show success message - use translation instead of API message for proper localization
      showSuccessToast(t('Product removed from cart successfully!'));
      
      // Refetch cart data after removal
      refetch();
    } catch (error: any) {
      // Show error message - use translation for proper localization
      showErrorToast(t('Failed to remove item. Please try again.'));
    }
  };

  // NOTE: Commenting out auto-refetch on focus to prevent showing empty cart
  // when user returns from canceled payment. The backend clears cart when
  // placeOrder is called, even if payment hasn't completed yet.
  // Users can still pull-to-refresh manually to update cart.
  // 
  // TODO: Remove this workaround once backend is fixed to only clear cart
  // after successful payment confirmation.
  //
  // useFocusEffect(
  //   React.useCallback(() => {
  //     refetch();
  //   }, [])
  // );

  // Handle pull-to-refresh
  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } catch (error) {
      console.error('Error refreshing cart:', error);
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  return (
    <SafeAreaView style={[styles.container,{ backgroundColor: isDark ? colors.background : colors.bgLight }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header]}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>{t('My Cart')}</Text>

        <View style={styles.dateSelector}>
          <TouchableOpacity 
            style={styles.dateArrow}
            onPress={() => {
              const newDate = new Date(selectedDate);
              newDate.setDate(newDate.getDate() - 1);
              
              // Check if date is at or after tomorrow (min date)
              const tomorrow = getTomorrow();
              tomorrow.setHours(0, 0, 0, 0);
              const dateToCheck = new Date(newDate);
              dateToCheck.setHours(0, 0, 0, 0);
              
              if (dateToCheck >= tomorrow) {
                setSelectedDate(newDate);
              }
            }}
            disabled={(() => {
              const tomorrow = getTomorrow();
              tomorrow.setHours(0, 0, 0, 0);
              const current = new Date(selectedDate);
              current.setHours(0, 0, 0, 0);
              return current <= tomorrow;
            })()}
          >
            <ChevronLeftIcon 
              size={20} 
              color={(() => {
                const tomorrow = getTomorrow();
                tomorrow.setHours(0, 0, 0, 0);
                const current = new Date(selectedDate);
                current.setHours(0, 0, 0, 0);
                return current > tomorrow ? colors.textPrimary : colors.textTertiary;
              })()} 
            />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.dateTodayButton, { backgroundColor: colors.backgroundTertiary, borderRadius: 8 }]}
            onPress={() => setShowDatePicker(!showDatePicker)}
          >
            <CalendarFormIcon size={18} color={colors.textPrimary} />
            <Text style={[styles.dateTodayText, { color: colors.textPrimary }]}>{getDateDisplay()}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.dateArrow}
            onPress={() => {
              const newDate = new Date(selectedDate);
              newDate.setDate(newDate.getDate() + 1);
              // Check against max date
              if (!maxDateForCalendar || newDate <= maxDateForCalendar) {
                setSelectedDate(newDate);
              }
            }}
            disabled={maxDateForCalendar ? selectedDate >= maxDateForCalendar : false}
          >
            <ChevronRightIcon size={20} color={(maxDateForCalendar && selectedDate >= maxDateForCalendar) ? colors.textTertiary : colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Inline Calendar Dropdown */}
      {showDatePicker && (
        <CalendarDropdown
          selectedDate={selectedDate}
          onSelectDate={(date) => setSelectedDate(date)}
          onClose={() => setShowDatePicker(false)}
          allowFutureDates={true}
          minDate={minDateForCalendar}
          maxDate={maxDateForCalendar}
        />
      )}

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A3428" />
          <Text style={styles.loadingText}>{t('Loading cart...')}</Text>
        </View>
      ) : (
        <>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[colors.primary]}
                tintColor={colors.primary}
              />
            }
          >
            {/* Cart Items */}
            <View style={styles.cartItems}>
              {cartItems.length > 0 ? (
                cartItems.map((item: any, index: number) => {
                  const imageUrl = item.image && `${BASE_URL}${item.image}`;
                  
                  return (
                    <View key={`${item.product_id}-${index}`} style={[styles.cartItem, { borderBottomColor: colors.borderLight }]}>
                      {/* Image on left */}
                      <Image
                        source={{ uri: imageUrl || '' }}
                        style={[styles.itemImage, { backgroundColor: colors.gray200 }]}
                      />

                      {/* Right side content */}
                      <View style={styles.rightContent}>
                        {/* Top: Name and Delete */}
                        <View style={styles.nameRow}>
                          <View style={styles.itemDetails}>
                            <Text style={[styles.itemName, { color: colors.textPrimary }]}>
                              {isArabic && item.product_name_ar ? item.product_name_ar : item.product_name}
                            </Text>
                            <Text style={[styles.itemDepartment, { color: colors.textTertiary }]}>
                              {isArabic && item.department?.name_ar 
                                ? item.department.name_ar 
                                : (item.department_name || item.department?.name_en || t('N/A'))}
                            </Text>
                          </View>
                          <TouchableOpacity
                            style={styles.deleteButton}
                            onPress={() => removeItem(item.product_id)}
                          >
                            <DeleteIcon size={22} color={colors.textPrimary} />
                          </TouchableOpacity>
                        </View>

                        {/* Bottom: Quantity + Price */}
                        <View style={styles.bottomRow}>
                          <View style={[styles.quantityContainer, { backgroundColor: colors.backgroundSecondary, borderColor: colors.borderLight }]}>
                            <TouchableOpacity
                              style={styles.quantityButton}
                              onPress={() => updateQuantity(item, -1)}
                              disabled={updatingProductId === item.product_id}
                            >
                              <Text style={styles.quantityButtonText}>-</Text>
                            </TouchableOpacity>

                            <Text style={[styles.quantityText, { color: colors.textPrimary }]}>{item.quantity}</Text>

                            <TouchableOpacity
                              style={styles.quantityButton}
                              onPress={() => updateQuantity(item, 1)}
                              disabled={updatingProductId === item.product_id}
                            >
                              <Text style={styles.quantityButtonText}>+</Text>
                            </TouchableOpacity>
                          </View>

                          <Text style={[styles.itemPrice, { color: colors.textPrimary }]}>
                            {item.price} QAR
                          </Text>
                        </View>
                      </View>
                    </View>
                  );
                })
              ) : (
                <View style={styles.emptyCart}>
                  <Text style={styles.emptyCartText}>{t('Your cart is empty')}</Text>
                </View>
              )}
            </View>

            {/* Totals Section */}
            {cartItems.length > 0 && (
              <View style={styles.totalsSection}>
                <View style={styles.totalRow}>
                  <Text style={[styles.totalLabel1, { color: colors.textPrimary }]}>{t('Sub Total:')}</Text>
                  <Text style={[styles.totalValue, { color: colors.textPrimary }]}>{subtotalStr} QAR</Text>
                </View>

                <View style={styles.totalRow}>
                  <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>{t('Total Allowance:')}</Text>
                  <Text style={[styles.totalValue, { color: colors.textSecondary }]}>{dailyAllowanceStr} QAR</Text>
                </View>

                <View style={styles.totalRow}>
                  <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>{t('Remaining Allowance:')}</Text>
                  <Text style={[styles.totalValue, { color: colors.textSecondary }]}>{remainingAllowanceStr} QAR</Text>
                </View>

                <View style={styles.totalRow}>
                  <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>{t('Extra Payment:')}</Text>
                  <Text style={[styles.totalValue, { color: colors.textSecondary }]}>
                    {extraPaymentStr} QAR
                  </Text>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Cart-specific Allowance Section with Buttons */}
          <View style={styles.allowanceContainer}>
            <View style={[styles.cartAllowanceCard, { backgroundColor: colors.allowanceCardBg }]}>
              {/* Header: Total with value in gray */}
              <View style={styles.cartAllowanceHeader}>
                <Text
                  style={[
                    styles.cartAllowanceTitle,
                    { color: isDark ? colors.textPrimary : colors.primary, opacity: 0.5 },
                  ]}
                >
                  {t('Total allowance used:')}
                 
                </Text>
                 <Text    style={[
                    styles.cartAllowanceTitle1,
                    { color: isDark ? colors.textPrimary : colors.primary },
                  ]}> {usedAllowanceStr} QAR
                    </Text>
              </View>
              
              {/* Allowance Info */}
              <View style={styles.cartAllowanceInfo}>
                <Text
                  style={[
                    styles.cartAllowanceLabel,
                    { color: isDark ? '#D4A574' : colors.primary },
                  ]}
                >
                  {t('Remaining')}:{' '}
                  <Text
                    style={[
                      styles.cartAllowanceValue,
                      { color: colors.secondary },
                    ]}
                  >
                    {remainingAllowanceStr} QAR
                  </Text>
                </Text>
                <Text
                  style={[
                    styles.cartAllowanceLabel,
                    { color: isDark ? '#D4A574' : colors.primary },
                  ]}
                >
                  {t('Total')}:{' '}
                  <Text
                    style={[
                      styles.cartAllowanceValue,
                      { color: isDark ? '#D4A574' : colors.primary },
                    ]}
                  >
                    {dailyAllowanceStr} QAR
                  </Text>
                </Text>
              </View>
              
              {/* Progress Bar */}
              <View
                style={[
                  styles.cartProgressBar,
                  { backgroundColor: colors.allowanceProgressBg },
                ]}
              >
                <View
                  style={[
                    styles.cartProgressFill,
                    {
                      width: `${dailyAllowance > 0 ? Math.max(0, Math.min((remainingAllowance / dailyAllowance) * 100, 100)) : 0}%`,
                      backgroundColor: colors.allowanceProgressFill,
                    },
                  ]}
                />
              </View>
            </View>

            {/* Button Row - Outside AllowanceCard */}
            {cartItems.length > 0 && (
              <View style={styles.buttonRow}>
                <TouchableOpacity 
                  style={[styles.addMoreButton, { borderColor: colors.primary,backgroundColor:colors.white }]}
                  onPress={() => (navigation as any).navigate('MainTabs', { 
                    screen: 'Home',
                    params: { preorderDate: formattedDate }
                  })}
                >
                  <Text style={[styles.addMoreText, { color: colors.primary }]}>{t('Add More Items')}</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.checkoutButtonNew, { backgroundColor: colors.primary }]}
                  onPress={handleCheckout}
                  disabled={isPlacingOrder}
                >
                  {isPlacingOrder ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.checkoutButtonText}>{t('Proceed to checkout')}</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 25,
    fontFamily: typography.fontFamily.regular,
    color:colors.primary,
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateArrow: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateTodayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  dateTodayText: {
    fontSize: 15,
    fontFamily: typography.fontFamily.interRegular,
    fontWeight: '500',
    color: '#000000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontFamily: typography.fontFamily.interRegular,
    color: colors.textTertiary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 280, // Increased to account for fixed bottom allowance card + button
  },
  cartItems: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  emptyCart: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyCartText: {
    fontSize: 16,
    fontFamily: typography.fontFamily.interRegular,
    color: colors.textTertiary,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
    borderRadius: 0,
    paddingVertical: 14,
    paddingHorizontal: 0,
    marginBottom: 12,
    position: 'relative',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  itemImage: {
    width: 96,
    height: 120,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
  },
  rightContent: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  itemDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  itemName: {
    fontSize: 17,
    fontFamily: typography.fontFamily.interRegular,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  itemDepartment: {
    fontSize: 13,
    fontFamily: typography.fontFamily.interRegular,
    color: '#9CA3AF',
  },
  deleteButton: {
    padding: 4,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 0,
    marginTop: 4,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  quantityButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonText: {
    fontSize: 18,
    fontFamily: typography.fontFamily.interRegular,
    color: '#D97706',
    fontWeight: '500',
  },
  quantityText: {
    fontSize: 15,
    fontFamily: typography.fontFamily.interRegular,
    fontWeight: '600',
    color: '#000000',
    paddingHorizontal: 16,
    minWidth: 32,
    textAlign: 'center',
  },
  quantityContainerReadOnly: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quantityLabel: {
    fontSize: 14,
    fontFamily: typography.fontFamily.interRegular,
    color: '#6B7280',
    fontWeight: '500',
  },
  quantityTextReadOnly: {
    fontSize: 16,
    fontFamily: typography.fontFamily.interRegular,
    fontWeight: '600',
    color: '#000000',
  },
  itemPrice: {
    fontSize: 17,
    fontFamily: typography.fontFamily.interRegular,
    fontWeight: '700',
    color: '#000000',
  },
  totalsSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    // backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel1:{
    fontSize: 19,
    
  },
  totalLabel: {
    fontSize: 17,
    fontFamily: typography.fontFamily.interRegular,
    color: colors.primary,
  },
  totalLabelBold: {
    fontSize: 17,
    fontFamily: typography.fontFamily.interRegular,
    fontWeight: '600',
    color: '#000000',
  },
  totalValue: {
    fontSize: 18,
    fontFamily: typography.fontFamily.interSemiBold,
    fontWeight: '600',
    color: colors.primaryDark,
  },
  totalValueBold: {
    fontSize: 17,
    fontFamily: typography.fontFamily.interRegular,
    fontWeight: '700',
    color: '#000000',
  },
  remainingValue: {
    fontSize: 13,
    fontFamily: typography.fontFamily.interSemiBold,
    fontWeight: '600',
    color: '#D97706',
  },
  // New styles for Figma design
  subTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  subTotalLabel: {
    fontSize: 14,
    fontFamily: typography.fontFamily.interRegular,
    color: '#6B7280',
  },
  subTotalValue: {
    fontSize: 16,
    fontFamily: typography.fontFamily.interSemiBold,
    fontWeight: '600',
    color: '#000000',
  },
  allowanceSection: {
    marginTop: 8,
  },
  allowanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  allowanceItem: {
    flex: 1,
  },
  allowanceLabel: {
    fontSize: 12,
    fontFamily: typography.fontFamily.interRegular,
    color: '#6B7280',
    marginBottom: 4,
  },
  totalAllowanceValue: {
    fontSize: 14,
    fontFamily: typography.fontFamily.interSemiBold,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'right',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#D97706',
    borderRadius: 4,
  },
  allowanceContainer: {
    position: 'absolute',
    bottom: 0, // Position at bottom (button is now inside the card)
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    pointerEvents: 'box-none', // Allow touches to pass through transparent areas
  },
  bottomSection: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
    backgroundColor: '#FFFFFF',
  },
  // Cart-specific allowance card styles
  cartAllowanceCard: {
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cartAllowanceHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: 12,
  },
  cartAllowanceTitle: {
    fontSize: 15,
    fontWeight: '400',
    fontFamily:typography.fontFamily.interRegular
  },
    cartAllowanceTitle1: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily:typography.fontFamily.interRegular
  },
  cartAllowanceInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cartAllowanceLabel: {
    fontSize: 14,
  },
  cartAllowanceValue: {
    fontWeight: '600',
  },
  cartProgressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  cartProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  checkoutButton: {
    marginTop: 16, // Space from progress bar
    backgroundColor:colors.primary,
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 0,
    marginBottom: 32,
    paddingHorizontal: 20,
    gap: 12,
  },
  addMoreButton: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    backgroundColor: 'transparent',
  },
  addMoreText: {
    fontSize: 14,
    fontFamily: typography.fontFamily.medium,
    
  },
  checkoutButtonNew: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkoutButtonText: {
    fontSize: 14,
    fontFamily: typography.fontFamily.medium,
    color: '#FFFFFF',
  },
});

export default CartScreen;
