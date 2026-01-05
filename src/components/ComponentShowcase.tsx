/**
 * Component Showcase - For testing/demo
 * Remove this file in production
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Button, Input, Checkbox } from './common';
import { colors, typography, spacing } from '../theme';

export const ComponentShowcase = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Component Showcase</Text>

      {/* Buttons Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Buttons</Text>

        <Button
          title="Primary Button"
          onPress={() => {}}
          style={styles.button}
        />

        <Button
          title="Secondary Button"
          onPress={() => {}}
          variant="secondary"
          style={styles.button}
        />

        <Button
          title="Outline Button"
          onPress={() => {}}
          variant="outline"
          style={styles.button}
        />

        <Button
          title="Text Button"
          onPress={() => {}}
          variant="text"
          style={styles.button}
        />

        <Button
          title="Disabled Button"
          onPress={() => {}}
          disabled
          style={styles.button}
        />

        <Button
          title="Loading Button"
          onPress={() => {}}
          loading
          style={styles.button}
        />
      </View>

      {/* Inputs Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Inputs</Text>

        <Input
          label="Email"
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Input
          label="Password"
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
          showPasswordToggle
        />

        <Input
          label="With Error"
          placeholder="This field has an error"
          error="This is an error message"
        />
      </View>

      {/* Checkbox Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Checkbox</Text>

        <Checkbox
          label="Remember me"
          checked={rememberMe}
          onChange={setRememberMe}
        />

        <Checkbox
          label="Disabled checkbox"
          checked={false}
          onChange={() => {}}
          disabled
          containerStyle={styles.checkbox}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary, // White for showcase
    padding: spacing[5],
  },
  title: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing[6],
    marginTop: spacing[8],
  },
  section: {
    marginBottom: spacing[8],
  },
  sectionTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textPrimary,
    marginBottom: spacing[4],
  },
  button: {
    marginBottom: spacing[3],
  },
  checkbox: {
    marginTop: spacing[3],
  },
});
