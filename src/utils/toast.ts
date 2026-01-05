/**
 * Toast utility - re-export from ToastProvider for convenience
 * This allows components to use toast without needing the useToast hook
 */

// We'll create a singleton reference to the toast context
// This will be set by the ToastProvider when it mounts
let toastInstance: {
  show: (message: string, type?: 'success' | 'error' | 'info', durationMs?: number) => void;
  showSuccess: (message: string, durationMs?: number) => void;
  showError: (message: string, durationMs?: number) => void;
} | null = null;

export const setToastInstance = (instance: typeof toastInstance) => {
  toastInstance = instance;
};

export const showToast = (
  message: string,
  type: 'success' | 'error' | 'info' = 'info',
  duration: number = 3000
) => {
  if (toastInstance) {
    toastInstance.show(message, type, duration);
  } else {
    console.warn('[Toast] Toast instance not initialized');
  }
};

export const showSuccessToast = (message: string = 'Success!') => {
  if (toastInstance) {
    toastInstance.showSuccess(message, 3000);
  } else {
    console.warn('[Toast] Toast instance not initialized');
  }
};

export const showErrorToast = (message: string = 'Something went wrong') => {
  if (toastInstance) {
    toastInstance.showError(message, 4000);
  } else {
    console.warn('[Toast] Toast instance not initialized');
  }
};
