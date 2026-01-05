/**
 * Input Component
 * Reusable text input with validation support
 */
import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { useRTL } from '../../hooks/useRTL';
import { useTheme } from '../../hooks/useTheme';
import { typography, spacing, borderRadius } from '../../theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  rightIcon?: React.ReactNode;
  leftIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
  inputStyle?: ViewStyle;
  showPasswordToggle?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  rightIcon,
  leftIcon,
  containerStyle,
  inputStyle,
  showPasswordToggle = false,
  secureTextEntry,
  ...textInputProps
}) => {
  const { isRTL, textAlign, flexDirection } = useRTL();
  const { colors } = useTheme();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const handleTogglePassword = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const isSecure = showPasswordToggle ? !isPasswordVisible : secureTextEntry;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, { textAlign, color: colors.textPrimary }]}>
          {label}
        </Text>
      )}

      <View
        style={{
          flexDirection,
          alignItems: 'center',
          backgroundColor: colors.backgroundSecondary,
          borderWidth: isFocused ? 2 : 1.5,
          borderColor: error
            ? colors.error
            : isFocused
            ? colors.primary
            : colors.border,
          borderRadius: borderRadius.lg,
          paddingHorizontal: spacing[4],
          minHeight: 56,
        }}
      >
        {leftIcon && <View style={styles.iconWrapper}>{leftIcon}</View>}

        <TextInput
          style={[
            styles.input,
            {
              textAlign,
              writingDirection: isRTL ? 'rtl' : 'ltr',
              color: colors.textPrimary,
            },
            inputStyle,
          ]}
          placeholderTextColor={colors.textPlaceholder}
          secureTextEntry={isSecure}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...textInputProps}
        />

        {showPasswordToggle ? (
          <TouchableOpacity
            style={styles.iconWrapper}
            onPress={handleTogglePassword}
          >
            <Text style={styles.iconText}>
              {isPasswordVisible ? '👁️' : '👁️‍🗨️'}
            </Text>
          </TouchableOpacity>
        ) : rightIcon ? (
          <View style={styles.iconWrapper}>{rightIcon}</View>
        ) : null}
      </View>

      {error && (
        <Text style={[styles.errorText, { textAlign, color: colors.error }]}>
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing[4],
  },
  label: {
    fontSize: 14,
    fontWeight: typography.fontWeight.regular,
    marginBottom: spacing[2],
  },
  input: {
    flex: 1,
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.interLight,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[2],
  },
  iconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 20,
  },
  errorText: {
    fontSize: typography.fontSize.sm,
    marginTop: spacing[1],
  },
});
