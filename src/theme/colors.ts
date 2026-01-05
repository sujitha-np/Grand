/**
 * App Color Palette
 * Based on Grand Central Bakery brand colors from Figma
 */

// Base palette that doesn't change with theme
const baseColors = {
  // Brand Colors
  primary: '#3B2B20', // Dark Chocolate
  primaryDark: '#2D211A',
  primaryLight: '#4A3529',

  secondary: '#B8935E', // Bronze Gold
  secondaryDark: '#9B7A4F',
  secondaryLight: '#C8A570',

  profileInitial: '#AE6D38',

  // Basic
  black: '#000000',
  white: '#FFFFFF',
  bgLight: '#F8F8F8',

  // Grays (could be adapted but usually stay consistent or inverted)
  gray900: '#1F2937',
  gray800: '#374151',
  gray700: '#4B5563',
  gray600: '#6B7280',
  gray500: '#9CA3AF',
  gray400: '#D1D5DB',
  gray300: '#E5E7EB',
  gray200: '#F3F4F6',
  gray100: '#F9FAFB',

  // Semantic
  success: '#10B981',
  successDark: '#448C07',
  error: '#EF4444',
  favorite: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',

  // Special Cards
  offerBrown: '#8B4513',
  offerOrange: '#D2691E',
  offerDarkOrange: '#FF8C00',

  // Transparents
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
  transparent: 'transparent',
  amber:'#F7B731',
  skyBlue:'#4DA6FF',
  orengeDeep:'#FF8C42',
  greenDeep:'#448C07',
  red:'#E42727',
  amberBg: '#FFF9F0',
  skyBlueBg: '#F5FAFF',
  orengeDeepBg: '#FFF8F0',
  greenDeepBg: '#F7FDF8',
  redBg: '#FFF5F5',
  ash:'#EEEEEE',
};

export const lightColors = {
  ...baseColors,

  // Backgrounds
  background: '#F5EFE7', // Warm cream
  backgroundSecondary: '#FFFFFF', // White for cards
  backgroundTertiary: '#FAF6F0', // Light cream

  // Allowance Card
  allowanceCardBg: '#F7F5F1',
  allowanceProgressBg: '#F3E7D3',
  allowanceProgressFill: '#B88A52',

  // Tab Bar
  tabBarBackground: '#F3E7D3',

  // Auth
  borderBeige: '#D9D4CB',
  borderTan: '#CDBFAA',

  // Buttons
  logoutBg: '#FFF5E6',
  sendButtonBg: '#F3E7D3',

  // Text
  textPrimary: '#252525',
  textSecondary: '#4A3529',
  textTertiary: '#6B5B4F',
  textInverse: '#FFFFFF',
  textPlaceholder: '#252525',

  // Borders
  border: '#D1D5DB',
  borderLight: '#E5E7EB',
  borderDark: '#9CA3AF',
};

export const darkColors = {
  ...baseColors,

  // Backgrounds - Dark Chocolate Theme
  background: '#120C09', // Extremely dark brown, almost black
  backgroundSecondary: '#1E1611', // Card background
  backgroundTertiary: '#2D211A', // Slightly lighter

  // Allowance Card
  allowanceCardBg: '#1E1611',
  allowanceProgressBg: '#3B2B20',
  allowanceProgressFill: '#B8935E', // Gold for better visibility

  // Tab Bar
  tabBarBackground: '#1E1611',

  // Auth
  borderBeige: '#3D3128',
  borderTan: '#4A3C32',

  // Buttons
  logoutBg: '#2D1F17',
  sendButtonBg: '#3B2B20',

  // Text
  textPrimary: '#FFFFFF', // White text
  textSecondary: '#E5E0D8', // Off-white
  textTertiary: '#B8A89C', // Muted beige
  textInverse: '#120C09',
  textPlaceholder: '#9CA3AF',

  // Borders
  border: '#374151',
  borderLight: '#4B5563',
  borderDark: '#6B7280',
};

// Default export for backward compatibility
export const colors = lightColors;

export type ThemeColors = typeof lightColors;
export type ColorKey = keyof ThemeColors;
