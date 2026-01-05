/**
 * Authentication Stack Navigator
 */
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createStackNavigator, StackNavigationOptions } from '@react-navigation/stack';
import type { AuthStackParamList } from './types';
import {
  EntryScreen,
  LoginScreen,
  RegisterScreen,
  ConfirmRegisterScreen,
  OTPScreen,
} from '../features/Auth/screens';
import { LanguageSelectScreen } from '../features/Auth/screens/LanguageSelectScreen';
import { hasLanguageBeenSelected } from '../i18n';

// Placeholder screens (will be implemented)

const ForgotPasswordScreen = () => (
  <View style={styles.placeholder}>
    <Text style={styles.text}>Forgot Password Screen</Text>
    <Text style={styles.subtext}>Coming soon...</Text>
  </View>
);

const styles = StyleSheet.create({
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  subtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
  },
});

const Stack = createStackNavigator<AuthStackParamList>();

export const AuthStack = () => {
  // Start directly at Entry screen, skipping language selection
  const [initialRoute, setInitialRoute] = useState<
    'LanguageSelect' | 'Entry' | null
  >('Entry');

  useEffect(() => {
    setInitialRoute('Entry');
  }, []);

  // Show loading until we determine the initial route
  if (!initialRoute) {
    return null;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#FFFFFF' },
        // Let React Navigation handle the back button
        gestureEnabled: true,
      }}
      initialRouteName={initialRoute}
    >
      <Stack.Screen 
        name="LanguageSelect" 
        component={LanguageSelectScreen}
      />
      <Stack.Screen 
        name="Entry" 
        component={EntryScreen}
        options={{
          // Entry screen doesn't have a previous screen
          gestureEnabled: false,
        }}
      />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ConfirmRegister" component={ConfirmRegisterScreen} />
      <Stack.Screen name="OTP" component={OTPScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
};
