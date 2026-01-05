import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { ApiResponse } from '../../types';
import { BASE_URL, API_PREFIX } from './baseUrl';
import type { RootState } from '../../state/store';
import { storage } from '../../utils/storage';
import { STORAGE_KEYS } from '../../config/constants';

// Raw base query WITHOUT token injection (we'll do it in the wrapper)
const rawBaseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
});

// Type for place order response
export interface PlaceOrderResponse {
  success: boolean;
  message: string;
  requires_payment: boolean;
  data?: {
    order_id: number;
    unique_id: string;
    extra_payment: number;
    allowance_used: number;
    payment_url?: string;
  };
}

// Wrap with logging and token fallback from storage
const baseQueryWithLogging: any = async (
  args: any,
  api: any,
  extraOptions: any
) => {
  // Check for token in Redux state, fallback to AsyncStorage
  const state = api.getState() as RootState;
  let token: string | null = state?.auth?.token || null;

  if (!token) {
    token = (await storage.getItem<string>(STORAGE_KEYS.AUTH_TOKEN)) || null;
  }

  // Ensure args is an object and has headers property
  if (typeof args !== 'string') {
    if (!args.headers) {
      args.headers = {};
    }

    // Always set Accept header
    args.headers['Accept'] = 'application/json';

    // Set bearer header (custom header, not Authorization)
    if (token) {
      args.headers['bearer'] = token;
    }
  }

  // Always log for debugging
  const url = typeof args === 'string' ? args : args?.url;
  const method = typeof args === 'string' ? 'GET' : args?.method || 'GET';
  const headers = typeof args !== 'string' ? args.headers : {};
  const body = typeof args !== 'string' ? args.body : undefined;
  
  console.log('🛒 [Cart API Request]', url, {
    method,
    headers,
    body: body ? JSON.stringify(body, null, 2) : undefined,
    fullUrl: `${BASE_URL}${url}`,
  });

  const result = await rawBaseQuery(args, api, extraOptions);

  console.log('🛒 [Cart API Response]', url, {
    status: result?.meta?.response?.status,
    data: result?.data ? JSON.stringify(result.data, null, 2) : undefined,
    error: result?.error,
  });

  return result;
};

export const cartApi = createApi({
  reducerPath: 'cartApi',
  baseQuery: baseQueryWithLogging,
  tagTypes: ['Cart', 'Home'],
  endpoints: builder => ({
    // POST /api/employee/cart/add - Add product to cart
    addToCart: builder.mutation<ApiResponse<any>, {
      employee_id: number;
      product_id: number;
      quantity: number;
      preorder_date: string;
    }>({
      query: body => ({
        url: `${API_PREFIX}/employee/cart/add`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Cart'],
    }),

    // POST /api/employee/cart/get - Get cart list
    getCartList: builder.query<ApiResponse<any>, {
      employee_id: number;
      preorder_date: string;
    }>({
      query: body => ({
        url: `${API_PREFIX}/employee/cart/get`,
        method: 'POST',
        body,
      }),
      providesTags: ['Cart'],
    }),

    // POST /api/employee/cart/update - Update cart item quantity
    updateCartQuantity: builder.mutation<ApiResponse<any>, {
      employee_id: number;
      cart_id: number;
      product_id: number;
      quantity: number;
    }>({
      query: body => ({
        url: `${API_PREFIX}/employee/cart/update`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Cart'],
    }),

    // POST /api/employee/cart/remove - Remove item from cart
    removeFromCart: builder.mutation<ApiResponse<any>, {
      employee_id: number;
      cart_id: number;
      product_id: number;
    }>({
      query: body => ({
        url: `${API_PREFIX}/employee/cart/remove`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Cart'],
    }),

    // POST /api/employee/place-order - Place order
    placeOrder: builder.mutation<PlaceOrderResponse, {
      employee_id: number;
      cart_id: number;
    }>({
      query: body => ({
        url: `${API_PREFIX}/employee/place-order`,
        method: 'POST',
        body,
      }),
      // Invalidate both Cart and Home tags to refresh allowance data
      invalidatesTags: ['Cart', 'Home'],
    }),
  }),
});

export const {
  useAddToCartMutation,
  useGetCartListQuery,
  useUpdateCartQuantityMutation,
  useRemoveFromCartMutation,
  usePlaceOrderMutation,
} = cartApi;
