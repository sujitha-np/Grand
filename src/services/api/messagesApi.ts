import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { ApiResponse } from '../../types';
import { BASE_URL, API_PREFIX } from './baseUrl';
import type { RootState } from '../../state/store';
import { storage } from '../../utils/storage';
import { STORAGE_KEYS } from '../../config/constants';

// Message type
export interface Message {
  id: number;
  message: string;
  sender_type: 'employee' | 'admin';
  created_at: string;
}

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
  
  console.log('💬 [Messages API Request]', {
    method,
    url,
    body: body ? JSON.stringify(body) : undefined,
  });

  const result = await rawBaseQuery(args, api, extraOptions);

  // Log response
  if (result.error) {
    console.log('💬 [Messages API Response] Error:', result.error);
  } else {
    console.log('💬 [Messages API Response]', {
      status: 'success',
      data: result.data ? JSON.stringify(result.data) : undefined,
    });
  }

  return result;
};

export const messagesApi = createApi({
  reducerPath: 'messagesApi',
  baseQuery: baseQueryWithLogging,
  tagTypes: ['Messages'],
  endpoints: builder => ({
    // GET /api/employee/messages/conversations - Get all messages
    getAllMessages: builder.query<ApiResponse<Message[]>, { employee_id: number }>({
      query: ({ employee_id }) => ({
        url: `${API_PREFIX}/employee/messages/conversations`,
        method: 'POST',
        body: { employee_id },
      }),
      providesTags: ['Messages'],
    }),

    // POST /api/employee/message/save - Send a message
    sendMessage: builder.mutation<ApiResponse<any>, {
      employee_id: number;
      message: string;
    }>({
      query: body => ({
        url: `${API_PREFIX}/employee/message/save`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Messages'],
    }),
  }),
});

export const {
  useGetAllMessagesQuery,
  useSendMessageMutation,
} = messagesApi;
