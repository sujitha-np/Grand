import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  RefreshControl,
} from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../hooks/useTheme';
import { colors, typography } from '../../../theme';
import { useAppSelector } from '../../../state/hooks';
import { useGetPendingOrdersQuery, useGetPreorderSettingsQuery } from '../../../services/api/homeApi';
import { BASE_URL } from '../../../services/api/baseUrl';
import { Svg, Path, Rect } from 'react-native-svg';
import { CalendarDropdown } from '../../../components/common/CalendarDropdown';
import { useTranslation } from 'react-i18next';

const BackIcon = ({ color = "#1F2937" }) => (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <Path d="M15 18L9 12L15 6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
);

const CalendarIcon = ({ color = "#382E28" }) => (
    <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <Rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></Rect>
        <Path d="M16 2V6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></Path>
        <Path d="M8 2V6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></Path>
        <Path d="M3 10H21" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></Path>
    </Svg>
);

const ChevronLeft = ({ color = "#9CA3AF" }) => (
    <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <Path d="M15 18L9 12L15 6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
);

const ChevronRight = ({ color = "#382E28" }) => (
    <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <Path d="M9 18L15 12L9 6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
);

interface Product {
    id: number;
    name_en: string;
    name_ar?: string | null;
    image: string;
}

interface OrderItem {
    id: number;
    product_id: number;
    item_name: string;
    item_unit: string;
    item_rate: string;
    item_quantity: number;
    item_sub_total: string;
    item_grand_total: string;
    product: Product;
}

interface Order {
    id: number;
    unique_id: string;
    order_date: string;
    formatted_date: string;
    sub_total: string;
    grand_total: string;
    payment_status_text: string;
    tracking_status: number;
    tracking_status_text: string;
    items: OrderItem[];
}

