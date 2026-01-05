import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../hooks/useTheme';
import { colors, typography } from '../../../theme';
import { useAppSelector } from '../../../state/hooks';
import { useGetMessagesQuery, useSendMessageMutation } from '../../../services/api/homeApi';

import SendIcon from '../../../components/icons/SendIcon';
import LocationIcon from '../../../components/icons/LocationIcon';

interface Message {
  id: number;
  message: string;
  sender_type: 'employee' | 'admin';
  created_at: string;
}

export const MessagesScreen = () => {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const { employeeId } = useAppSelector(state => state.auth);
  const employeeName = useAppSelector(state => state.auth.user?.name_en || 'Employee');
  const scrollViewRef = useRef<ScrollView>(null);
  const isFocused = useIsFocused(); // Track if Messages screen is focused
  
  const [message, setMessage] = useState('');
  
  // Location modal state
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [street, setStreet] = useState('');
  const [zone, setZone] = useState('');
  const [building, setBuilding] = useState('');
  
  // Check if all location fields are filled
  const isLocationFormValid = street.trim() && zone.trim() && building.trim();
  
  // Fetch messages from API
  const { data: messagesResponse, isLoading, refetch } = useGetMessagesQuery(
    { employee_id: employeeId || 0 },
    { 
      skip: !employeeId || !isFocused, // Only fetch when screen is focused
      pollingInterval: isFocused ? 10000 : 0, // Poll every 10 seconds when focused
    }
  );
  
  const messages = messagesResponse?.data || [];
  
  const [sendMessage, { isLoading: isSending }] = useSendMessageMutation();

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  const handleSendMessage = async () => {
    if (!message.trim()) {
      Alert.alert('Error', 'Please enter a message');
      return;
    }

    if (!employeeId) {
      Alert.alert('Error', 'User information not available');
      return;
    }

    try {
      const result = await sendMessage({
        employee_id: employeeId,
        employer_id: 1,
        message: message.trim(),
        subject: null,
        status: 1,
        is_read: 0,
      }).unwrap();

      if (result.success) {
        // Refetch messages to get the updated list
        refetch();
        setMessage('');
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      Alert.alert('Error', error?.data?.message || 'Failed to send message');
    }
  };

  const handleSendLocationMessage = async () => {
    if (!isLocationFormValid) {
      Alert.alert('Error', 'Please fill all location fields');
      return;
    }

    if (!employeeId) {
      Alert.alert('Error', 'User information not available');
      return;
    }

    try {
      const locationMessage = `Location shared:\nStreet: ${street.trim()}\nZone: ${zone.trim()}\nBuilding: ${building.trim()}`;
      
      // Create location object and stringify it for the API
      const locationData = {
        building: building.trim(),
        street: street.trim(),
        zone: zone.trim(),
      };
      
      const result = await sendMessage({
        employee_id: employeeId,
        employer_id: 1,
        message: locationMessage,
        subject: null,
        status: 1,
        is_read: 0,
        location: JSON.stringify(locationData), // Send as JSON string
      }).unwrap();

      if (result.success) {
        // Refetch messages to get the updated list
        refetch();
        // Clear location fields and close modal
        setStreet('');
        setZone('');
        setBuilding('');
        setShowLocationModal(false);
      }
    } catch (error: any) {
      console.error('Error sending location message:', error);
      Alert.alert('Error', error?.data?.message || 'Failed to send location');
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Check if it's today
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    }
    
    // Check if it's yesterday
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    
    // For older dates, show the formatted date
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
    });
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups: any, msg: any) => {
    const date = formatDate(msg.created_at);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(msg);
    return groups;
  }, {});

  return (
    <KeyboardAvoidingView
      style={[styles.container,  { backgroundColor: isDark ? colors.background : colors.bgLight },]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + 10,
            backgroundColor: isDark ? colors.background : colors.bgLight,
          },
        ]}
      >
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          Message
        </Text>
      </View>

      {/* Messages List */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.length > 0 ? (
          Object.keys(groupedMessages).map(date => (
            <View key={date}>
              <View style={styles.dateHeader}>
                <Text style={[styles.dateText, { color: colors.textTertiary }]}>
                  {date}
                </Text>
              </View>
              {groupedMessages[date].map((msg: Message) => {
                const isFromEmployee = msg.sender_type === 'employee';
                return (
                  <View 
                    key={msg.id} 
                    style={[
                      styles.messageWrapper,
                      isFromEmployee ? styles.sentWrapper : styles.receivedWrapper
                    ]}
                  >
                    <View>
                      <View
                        style={[
                          styles.messageBubble,
                          isFromEmployee 
                            ? [styles.sentMessage, { backgroundColor: isDark ? colors.primary : '#F5E6D3' }]
                            : [styles.receivedMessage, { backgroundColor: isDark ? colors.backgroundSecondary : colors.ash }]
                        ]}
                      >
                        <Text style={[styles.senderName, { color: colors.textPrimary }]}>
                          {isFromEmployee ? employeeName : 'Admin'}
                        </Text>
                        <Text style={[styles.messageText, { color: colors.textPrimary }]}>
                          {msg.message}
                        </Text>                      
                      </View>
                      <Text style={[
                        styles.messageTime, 
                        { 
                          color: colors.textTertiary,
                          alignSelf: isFromEmployee ? 'flex-start' : 'flex-end',
                          paddingLeft: isFromEmployee ? 0 : 12,
                          paddingRight: isFromEmployee ? 12 : 0,
                        }
                      ]}>
                        {formatTime(msg.created_at)}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: colors.textTertiary }]}>
              No messages yet
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.textPlaceholder }]}>
              Send a message to get started
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Input Area */}
      <View
        style={[
          styles.inputContainer,
          {
            paddingBottom: insets.bottom > 0 ? insets.bottom : 12,
            backgroundColor: isDark ? colors.background : colors.bgLight,
            borderTopColor: colors.borderLight,
          },
        ]}
      >
        <View style={[styles.inputWrapper, { backgroundColor: isDark ? colors.backgroundSecondary : colors.white }]}>
          <TextInput
            style={[
              styles.input,
              { color: isDark ? colors.textPrimary : colors.textPrimary },
            ]}
            placeholder="Type..."
            placeholderTextColor={colors.primary}
            value={message}
            onChangeText={setMessage}
            multiline
            maxLength={500}
          />
        </View>
        
        {/* Location Button */}
        <TouchableOpacity
          style={[
            styles.locationButton,
            { backgroundColor: isDark ? colors.secondary : '#F3E5D0' },
          ]}
          onPress={() => setShowLocationModal(true)}
        >
          <LocationIcon
            size={20}
            color="#3B2B20"
          />
        </TouchableOpacity>
        
        {/* Send Button */}
        <TouchableOpacity
          style={[
            styles.sendButton,
            { backgroundColor: isDark ? colors.secondary : '#F3E5D0' },
            isSending && styles.sendButtonDisabled,
          ]}
          onPress={handleSendMessage}
          disabled={isSending || !message.trim()}
        >
          <SendIcon
            size={20}
            color={!message.trim() || isSending ? colors.textPlaceholder : '#3B2B20'}
          />
        </TouchableOpacity>
      </View>

      {/* Location Modal */}
      <Modal
        visible={showLocationModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowLocationModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: isDark ? colors.backgroundSecondary : colors.white }]}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
              Share Location
            </Text>
            
            {/* Street Input */}
            <View style={styles.modalInputContainer}>
              <Text style={[styles.modalInputLabel, { color: colors.textSecondary }]}>
                Street
              </Text>
              <TextInput
                style={[
                  styles.modalInput,
                  { 
                    backgroundColor: isDark ? colors.background : colors.bgLight,
                    color: colors.textPrimary,
                    borderColor: colors.borderLight,
                  },
                ]}
                placeholder="Enter street name"
                placeholderTextColor={colors.textPlaceholder}
                value={street}
                onChangeText={setStreet}
              />
            </View>
            
            {/* Zone Input */}
            <View style={styles.modalInputContainer}>
              <Text style={[styles.modalInputLabel, { color: colors.textSecondary }]}>
                Zone
              </Text>
              <TextInput
                style={[
                  styles.modalInput,
                  { 
                    backgroundColor: isDark ? colors.background : colors.bgLight,
                    color: colors.textPrimary,
                    borderColor: colors.borderLight,
                  },
                ]}
                placeholder="Enter zone"
                placeholderTextColor={colors.textPlaceholder}
                value={zone}
                onChangeText={setZone}
              />
            </View>
            
            {/* Building Input */}
            <View style={styles.modalInputContainer}>
              <Text style={[styles.modalInputLabel, { color: colors.textSecondary }]}>
                Building
              </Text>
              <TextInput
                style={[
                  styles.modalInput,
                  { 
                    backgroundColor: isDark ? colors.background : colors.bgLight,
                    color: colors.textPrimary,
                    borderColor: colors.borderLight,
                  },
                ]}
                placeholder="Enter building number"
                placeholderTextColor={colors.textPlaceholder}
                value={building}
                onChangeText={setBuilding}
              />
            </View>
            
            {/* Modal Buttons */}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalCancelButton, { borderColor: colors.borderLight }]}
                onPress={() => {
                  setShowLocationModal(false);
                  setStreet('');
                  setZone('');
                  setBuilding('');
                }}
              >
                <Text style={[styles.modalCancelButtonText, { color: colors.textSecondary }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.modalSendButton,
                  { backgroundColor: isLocationFormValid ? '#3B2B20' : colors.textPlaceholder },
                ]}
                onPress={handleSendLocationMessage}
                disabled={!isLocationFormValid || isSending}
              >
                {isSending ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <SendIcon size={18} color="#FFFFFF" />
                    <Text style={styles.modalSendButtonText}>Send</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: typography.fontFamily.semiBold,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  dateHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  dateText: {
    fontSize: 12,
    fontFamily: typography.fontFamily.interRegular,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: typography.fontFamily.interRegular,
    marginTop: 12,
  },
  messageWrapper: {
    marginBottom: 12,
  },
  sentWrapper: {
    alignItems: 'flex-end',
  },
  receivedWrapper: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    borderRadius: 16,
    padding: 12,
  },
  sentMessage: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  receivedMessage: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  senderName: {
    fontSize: 12,
    fontFamily: typography.fontFamily.interLight,
    marginBottom: 4,
    fontWeight: '700',
  },
  messageText: {
    fontSize: 14,
    fontFamily: typography.fontFamily.interRegular,
    lineHeight: 20,
  },
  messageTime: {
    fontSize: 10,
    fontFamily: typography.fontFamily.interRegular,
    marginTop: 2,
    color: colors.primary,
    fontWeight: '600',
  },
  messageTimeLeft: {
    alignSelf: 'flex-start',
    paddingLeft: 12,
  },
  messageTimeRight: {
    alignSelf: 'flex-end',
    paddingRight: 12,
  },
  messageTimeInside: {
    fontSize: 10,
    fontFamily: typography.fontFamily.interRegular,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: typography.fontFamily.medium,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: typography.fontFamily.interRegular,
    marginTop: 8,
  },
  inputContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontFamily: typography.fontFamily.interRegular,
    maxHeight: 100,
    paddingVertical: 12, 
    opacity: 0.9,
  },
  locationButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 0,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    width: '100%',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: typography.fontFamily.semiBold,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalInputContainer: {
    marginBottom: 16,
  },
  modalInputLabel: {
    fontSize: 14,
    fontFamily: typography.fontFamily.medium,
    marginBottom: 8,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: typography.fontFamily.interRegular,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelButtonText: {
    fontSize: 16,
    fontFamily: typography.fontFamily.medium,
  },
  modalSendButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  modalSendButtonText: {
    fontSize: 16,
    fontFamily: typography.fontFamily.medium,
    color: '#FFFFFF',
  },
});

