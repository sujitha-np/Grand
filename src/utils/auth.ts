/**
 * Authentication utility functions
 */
import { storage } from './storage';
import { STORAGE_KEYS } from '../config/constants';
import { logout as logoutAction } from '../features/Auth/authSlice';
import type { AppDispatch } from '../state/store';

/**
 * Performs a complete logout by clearing storage and Redux state
 * @param dispatch - Redux dispatch function
 */
export const performLogout = async (dispatch: AppDispatch): Promise<void> => {
  try {
    // Clear all auth-related storage
    await Promise.all([
      storage.removeItem(STORAGE_KEYS.AUTH_TOKEN),
      storage.removeItem(STORAGE_KEYS.USER_DATA),
      storage.removeItem('@employee_id'),
    ]);

    // Clear Redux state
    dispatch(logoutAction());

    if (__DEV__) {
    }
  } catch (error) {
    console.error('❌ Error during logout:', error);
    // Still dispatch logout action even if storage clearing fails
    dispatch(logoutAction());
    throw error;
  }
};
