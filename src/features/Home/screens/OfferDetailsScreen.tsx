import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useTheme } from '../../../hooks/useTheme';
import { typography } from '../../../theme';
import { useTranslation } from 'react-i18next';
import { useOfferProductsQuery, useCategoriesQuery, useOffersQuery } from '../../../services/api/homeApi';
import { useAddToCartMutation } from '../../../services/api/cartApi';
import { useAppSelector } from '../../../state/hooks';
import { BASE_URL } from '../../../services/api/baseUrl';
import AddButtonIcon from '../../../components/icons/AddButtonIcon';
import { showSuccessToast, showErrorToast } from '../../../utils/toast';
import { Header } from '../../../components/common/Header';

export const OfferDetailsScreen = () => {
  const route = useRoute();
  const navigation = useNavigation<any>();
  const { colors, isDark } = useTheme();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const { offerId, offerName } = route.params as { offerId: number; offerName: string };
  const { employeeId } = useAppSelector(state => state.auth);
  const [selectedDate] = useState(new Date());

  const { data: productsResp, isLoading } = useOfferProductsQuery(offerId);
  const products = productsResp?.data || [];

  // Fetch departments/categories to map department_id to name
  const { data: categoriesResp } = useCategoriesQuery();
  const categories = categoriesResp?.data || [];

  // Fetch offers to get the dynamic name (arabic support)
  const { data: offersResp } = useOffersQuery();
  const currentOffer = offersResp?.data?.find((o: any) => o.id === offerId);
  
  const displayOfferName = isRTL 
    ? (currentOffer?.name_ar || currentOffer?.name_en || offerName)
    : (currentOffer?.name_en || offerName);

  const [addToCart] = useAddToCartMutation();

  const handleBack = () => navigation.goBack();

  // Handle add to cart
  const handleAddToCart = async (productId: number) => {
    if (!employeeId) return;

    try {
      const formatDateForAPI = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      const preorderDate = formatDateForAPI(selectedDate);

      const response = await addToCart({
        employee_id: employeeId,
        product_id: productId,
        quantity: 1,
        preorder_date: preorderDate,
      }).unwrap();

      const successMessage = response?.message || t('Product added to cart successfully!');
      showSuccessToast(successMessage);
      
      // Navigate to Cart screen with the preorder date
      navigation.navigate('Cart', { preorderDate });
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      showErrorToast(error?.data?.message || t('Failed to add product to cart'));
    }
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
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? colors.background : colors.bgLight,
        },
      ]}
    >
      {/* Header */}
      <Header 
        title={displayOfferName}
        backgroundColor={isDark ? colors.background : '#FFFFFF'}
        backIconSize={32}
      />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Products List */}
        <View style={styles.productsList}>
          {products.length > 0 ? (
            products.map((item: any) => {
              const product = item.product;
              const imageUrl = product.image && `${BASE_URL}${product.image}`;
              const offerPriceStr = item.offer_price || product.offer_price || '0';
              const originalPriceStr = product.price || '0';
              const offerPrice = parseFloat(offerPriceStr);
              const originalPrice = parseFloat(originalPriceStr);
              
              // Find department name from categories using department_id
              const department = categories.find((cat: any) => cat.id === product.department_id);
              const departmentName = isRTL
                ? (department?.name_ar || department?.name_en || product.department?.name_ar || product.department?.name_en || t('Category'))
                : (department?.name_en || product.department?.name_en || t('Category'));
                
              const productName = isRTL 
                ? (product.name_ar || product.name_en || product.name) 
                : (product.name_en || product.name);

              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.productCard,
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
                    source={{ uri: imageUrl }}
                    style={[
                      styles.productImage,
                      { backgroundColor: colors.gray200 },
                    ]}
                  />

                  <View style={styles.productInfo}>
                    {/* Top Row: Info */}
                    <View style={styles.cardTopRow}>
                      <View style={styles.textContainer}>
                        <Text
                          style={[
                            styles.productName,
                            { color: colors.textPrimary },
                          ]}
                          numberOfLines={1}
                        >
                          {productName}
                        </Text>
                        <Text
                          style={[
                            styles.productCategory,
                            { color: colors.gray600 },
                          ]}
                        >
                          {departmentName}
                        </Text>
                      </View>
                    </View>

                    {/* Bottom Row: Price + Add Button */}
                    <View style={styles.cardBottomRow}>
                      <View>
                        <Text
                          style={[
                            styles.productStock,
                            { color: colors.gray500 },
                          ]}
                        >
                          {product.stock > 0 ? t('In stock') : t('Out of stock')}
                        </Text>
                        <View style={styles.priceRow}>
                          <Text
                            style={[
                              styles.productPrice,
                              { color: colors.successDark },
                            ]}
                          >
                            {offerPriceStr} QAR
                          </Text>
                          {originalPrice > offerPrice && (
                            <Text
                              style={[
                                styles.originalPrice,
                                { color: colors.gray500 },
                              ]}
                            >
                              {originalPriceStr} QAR
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
                          backgroundColor={isDark ? colors.textPrimary : "#ECF1E8"}
                          iconColor={colors.successDark}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          ) : (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                {t('No products in this offer')}
              </Text>
            </View>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 20,
    paddingBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: typography.fontFamily.semiBold,
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  productsList: {
    flex: 1,
  },
  productCard: {
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
  productImage: {
    width: 110,
    height: 110,
    borderRadius: 16,
  },
  productInfo: {
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
  productName: {
    fontSize: 16,
    fontFamily: typography.fontFamily.interRegular,
    fontWeight: '600',
  },
  productCategory: {
    fontSize: 12,
    fontFamily: typography.fontFamily.interRegular,
  },
  productStock: {
    fontSize: 12,
    fontFamily: typography.fontFamily.interRegular,
  },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  productPrice: {
    fontSize: 18,
    fontFamily: typography.fontFamily.interRegular,
    fontWeight: '600',
  },
  originalPrice: {
    fontSize: 14,
    fontFamily: typography.fontFamily.interRegular,
    textDecorationLine: 'line-through',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: typography.fontFamily.interRegular,
  },
});
