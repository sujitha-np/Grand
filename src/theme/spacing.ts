/**
 * Spacing Scale
 */

export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
  24: 96,
  32: 128,
};

export const borderRadius = {
  none: 0,
  sm: 4,
  base: 12, // Slightly more rounded
  md: 16,
  lg: 24, // For buttons - fully rounded
  xl: 32,
  full: 9999,
};

export type Spacing = keyof typeof spacing;
export type BorderRadius = keyof typeof borderRadius;
