/**
 * Authentication Redux Slice (pure Redux, no thunks)
 */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { User } from '../../types';

interface AuthState {
  user: User | null;
  token: string | null;
  employeeId: number | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  otpSent: boolean;
  phoneNumber: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  employeeId: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  otpSent: false,
  phoneNumber: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: state => {
      state.error = null;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    clearAuth: state => {
      state.user = null;
      state.token = null;
      state.employeeId = null;
      state.isAuthenticated = false;
      state.error = null;
      state.otpSent = false;
      state.phoneNumber = null;
    },
    setTokenAndEmployee: (
      state,
      action: PayloadAction<{
        token?: string | null;
        employeeId?: number | null;
      }>
    ) => {
      if (typeof action.payload.token !== 'undefined') {
        state.token = action.payload.token ?? null;
      }
      if (typeof action.payload.employeeId !== 'undefined') {
        state.employeeId = action.payload.employeeId ?? null;
      }
    },
    setOtpSent: (
      state,
      action: PayloadAction<{ otpSent: boolean; phoneNumber?: string | null }>
    ) => {
      state.otpSent = action.payload.otpSent;
      state.phoneNumber =
        typeof action.payload.phoneNumber !== 'undefined'
          ? action.payload.phoneNumber
          : state.phoneNumber;
    },
    logout: state => {
      // Clear all auth state (same as clearAuth)
      state.user = null;
      state.token = null;
      state.employeeId = null;
      state.isAuthenticated = false;
      state.error = null;
      state.otpSent = false;
      state.phoneNumber = null;
    },
  },
});

export const {
  setLoading,
  setError,
  clearError,
  setUser,
  clearAuth,
  setTokenAndEmployee,
  setOtpSent,
  logout,
} = authSlice.actions;
export default authSlice.reducer;
