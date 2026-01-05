import React from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import { useGetTermsQuery } from '../../../services/api/miscApi';
import { typography } from '../../../theme';
import { useTranslation } from 'react-i18next';
import { Header } from '../../../components/common/Header';

export const TermsScreen = () => {
  const { colors, isDark } = useTheme();
  const { t, i18n } = useTranslation();
  const { data: apiResponse, isLoading, error } = useGetTermsQuery();

  // Helper to strip HTML tags
  const stripHtml = (html: string) => {
      if (!html) return '';
      return html.replace(/<[^>]*>?/gm, '');
  };

  const termsData = apiResponse?.data;
  const isArabic = i18n.language === 'ar';

  return (
    <View style={[styles.container, { backgroundColor: isDark ? colors.background : colors.white }]}>
      {/* Header */}
      <Header 
        title={t('Terms of Use')}
        backgroundColor={colors.backgroundSecondary}
      />

      {/* Content */}
      <ScrollView contentContainerStyle={styles.content}>
        {isLoading ? (
             <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
        ) : error ? (
             <View />
        ) : termsData ? (
            <View>
                {isArabic ? (
                     // Arabic Content
                     termsData.terms_ar ? (
                        <View style={styles.section}>
                            <Text style={[styles.text, { color: colors.textSecondary, textAlign: 'right', writingDirection: 'rtl' }]}>
                                {stripHtml(termsData.terms_ar)}
                            </Text>
                        </View>
                     ) : (
                        <Text style={[styles.errorText, { color: colors.textTertiary }]}>No Arabic content available.</Text>
                     )
                ) : (
                    // English Content
                    termsData.terms_en ? (
                        <View style={styles.section}>
                            <Text style={[styles.text, { color: colors.textSecondary, textAlign: 'left' }]}>
                                {stripHtml(termsData.terms_en)}
                            </Text>
                        </View>
                    ) : (
                        <Text style={[styles.errorText, { color: colors.textTertiary }]}>No English content available.</Text>
                    )
                )}
            </View>
        ) : (
            <Text style={[styles.errorText, { color: colors.textTertiary }]}>No information available.</Text>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
      padding: 24,
  },
  section: {
      marginBottom: 24,
  },
  sectionTitle: {
      fontSize: 18,
      fontFamily: typography.fontFamily.semiBold,
      marginBottom: 12,
  },
  text: {
      fontSize: 16,
      fontFamily: typography.fontFamily.regular,
      lineHeight: 24,
      marginBottom: 16,
  },
  errorText: {
      textAlign: 'center',
      marginTop: 40,
      fontSize: 16,
  }
});
