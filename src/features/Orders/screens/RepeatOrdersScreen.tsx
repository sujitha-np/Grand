import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Platform,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { typography, colors, spacing } from '../../../theme';
import ChevronLeftIcon from '../../../components/icons/ChevronLeftIcon';
import ChevronRightIcon from '../../../components/icons/ChevronRightIcon';
import { CalendarFormIcon } from '../../../components/icons/FormIcons';
import { CalendarDropdown } from '../../../components/common/CalendarDropdown';
import { useGetOrderHistoryMutation, useRepeatOrderMutation } from '../../../services/api/ordersApi';
import { useGetPreorderSettingsQuery } from '../../../services/api/homeApi';
import { useSelector } from 'react-redux';
import { RootState } from '../../../state/store';
import { useToast } from '../../../components/common/ToastProvider';
import { useTheme } from '../../../hooks/useTheme';
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

interface HistoryOrder {
  id: number;
  unique_id: string;
  order_date: string;
  grand_total: string;
  payment_status_text: string;
  tracking_status_text: string;
  created_at: string;
  formatted_date: string;
  items: HistoryItem[];
}

export const RepeatOrdersScreen = () => {
  const navigation = useNavigation<any>();
  const { colors: themeColors, isDark } = useTheme();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  
  const user = useSelector((state: RootState) => state.auth.user);
  const employeeId = user?.id;

  const [getOrderHistory, { isLoading, data: apiResponse }] = useGetOrderHistoryMutation();
  const [repeatOrder, { isLoading: isRepeating }] = useRepeatOrderMutation();
  const [refreshing, setRefreshing] = useState(false);
  const { show: showToast } = useToast();
  const { t } = useTranslation();

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

  const formatDateApi = (date: Date) => {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
  };
  
    const fetchHistory = async () => {
    if (!employeeId) return;
    try {
      const payload: any = { employee_id: employeeId };
      if (selectedDate) {
         payload.date = formatDateApi(selectedDate);
      }
      await getOrderHistory(payload).unwrap();
    } catch (error) {
      console.error('Failed to fetch history', error);
      showToast('Failed to fetch orders', 'error');
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
  
  const handleOrderPress = (order: HistoryOrder) => {
    Alert.alert(
      t('Repeat Last Order'),
      t('Are you sure you want to replace the items in your cart with those from your previous order ?'),
      [
        {
          text: t('Cancel'),
          style: 'cancel',
        },
        {
          text: t('Yes'),
          onPress: async () => {
            if (!employeeId) return;
            try {
              // Default preorder date to tomorrow
              const tomorrow = new Date();
              tomorrow.setDate(tomorrow.getDate() + 1);
              const preorderDate = formatDateApi(tomorrow);
              
              const response = await repeatOrder({
                employee_id: employeeId,
                order_id: order.id,
                preorder_date: preorderDate,
              }).unwrap();
              
              if (response.success) {
                showToast(response.message || t('Order items added to cart successfully!'), 'success');
                // Navigate to RepeatOrderDetails with the items from response
                navigation.navigate('RepeatOrderDetails', { order: response.data });
              }
            } catch (error: any) {
              console.error('Failed to repeat order', error);
              showToast(error?.data?.message || t('Failed to repeat order'), 'error');
            }
          },
        },
      ],
      { cancelable: false }
    );
  };
  
    const orders = (apiResponse?.data?.orders || []) as HistoryOrder[];

    // Group orders by date safely
    const groupedOrders = React.useMemo(() => {
        if (!orders || orders.length === 0) return {};
        
        const groups: {[key: string]: HistoryOrder[]} = {};
        
        // Helper to format date for grouping header
        const formatHeaderDate = (dateStr: string) => {
            if(!dateStr) return '';
            const date = new Date(dateStr);
            return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
        }

        orders.forEach((order) => {
            const dateToUse = order.created_at || order.order_date;
            if (!dateToUse) return;
            
            const dateKey = order.formatted_date ? order.formatted_date.split(',')[0] : formatHeaderDate(dateToUse);
            if (!groups[dateKey]) {
                groups[dateKey] = [];
            }
            groups[dateKey].push(order);
        });
        
        return groups;
    }, [orders]);


  const renderOrderRow = (order: HistoryOrder) => {
      // Safely parse items handling both array and string formats
      let parsedItems: any[] = [];
      if (Array.isArray(order.items)) {
          parsedItems = order.items;
      } else if (typeof order.items === 'string') {
          try {
              const parsed = JSON.parse(order.items);
              parsedItems = Array.isArray(parsed) ? parsed : [];
          } catch (e) {
              parsedItems = [];
          }
      }

      const itemCount = parsedItems.length;

      return (
          <TouchableOpacity 
              key={order.id} 
              style={[styles.orderCard, { backgroundColor: themeColors.backgroundSecondary }]}
              onPress={() => handleOrderPress(order)}
          >
             <View style={styles.orderCardHeader}>
                 <Text style={[styles.orderId, { color: themeColors.textPrimary }]}>Order #{order.unique_id}</Text>
                 <Text style={[styles.orderDate, { color: themeColors.textTertiary }]}>{order.formatted_date}</Text>
             </View>
             
             {/* Items List */}
             {parsedItems.length > 0 && (
               <View style={styles.itemsList}>
                 {parsedItems.map((item: any, index: number) => {
                   const itemName = item.item_name || item.product_name || item.name_en || 'Item';
                   const quantity = item.item_quantity || item.quantity || 1;
                   return (
                    <View style={{flexDirection:'row'}}>
                     <Text 
                       key={item.id || item.product_id || index} 
                       style={[styles.itemText, { color: themeColors.textSecondary ,backgroundColor:colors.gray300}]}
                       numberOfLines={1}
                     >
                       {quantity}x 
                     </Text>
                     <Text style={[styles.itemText, { color: themeColors.textSecondary,       fontFamily: typography.fontFamily.regular,}]}>
                       {itemName}
                     </Text>
                     </View>
                   );
                 })}
               </View>
             )}
             
             <View style={styles.orderCardBody}>
                 <Text style={[styles.itemCount, { color: themeColors.textSecondary }]}>
                     {itemCount} {itemCount === 1 ? t('Item') : t('Items')}
                 </Text>
                 <Text style={[styles.orderTotal, { color: colors.successDark }]}>{order.grand_total} QAR</Text>
             </View>
          </TouchableOpacity>
      );
  };
  
    return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? themeColors.background : colors.white }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={[styles.backButton, { backgroundColor: themeColors.backgroundSecondary, borderColor: themeColors.borderLight }]}>
          <ChevronLeftIcon size={24} color={themeColors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: themeColors.textPrimary }]}>{t('Repeat Last Order')}</Text>
        
        {/* Date Selector */}
         <View style={[styles.dateSelector, { backgroundColor: themeColors.backgroundSecondary }]}>
             <TouchableOpacity onPress={() => {
                 const d = new Date(selectedDate);
                 d.setDate(d.getDate() - 1);
                 setSelectedDate(d);
             }}>
                 <ChevronLeftIcon size={16} color={themeColors.textTertiary} />
             </TouchableOpacity>
             
             <TouchableOpacity onPress={() => setShowCalendar(true)} style={styles.dateBtn}>
                 <CalendarFormIcon size={16} color={themeColors.textPrimary} />
                 <Text style={[styles.dateText, { color: themeColors.textPrimary }]}>
                    {selectedDate.toDateString() === new Date().toDateString() ? "Today" : selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                 </Text>
             </TouchableOpacity>

             <TouchableOpacity onPress={() => {
                 const d = new Date(selectedDate);
                 d.setDate(d.getDate() + 1);
                 // Don't go beyond maxDate if set
                 if (!maxDateForCalendar || d <= maxDateForCalendar) {
                   setSelectedDate(d);
                 }
             }}
             disabled={maxDateForCalendar ? selectedDate >= maxDateForCalendar : false}
             >
                 <ChevronRightIcon size={16} color={(maxDateForCalendar && selectedDate >= maxDateForCalendar) ? themeColors.borderLight : themeColors.textTertiary} />
             </TouchableOpacity>
         </View>
      </View>

      {/* Calendar Dropdown */}
      {showCalendar && (
        <CalendarDropdown
          selectedDate={selectedDate}
          onSelectDate={(date) => {
              setSelectedDate(date);
              setShowCalendar(false);
          }}
          onClose={() => setShowCalendar(false)}
          allowPastDates={true}
          maxDate={maxDateForCalendar}
        />
      )}

      {/* Content */}
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {isLoading && !refreshing ? (
             <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
        ) : Object.keys(groupedOrders).length === 0 ? (
            <Text style={[styles.emptyText, { color: themeColors.textTertiary }]}>{t('No orders found.')}</Text>
        ) : (
             Object.keys(groupedOrders).map(dateKey => (
                <View key={dateKey} style={styles.dateSection}>
                    {/* User requested to remove the date outside the box "remove the date in the out of the box" */}
                    {/* <Text style={[styles.dateHeader, { color: themeColors.textTertiary }]}>{dateKey}</Text> */} 
                    {groupedOrders[dateKey].map(renderOrderRow)}
                </View>
            ))
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
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  
  },
  headerTitle: {
    fontSize: 20,
     color:colors.primary,
    fontFamily:typography.fontFamily.medium,
    flex: 1,
    marginLeft: 16,
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
  scrollContent: {
      padding: 20,
  },
  emptyText: {
      textAlign: 'center',
      marginTop: 40,
  },
  dateSection: {
      marginBottom: 20,
  },
  dateHeader: {
      fontSize: 14,
      fontFamily: typography.fontFamily.medium,
      marginBottom: 10,
  },
  orderCard: {
      borderRadius: 16,
      paddingVertical: 30,
      paddingHorizontal: 16,
      marginBottom: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
  },
  orderCardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
  },
  orderId: {
      fontSize: 16,
      fontFamily: typography.fontFamily.semiBold,
  },
  orderDate: {
      fontSize: 12,
  },
  orderCardBody: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
  },
  statusRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
  },
  statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
  },
  statusText: {
      fontSize: 12,
      fontWeight: '600',
  },
  itemCount: {
      fontSize: 13,
  },
  orderTotal: {
      fontSize: 16,
      fontWeight: '700',
  },
  itemsList: {
      marginBottom: 12,
  },
  itemText: {
      fontSize: 13,
      fontFamily: typography.fontFamily.interRegular,
      marginBottom: 6,
      paddingHorizontal: 10,
      borderRadius: 5,

  },
});
