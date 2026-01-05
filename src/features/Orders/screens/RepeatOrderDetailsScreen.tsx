import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { typography, colors, spacing } from '../../../theme';
import HeartIcon from '../../../components/icons/HeartIcon';
import CheckmarkIcon from '../../../components/icons/CheckmarkIcon';
import { useGetAllowancesQuery, useAddToWishlistMutation, useRemoveFromWishlistMutation, useGetPreorderSettingsQuery } from '../../../services/api/homeApi';
import { useAddToCartMutation } from '../../../services/api/cartApi';
import { useSelector } from 'react-redux';
import { RootState } from '../../../state/store';
import { BASE_URL } from '../../../services/api/baseUrl';
import { useToast } from '../../../components/common/ToastProvider';
import { useTheme } from '../../../hooks/useTheme';
import { AllowanceCard } from '../../../components/common/AllowanceCard';
import { Header } from '../../../components/common/Header';
import { CalendarDropdown } from '../../../components/common/CalendarDropdown';
import { CalendarFormIcon } from '../../../components/icons/FormIcons';
import ChevronLeftIcon from '../../../components/icons/ChevronLeftIcon';
import ChevronRightIcon from '../../../components/icons/ChevronRightIcon';
import { useTranslation } from 'react-i18next';

// Interfaces
interface Product {
  id: number;
  name_en: string;
  name_ar: string | null;
  image: string;
  price: string;
  offer_price?: string;
  department?: {
      name_en: string;
  };
  category?: {
      name_en: string;
  };
  is_wishlisted?: boolean;
  stock?: number;
}

interface HistoryItem {
  id: number;
  product_id: number;
  item_name: string;
  item_unit: string;
  item_rate: string;
  item_quantity: number;
  item_sub_total: string;
  item_discount: string;
  item_grand_total: string;
  product: Product;
}

