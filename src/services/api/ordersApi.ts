import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { ApiResponse } from '../../types';
import { BASE_URL, API_PREFIX } from './baseUrl';
import type { RootState } from '../../state/store';
import { storage } from '../../utils/storage';
import { STORAGE_KEYS } from '../../config/constants';

// Raw base query WITHOUT token injection
const rawBaseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
});

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

    args.headers['Accept'] = 'application/json';

    if (token) {
      args.headers['bearer'] = token;
    }
  }

  // Log request
  const url = typeof args === 'string' ? args : args?.url;
  const method = typeof args === 'string' ? 'GET' : args?.method || 'GET';
  const body = typeof args !== 'string' ? args.body : undefined;
  
  console.log('🛍️ [Orders API Request]', {
    method,
    url,
    body: body ? JSON.stringify(body) : undefined,
  });

  const result = await rawBaseQuery(args, api, extraOptions);

  // Log response
  if (result.error) {
    console.log('🛍️ [Orders API Response] Error:', result.error);
  } else {
    console.log('🛍️ [Orders API Response]', {
      status: 'success',
      data: result.data ? JSON.stringify(result.data) : undefined,
    });
  }

  return result;
};

export const ordersApi = createApi({
  reducerPath: 'ordersApi',
  baseQuery: baseQueryWithLogging,
  tagTypes: ['Orders'],
  endpoints: builder => ({
    // POST /api/employee/orders/by-date - Get orders by date
    getOrdersByDate: builder.mutation<ApiResponse<any>, {
      employee_id: number;
      order_date: string; // Format: YYYY-MM-DD
    }>({
      query: body => ({
        url: `${API_PREFIX}/employee/orders/by-date`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Orders'],
    }),

    // POST /api/employee/orders/history - Get order history
    getOrderHistory: builder.mutation<ApiResponse<any>, {
      employee_id: number;
      date?: string; // Optional: Format YYYY-MM-DD
    }>({
      query: body => ({
        url: `${API_PREFIX}/employee/orders/history`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Orders'],
    }),

    // POST /api/employee/order/repeat - Repeat an order
    repeatOrder: builder.mutation<ApiResponse<any>, {
      employee_id: number;
      order_id: number;
      preorder_date: string; // Format: YYYY-MM-DD
    }>({
      query: body => ({
        url: `${API_PREFIX}/employee/order/repeat`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Orders'],
    }),
  }),
});

export const {
  useGetOrdersByDateMutation,
  useGetOrderHistoryMutation,
  useRepeatOrderMutation,
} = ordersApi;
