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
      args.headers['bearer'] = token; // Just the token, no "Bearer " prefix
    }
  }

  // Always log for debugging (not just in __DEV__)
  const url = typeof args === 'string' ? args : args?.url;
  const method = typeof args === 'string' ? 'GET' : args?.method || 'GET';
  const headers = typeof args !== 'string' ? args.headers : {};
  const body = typeof args !== 'string' ? args.body : undefined;
  const params = typeof args !== 'string' ? args.params : undefined;
  
  console.log('🌐 [Home API Request]', url, {
    method,
    headers,
    body: body ? JSON.stringify(body, null, 2) : undefined,
    params: params ? JSON.stringify(params, null, 2) : undefined,
    fullUrl: `${BASE_URL}${url}`,
  });

  const result = await rawBaseQuery(args, api, extraOptions);
  
  // Always log response
  const hasError = !!(result as any)?.error;
  console.log('📥 [Home API Response]', url, {
    ok: !hasError,
    status:
      (result as any)?.meta?.response?.status ||
      (result as any)?.error?.status,
    data: (result as any)?.data ? JSON.stringify((result as any).data, null, 2) : undefined,
    error: hasError
      ? {
          status: (result as any)?.error?.status,
          data: (result as any)?.error?.data,
          message:
            (result as any)?.error?.error ||
            (result as any)?.error?.data?.message,
        }
      : undefined,
  });

  return result;
};

