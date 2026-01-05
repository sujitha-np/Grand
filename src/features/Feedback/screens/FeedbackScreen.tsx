/**
 * Feedback Screen - Matching Figma design
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../../hooks/useTheme';
import { typography } from '../../../theme';
import { useAppSelector } from '../../../state/hooks';
import { useSubmitFeedbackMutation } from '../../../services/api/homeApi';
import { showSuccessToast, showErrorToast } from '../../../utils/toast';
import { Header } from '../../../components/common/Header';
import { useTranslation } from 'react-i18next';

// Rating emoji data
const RATINGS = [
  { id: 1, emoji: '😡', label: 'Very poor', color: '#D32F2F' },
  { id: 2, emoji: '😑', label: 'poor', color: '#F57C00' },
  { id: 3, emoji: '😊', label: 'Good', color: '#FBC02D' },
  { id: 4, emoji: '😀', label: 'Very Good', color: '#FFD700' },
  { id: 5, emoji: '😍', label: 'Excellent', color: '#FF6347' },
];

// Feedback tags
const FEEDBACK_TAGS = [
  'Great Quality',
  'Love the packaging',
  'Arrived on time',
  'Minor issue, but still happy',
  'Would order again',
];

export const FeedbackScreen = () => {
  const navigation = useNavigation<any>();
  const { colors, isDark } = useTheme();
  const { employeeId, user } = useAppSelector(state => state.auth);
  const { t } = useTranslation();

  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [feedbackText, setFeedbackText] = useState('');

  const [submitFeedback, { isLoading }] = useSubmitFeedbackMutation();

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = async () => {
    if (!selectedRating) {
      showErrorToast('Please select a rating before submitting');
      return;
    }

    if (!employeeId || !user?.employer_id) {
      showErrorToast('User information is missing. Please try again');
      return;
    }

    try {
      // Format date using local timezone, not UTC
      const formatDateForAPI = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      // Prepare feedback data
      const feedbackData = {
        employer_id: user.employer_id,
        employee_id: employeeId,
        feedback: feedbackText || 'No additional comments',
        rating: selectedRating,
        feedback_type: selectedTags.join(', ') || 'General feedback',
        feedback_date: formatDateForAPI(new Date()),
      };



      const response = await submitFeedback(feedbackData).unwrap();



      // Show success toast
      showSuccessToast('Thank you! Your feedback has been submitted successfully');
      
      // Navigate back after a short delay to let user see the toast
      setTimeout(() => {
        navigation.goBack();
      }, 1000);
    } catch (error: any) {
      showErrorToast('Something went wrong');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? colors.background : colors.white }]}>
      {/* Header */}
      <Header 
        title={t('Feedback')}
        backgroundColor={isDark ? colors.background : colors.white}
        backIconSize={24}
      />

      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Rating Section */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle1, { color: colors.primary }]}>
                How would you rate your experience?
              </Text>

              <View style={styles.ratingsContainer}>
                {RATINGS.map(rating => {
                  const isSelected = selectedRating === rating.id;
                  return (
                    <TouchableOpacity
                      key={rating.id}
                      style={styles.ratingItem}
                      onPress={() => setSelectedRating(rating.id)}
                      activeOpacity={0.7}
                    >
                      <View
                        style={[
                          styles.emojiContainer,
                          isSelected && {
                            borderColor: colors.allowanceProgressFill,
                            borderWidth: 2,
                            borderRadius: 30, // Make it circular
                          },
                        ]}
                      >
                        <Text style={styles.emoji}>{rating.emoji}</Text>
                      </View>
                      {isSelected && (
                        <Text style={[styles.ratingLabel, { color: colors.textPrimary }]}>
                          {rating.label}
                        </Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Tags Section */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.primary }]}>
                What do you think?
              </Text>

              <View style={styles.tagsContainer}>
                {FEEDBACK_TAGS.map(tag => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <TouchableOpacity
                      key={tag}
                      style={[
                        styles.tag,
                        {
                          backgroundColor: isSelected
                            ? colors.backgroundTertiary
                            : colors.backgroundSecondary,
                          borderColor: isSelected ? colors.primary : colors.primary,
                        },
                      ]}
                      onPress={() => toggleTag(tag)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.tagText,
                          {
                            color: isSelected ? colors.primary : colors.primary,
                          },
                        ]}
                      >
                        {tag}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Comment Section */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.primary }]}>
                Would you tell us about your experience.
              </Text>

              <View
                style={[
                  styles.textInputContainer,
                  { backgroundColor: colors.white, borderColor: colors.allowanceProgressBg },
                ]}
              >
                <TextInput
                  style={[styles.textInput, { color: colors.textPrimary }]}
                  placeholder="Enter your feedback here"
                  placeholderTextColor={colors.gray500}
                  multiline
                  numberOfLines={8}
                  textAlignVertical="top"
                  value={feedbackText}
                  onChangeText={setFeedbackText}
                />
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                { backgroundColor: colors.primary },
                isLoading && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              activeOpacity={0.8}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.submitButtonText}>Submit</Text>
              )}
            </TouchableOpacity>

            <View style={{ height: 40 }} />
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 16,
    paddingTop: 54,
    paddingBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: typography.fontFamily.medium,
    // fontWeight: '600',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: typography.fontFamily.interRegular,
    fontWeight: '500',
    marginBottom: 10,
    lineHeight: 26,
  },
  sectionTitle1: {
    fontSize: 25,
    fontFamily: typography.fontFamily.interRegular,
    fontWeight: '500',
    marginBottom: 10,
    lineHeight: 26,
  },
  ratingsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 8,
  },
  ratingItem: {
    alignItems: 'center',
    gap: 4,
  },
  emojiContainer: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  emoji: {
    fontSize: 32,
  },
  ratingLabel: {
    fontSize: 12,
    fontFamily: typography.fontFamily.interRegular,
    marginTop: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  tag: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 0.5,
  },
  tagText: {
    fontSize: 14,
    fontFamily: typography.fontFamily.interRegular,
  },
  textInputContainer: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginTop: 8,
    minHeight: 180,
  },
  textInput: {
    fontSize: 15,
    fontFamily: typography.fontFamily.interRegular,
    lineHeight: 22,
  },
  submitButton: {
    borderRadius: 28,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: typography.fontFamily.regular,
    fontWeight: '600',
  },
});