export const RepeatOrderDetailsScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { colors: themeColors, isDark } = useTheme();
  const { t } = useTranslation();
  
  const order = route.params?.order;
  
  // State for calendar
  const [showCalendar, setShowCalendar] = useState(false);
  
  // Helper to get tomorrow's date
  const getTomorrow = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  };
  
  // Parse preorder_date from order data if available, otherwise default to tomorrow
  const getInitialDate = () => {
    if (order?.preorder_date) {
      // Parse YYYY-MM-DD format
      const [year, month, day] = order.preorder_date.split('-').map(Number);
      return new Date(year, month - 1, day);
    }
    return getTomorrow();
  };
  const [selectedDate, setSelectedDate] = useState<Date>(getInitialDate());
  
  // Handle both formats: direct items array or items as JSON string
  let items: any[] = [];
  if (order?.items) {
    if (typeof order.items === 'string') {
      try {
        items = JSON.parse(order.items);
      } catch (e) {
        console.error('Failed to parse items:', e);
        items = [];
      }
    } else if (Array.isArray(order.items)) {
      items = order.items;
    }
  }

  const user = useSelector((state: RootState) => state.auth.user);
  const employeeId = user?.id;

  const [addToCart] = useAddToCartMutation();
  const [addToWishlist] = useAddToWishlistMutation();
  const [removeFromWishlist] = useRemoveFromWishlistMutation();
  
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
  
  // Min date is tomorrow (today is disabled)
  const minDateForCalendar = getTomorrow();

  // Helper to format date for API (YYYY-MM-DD)
  const formatDateApi = (date: Date) => {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
  };

  // Allowance Query - use selected date
  const { data: allowancesResp } = useGetAllowancesQuery(
      {
        employee_id: employeeId || 0,
        Preorder_date: formatDateApi(selectedDate),
      },
      {
        skip: !employeeId,
      }
  );
  const allowanceData = allowancesResp?.data;
  const dailyAllowance = parseFloat(allowanceData?.daily_meal_allowance || '0');
  const remainingAllowance = parseFloat(allowanceData?.remaining_allowance || '0');

  const { show: showToast } = useToast();

  const handleBack = () => {
    navigation.goBack();
  };

  const handleAddToCart = async (product: Product) => {
      if (!employeeId) return;
      try {
        const preorderDate = formatDateApi(new Date()); // Add for Today
        await addToCart({
            employee_id: employeeId,
            product_id: product.id,
            quantity: 1,
            preorder_date: preorderDate,
        }).unwrap();
        showToast('Added to cart', 'success');
        navigation.navigate('Cart', { preorderDate });
      } catch (error) {
          showToast('Failed to add to cart', 'error');
      }
  };

   const toggleFavorite = async (product: Product) => {
      if (!employeeId) return;
      try {
        if (product.is_wishlisted) {
           await removeFromWishlist({ employee_id: employeeId, product_id: product.id }).unwrap();
        } else {
           await addToWishlist({ employee_id: employeeId, product_id: product.id }).unwrap();
        }
           // Optimistic update difficult without local state or refetch parent.
           // For now assume user knows.
        showToast('Wishlist updated', 'success');
      } catch (error) {
           console.error(error);
      }
   };

  const renderProductCard = (item: any, index: number) => {
      // Handle both old format (with product object) and new format (direct fields)
      const productId = item.product_id || item.product?.id;
      const productName = item.product_name || item.product?.name_en || item.item_name || 'Item';
      let imageUri = item.image || item.product?.image || '';
      
      if (imageUri && imageUri.startsWith('/')) {
        imageUri = `${BASE_URL}${imageUri}`;
      }

      // Construct a minimal product object for interactions
      const productObj = item.product || {
          id: productId,
          name_en: productName,
          name_ar: item.product_name_ar || null,
          image: imageUri,
          price: item.price || '0',
          is_wishlisted: item.is_wishlisted || false // fallback if available
      };

      const isWishlisted = productObj.is_wishlisted || false;
      const price = item.price || item.item_rate || item.product?.price || '0';
      
      const departmentName = item.product?.department?.name_en || item.product?.category?.name_en || 'Kitchen';
      const stockStatus = "In stock"; 

      return (
          <View key={`${index}-${productId}`} style={[styles.card, { backgroundColor: themeColors.backgroundSecondary }]}>
              {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.cardImage} />
              ) : (
                <View style={[styles.cardImage, { backgroundColor: themeColors.borderLight, alignItems: 'center', justifyContent: 'center' }]}>
                    <Text style={{ fontSize: 10, color: themeColors.textTertiary }}>No Image</Text>
                </View>
              )}
              
              <View style={styles.cardContent}>
                  {/* Top Row with Name and Heart */}
                  <View style={styles.topRow}>
                      <View style={styles.infoColumn}>
                          <Text style={[styles.productName, { color: themeColors.textPrimary }]} numberOfLines={2}>{productName}</Text>
                          <Text style={[styles.categoryName, { color: themeColors.textTertiary }]}>{departmentName}</Text>
                          <Text style={[styles.stockText, { color: themeColors.textTertiary }]}>{stockStatus}</Text>
                      </View>
                      
                      <TouchableOpacity onPress={() => toggleFavorite(productObj)} style={styles.heartBtn}>
                            <HeartIcon size={24} color={isWishlisted ? colors.red : themeColors.textTertiary} filled={isWishlisted} />
                      </TouchableOpacity>
                  </View>

                  {/* Bottom Row: Price and Action Button */}
                  <View style={styles.bottomRow}>
                       <Text style={[styles.priceText, { color: colors.successDark }]}>{parseFloat(price).toFixed(2)} QAR</Text>
                       {/* <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.successDark }]}>
                           <CheckmarkIcon size={16} color="#FFFFFF" />
                       </TouchableOpacity> */}
                  </View>
              </View>
          </View>
      );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? themeColors.background : colors.white }]} edges={['top']}>
      {/* Header */}
      <Header 
        title={t('Repeat Order')}
        includeSafeArea={false}
        rightComponent={
          <View style={[styles.dateSelector, { backgroundColor: themeColors.backgroundSecondary }]}>
            <TouchableOpacity 
              onPress={() => {
                const d = new Date(selectedDate);
                d.setDate(d.getDate() - 1);
                // Ensure we don't go before tomorrow
                const tomorrow = getTomorrow();
                if (d >= tomorrow) {
                  setSelectedDate(d);
                }
              }}
              disabled={selectedDate <= minDateForCalendar}
            >
              <ChevronLeftIcon 
                size={16} 
                color={selectedDate <= minDateForCalendar ? themeColors.borderLight : themeColors.textTertiary} 
              />
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => setShowCalendar(true)} style={styles.dateBtn}>
              <CalendarFormIcon size={16} color={themeColors.textPrimary} />
              <Text style={[styles.dateText, { color: themeColors.textPrimary }]}>
                {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => {
                const d = new Date(selectedDate);
                d.setDate(d.getDate() + 1);
                // Ensure we don't go beyond max date
                if (!maxDateForCalendar || d <= maxDateForCalendar) {
                  setSelectedDate(d);
                }
              }}
              disabled={maxDateForCalendar ? selectedDate >= maxDateForCalendar : false}
            >
              <ChevronRightIcon 
                size={16} 
                color={(maxDateForCalendar && selectedDate >= maxDateForCalendar) ? themeColors.borderLight : themeColors.textTertiary} 
              />
            </TouchableOpacity>
          </View>
        }
      />

      {/* Calendar Dropdown */}
      {showCalendar && (
        <CalendarDropdown
          selectedDate={selectedDate}
          onSelectDate={(date) => {
            setSelectedDate(date);
            setShowCalendar(false);
          }}
          onClose={() => setShowCalendar(false)}
          allowFutureDates={true}
          minDate={minDateForCalendar}
          maxDate={maxDateForCalendar}
        />
      )}

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {items.length === 0 ? (
            <Text style={[styles.emptyText, { color: themeColors.textTertiary }]}>No items found in this order.</Text>
        ) : (
            items.map(renderProductCard)
        )}
        <View style={{ height: 200 }} />
      </ScrollView>

      {/* Footer Allowance */}
      <View style={styles.footerContainer}>
             <AllowanceCard
                dailyAllowance={dailyAllowance}
                remainingAllowance={remainingAllowance}
             />
             
             {/* Button Row - Outside AllowanceCard */}
             <View style={styles.buttonRow}>
                 <TouchableOpacity 
                    style={[styles.addMoreButton, { borderColor: colors.primary }]}
                    onPress={() => navigation.navigate('MainTabs', { 
                      screen: 'Home',
                      params: { preorderDate: formatDateApi(selectedDate) }
                    })}
                 >
                    <Text style={[styles.addMoreText, { color: colors.primary }]}>{t('Add More Items')}</Text>
                 </TouchableOpacity>
                 
                 <TouchableOpacity 
                    style={[styles.viewCartButton, { backgroundColor: colors.primary }]}
                    onPress={() => navigation.navigate('Cart', { preorderDate: formatDateApi(selectedDate) })}
                 >
                    <Text style={styles.viewCartText}>{t('View Cart')}</Text>
                 </TouchableOpacity>
             </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  dateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    fontSize: 14,
    fontFamily: typography.fontFamily.medium,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: typography.fontFamily.medium,
    color:colors.primary,
    flex: 1,
    paddingHorizontal:10,
  },
  scrollContent: {
      padding: 20,
  },
  card: {
      flexDirection: 'row',
      borderRadius: 24,
      padding: 12,
      marginBottom: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 4,
      alignItems: 'center',
  },
  cardImage: {
      width: 110,
      height: 110,
      borderRadius: 16,
      backgroundColor: '#f0f0f0',
  },
  cardContent: {
      flex: 1,
      marginLeft: 16,
      height: 110, 
      justifyContent: 'space-between',
      paddingVertical: 4,
  },
  topRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
  },
  infoColumn: {
      flex: 1,
      marginRight: 8,
  },
  productName: {
      fontSize: 16,
      fontFamily: typography.fontFamily.semiBold,
      marginBottom: 2,
      lineHeight: 22,
  },
  categoryName: {
      fontSize: 13,
      marginBottom: 2,
  },
  stockText: {
      fontSize: 12,
      marginTop: 12,
  },
  heartBtn: {
      marginTop: -4,
  },
  bottomRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
  },
  priceText: {
      fontSize: 18,
      fontWeight: '700',
  },
  actionBtn: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
  },
  emptyText: {
      textAlign: 'center',
      marginTop: 40,
  },
  footerContainer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
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
  viewCartButton: {
      flex: 1,
      height: 48,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
  },
  viewCartText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontFamily: typography.fontFamily.medium,
  },
});
