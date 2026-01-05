/**
 * Navigation entry point
 */
import React, { useEffect, useRef } from 'react';
import { BackHandler, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { RootNavigator } from './RootNavigator';
import { navigationRef } from './navigationRef';

export const AppNavigator = () => {
  // Handle Android back button globally
  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const onBackPress = () => {
      // Let React Navigation handle the back button
      // Return  false to allow default behavior
      if (navigationRef.current?.canGoBack()) {
        navigationRef.current?.goBack();
        return true; // We handled it
      }
      return false; // Exit app if can't go back
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

    return () => subscription.remove();
  }, []);

  return (
    <NavigationContainer ref={navigationRef}>
      <RootNavigator />
    </NavigationContainer>
  );
};

export * from './types';
