/**
 * Environment configuration
 * For production, use react-native-config or similar
 */

export const ENV = {
  API_URL: process.env.API_URL || 'http://localhost:8000/api/v1',
  STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY || '',
  GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY || '',
  SENTRY_DSN: process.env.SENTRY_DSN || '',
  FIREBASE_CONFIG: {
    apiKey: process.env.FIREBASE_API_KEY || '',
    authDomain: process.env.FIREBASE_AUTH_DOMAIN || '',
    projectId: process.env.FIREBASE_PROJECT_ID || '',
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '',
    appId: process.env.FIREBASE_APP_ID || '',
  },
};

export const isDevelopment = __DEV__;
export const isProduction = !__DEV__;
