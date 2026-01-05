/**
 * Root Navigator - Handles auth state and navigation
 */
import React, { useEffect, useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import type { RootStackParamList } from './types';
import { AuthStack } from './AuthStack';
import { MainStack } from './MainStack';
import { STORAGE_KEYS } from '@config/constants';
import { storage } from '@utils/storage';
import { SplashScreen } from '../features/Auth/screens/SplashScreen';
import { useAppSelector } from '../state/hooks';

const Stack = createStackNavigator<RootStackParamList>();

export const RootNavigator = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  
  // Listen to Redux auth state
  const { isAuthenticated, token } = useAppSelector(state => state.auth);
  
  // Determine if user is actually authenticated (has token)
  const isUserAuthenticated = isAuthenticated && !!token;

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const handleGetStarted = async () => {
    // Mark that user has seen the splash screen
    await storage.setItem('HAS_SEEN_SPLASH', true);
    setShowSplash(false);
  };

  const checkAuthStatus = async () => {
    try {
      const storedToken = await storage.getItem<string>(STORAGE_KEYS.AUTH_TOKEN);
      // Check if this is the first launch
      const hasSeenSplash = await storage.getItem<boolean>('HAS_SEEN_SPLASH');
      
      if (!hasSeenSplash) {
        // First launch - show splash screen and wait for user to click Get Started
        setShowSplash(true);
        setIsLoading(false); // Allow splash to render
      } else {
        // Not first launch - skip splash
        setShowSplash(false);
        setIsLoading(false);
      }
      // Auth state will be hydrated by AuthBootstrap
    } catch (error) {
      console.error('Error checking auth status:', error);
      setShowSplash(false);
      setIsLoading(false);
    }
  };

  // Wait until we've checked if we should show splash
  if (isLoading) {
    return null;
  }

  if (showSplash) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash">
          {props => <SplashScreen {...props} onGetStarted={handleGetStarted} />}
        </Stack.Screen>
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isUserAuthenticated ? (
        <Stack.Screen name="Main" component={MainStack} />
      ) : (
        <Stack.Screen name="Auth" component={AuthStack} />
      )}
    </Stack.Navigator>
  );
};
