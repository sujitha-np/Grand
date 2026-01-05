/**
 * Navigation type definitions
 */
import type { StackScreenProps } from '@react-navigation/stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';

// Root Stack Navigator
export type RootStackParamList = {
  Splash: undefined;
  Auth: undefined;
  Main: undefined;
};

// Auth Stack Navigator
export type AuthStackParamList = {
  LanguageSelect: undefined;
  Entry: undefined;
  Login: undefined;
  Register: undefined;
  ConfirmRegister: {
    employer_id: string;
    employee_code: string;
    name_en: string;
    mobile: string;
    email: string;
    gender: string;
    dob: string; // ISO date string
    designation: string;
    qid: string;
  };
  OTP: { identifier: string; employeeId?: number };
  ForgotPassword: undefined;
};

// Main Tab Navigator
export type MainTabParamList = {
  Home: undefined;
  Cart: { preorderDate?: string } | undefined;
  Orders: undefined;
  Message: undefined;
};

// Main Stack Navigator (contains tabs + other screens)
export type MainStackParamList = {
  MainTabs: undefined;
  ProductDetail: { productId: number };
  Profile: undefined;
  CategoryProducts: { categoryId: number; categoryName: string };
  Checkout: undefined;
  OrderHistory: undefined;
  PendingOrders: undefined;
  RepeatOrders: undefined;
  RepeatOrderDetails: { order: any };
  PersonalInfo: undefined;
  Settings: undefined;
  Wallet: undefined;
  Allowance: undefined;
  LoyaltyPoints: undefined;
  Offers: undefined;
  OfferDetails: { offerId: number; offerName: string };
  Notifications: undefined;
  Messages: undefined;
  Feedback: undefined;
  OrderConfirmation: { orderId: number };
  About: undefined;
  Terms: undefined;
  Help: undefined;
  Language: undefined;
  PaymentWebView: { 
    payment_url: string; 
    order_id: number; 
    amount: number;
    cartItems?: any[];
    cartData?: any;
  };
};

// Screen Props Types
export type RootStackScreenProps<T extends keyof RootStackParamList> =
  StackScreenProps<RootStackParamList, T>;

export type AuthStackScreenProps<T extends keyof AuthStackParamList> =
  StackScreenProps<AuthStackParamList, T>;

export type MainTabScreenProps<T extends keyof MainTabParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, T>,
    StackScreenProps<MainStackParamList>
  >;

export type MainStackScreenProps<T extends keyof MainStackParamList> =
  StackScreenProps<MainStackParamList, T>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