export const homeApi = createApi({
  reducerPath: 'homeApi',
  baseQuery: baseQueryWithLogging,
  tagTypes: ['Home', 'Messages'],
  endpoints: builder => ({
    // GET /api/employee/profile/:id
    profile: builder.query<ApiResponse<any>, number | void>({
      query: id => ({
        url: id
          ? `${API_PREFIX}/employee/profile/${id}`
          : `${API_PREFIX}/employee/profile`,
        method: 'GET',
      }),
      providesTags: ['Home'],
    }),

    // GET /api/departments - Fetch filter categories/departments
    categories: builder.query<ApiResponse<any[]>, void>({
      query: () => ({
        url: `${API_PREFIX}/departments`,
        method: 'GET',
      }),
      providesTags: ['Home'],
    }),

    // POST /api/employee/allowance/:id - Fetch employee allowance with date
    getAllowances: builder.query<ApiResponse<any>, { employee_id: number; Preorder_date: string }>({
      query: ({ employee_id, Preorder_date }) => {
        const url = `${API_PREFIX}/employee/allowance/${employee_id}`;
        console.log('🚀 getAllowances API called with:', { employee_id, Preorder_date, url });
        
        // Use FormData to match Postman structure
        // Note: Backend expects 'preorder_date' (lowercase), not 'Preorder_date'
        const formData = new FormData();
        formData.append('preorder_date', Preorder_date);
        
        return {
          url,
          method: 'POST',
          body: formData,
        };
      },
      providesTags: ['Home'],
    }),

    // GET /api/employee/loyalty-points/:id - Fetch employee loyalty points
    getLoyaltyPoints: builder.query<ApiResponse<any>, number>({
      query: id => ({
        url: `${API_PREFIX}/employee/loyalty-points/${id}`,
        method: 'GET',
      }),
      providesTags: ['Home'],
    }),

    // GET /api/employee/allowance-usage/today/:id - Fetch today's allowance usage with orders
    getAllowanceUsage: builder.query<ApiResponse<any>, number>({
      query: employeeId => ({
        url: `${API_PREFIX}/employee/allowance-usage/today/${employeeId}`,
        method: 'GET',
      }),
      providesTags: ['Home'],
    }),

    // POST /api/products - Fetch products
    products: builder.query<ApiResponse<any[]>, { employeeId: number; searchTerm?: string }>({
      query: ({ employeeId, searchTerm }) => ({
        url: `${API_PREFIX}/products`,
        method: 'POST',
        body: { 
          employee_id: employeeId,
          ...(searchTerm && { search_term: searchTerm })
        },
      }),
      providesTags: ['Home'],
    }),

    // GET /api/products/offers - Fetch offers
    offers: builder.query<ApiResponse<any[]>, void>({
      query: () => ({
        url: `${API_PREFIX}/products/offers`,
        method: 'GET',
      }),
      providesTags: ['Home'],
    }),

    // GET /api/products/offer/:id - Fetch products for a specific offer
    offerProducts: builder.query<ApiResponse<any[]>, number>({
      query: offerId => ({
        url: `${API_PREFIX}/products/offer/${offerId}`,
        method: 'GET',
      }),
      providesTags: ['Home'],
    }),

    // POST /api/employee/profile/update - Update employee profile
    updateProfile: builder.mutation<ApiResponse<any>, FormData>({
      query: formData => ({
        url: `${API_PREFIX}/employee/profile/update`,
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Home'],
    }),


    // POST /api/employee/messages/conversations - Get all messages
    getMessages: builder.query<ApiResponse<any[]>, { employee_id: number }>({
      query: (body) => ({
        url: `${API_PREFIX}/employee/messages/conversations`,
        method: 'POST',
        body,
      }),
      providesTags: ['Messages'],
    }),

    // POST /api/employee/message/save - Send message
    sendMessage: builder.mutation<ApiResponse<any>, {
      employee_id: number;
      employer_id: number;
      message: string;
      subject: string | null;
      status: number;
      is_read: number;
      location?: string; // Location as JSON string
    }>({
      query: body => ({
        url: `${API_PREFIX}/employee/message/save`,
        method: 'POST',
        body,
      }),
    }),

    // POST /api/employee/wishlist/add - Add product to wishlist
    addToWishlist: builder.mutation<ApiResponse<any>, {
      employee_id: number;
      product_id: number;
    }>({
      query: body => ({
        url: `${API_PREFIX}/employee/wishlist/add`,
        method: 'POST',
        body,
      }),
    }),

    // POST /api/employee/wishlist/remove - Remove product from wishlist
    removeFromWishlist: builder.mutation<ApiResponse<any>, {
      employee_id: number;
      product_id: number;
    }>({
      query: body => ({
        url: `${API_PREFIX}/employee/wishlist/remove`,
        method: 'POST',
        body,
      }),
    }),

    // POST /api/employee/feedback/save - Submit feedback
    submitFeedback: builder.mutation<ApiResponse<any>, {
      employer_id: number;
      employee_id: number;
      product_id: number;
      feedback: string;
      rating: number;
      feedback_type: string;
      feedback_date: string;
    }>({
      query: body => ({
        url: `${API_PREFIX}/employee/feedback/save`,
        method: 'POST',
        body,
      }),
    }),

    // GET /api/employee/notifications/:id - Fetch employee notifications
    getNotifications: builder.query<ApiResponse<any[]>, number>({
      query: employeeId => ({
        url: `${API_PREFIX}/employee/notifications/${employeeId}`,
        method: 'GET',
      }),
    }),

    // POST /api/employee/orders/pending/by-date - Fetch pending orders
    getPendingOrders: builder.query<ApiResponse<any>, { employee_id: number; order_date: string }>({
      query: body => ({
        url: `${API_PREFIX}/employee/orders/pending/by-date`,
        method: 'POST',
        body,
      }),
    }),

    // GET /api/settings/preorder-limit - Fetch preorder settings (max date limit)
    // Note: This endpoint returns data directly, not wrapped in ApiResponse
    getPreorderSettings: builder.query<{
      success: boolean;
      preorder_limit_weeks: number;
      max_preorder_date: string;
    }, void>({
      query: () => ({
        url: `${API_PREFIX}/settings/preorder-limit`,
        method: 'GET',
      }),
    }),
  }),
});

export const {
  useProfileQuery,
  useCategoriesQuery,
  useGetAllowancesQuery,
  useGetAllowanceUsageQuery,
  useGetLoyaltyPointsQuery,
  useProductsQuery,
  useOffersQuery,
  useOfferProductsQuery,
  useUpdateProfileMutation,
  useGetMessagesQuery,
  useSendMessageMutation,
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
  useSubmitFeedbackMutation,
  useGetNotificationsQuery,
  useGetPendingOrdersQuery,
  useGetPreorderSettingsQuery,
} = homeApi;



