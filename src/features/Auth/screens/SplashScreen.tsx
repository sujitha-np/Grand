/**
 * Splash Screen - Professional bakery themed
 */
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Animated,
  Dimensions,
  TouchableOpacity,
  Platform,
  Image,
} from 'react-native';
import { colors, typography, spacing } from '../../../theme';
import { Button } from '../../../components/common';
import type { RootStackScreenProps } from '../../../navigation/types';

const { width } = Dimensions.get('window');

export const SplashScreen = ({
  navigation,
  onGetStarted,
}: RootStackScreenProps<'Splash'> & { onGetStarted: () => void }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;

  const handleGetStarted = () => {
    // Call the parent function to hide splash and show Entry screen
    onGetStarted();
  };

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 10,
        friction: 2,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Logo Container */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Logo Image */}
        <Image
          source={require('../../../assets/images/logo.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />
      </Animated.View>

      {/* Get Started Button */}
      <View style={styles.buttonContainer}>
        <Button
          title="Get Started"
          onPress={handleGetStarted}
          style={styles.getStartedButton}
          size="large"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background, // Cream background
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: {
    width: width * 0.65, // 80% of screen width for better visibility
    height: width * 0.65, // Square aspect ratio
    marginBottom: spacing[8],
    backgroundColor: 'transparent', // Transparent background
  },
  buttonContainer: {
    marginBottom: spacing[10],
    width: width * 0.9, // 90% of screen width
    height: width * 0.2, // Increased height
  },
  getStartedButton: {
    marginBottom: spacing[4],
    height: width * 0.16, // Increased height
  },
});
