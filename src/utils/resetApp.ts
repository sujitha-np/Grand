/**
 * Debug utility to reset app to first launch state
 * Use this to test the first launch experience
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

export const resetToFirstLaunch = async () => {
  try {
    // Clear all AsyncStorage
    await AsyncStorage.clear();
    console.log('✅ App reset to first launch state');
    console.log('Please reload the app to see the Entry screen');
    return true;
  } catch (error) {
    console.error('❌ Error resetting app:', error);
    return false;
  }
};

// You can call this from React Native Debugger console:
// import { resetToFirstLaunch } from './src/utils/resetApp';
// resetToFirstLaunch();
