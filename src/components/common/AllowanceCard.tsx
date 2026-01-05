import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { colors as themeColors } from '../../theme';
import ChevronRightIcon from '../icons/ChevronRightIcon';
import { useTranslation } from 'react-i18next';

interface AllowanceCardProps {
  dailyAllowance: number;
  remainingAllowance: number;
  onPress?: () => void;
  children?: React.ReactNode; // Optional children (e.g., checkout button)
}

export const AllowanceCard: React.FC<AllowanceCardProps> = ({
  dailyAllowance,
  remainingAllowance,
  onPress,
  children,
}) => {
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();

  // Calculate progress percentage (remaining allowance fills from left to right)
  const progressPercentage =
    dailyAllowance > 0
      ? Math.max(0, Math.min((remainingAllowance / dailyAllowance) * 100, 100))
      : 0;

  return (
    <View
      style={[
        styles.allowanceCard,
        { backgroundColor: colors.allowanceCardBg },
      ]}
    >
      <TouchableOpacity style={styles.allowanceHeader} onPress={onPress}>
        <Text
          style={[
            styles.allowanceTitle,
            { color: isDark ? '#D4A574' : themeColors.primary },
          ]}
        >
          {t('Allowance')}
        </Text>
        <ChevronRightIcon
          size={20}
          color={isDark ? '#D4A574' : themeColors.primary}
        />
      </TouchableOpacity>
      
      <View style={styles.allowanceInfo}>
        <Text
          style={[
            styles.allowanceLabel,
            { color: isDark ? '#D4A574' : themeColors.primary },
          ]}
        >
          {t('Remaining')}:{' '}
          <Text
            style={[
              styles.allowanceValue,
              { color: themeColors.secondary },
            ]}
          >
            {remainingAllowance.toFixed(2)} QAR
          </Text>
        </Text>
        <Text
          style={[
            styles.allowanceLabel,
            { color: isDark ? '#D4A574' : themeColors.primary },
          ]}
        >
          {t('Total')}:{' '}
          <Text
            style={[
              styles.allowanceValue,
              { color: isDark ? '#D4A574' : themeColors.primary },
            ]}
          >
            {dailyAllowance.toFixed(2)} QAR
          </Text>
        </Text>
      </View>
      
      <View
        style={[
          styles.progressBar,
          { backgroundColor: colors.allowanceProgressBg },
        ]}
      >
        <View
          style={[
            styles.progressFill,
            {
              width: `${progressPercentage}%`,
              backgroundColor: colors.allowanceProgressFill,
            },
          ]}
        />
      </View>

      {/* Render children (e.g., checkout button) if provided */}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  allowanceCard: {
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 16,
    shadowColor: '#B88A52',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  allowanceHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  allowanceTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  allowanceInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  allowanceLabel: {
    fontSize: 14,
  },
  allowanceValue: {
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
});
