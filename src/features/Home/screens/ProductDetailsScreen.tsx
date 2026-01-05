import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
  StatusBar,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { I18nManager } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import { colors, spacing, typography } from '../../../theme';
import { BASE_URL } from '../../../services/api/baseUrl';
import { useProductsQuery } from '../../../services/api/homeApi';
import { useAddToCartMutation } from '../../../services/api/cartApi';
import { useAppSelector } from '../../../state/hooks';
import { showSuccessToast, showErrorToast } from '../../../utils/toast';

const { width } = Dimensions.get('window');

export const ProductDetailsScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { colors: themeColors, isDark } = useTheme();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const { productId } = route.params as { productId: number };
  const { employeeId } = useAppSelector(state => state.auth);
  
  const [quantity, setQuantity] = useState(1);
  
  const { data: productsResp } = useProductsQuery({ employeeId: employeeId || 0 }, {
    skip: !employeeId,
  });
  const products = productsResp?.data || [];
  const product = products.find((p: any) => p.id === productId);

  const [addToCart] = useAddToCartMutation();

  if (!product) {
    return (
      <View style={styles.container}>
        <Text>{t('Product not found')}</Text>
      </View>
    );
  }

  const imageUrl = product.image 
    && `${BASE_URL}${product.image}`;

  const productName = isRTL ? (product.name_ar || product.name || product.name_en) : (product.name_en || product.name);
  const productDesc = isRTL 
    ? (product.description_ar || product.description_en || product.description) 
    : (product.description || product.description_en);
  const categoryName = isRTL 
    ? (product.department?.name_ar || product.department?.name_en) 
    : product.department?.name_en;

  let ingredients: string[] = [];
  if (typeof product.ingredients === 'string') {
    ingredients = product.ingredients.split(',').map((i: string) => i.trim());
  } else if (Array.isArray(product.ingredients)) {
    ingredients = product.ingredients;
  }

  const handleBack = () => navigation.goBack();
  const handleShare = () => {
    // Implement share logic
    console.log('Share product', product.name_en);
  };
  
  const incrementQuantity = () => setQuantity(prev => prev + 1);
  const decrementQuantity = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));
  
  const handleAddToCart = async () => {
    if (!employeeId) {
      showErrorToast(t('Please login to add items to cart'));
      return;
    }

    try {
      const formatDateForAPI = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      const selectedDate = new Date();
      const preorderDate = formatDateForAPI(selectedDate);

      const response = await addToCart({
        employee_id: employeeId,
        product_id: product.id,
        quantity: quantity,
        preorder_date: preorderDate,
      }).unwrap();

      const successMessage = response?.message || t('item(s) added to cart successfully!');
      showSuccessToast(successMessage);
      
      // Navigate to Cart screen with the preorder date
      // @ts-ignore - Navigation typing issue
      navigation.navigate('Cart', { preorderDate });
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      showErrorToast(error?.data?.message || t('Failed to add product to cart'));
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? themeColors.background : colors.white }]}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <ScrollView 
        style={styles.scrollView}
        bounces={false}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Image */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
          
          {/* Header Actions (Absolute) */}
          <View style={[styles.headerActions, { paddingTop: insets.top + 10 }]}>
            <TouchableOpacity onPress={handleBack} style={styles.iconButton}>
              {/* <View style={styles.backIconCircle}> */}
                <Image 
                  source={require('../../../assets/images/whiteArrow.png')} 
                  style={{ width: 36, height: 36 }}
                  resizeMode="contain"
                />
              {/* </View> */}
            </TouchableOpacity>
            <TouchableOpacity onPress={handleShare} style={styles.iconButtonWrapper}>
               {/* <View style={styles.shareIconCircle}> */}
                <Image 
                  source={require('../../../assets/images/share.png')} 
                  style={{ width: 36, height: 36 }}
                  resizeMode="contain"
                />
               {/* </View> */}
            </TouchableOpacity>
          </View>

          {/* Pagination Dots (Placeholder for multiple images) */}
          <View style={styles.pagination}>
            <View style={[styles.dot, styles.activeDot]} />
            <View style={styles.dot} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
        </View>

        {/* Content */}
        <View style={[styles.content, { backgroundColor: isDark ? themeColors.background : colors.white }]}>
          <Text style={[
              styles.category, 
              { color: isDark ? themeColors.textTertiary : colors.gray700 },
            ]}>{categoryName}</Text>
          <Text style={[
              styles.title, 
              { color: isDark ? themeColors.textPrimary : colors.primary },
            ]}>{productName}</Text>
          <Text style={styles.price}>{product.price} QAR</Text>
          
          <Text style={[
              styles.description, 
              { color: isDark ? themeColors.textTertiary : colors.gray500 },
            ]}>
            {productDesc || t('Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.')}
          </Text>

          {/* Ingredients */}
          {ingredients.length > 0 && (
            <View style={styles.section}>
              <Text style={[
                  styles.sectionTitle, 
                  { color: isDark ? themeColors.textPrimary : colors.primary },
                ]}>{t('Ingredients')}</Text>
              <Text style={[
                  styles.itemCount, 
                  { color: themeColors.textTertiary },
                ]}>{ingredients.length} {t('Items')}</Text>
              <View style={styles.chipContainer}>
                {ingredients.map((item: string, index: number) => (
                  <View key={index} style={[styles.chip, { 
                      backgroundColor: isDark ? themeColors.backgroundSecondary : colors.white,
                      borderColor: isDark ? themeColors.borderLight : colors.secondary 
                  }]}>
                    <Text style={[styles.chipText, { color: isDark ? themeColors.textPrimary : colors.primary }]}>{item}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
           
           {/* Bottom Spacer to clear fixed bottom bar */}
           <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* Bottom Bar */}
      <View style={[styles.bottomBar, { 
          paddingBottom: insets.bottom + 20,
          backgroundColor: isDark ? themeColors.background : colors.white,
          borderTopColor: isDark ? themeColors.borderLight : '#F3F4F6'
      }]}>
        <View style={[styles.quantityControl, { 
            backgroundColor: isDark ? themeColors.backgroundSecondary : '#F9FAFB',
            borderColor: isDark ? themeColors.borderLight :  colors.secondary
        }]}>
          <TouchableOpacity onPress={decrementQuantity} style={styles.qtyBtn}>
            <Text style={[styles.qtyBtnText, { color: isDark ? themeColors.textPrimary : colors.secondary }]}>-</Text>
          </TouchableOpacity>
          <Text style={[styles.qtyText, { color: isDark ? themeColors.textPrimary : colors.primary }]}>{quantity}</Text>
          <TouchableOpacity onPress={incrementQuantity} style={styles.qtyBtn}>
            <Text style={[styles.qtyBtnText, { color: isDark ? themeColors.textPrimary : colors.secondary }]}>+</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.addToCartBtn} onPress={handleAddToCart}>
          <Text style={styles.addToCartText}>{t('Add to cart')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    height: 300,
    width: '100%',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  headerActions: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  iconButton: {
    // padding: 8,
  },
  backIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButtonWrapper: {
     justifyContent: 'center',
     alignItems: 'center',
  },
  shareIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.8)', // Semi-transparent white
    justifyContent: 'center',
    alignItems: 'center',
  },
  pagination: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  activeDot: {
    backgroundColor: colors.white,
  },
  content: {
    padding: 24,
    backgroundColor: colors.white,
    borderTopLeftRadius: 30, // Usually sheets have this, but design looks flat. 
    // Figma image shows the white content starts below the image, maybe simpler.
    // The design shows the text starting on white background.
  },
  category: {
    fontSize: 14,
    color: colors.gray700,
    fontFamily: typography.fontFamily.interBold,
    marginBottom: 8,
    // fontWeight:'600'
  },
  title: {
    fontSize: 24,
    color: colors.primary,
    fontFamily: typography.fontFamily.medium,
    marginBottom: 12,
    lineHeight: 32,
  },
  price: {
    fontSize: 24,
    color: colors.successDark, // Green
    fontFamily: typography.fontFamily.interRegular,
    marginBottom: 16,
    fontWeight:'700'
  },
  description: {
    fontSize: 14,
    color: colors.gray500, // Light gray for description
    fontFamily: typography.fontFamily.interRegular,
    lineHeight: 22,
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    color: colors.primary,
    fontFamily: typography.fontFamily.interRegular,
    fontWeight:'700',
    marginBottom: 4,
  },
  itemCount: {
    fontSize: 12,
    color: colors.gray500,
    fontFamily: typography.fontFamily.interRegular,
    marginBottom: 12,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor:  colors.gray300,
    backgroundColor: colors.white,
  },
  chipText: {
    fontSize: 14,
    color: colors.gray700,
    fontFamily: typography.fontFamily.interRegular,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    borderTopColor: '#F3F4F6',
    gap: 16,
  
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB', // Very light gray background for control
    borderRadius: 30, // Pill shape
    paddingHorizontal: 4,
    height: 50,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  qtyBtn: {
    width: 40,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyBtnText: {
    fontSize: 20,
    color: colors.primary,
    fontWeight: '400',
  },
  qtyText: {
    fontSize: 18,
    color: colors.primary,
    fontWeight: '600',
    marginHorizontal: 8,
    minWidth: 20,
    textAlign: 'center',
  },
  addToCartBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    height: 50,
    borderRadius: 30, // Pill shape
    justifyContent: 'center',
    alignItems: 'center',
  },
  addToCartText: {
    color: colors.white,
    fontSize: 16,
    fontFamily: typography.fontFamily.semiBold,
  },
});
