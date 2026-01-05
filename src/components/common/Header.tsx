import React, { ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import { typography } from '../../theme';
import { BackIcon } from '../icons/BackIcon';

interface HeaderProps {
  /** Title displayed in the header */
  title: string;
  /** Whether to show the back button (default: true) */
  showBackButton?: boolean;
  /** Custom back button handler (default: navigation.goBack) */
  onBackPress?: () => void;
  /** Right side component (e.g., action buttons) */
  rightComponent?: ReactNode;
  /** Custom background color (default: uses theme color) */
  backgroundColor?: string;
  /** Custom title color (default: uses theme textPrimary) */
  titleColor?: string;
  /** Custom back icon color (default: uses theme textPrimary) */
  backIconColor?: string;
  /** Whether to include safe area padding (default: true) */
  includeSafeArea?: boolean;
  /** Custom container style */
  containerStyle?: ViewStyle;
  /** Custom title style */
  titleStyle?: TextStyle;
  /** Back icon size (default: 40) */
  backIconSize?: number;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  showBackButton = true,
  onBackPress,
  rightComponent,
  backgroundColor,
  titleColor,
  backIconColor,
  includeSafeArea = true,
  containerStyle,
  titleStyle,
  backIconSize = 39,
}) => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      navigation.goBack();
    }
  };

  const bgColor = backgroundColor ?? (isDark ? colors.background : colors.white);
  const txtColor = titleColor ?? colors.textPrimary;
  const iconColor = backIconColor ?? colors.textPrimary;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: bgColor,
          paddingTop: includeSafeArea ? insets.top + 10 : 10,
        },
        containerStyle,
      ]}
    >
      <View style={styles.content}>
        {/* Left side - Back button or empty space */}
        {showBackButton ? (
          <TouchableOpacity 
            onPress={handleBack} 
            style={styles.backButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <BackIcon size={backIconSize} color={iconColor} />
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}

        {/* Title */}
        <Text
          style={[
            styles.title,
            { color: txtColor },
            titleStyle,
          ]}
          numberOfLines={1}
        >
          {title}
        </Text>

        {/* Right side - Custom component or empty space */}
        {rightComponent ? (
          <View style={styles.rightContainer}>{rightComponent}</View>
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontFamily: typography.fontFamily.medium,
    textAlign: 'left',
    marginHorizontal: 12,
  },
  placeholder: {
    width: 40,
    height: 40,
  },
  rightContainer: {
    minWidth: 40,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
});

export default Header;
