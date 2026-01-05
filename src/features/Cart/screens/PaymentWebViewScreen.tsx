import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../../../hooks/useTheme';
import { typography } from '../../../theme';
import ChevronLeftIcon from '../../../components/icons/ChevronLeftIcon';
import { showSuccessToast, showErrorToast } from '../../../utils/toast';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../../../state/hooks';
import { cartApi } from '../../../services/api/cartApi';
import { useGetAllowancesQuery } from '../../../services/api/homeApi';

type RouteParams = {
  payment_url: string;
  order_id: number;
  amount: number;
};

export const PaymentWebViewScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { employeeId } = useAppSelector(state => state.auth);
  
  const { payment_url, order_id, amount } = route.params as RouteParams;

  const [loading, setLoading] = useState(true);
  const [canGoBack, setCanGoBack] = useState(false);

  // Helper to format date for API (YYYY-MM-DD)
  const getTodayFormatted = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Get allowance refetch function
  const { refetch: refetchAllowance } = useGetAllowancesQuery(
    {
      employee_id: employeeId || 0,
      Preorder_date: getTodayFormatted(),
    },
    {
      skip: !employeeId,
    }
  );

  // Handle navigation state changes to detect payment completion
  const handleNavigationStateChange = (navState: any) => {
    const { url } = navState;
    setCanGoBack(navState.canGoBack);

    // Check if the URL indicates payment success or failure
    // Adjust these patterns based on what SkipCash returns
    if (url.includes('payment/success') || url.includes('status=success')) {
      // Payment successful
      handlePaymentSuccess();
    } else if (url.includes('payment/failure') || url.includes('payment/cancel') || url.includes('status=failed')) {
      // Payment failed or cancelled
      handlePaymentFailure();
    }
  };

  const handlePaymentSuccess = async () => {
    // Invalidate cart cache to trigger refetch (this will show empty cart since payment succeeded)
    if (employeeId) {
      // Manually invalidate the cart cache using the util
      cartApi.util.invalidateTags(['Cart']);
      
      // Refetch allowance to get updated values after successful payment
      await refetchAllowance();
    }
    
    showSuccessToast(t('Payment completed successfully!'));
    
    // Navigate to Orders screen to show the order
    navigation.navigate('Orders' as never);
  };

  const handlePaymentFailure = () => {
    showErrorToast(t('Payment failed or cancelled. Please try again.'));
    // Navigate back to Cart screen
    navigation.goBack();
  };

  const handleBackPress = () => {
    Alert.alert(
      t('Cancel Payment'),
      t('Are you sure you want to cancel this payment?'),
      [
        {
          text: t('No'),
          style: 'cancel',
        },
        {
          text: t('Yes'),
          onPress: () => {
            showErrorToast(t('Payment cancelled'));
            navigation.goBack();
          },
          style: 'destructive',
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.backgroundSecondary, borderBottomColor: colors.borderLight }]}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <ChevronLeftIcon size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          {t('Payment')}
        </Text>
        <View style={styles.placeholder} />
      </View>

      {/* Payment Info */}
      <View style={[styles.infoBar, { backgroundColor: colors.backgroundTertiary }]}>
        <Text style={[styles.infoText, { color: colors.textSecondary }]}>
          {t('Order ID')}: #{order_id}
        </Text>
        <Text style={[styles.amountText, { color: colors.primary }]}>
          {amount} QAR
        </Text>
      </View>

      {/* WebView */}
      <View style={styles.webViewContainer}>
        <WebView
          source={{ uri: payment_url }}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
          onNavigationStateChange={handleNavigationStateChange}
          onError={(syntheticEvent: any) => {
            const { nativeEvent } = syntheticEvent;
            showErrorToast(t('Failed to load payment page. Please try again.'));
            console.error('WebView error:', nativeEvent);
          }}
          style={styles.webView}
          // Allow the payment gateway to redirect
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          scalesPageToFit={true}
        />
        
        {/* Loading Indicator */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              {t('Loading payment gateway...')}
            </Text>
          </View>
        )}
      </View>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: typography.fontFamily.interSemiBold,
    fontWeight: '600',
  },
  placeholder: {
    width: 32,
  },
  infoBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  infoText: {
    fontSize: 14,
    fontFamily: typography.fontFamily.interRegular,
  },
  amountText: {
    fontSize: 16,
    fontFamily: typography.fontFamily.interSemiBold,
    fontWeight: '600',
  },
  webViewContainer: {
    flex: 1,
    position: 'relative',
  },
  webView: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontFamily: typography.fontFamily.interRegular,
  },
});

export default PaymentWebViewScreen;