export const PendingOrdersScreen = () => {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const { colors, isDark } = useTheme();
    const { t, i18n } = useTranslation();
    const isArabic = i18n.language === 'ar';
    const { employeeId } = useAppSelector(state => state.auth);
    const isFocused = useIsFocused();
    
    // Date state
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

    const formatDateForApi = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const formatDateForDisplay = (date: Date) => {
        const today = new Date();
        const apiDateStr = formatDateForApi(date);
        const todayStr = formatDateForApi(today);
        
        if (apiDateStr === todayStr) return t('Today');
        
        return date.toLocaleDateString('en-US', { day: 'numeric', month: 'long' });
    };

    const { data: ordersResponse, isLoading, refetch } = useGetPendingOrdersQuery({
        employee_id: employeeId || 0,
        order_date: formatDateForApi(selectedDate),
    }, {
        skip: !employeeId,
    });

    useEffect(() => {
        if (isFocused && employeeId) {
            refetch();
        }
    }, [isFocused, employeeId, refetch]);

    const orders = (ordersResponse?.data?.orders || []) as Order[];

    const renderItems = useMemo(() => {
        const items: { item: OrderItem; order: Order }[] = [];
        orders.forEach(order => {
            if (order.tracking_status === 1 || order.tracking_status_text === 'Pending') {
                order.items.forEach(orderItem => {
                    items.push({ item: orderItem, order: order });
                });
            }
        });
        return items;
    }, [orders]);

    const handlePrevDay = () => {
        const prevDate = new Date(selectedDate);
        prevDate.setDate(prevDate.getDate() - 1);
        setSelectedDate(prevDate);
    };

    const handleNextDay = () => {
        const nextDate = new Date(selectedDate);
        nextDate.setDate(nextDate.getDate() + 1);
        
        // Don't allow going beyond max date
        if (maxDateForCalendar) {
            const max = new Date(maxDateForCalendar);
            max.setHours(0, 0, 0, 0);
            nextDate.setHours(0, 0, 0, 0);
            if (nextDate > max) {
                return;
            }
        }
        
        setSelectedDate(nextDate);
    };

    const handleSelectDate = (date: Date) => {
        setSelectedDate(date);
    };

    const onRefresh = async () => {
        setRefreshing(true);
        try {
            await refetch();
        } catch (error) {
            console.error(error);
        } finally {
            setRefreshing(false);
        }
    };

    const renderCard = (orderItem: OrderItem, order: Order) => {
        const title = orderItem.item_name;
        const price = orderItem.item_grand_total;
        
        let imageUri = orderItem.product?.image;
        if (imageUri && !imageUri.startsWith('http')) {
            imageUri = `${BASE_URL}${imageUri}`;
        }
        if (!imageUri) imageUri = "";

        const statusText = order.tracking_status_text || "Pending";
        
        // Translate status text
        const getTranslatedStatus = (status: string) => {
          let translated;
          switch (status) {
            case 'Pending':
              translated = t('Pending');
              break;
            case 'Paid':
              translated = t('Paid');
              break;
            case 'Processing':
              translated = t('Processed');
              break;
            case 'Out for Delivery':
              translated = t('Accepted');
              break;
            case 'Ready for Pickup':
              translated = t('Ready');
              break;
            case 'Cancelled':
              translated = t('Cancelled');
              break;
            default:
              translated = status;
          }
          return translated;
        };

        return (
            <View style={[styles.card, { backgroundColor: colors.backgroundSecondary }]} key={`${order.unique_id}-${orderItem.id}`}>
                <Image 
                    source={{ uri: imageUri }} 
                    style={[styles.cardImage, { backgroundColor: colors.gray200 }]} 
                    resizeMode="cover"
                />
                <View style={styles.cardContent}>
                    <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>{
                      isArabic && orderItem.product?.name_ar ? orderItem.product.name_ar : title
                    }</Text>
                    <Text style={[styles.cardSubtitle, { color: colors.textTertiary }]}>{t('N/A')}</Text>
                    <Text style={[styles.cardPrice, { color: colors.textPrimary }]}>{parseFloat(price).toFixed(2)} QAR</Text>
                </View>
                <View style={styles.cardAction}>
                    <View style={styles.statusPill}>
                        <Text style={styles.statusText}>{getTranslatedStatus(statusText)}</Text>
                    </View>
                </View>
            </View>
        );
    };

    // Check if next day button should be disabled
    const isNextDayDisabled = () => {
        if (!maxDateForCalendar) return false;
        const nextDate = new Date(selectedDate);
        nextDate.setDate(nextDate.getDate() + 1);
        nextDate.setHours(0, 0, 0, 0);
        const max = new Date(maxDateForCalendar);
        max.setHours(0, 0, 0, 0);
        return nextDate > max;
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top, backgroundColor: isDark ? colors.background : colors.bgLight }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity 
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <BackIcon color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>{t('Pending Orders')}</Text>
                
                <View style={[styles.dateSelector, { backgroundColor: colors.backgroundSecondary }]}>
                    <TouchableOpacity onPress={handlePrevDay} style={styles.arrowBtn}>
                        <ChevronLeft color={colors.textPrimary} />
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={styles.dateDisplay}
                        onPress={() => setShowDatePicker(!showDatePicker)}
                    >
                        <CalendarIcon color={colors.textPrimary} />
                        <Text style={[styles.dateText, { color: colors.textPrimary }]}>{formatDateForDisplay(selectedDate)}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        onPress={handleNextDay} 
                        style={styles.arrowBtn}
                        disabled={isNextDayDisabled()}
                    >
                        <ChevronRight color={isNextDayDisabled() ? colors.textPlaceholder : colors.textPrimary} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Inline Calendar Dropdown */}
            {showDatePicker && (
                <CalendarDropdown
                    selectedDate={selectedDate}
                    onSelectDate={handleSelectDate}
                    onClose={() => setShowDatePicker(false)}
                    allowPastDates={true}
                    maxDate={maxDateForCalendar}
                />
            )}

            {isLoading && !refreshing ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <ScrollView 
                    style={styles.listContainer}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
                    }
                >
                    {renderItems.length > 0 ? (
                        renderItems.map(({ item, order }) => renderCard(item, order))
                    ) : (
                        <View style={styles.emptyState}>
                            <Text style={[styles.emptyText, { color: colors.textTertiary }]}>{t('No pending orders for')} {formatDateForDisplay(selectedDate)}</Text>
                        </View>
                    )}
                </ScrollView>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 22,
        fontFamily:typography.fontFamily.medium,
        flex: 1,
        marginLeft: 16,
    },
    dateSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 20,
        paddingVertical: 6,
        paddingHorizontal: 8,
    },
    arrowBtn: {
        padding: 4,
    },
    dateDisplay: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 8,
        gap: 6,
    },
    dateText: {
        fontSize: 13,
        fontWeight: '500', 
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContainer: {
        flex: 1,
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    card: {
        flexDirection: 'row',
        padding: 12,
        borderRadius: 16,
        marginBottom: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    cardImage: {
        width: 60,
        height: 60,
        borderRadius: 12,
    },
    cardContent: {
        flex: 1,
        marginLeft: 16,
        justifyContent: 'center',
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
        fontFamily: typography.fontFamily.interRegular,
        marginBottom: 2,
    },
    cardSubtitle: {
        fontSize: 12,
        marginBottom: 8,
        fontFamily: typography.fontFamily.interRegular,
    },
    cardPrice: {
        fontSize: 14,
        fontWeight: '600',
        fontFamily: typography.fontFamily.interRegular,
    },
    cardAction: {
        justifyContent: 'center',
        alignItems: 'flex-end',
    },
    statusPill: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#FEF3C7',
        backgroundColor: '#FFFBEB',
    },
    statusText: {
        fontSize: 12,
        color: '#D97706',
        fontWeight: '500',
    },
    emptyState: {
        marginTop: 60,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        fontFamily: typography.fontFamily.medium,
    },
});
