import React, {
  createContext,
  useContext,
  useMemo,
  useRef,
  useState,
  useEffect,
} from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import { typography } from '../../theme/typography';
import { setToastInstance } from '../../utils/toast';

export type ToastType = 'success' | 'error' | 'info';

interface ToastContextValue {
  show: (message: string, type?: ToastType, durationMs?: number) => void;
  showSuccess: (message: string, durationMs?: number) => void;
  showError: (message: string, durationMs?: number) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [message, setMessage] = useState<string>('');
  const [type, setType] = useState<ToastType>('info');
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hide = () => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: -20,
        duration: 200,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  };

  const show = (msg: string, t: ToastType = 'info', durationMs = 2000) => {
    setMessage(msg);
    setType(t);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 200,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
    timeoutRef.current = setTimeout(hide, durationMs);
  };

  const value = useMemo(
    () => ({
      show,
      showSuccess: (msg: string, d?: number) => show(msg, 'success', d),
      showError: (msg: string, d?: number) => show(msg, 'error', d),
    }),
    []
  );

  // Register this toast instance globally
  useEffect(() => {
    setToastInstance(value);
    return () => setToastInstance(null);
  }, [value]);

  const bg =
    type === 'success'
      ? colors.success
      : type === 'error'
      ? colors.error
      : colors.gray800;

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.container,
          { top: insets.top + 8, opacity, transform: [{ translateY }] },
        ]}
      >
        <View style={[styles.toast, { backgroundColor: bg }]}>
          <Text style={styles.text}>{message}</Text>
        </View>
      </Animated.View>
    </ToastContext.Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 9999,
  },
  toast: {
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
    maxWidth: '95%',
  },
  text: {
    fontSize: 14,
    fontFamily:
      typography.fontFamily.interLight || typography.fontFamily.regular,
  },
});
