import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../state/hooks';
import { setTheme, toggleTheme as toggleThemeAction } from '../state/themeSlice';
import { storage } from '../utils/storage';
import { lightColors, darkColors, ThemeColors } from '../theme/colors';

export const useTheme = () => {
  const dispatch = useAppDispatch();
  const isDark = useAppSelector((state) => state.theme.isDark);

  const colors = isDark ? darkColors : lightColors;

  const toggleTheme = useCallback(async () => {
    const newTheme = !isDark;
    dispatch(toggleThemeAction());
    await storage.setItem('theme', newTheme ? 'dark' : 'light');
  }, [isDark, dispatch]);

  const initTheme = useCallback(async () => {
    const savedTheme = await storage.getItem<string>('theme');
    if (savedTheme === 'dark') {
      dispatch(setTheme(true));
    }
  }, [dispatch]);

  return { isDark, colors, toggleTheme, initTheme };
};

export type ThemeHook = ReturnType<typeof useTheme>;
