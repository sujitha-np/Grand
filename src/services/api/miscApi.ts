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
  
  console.log('ℹ️ [Misc API Request]', {
    method,
    url,
  });

  const result = await rawBaseQuery(args, api, extraOptions);

  // Log response
  if (result.error) {
    console.log('❌ [Misc API Response] Error:', result.error);
  } else {
    console.log('✅ [Misc API Response]', {
      status: 'success',
    });
  }

  return result;
};

export const miscApi = createApi({
  reducerPath: 'miscApi',
  baseQuery: baseQueryWithLogging,
  endpoints: builder => ({
    getAbout: builder.query<ApiResponse<{ about_en: string; about_ar: string }>, void>({
      query: () => ({
        url: `${API_PREFIX}/about`,
        method: 'GET',
      }),
    }),
    getTerms: builder.query<ApiResponse<{ terms_en: string; terms_ar: string }>, void>({
      query: () => ({
        url: `${API_PREFIX}/terms`,
        method: 'GET',
      }),
    }),
    getContact: builder.query<ApiResponse<{
      phone: string;
      mobile: string;
      address_en: string;
      address_ar: string;
      whatsapp_no: string;
      email: string;
    }>, void>({
      query: () => ({
        url: `${API_PREFIX}/contact`,
        method: 'GET',
      }),
    }),
  }),
});

export const {
  useGetAboutQuery,
  useGetTermsQuery,
  useGetContactQuery,
} = miscApi;
