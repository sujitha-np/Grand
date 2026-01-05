import React, { useState, useEffect } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { typography } from '../../../theme';
import ChevronLeftIcon from '../../../components/icons/ChevronLeftIcon';
import { Svg, Path, Rect } from 'react-native-svg';
import { CalendarDropdown } from '../../../components/common/CalendarDropdown';
import { useGetOrderHistoryMutation } from '../../../services/api/ordersApi';
import { useSelector } from 'react-redux';
import { RootState } from '../../../state/store';
import { BASE_URL } from '../../../services/api/baseUrl';
import { useToast } from '../../../components/common/ToastProvider';
import { useTheme } from '../../../hooks/useTheme';
import { useTranslation } from 'react-i18next';


const CalendarIcon = ({ color = '#000000' }: { color?: string }) => (
    <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <Rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></Rect>
        <Path d="M16 2V6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></Path>
        <Path d="M8 2V6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></Path>
        <Path d="M3 10H21" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></Path>
    </Svg>
);

// Inline date formatters
const formatDateApi = (date: Date) => {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
};

const formatDateDisplay = (dateStr: string) => {
    // Expects YYYY-MM-DD or ISO
    if(!dateStr) return '';
    const date = new Date(dateStr);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
}

// Interfaces based on provided JSON
interface Product {
  id: number;
  name_en: string;
  name_ar: string | null;
  image: string;
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

interface HistoryOrder {
  id: number;
  unique_id: string;
  order_date: string;
  sub_total: string;
  discount: string;
  tax: string;
  shipping_charge: string;
  grand_total: string;
  allowance_amount: string;
  payment_type: number;
  payment_status: number;
  payment_status_text: string;
  tracking_status: number;
  tracking_status_text: string;
  payment_mode: string;
  items: HistoryItem[];
  created_at: string;
  formatted_date: string;
}

export const OrderHistoryScreen = () => {
  const navigation = useNavigation();
  const { colors,isDark } = useTheme();
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  
  const user = useSelector((state: RootState) => state.auth.user);
  const [getOrderHistory, { isLoading, data: apiResponse }] = useGetOrderHistoryMutation();
  const [refreshing, setRefreshing] = useState(false);
  const { show: showToast } = useToast();

  const fetchHistory = async () => {
    if (!user?.id) return;
    try {
      const payload: any = { employee_id: user.id };
      if (selectedDate) {
        payload.date = formatDateApi(selectedDate);
      }
      await getOrderHistory(payload).unwrap();
    } catch (error) {
      console.error('Failed to fetch history', error);
      showToast('Failed to fetch order history', 'error');
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [selectedDate]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchHistory();
    setRefreshing(false);
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const toggleCalendar = () => {
    setShowCalendar(!showCalendar);
  };

  const handleSelectDate = (date: Date) => {
    setSelectedDate(date);
    setShowCalendar(false); 
  };
  
  const handleClearDate = () => {
      setSelectedDate(null);
      setShowCalendar(false);
  }
  
  const orders = (apiResponse?.data?.orders || []) as HistoryOrder[];
  
  // Group orders by date safely
  const groupedOrders = React.useMemo(() => {
    if (!orders || orders.length === 0) return {};
    
    const groups: {[key: string]: HistoryOrder[]} = {};
    
    orders.forEach((order) => {
        // Use created_at for accurate day grouping as shown in formatted_date (e.g. 18 Dec)
        // vs order_date which might be start-of-day UTC
        const dateToUse = order.created_at || order.order_date;
        if (!dateToUse) return;
        
        const dateKey = formatDateDisplay(dateToUse);
        if (!groups[dateKey]) {
            groups[dateKey] = [];
        }
        groups[dateKey].push(order);
    });
    
    // Sort keys descending (newest first)
    const sortedKeys = Object.keys(groups).sort((a, b) => {
        const [da, ma, ya] = a.split('-').map(Number);
        const [db, mb, yb] = b.split('-').map(Number);
        const dateA = new Date(ya, ma-1, da);
        const dateB = new Date(yb, mb-1, db);
        return dateB.getTime() - dateA.getTime();
    });

    const sortedGroups: {[key: string]: HistoryOrder[]} = {};
    sortedKeys.forEach(key => {
        sortedGroups[key] = groups[key];
    });

    return sortedGroups;
  }, [orders]);

  const renderOrderCard = (order: HistoryOrder) => {
    return (
        <View key={order.id} style={[styles.orderCard, { backgroundColor: colors.backgroundSecondary, borderColor: colors.gray200 }]}>
            {/* Items List */}
             {order.items?.map((item, index) => {
                let imageUri = item.product?.image;
                if (imageUri && imageUri.startsWith('/')) {
                     imageUri = `${BASE_URL}${imageUri}`;
                }

                return (
                    <View key={`${order.id}-item-${index}`} style={styles.itemRow}>
                        <Image 
                            source={{ uri: imageUri || '' }} 
                            style={[styles.itemImage, { backgroundColor: colors.gray200 }]} 
                        />
                        <View style={styles.itemDetails}>
                            <Text style={[styles.itemName, { color: colors.textPrimary }]}>{
                              isArabic && item.product?.name_ar ? item.product.name_ar : item.item_name
                            }</Text>
                            <Text style={[styles.itemQty, { color: colors.gray600 }]}>x{item.item_quantity}</Text>
                        </View>
                        <Text style={[styles.itemPrice, { color: colors.textPrimary }]}>{parseFloat(item.item_grand_total || '0').toFixed(2)} QAR</Text>
                    </View>
                );
            })}
            
            {/* Order Footer - Total */}
            <View style={[styles.orderFooter, { borderTopColor: colors.gray200 }]}>
                <Text style={[styles.totalLabel, { color: colors.gray800 }]}>{t('Total')}</Text>
                <Text style={[styles.totalAmount, { color: colors.textSecondary }]}>{parseFloat(order.grand_total).toFixed(2)} QAR</Text>
            </View>
        </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container,         { backgroundColor: isDark ? colors.background : colors.bgLight },
]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.backgroundSecondary }]}>
        <TouchableOpacity onPress={handleBack} style={[styles.backButton, { backgroundColor: colors.backgroundSecondary, borderColor: colors.borderLight }]}>
          <ChevronLeftIcon size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textSecondary }]}>{t('Order History')}</Text>
        <TouchableOpacity onPress={toggleCalendar} style={styles.calendarButton}>
           <View style={[styles.calendarIconContainer, { backgroundColor: colors.backgroundSecondary, borderColor: colors.borderLight }]}>
                <CalendarIcon color={colors.textPrimary} /> 
           </View>
        </TouchableOpacity>
      </View>

      {/* Calendar Dropdown */}
      {showCalendar && (
        <View style={styles.calendarWrapper}>
            <CalendarDropdown
            selectedDate={selectedDate || new Date()}
            onSelectDate={handleSelectDate}
            onClose={() => setShowCalendar(false)}
            />
            {/* {selectedDate && (
                <TouchableOpacity onPress={handleClearDate} style={[styles.clearDateButton, { backgroundColor: colors.backgroundSecondary, borderColor: colors.borderLight }]}>
                    <Text style={[styles.clearDateText, { color: colors.error }]}>Clear Filter</Text>
                </TouchableOpacity>
            )} */}
        </View>
      )}

      {/* Content */}
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {isLoading && !refreshing ? (
             <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
        ) : (
            <>
                {/* If selectedDate, show specifically? Or just use the Grouped Loop */}
                {/* If API returns just this date's data, groupedOrders will have 1 key roughly */}
                
                {Object.keys(groupedOrders).length === 0 && !isLoading && (
                    <Text style={[styles.emptyText, { color: colors.gray600 }]}>{t('No orders found.')}</Text>
                )}

                {Object.keys(groupedOrders).map(dateKey => (
                    <View key={dateKey} style={styles.dateSection}>
                        <Text style={[styles.dateHeader, { color: colors.gray600 }]}>{dateKey}</Text>
                        {groupedOrders[dateKey].map(order => renderOrderCard(order))}
                    </View>
                ))}
            </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
    borderRadius: 20,
    borderWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: typography.fontFamily.medium,
    fontWeight: '700',
    flex: 1,
    marginLeft: 16,
  },
  calendarButton: {
    padding: 8,
    marginRight: -8,
  },
  calendarIconContainer: {
    padding: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  calendarWrapper: {
      position: 'absolute',
      top: 80,
      left: 0,
      right: 0,
      zIndex: 100,
      backgroundColor: 'transparent',
  },
  clearDateButton: {
      alignSelf: 'center',
      padding: 8,
      borderRadius: 8,
      marginTop: 4,
      borderWidth: 1,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
  },
  clearDateText: {
      fontSize: 12,
      fontWeight: '600',
  },
  scrollContent: {
      padding: 20,
      paddingTop: 10,
  },
  dateSection: {
      marginBottom: 20,
  },
  dateHeader: {
      fontSize: 14,
      marginBottom: 10,
      fontFamily: typography.fontFamily.interRegular,
      fontWeight: '500',
  },
  orderCard: {
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
  },
  itemRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
  },
  itemImage: {
      width: 65,
      height: 65,
      borderRadius: 10,
      marginRight: 12,
  },
  itemDetails: {
      flex: 1,
  },
  itemName: {
      fontSize: 16,
      fontWeight: '500',
      marginBottom: 4,
  },
  itemQty: {
      fontSize: 14,
  },
  itemPrice: {
      fontSize: 16,
      fontWeight: '500',
  },
  orderFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: 16,
      borderTopWidth: 1,
  },
  totalLabel: {
      fontSize: 16,
      fontWeight: '600',
  },
  totalAmount: {
      fontSize: 16,
      fontWeight: '700',
  },
  emptyText: {
      textAlign: 'center',
      marginTop: 50,
      fontSize: 16,
  }
});
