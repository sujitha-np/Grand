import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

const ThemeBootstrap = () => {
  const { initTheme, isDark, colors } = useTheme();

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  return (
    <StatusBar 
      barStyle={isDark ? 'light-content' : 'dark-content'} 
      backgroundColor={colors.background} 
    />
  );
};

export default ThemeBootstrap;
