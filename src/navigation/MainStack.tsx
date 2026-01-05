/**
 * Main Stack Navigator (contains tabs and modal screens)
 */
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import type { MainStackParamList } from './types';
import { MainTabs } from './MainTabs';

import { ProductDetailsScreen } from '../features/Home/screens/ProductDetailsScreen';
import { ProfileScreen } from '../features/Profile/screens/ProfileScreen';
import { PersonalInfoScreen } from '../features/Profile/screens/PersonalInfoScreen';
import { SettingsScreen } from '../features/Profile/screens/SettingsScreen';
import { AllowanceScreen } from '../features/Profile/screens/AllowanceScreen';
import { LoyaltyPointsScreen } from '../features/Profile/screens/LoyaltyPointsScreen';
import { OffersScreen } from '../features/Home/screens/OffersScreen';
import { OfferDetailsScreen } from '../features/Home/screens/OfferDetailsScreen';
import { MessagesScreen } from '../features/Messages/screens/MessagesScreen';
import { FeedbackScreen } from '../features/Feedback/screens/FeedbackScreen';
import { NotificationsScreen } from '../features/Notifications/screens/NotificationsScreen';

import { PendingOrdersScreen } from '../features/Orders/screens/PendingOrdersScreen';

import { OrderHistoryScreen } from '../features/Orders/screens/OrderHistoryScreen';
import { RepeatOrdersScreen } from '../features/Orders/screens/RepeatOrdersScreen';
import { RepeatOrderDetailsScreen } from '../features/Orders/screens/RepeatOrderDetailsScreen';
import { AboutScreen } from '../features/Profile/screens/AboutScreen';
import { TermsScreen } from '../features/Profile/screens/TermsScreen';
import { HelpScreen } from '../features/Profile/screens/HelpScreen';
import { LanguageScreen } from '../features/Profile/screens/LanguageScreen';
import { PaymentWebViewScreen } from '../features/Cart/screens/PaymentWebViewScreen';

// Placeholder screens (will be implemented)
const CategoryProductsScreen = () => null;
const CheckoutScreen = () => null;

const WalletScreen = () => null;
const OrderConfirmationScreen = () => null;

const Stack = createStackNavigator<MainStackParamList>();

export const MainStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#FFFFFF' },
      }}
    >
      <Stack.Screen name="MainTabs" component={MainTabs} />

      {/* Modal/Detail Screens */}
      <Stack.Screen
        name="ProductDetail"
        component={ProductDetailsScreen}
        options={{ presentation: 'card' }} // Changing to card for full screen transition usually preferred for details
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ presentation: 'card' }}
      />
      <Stack.Screen
        name="CategoryProducts"
        component={CategoryProductsScreen}
      />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen name="OrderHistory" component={OrderHistoryScreen} />
      <Stack.Screen name="PendingOrders" component={PendingOrdersScreen} />
      <Stack.Screen name="RepeatOrders" component={RepeatOrdersScreen} />
      <Stack.Screen name="RepeatOrderDetails" component={RepeatOrderDetailsScreen} />
      <Stack.Screen name="PersonalInfo" component={PersonalInfoScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Wallet" component={WalletScreen} />
      <Stack.Screen name="Allowance" component={AllowanceScreen} />
      <Stack.Screen name="LoyaltyPoints" component={LoyaltyPointsScreen} />
      <Stack.Screen name="Offers" component={OffersScreen} />
      <Stack.Screen name="OfferDetails" component={OfferDetailsScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Messages" component={MessagesScreen} />
      <Stack.Screen name="Feedback" component={FeedbackScreen} />
      <Stack.Screen
        name="OrderConfirmation"
        component={OrderConfirmationScreen}
      />
      <Stack.Screen name="About" component={AboutScreen} />
      <Stack.Screen name="Terms" component={TermsScreen} />
      <Stack.Screen name="Help" component={HelpScreen} />
      <Stack.Screen name="Language" component={LanguageScreen} />
      <Stack.Screen 
        name="PaymentWebView" 
        component={PaymentWebViewScreen}
        options={{ presentation: 'card' }}
      />
    </Stack.Navigator>
  );
};
