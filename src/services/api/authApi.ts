import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { ApiResponse } from '../../types';
import { BASE_URL, API_PREFIX } from './baseUrl';
import type { RootState } from '../../state/store';
import { storage } from '../../utils/storage';
import { STORAGE_KEYS } from '../../config/constants';
import { setTokenAndEmployee, setUser } from '../../features/Auth/authSlice';

// Types (align loosely with your backend; refine as needed)
export type RegisterPayload = Record<string, any>;
export interface SendOtpPayload {
  email?: string;
  phone?: string;
  login_id?: string;
  password?: string;
}
export interface VerifyOtpPayload {
  email?: string;
  phone?: string;
  employee_id?: number;
  otp: string;
}

export interface SendOtpResponse {
  success: boolean;
  message?: string;
  employee_id?: number;
  otp?: string; // dev-only
}

export interface VerifyOtpResponse {
  success: boolean;
  message?: string;
  token?: string;
  employee?: any; // Use User type from types/index.ts
}

// Wrap baseQuery to log requests/responses in development for easier debugging
const rawBaseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  prepareHeaders: (headers, { getState, endpoint }) => {
    // Attach Bearer token for all endpoints except unauthenticated ones
    const state = getState() as RootState;
    const token = state.auth.token;
    if (
      token &&
      endpoint !== 'register' &&
      endpoint !== 'sendOtp' &&
      endpoint !== 'verifyOtp' &&
      endpoint !== 'employers'
    ) {
      headers.set('bearer', token); // Custom header, just the token
    }
    headers.set('Accept', 'application/json');
    return headers;
  },
});

const baseQueryWithLogging: any = async (
  args: any,
  api: any,
  extraOptions: any
) => {
  // Attach Authorization header from state or storage when required
  const endpoint = api?.endpoint as string | undefined;
  const unauthEndpoints = ['register', 'sendOtp', 'verifyOtp', 'employers'];
  const state = api.getState() as RootState;
  let token: string | null = state?.auth?.token || null;
  if (!token) {
    token = (await storage.getItem<string>(STORAGE_KEYS.AUTH_TOKEN)) || null;
  }
  if (token && (!endpoint || !unauthEndpoints.includes(endpoint))) {
    if (typeof args !== 'string') {
      args.headers = {
        ...(args.headers || {}),
        bearer: token, // Custom header, just the token
        Accept: 'application/json',
      };
    }
  }

  if (__DEV__) {
    const url = typeof args === 'string' ? args : args?.url;
    const headers = typeof args !== 'string' ? args.headers : {};
    console.log('[API Request]', url, {
      method: typeof args === 'string' ? 'GET' : args?.method || 'GET',
      headers,
    });
  }
  const result = await rawBaseQuery(args, api, extraOptions);
  if (__DEV__) {
    const url = typeof args === 'string' ? args : args?.url;
    console.log('[API Response]', url, {
      ok: !(result as any)?.error,
      status: (result as any)?.meta?.response?.status,
      data: (result as any)?.data,
      error: (result as any)?.error,
    });
  }
  return result;
};

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: baseQueryWithLogging,
  tagTypes: ['Auth'],
  endpoints: builder => ({
    // POST https://.../api/employee/register
    register: builder.mutation<ApiResponse<any>, RegisterPayload>({
      query: body => ({
        url: `${API_PREFIX}/employee/register`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Auth'],
    }),

    // POST https://.../api/employee/send-otp
    sendOtp: builder.mutation<SendOtpResponse, SendOtpPayload>({
      query: body => ({
        url: `${API_PREFIX}/employee/send-otp`,
        method: 'POST',
        body,
      }),
    }),

    // POST https://.../api/employee/verify-otp
    verifyOtp: builder.mutation<VerifyOtpResponse, VerifyOtpPayload>({
      query: body => ({
        url: `${API_PREFIX}/employee/verify-otp`,
        method: 'POST',
        body,
      }),
      async onQueryStarted(arg, { queryFulfilled, getState, dispatch }) {
        try {
          const { data } = await queryFulfilled;
          // API returns token and employee directly in response, not nested under data
          const payload = data as any;
          const token = payload?.token;
          const employee = payload?.employee; // full employee object
          const employeeId = employee?.id ?? payload?.employee_id;
          if (token) {
            await storage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
          }
          if (employee) {
            await storage.setItem(STORAGE_KEYS.USER_DATA, employee);
          }
          if (employeeId) {
            await storage.setItem('@employee_id', employeeId);
          }
          // Update Redux auth state immediately (no thunks)
          if (employee) {
            dispatch(setUser(employee));
          }
          dispatch(
            setTokenAndEmployee({
              token: token ?? null,
              employeeId: employeeId ?? null,
            })
          );
        } catch (e) {
          // swallow
        }
      },
      invalidatesTags: ['Auth'],
    }),

    // GET https://.../api/employers
    employers: builder.query<ApiResponse<any[]>, void>({
      query: () => ({
        url: `${API_PREFIX}/employers`,
        method: 'GET',
      }),
    }),
  }),
});

export const { useRegisterMutation, useSendOtpMutation, useVerifyOtpMutation, useEmployersQuery } =
  authApi;
