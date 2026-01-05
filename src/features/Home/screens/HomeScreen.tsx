/**
 * Home Screen - Full Implementation matching Figma design
 */
import React from 'react';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  RefreshControl,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../../../state/hooks';
import { spacing, typography } from '../../../theme';
import { useTheme } from '../../../hooks/useTheme';
import HomeHeader from '../components/HomeHeader';
import {
  useProfileQuery,
  useCategoriesQuery,
  useGetAllowancesQuery,
  useProductsQuery,
  useOffersQuery,
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
  useGetPreorderSettingsQuery,
} from '../../../services/api/homeApi';
import { useAddToCartMutation } from '../../../services/api/cartApi';
import { performLogout } from '../../../utils/auth';
import ChevronRightIcon from '../../../components/icons/ChevronRightIcon';
import ChevronLeftIcon from '../../../components/icons/ChevronLeftIcon';
import ChevronDownIcon from '../../../components/icons/ChevronDownIcon';
import CheckmarkIcon from '../../../components/icons/CheckmarkIcon';
import { AllowanceCard } from '../../../components/common/AllowanceCard';
import { CalendarFormIcon } from '../../../components/icons/FormIcons';
import { BASE_URL } from '../../../services/api/baseUrl';
import HeartIcon from '../../../components/icons/HeartIcon';
import AddButtonIcon from '../../../components/icons/AddButtonIcon';
import DateTimePicker from '@react-native-community/datetimepicker';
import { showSuccessToast, showErrorToast } from '../../../utils/toast';
import { CalendarModal } from '../../../components/common/CalendarModal';
import { CalendarDropdown } from '../../../components/common/CalendarDropdown';
import { FilterDropdown } from '../../../components/common/FilterDropdown';
import { useTranslation } from 'react-i18next';

