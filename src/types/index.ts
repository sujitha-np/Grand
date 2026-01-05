/**
 * Global TypeScript type definitions
 */

// User types (Employee from backend)
export interface User {
  id: number;
  employer_id: number;
  employee_code: string;
  name_en: string;
  name_ar: string | null;
  mobile: string;
  email: string;
  qid: string;
  gender: string;
  dob: string;
  photo: string | null;
  designation: string;
  remaining_allowance: string;
  status: number;
  daily_meal_allowance: string;
  cutoff_time: string;
  use_custom_settings: number;
  registration_source: string;
  is_approved: number;
  otp: string | null;
  otp_expiration: string | null;
  access_token: string | null;
  device_token: string | null;
  created_by: number;
  updated_by: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  approved_by: number | null;
  approved_at: string | null;
  is_verified: number;
  verified_by: number | null;
  verified_at: string | null;
  // Convenience properties (computed from backend fields)
  name?: string; // alias for name_en
  phone?: string; // alias for mobile
  avatar?: string; // alias for photo
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Product types
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  salePrice?: number;
  imageUrl: string;
  images?: string[];
  stock: number;
  categoryId: number;
  category?: Category;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  imageUrl?: string;
  parentId?: number;
}

// Cart types
export interface CartItem {
  id: number;
  productId: number;
  product: Product;
  quantity: number;
  price: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
  itemCount: number;
}

// Order types
export interface Order {
  id: number;
  userId: number;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  shippingAddress: Address;
  billingAddress?: Address;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  product: Product;
  quantity: number;
  price: number;
  subtotal: number;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'paid'
  | 'failed'
  | 'refunded';

// Address types
export interface Address {
  id?: number;
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  meta: {
    currentPage: number;
    lastPage: number;
    perPage: number;
    total: number;
  };
}

// Navigation types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  ProductDetail: { productId: number };
  Checkout: undefined;
  OrderConfirmation: { orderId: number };
};

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Products: undefined;
  Cart: undefined;
  Profile: undefined;
};
