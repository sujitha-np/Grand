/**
 * Checkbox Component
 * Reusable checkbox for forms
 */
import React from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { typography, spacing, borderRadius } from '../../theme';

interface CheckboxProps {
  label?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  containerStyle?: ViewStyle;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  checked,
  onChange,
  disabled = false,
  containerStyle,
}) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.container, containerStyle]}
      onPress={() => !disabled && onChange(!checked)}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.checkbox,
          {
            borderColor: checked ? colors.primary : colors.gray400,
            backgroundColor: checked
              ? colors.primary
              : disabled
              ? colors.gray200
              : colors.white,
          },
          disabled && { borderColor: colors.gray300 },
        ]}
      >
        {checked && (
          <Text style={[styles.checkmark, { color: colors.white }]}>✓</Text>
        )}
      </View>
      {label && (
        <Text
          style={[
            styles.label,
            { color: disabled ? colors.gray500 : colors.textPrimary },
          ]}
        >
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    fontSize: 16,
    fontWeight: typography.fontWeight.bold,
  },
  label: {
    marginLeft: spacing[2],
    fontSize: typography.fontSize.base,
  },
});