export const HomeScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const dispatch = useAppDispatch();
  const { colors, isDark } = useTheme();
  const { i18n, t } = useTranslation();
  const { employeeId, token } = useAppSelector(state => state.auth);

  // State for favorite products - removed, now using is_wishlisted from API

  // State for selected department filter
  const [selectedDepartmentId, setSelectedDepartmentId] = React.useState<
    number | null
  >(null);

  // State for pull-to-refresh
  const [refreshing, setRefreshing] = React.useState(false);

  // State for product filter dropdown
  const [selectedFilter, setSelectedFilter] = React.useState(t('All'));
  const [showFilterDropdown, setShowFilterDropdown] = React.useState(false);

  // Helper to get tomorrow's date (users can only order for future dates)
  const getTomorrow = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  };

  // Min date is tomorrow (today and past dates are disabled)
  const minDateForCalendar = getTomorrow();

  // Parse preorderDate from route params if passed (from RepeatOrderDetails > Add More Items)
  const parsePreorderDate = (dateStr: string | undefined) => {
    if (dateStr) {
      // Parse YYYY-MM-DD format
      const [year, month, day] = dateStr.split('-').map(Number);
      const parsedDate = new Date(year, month - 1, day);
      // Ensure the date is not before tomorrow
      const tomorrow = getTomorrow();
      if (parsedDate >= tomorrow) {
        return parsedDate;
      }
    }
    return getTomorrow(); // Default to tomorrow instead of today
  };

  // State for selected date - initialize from route param if available, default to tomorrow
  const [selectedDate, setSelectedDate] = React.useState(() => 
    parsePreorderDate(route.params?.preorderDate)
  );
  const [showDatePicker, setShowDatePicker] = React.useState(false);

  // Update selectedDate when route params change (e.g., coming from RepeatOrderDetails)
  React.useEffect(() => {
    if (route.params?.preorderDate) {
      setSelectedDate(parsePreorderDate(route.params.preorderDate));
    }
  }, [route.params?.preorderDate]);

  // State for search
  const [searchTerm, setSearchTerm] = React.useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = React.useState('');

  // Debounce search term to avoid excessive API calls
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data: profileResp, refetch: refetchProfile } = useProfileQuery(
    employeeId ?? undefined,
    {
      skip: !employeeId || !token,
    }
  );
  const profile = profileResp?.data;

  // Fetch categories/departments
  const {
    data: categoriesResp,
    isLoading: categoriesLoading,
    refetch: refetchCategories,
  } = useCategoriesQuery();
  const categories = categoriesResp?.data || [];

  // Fetch products
  const {
    data: productsResp,
    isLoading: productsLoading,
    refetch: refetchProducts,
  } = useProductsQuery(
    { 
      employeeId: employeeId || 0,
      searchTerm: debouncedSearchTerm || undefined 
    },
    {
      skip: !employeeId,
    }
  );
  const allProducts = productsResp?.data || [];

  // Wishlist mutations
  const [addToWishlist] = useAddToWishlistMutation();
  const [removeFromWishlist] = useRemoveFromWishlistMutation();
  const [addToCart] = useAddToCartMutation();

  // Filter products by selected filter
  const products = selectedFilter === t('Favorites')
    ? allProducts.filter((product: any) => product.is_wishlisted === true)
    : selectedDepartmentId
    ? allProducts.filter(
        (product: any) => product.department_id === selectedDepartmentId
      )
    : allProducts;

  // Helper to format today's date for API (YYYY-MM-DD)
  const getTodayFormatted = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Helper to format any date for API (YYYY-MM-DD)
  const formatDateForAPI = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Fetch allowances - use selectedDate from calendar
  const { data: allowancesResp, refetch: refetchAllowances } =
    useGetAllowancesQuery(
      {
        employee_id: employeeId || 0,
        Preorder_date: formatDateForAPI(selectedDate),
      },
      {
        skip: !employeeId || !token,
      }
    );
  const allowanceData = allowancesResp?.data;

  // Refetch allowances when selectedDate changes
  React.useEffect(() => {
    if (employeeId && token) {
      refetchAllowances();
    }
  }, [selectedDate, employeeId, token, refetchAllowances]);

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

  // Fetch offers
  const { data: offersResp, refetch: refetchOffers } = useOffersQuery();
  const offers = offersResp?.data || [];

  // Calculate allowance values and progress (with fallback to ensure data is shown)
  const dailyAllowance = parseFloat(allowanceData?.daily_meal_allowance || '0');
  const remainingAllowance = parseFloat(
    allowanceData?.remaining_allowance || '0'
  );
  // Progress shows REMAINING allowance (fills from left to right)
  // Brown color shows what's remaining, not what's been used
  const progressPercentage =
    dailyAllowance > 0
      ? Math.max(0, Math.min((remainingAllowance / dailyAllowance) * 100, 100))
      : 0;

  // Placeholder image for categories without images from API
  const placeholderImage = require('../../../assets/images/backery.png');

  // Toggle favorite
  const toggleFavorite = async (
    productId: number,
    isCurrentlyWishlisted: boolean
  ) => {
    if (!employeeId) return;

    try {
      if (isCurrentlyWishlisted) {
        // Remove from wishlist
        await removeFromWishlist({
          employee_id: employeeId,
          product_id: productId,
        }).unwrap();
      } else {
        // Add to wishlist
        await addToWishlist({
          employee_id: employeeId,
          product_id: productId,
        }).unwrap();
      }
      // Refetch products to get updated is_wishlisted status
      refetchProducts();
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    }
  };

  // Handle add to cart
  const handleAddToCart = async (productId: number) => {
    if (!employeeId) return;

    try {
      const preorderDate = formatDateForAPI(selectedDate);

      const response = await addToCart({
        employee_id: employeeId,
        product_id: productId,
        quantity: 1,
        preorder_date: preorderDate,
      }).unwrap();

      // Show success toast - use translation instead of API message for proper localization
      showSuccessToast(t('Product added to cart successfully!'));
      
      // Refetch allowances after adding to cart to update remaining allowance
      refetchAllowances();
      
      // Navigate to Cart screen with the preorder date
      navigation.navigate('Cart', { preorderDate });
    } catch (error: any) {
      
      // Show error toast
      showErrorToast(t('Something went wrong'));
    }
  };


  // Handle department filter
  const handleDepartmentPress = (departmentId: number) => {
    // Toggle filter: if already selected, clear filter; otherwise set new filter
    const newFilterId =
      selectedDepartmentId === departmentId ? null : departmentId;
    setSelectedDepartmentId(newFilterId);

    // Update filter text
    if (newFilterId) {
      const department = categories.find((cat: any) => cat.id === newFilterId);
      const isArabic = i18n.language === 'ar';
      const departmentName = isArabic 
        ? (department?.name_ar || department?.name_en || department?.name || 'All')
        : (department?.name_en || department?.name || 'All');
      setSelectedFilter(departmentName);
    } else {
      setSelectedFilter(t('All'));
    }
  };

  // Handle filter dropdown selection
  const handleFilterSelect = (
    departmentId: number | null,
    departmentName: string
  ) => {
    setSelectedDepartmentId(departmentId);
    setSelectedFilter(departmentName);
    setShowFilterDropdown(false);
  };

  // Handle pull-to-refresh
  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);

    // Clear department filter and search on refresh
    if (selectedDepartmentId) {
      setSelectedDepartmentId(null);
      setSelectedFilter('All');
    }
    if (searchTerm) {
      setSearchTerm('');
    }
    
    // Reset date to tomorrow on refresh
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setSelectedDate(tomorrow);

    try {
      // Refetch all APIs in parallel
      await Promise.all([
        refetchProfile(),
        refetchCategories(),
        refetchProducts(),
        refetchOffers(),
        employeeId && token ? refetchAllowances() : Promise.resolve(),
      ]);
    } catch (error) {
      console.error('❌ [Refresh] Error refetching APIs:', error);
    } finally {
      setRefreshing(false);
    }
  }, [
    refetchProfile,
    refetchCategories,
    refetchProducts,
    refetchAllowances,
    employeeId,
    token,
    selectedDepartmentId,
    searchTerm,
  ]);
  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? colors.background : colors.bgLight },
      ]}
    >
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
        <HomeHeader 
          profile={profile} 
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />
        {/* Categories */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categories}
        >
          {categoriesLoading ? (
            <Text style={styles.loadingText}>Loading categories...</Text>
          ) : categories.length > 0 ? (
            categories.map((category: any) => {
              const isSelected = selectedDepartmentId === category.id;
              const isAnySelected = selectedDepartmentId !== null;
              const opacity = isAnySelected && !isSelected ? 0.5 : 1;
              
              return (
                <TouchableOpacity
                  key={category.id}
                  style={[styles.categoryItem, { opacity }]}
                  onPress={() => handleDepartmentPress(category.id)}
                >
                  <View
                    style={[
                      styles.categoryCircle,
                      { backgroundColor: colors.backgroundSecondary },
                      isSelected && {
                        borderWidth: 3,
                        borderColor: colors.secondary, // Changed to secondary color
                        backgroundColor: 'transparent',
                        shadowColor: colors.secondary,
                      },
                    ]}
                  >
                    <Image
                      source={
                        category.image
                          ? { uri: `${BASE_URL}${category.image}` }
                          : placeholderImage
                      }
                      style={styles.categoryImage}
                      resizeMode="cover"
                    />
                  </View>
                  <Text
                    style={[
                      styles.categoryLabel,
                      { color: isDark ? colors.textPrimary : colors.primary }, // Text should be dark/black when selected
                      isSelected && { fontWeight: 'bold' },
                    ]}
                  >
                    {i18n.language === 'ar' ? (category.name_ar || category.name_en || category.name) : (category.name_en || category.name)}
                  </Text>
                </TouchableOpacity>
              );
            })
          ) : null}
        </ScrollView>

        {/* Offers Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: isDark ? colors.textPrimary : colors.primary }]}>
              {t('Offers for you')}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Offers')}>
              <ChevronRightIcon size={20} color={isDark ? colors.textPrimary : colors.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.offersScroll}
          >
            {offers.map((offer: any) => {
              const imageUrl = offer.image_en && `${BASE_URL}${offer.image_en}`;
              return (
                <TouchableOpacity
                  key={offer.id}
                  style={styles.offerCard}
                  onPress={() =>
                    navigation.navigate('OfferDetails', {
                      offerId: offer.id,
                      offerName: offer.name_en,
                    })
                  }
                >
                  <Image
                    source={{ uri: imageUrl }}
                    style={styles.offerImage}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Filter Section - Dropdown and Date selector */}
        <View style={styles.filterSection}>
          {/* Oval Container with Conditional Shadow */}
          <View style={[
            styles.filterOvalContainer,
            { backgroundColor: colors.backgroundSecondary, width: showFilterDropdown ? 160 : 130 },
            showFilterDropdown && { borderRadius: 16 }
          ]}>

            {/* Filter Dropdown Button or Dropdown */}
            {!showFilterDropdown ? (
              <TouchableOpacity
                style={styles.filterDropdown}
                onPress={() => setShowFilterDropdown(true)}
              >
                <Text
                  style={[styles.filterDropdownText, { color: colors.textPrimary }]}
                >
                  {selectedFilter}
                </Text>
                <ChevronDownIcon size={20} color={colors.textPrimary} />
              </TouchableOpacity>
            ) : (
              <FilterDropdown
                selectedFilter={selectedFilter}
                onSelectFilter={(filter) => {
                  setSelectedFilter(filter);
                  setSelectedDepartmentId(null);
                }}
                onClose={() => setShowFilterDropdown(false)}
              />
            )}
          </View>

          {/* Date Selector */}
          <View style={[styles.filterOvalContainer, { backgroundColor: colors.backgroundSecondary }]}>
            <View style={styles.dateSelector}>
              <TouchableOpacity
                style={[
                  styles.dateArrow,
                  { backgroundColor: 'transparent' },
                ]}
                onPress={() => {
                  const newDate = new Date(selectedDate);
                  newDate.setDate(newDate.getDate() - 1);
                  
                  // Helper to check if date is today
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const dateToCheck = new Date(newDate);
                  dateToCheck.setHours(0, 0, 0, 0);
                  
                  if (dateToCheck >= today) {
                    setSelectedDate(newDate);
                  }
                }}
                disabled={(() => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const current = new Date(selectedDate);
                  current.setHours(0, 0, 0, 0);
                  return current <= today;
                })()}
              >
                <ChevronLeftIcon 
                  size={20} 
                  color={(() => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const current = new Date(selectedDate);
                    current.setHours(0, 0, 0, 0);
                    return current > today ? colors.textPrimary : colors.gray400;
                  })()} 
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.dateTodayButton}
                onPress={() => setShowDatePicker(true)}
              >
                <CalendarFormIcon size={20} color={colors.textPrimary} />
                <Text
                  style={[styles.dateTodayText, { color: colors.textPrimary }]}
                >
                  {(() => {
                    const today = new Date();
                    const isToday = 
                      selectedDate.getDate() === today.getDate() &&
                      selectedDate.getMonth() === today.getMonth() &&
                      selectedDate.getFullYear() === today.getFullYear();
                    
                    if (isToday) {
                      return t('Today');
                    }
                    
                    // Format: Dec 16 or 16 Dec based on your preference
                    const options: Intl.DateTimeFormatOptions = { 
                      month: 'short', 
                      day: 'numeric' 
                    };
                    return selectedDate.toLocaleDateString('en-US', options);
                  })()}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.dateArrow, { backgroundColor: 'transparent' }]}
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

        {/* Food Items / Products */}
        <View style={styles.foodItems}>
          {productsLoading ? (
            <Text style={[styles.loadingText, { color: colors.textTertiary }]}>
              Loading products...
            </Text>
          ) : products.length > 0 ? (
            products.map((product: any) => {
              const imageUrl = product.image && `${BASE_URL}${product.image}`;

              const isFavorite = product.is_wishlisted || false;

              return (
                <TouchableOpacity
                  key={product.id}
                  style={[
                    styles.foodCard,
                    { backgroundColor: colors.backgroundSecondary },
                  ]}
                  onPress={() =>
                    navigation.navigate('ProductDetail', {
                      productId: product.id,
                    })
                  }
                  activeOpacity={0.9}
                >
                  <Image
                    source={{ uri: imageUrl || '' }}
                    style={[
                      styles.foodImage,
                      { backgroundColor: colors.gray200 },
                    ]}
                  />
                  <View style={styles.foodInfo}>
                    {/* Top Row: Info + Heart */}
                    <View style={styles.cardTopRow}>
                      <View style={styles.textContainer}>
                        <Text
                          style={[
                            styles.foodName,
                            { color: isDark ? colors.textPrimary : colors.primary },
                          ]}
                          numberOfLines={1}
                        >
                          {i18n.language === 'ar' ? (product.name_ar || product.name_en || product.name) : (product.name_en || product.name)}
                        </Text>
                        <Text
                          style={[
                            styles.foodCategory,
                            { color: isDark ? colors.textSecondary : colors.primary },
                          ]}
                        >
                          {i18n.language === 'ar' 
                            ? (product.department?.name_ar || product.department?.name_en || product.category?.name_ar || product.category?.name_en || 'N/A')
                            : (product.department?.name_en || product.category?.name_en || t('Category'))}
                        </Text>
                      </View>

                      <TouchableOpacity
                        style={styles.favoriteBtn}
                        onPress={e => {
                          e.stopPropagation();
                          toggleFavorite(product.id, isFavorite);
                        }}
                      >
                        <HeartIcon
                          size={24}
                          color={isFavorite ? '#FF0000' : colors.textSecondary}
                          filled={isFavorite}
                        />
                      </TouchableOpacity>
                    </View>

                    {/* Bottom Row: Price + Add Button */}
                    <View style={styles.cardBottomRow}>
                      <View>
                        <Text
                          style={[styles.foodStock, { color: isDark ? colors.textPrimary : colors.primary }]}
                        >
                          {product.stock > 0 ? t('In stock') : t('Out of stock')}
                        </Text>
                        <View style={styles.priceRow}>
                          <Text
                            style={[
                              styles.foodPrice,
                              { color: colors.successDark },
                            ]}
                          >
                            {product.offer_price && parseFloat(product.offer_price) > 0
                              ? product.offer_price
                              : product.price} QAR
                          </Text>
                          {product.offer_price && parseFloat(product.offer_price) > 0 && parseFloat(product.price) > parseFloat(product.offer_price) && (
                            <Text
                              style={[
                                styles.originalPrice,
                                { color: colors.gray500 },
                              ]}
                            >
                              {product.price} QAR
                            </Text>
                          )}
                        </View>
                      </View>

                      <TouchableOpacity
                        onPress={e => {
                          e.stopPropagation();
                          handleAddToCart(product.id);
                        }}
                      >
                        <AddButtonIcon
                          size={36}
                          backgroundColor="#ECF1E8"
                          iconColor={colors.successDark}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          ) : (
            <Text style={[styles.loadingText, { color: colors.gray500 }]}>
              No products available
            </Text>
          )}
        </View>

        {/* Spacer to ensure content is scrollable above AllowanceCard and bottom tab bar */}
        <View style={{ height: 180 }} />
      </ScrollView>

      {/* Allowance Section - Fixed at bottom */}
      <View style={styles.allowanceContainer}>
        <AllowanceCard
          dailyAllowance={dailyAllowance}
          remainingAllowance={remainingAllowance}
          onPress={() => navigation.navigate('Allowance')}
        />
      </View>

      {/* Loading Overlay */}
      {refreshing && (
        <View style={styles.loadingOverlay}>
          <View
            style={[
              styles.loadingBox,
              { backgroundColor: colors.backgroundSecondary },
            ]}
          >
            <ActivityIndicator size="large" color={colors.primary} />
            <Text
              style={[styles.loadingOverlayText, { color: colors.primary }]}
            >
              {t('Refreshing...')}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {},
  scrollContent: {
    flexGrow: 1,
  },
  categories: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 4,
    gap: 16,
  },
  categoryItem: {
    alignItems: 'center',
  },
  categoryCircle: {
    width: 72,
    height: 72,
    borderRadius: 24, // Increased radius for squircle look
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
    borderWidth: 0, // Default no border width
    borderColor: 'transparent',
  },
  categoryEmoji: {
    fontSize: 36,
  },
  categoryImage: {
    width: 72,
    height: 72,
    borderRadius: 24, // Match parent radius
  },
  categoryLabel: {
    fontSize: 12,
    fontFamily: typography.fontFamily.interRegular,
    textAlign: 'center',
  },
  filterOvalContainer: {
    borderRadius: 50,
    paddingVertical: 5,
    paddingHorizontal: 12,
 
  },
  filterOvalContainerShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: typography.fontFamily.interRegular,
    textAlign: 'center',
    padding: 20,
  },
  section: {
    marginTop: 8,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    fontFamily: typography.fontFamily.interBold,
  },
  offersScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  offerCard: {
    width: 160,
    height: 192,
    borderRadius: 20,
    marginRight: 12,
    overflow: 'hidden',
  },
  offerImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  offerBadge: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  offerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  offerSubtitle: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
  },
  allowanceContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    pointerEvents: 'box-none', // Allow touches to pass through transparent areas
  },
  allowanceCard: {
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
  allowanceHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  allowanceTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  allowanceInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  allowanceLabel: {
    fontSize: 14,
  },
  allowanceValue: {
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  foodItems: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  foodCard: {
    flexDirection: 'row',
    borderRadius: 20,
    padding: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  foodImage: {
    width: 110,
    height: 110,
    borderRadius: 16,
  },
  foodInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  textContainer: {
    flex: 1,
    marginRight: 8,
  },
  foodName: {
    fontSize: 16,
    fontFamily: typography.fontFamily.interRegular,
    fontWeight: '800',
  },
  foodCategory: {
    fontSize: 14,
    fontFamily: typography.fontFamily.interLight,
    fontWeight:'600'
  },
  foodStock: {
    fontSize: 12,
    fontFamily: typography.fontFamily.interRegular,
  },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  foodPrice: {
    fontSize: 18,
    fontFamily: typography.fontFamily.interRegular,
    fontWeight: '700',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  originalPrice: {
    fontSize: 14,
    fontFamily: typography.fontFamily.interRegular,
    textDecorationLine: 'line-through',
  },
  foodActions: {
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  favoriteBtn: {
    padding: 4,
  },
  addBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  loadingBox: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  loadingOverlayText: {
    marginTop: 12,
    fontSize: 16,
    fontFamily: typography.fontFamily.interRegular,
    fontWeight: '500',
  },
  // Filter Section Styles
  filterSection: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 12,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop:20,
   alignSelf:'center'

  },
  filterDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  filterDropdownText: {
    fontSize: 16,
    fontFamily: typography.fontFamily.regular,
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateArrowDisabled: {
    opacity: 0.3,
  },
  dateTodayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  dateTodayText: {
    fontSize: 16,
    fontFamily: typography.fontFamily.regular,
  },
  // Date Picker Modal Styles
  datePickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  datePickerContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  datePickerCancel: {
    fontSize: 16,
    fontFamily: typography.fontFamily.interRegular,
  },
  datePickerTitle: {
    fontSize: 18,
    fontFamily: typography.fontFamily.interRegular,
    fontWeight: '600',
  },
  datePickerDone: {
    fontSize: 16,
    fontFamily: typography.fontFamily.interRegular,
    fontWeight: '600',
  },
  datePickerContent: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  datePickerDateText: {
    fontSize: 20,
    fontFamily: typography.fontFamily.interRegular,
    fontWeight: '500',
    textAlign: 'center',
  },
  // Dropdown Modal Styles
  dropdownOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-start',
    paddingTop: 120,
  },
  dropdownContainer: {
    paddingHorizontal: 20,
  },
  dropdownMenu: {
    borderRadius: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  dropdownItemSelected: {
    backgroundColor: 'rgba(124, 58, 0, 0.08)',
  },
  dropdownItemText: {
    fontSize: 16,
    fontFamily: typography.fontFamily.interRegular,
    fontWeight: '500',
  },
});
