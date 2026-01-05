/**
 * Grand Central Backery and Kitchen
 * Main App Entry Point
 * @format
 */

import React, { useEffect, useState } from 'react';
import { StatusBar, StyleSheet, Text, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as ReduxProvider } from 'react-redux';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { enableScreens } from 'react-native-screens';
import { store } from './src/state/store';
import { AppNavigator } from './src/navigation';
import AuthBootstrap from './src/features/Auth/AuthBootstrap';
import ThemeBootstrap from './src/features/Theme/ThemeBootstrap';
import { setupI18n } from './src/i18n';
import { typography } from './src/theme/typography';
import { ToastProvider } from './src/components/common/ToastProvider';

// Enable react-native-screens for better performance and proper back button handling
enableScreens();

function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Initialize i18n with saved language from AsyncStorage
    setupI18n().then(i18n => {
      console.log('✅ App ready with language:', i18n.language);
      setIsReady(true);
    });
  }, []);

  // Wait for i18n to initialize
  if (!isReady) {
    return null;
  }

  // Set global default font family for all Text components
  const RNText: any = Text as any;
  if (RNText && !RNText.defaultProps) {
    RNText.defaultProps = {} as any;
  }
  if (RNText) {
    RNText.defaultProps!.style = [
      (RNText.defaultProps!.style as any) || {},
      { fontFamily: typography.fontFamily.regular },
    ];
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <ReduxProvider store={store}>
        <SafeAreaProvider>
          {/* ThemeBootstrap handles StatusBar and theme loading */}
          <ThemeBootstrap />
          {/* Hydrate auth state from AsyncStorage on app start */}
          <AuthBootstrap />
          <ToastProvider>
            <AppNavigator />
          </ToastProvider>
        </SafeAreaProvider>
      </ReduxProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
