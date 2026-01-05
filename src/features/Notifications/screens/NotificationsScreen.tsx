import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import { colors, typography } from '../../../theme';
import { useAppSelector } from '../../../state/hooks';
import { useGetNotificationsQuery } from '../../../services/api/homeApi';
import { DocumentIcon, FeedbackIcon } from '../../../components/icons/NotificationIcons';
import { Header } from '../../../components/common/Header';
import { useTranslation } from 'react-i18next';

// ... (Interfaces remain same)
interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  created_at: string;
  created_time?: string;
  is_read: number | boolean;
}

interface GroupedNotifications {
  [key: string]: Notification[];
}

export const NotificationsScreen = () => {
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();
  const { employeeId } = useAppSelector(state => state.auth);
  const [refreshing, setRefreshing] = useState(false);

  const { data: notificationsResponse, isLoading, refetch } = useGetNotificationsQuery(employeeId || 0, {
    skip: !employeeId,
  });

  const onRefresh = async () => {
    setRefreshing(true);
    try {
        await refetch();
    } catch (error) {
        console.error("Failed to refresh notifications:", error);
    } finally {
        setRefreshing(false);
    }
  };

  const notifications = useMemo(() => {
    return notificationsResponse?.data?.notifications || [];
  }, [notificationsResponse]);

  // Group notifications by date
  const groupedNotifications = useMemo(() => {
    return notifications.reduce((acc: GroupedNotifications, notification: Notification) => {
      const date = new Date(notification.created_at);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      let key;
      
      const isToday = date.getDate() === today.getDate() &&
                      date.getMonth() === today.getMonth() &&
                      date.getFullYear() === today.getFullYear();
                      
      const isYesterday = date.getDate() === yesterday.getDate() &&
                          date.getMonth() === yesterday.getMonth() &&
                          date.getFullYear() === yesterday.getFullYear();

      if (isToday) {
        key = 'Today';
      } else if (isYesterday) {
        key = 'Yesterday';
      } else {
        key = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      }

      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(notification);
      return acc;
    }, {});
  }, [notifications]);

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase();
    } catch (e) {
      return '';
    }
  };

  const getEmojiForTitle = (title: string, type: string) => {
      const lowerTitle = title.toLowerCase();
      if (type.includes('new_order')) return '🍴';
      if (type.includes('order_placed')) return '👨‍🍳';
      if (type.includes('progress')) return '🔪';
      if (type.includes('ready')) return '🍽️';
      if (type.includes('cancelled')) return '❌';
      if (type === 'feedback' || lowerTitle.includes('feedback')) return '😋';
      if (lowerTitle.includes('status')) return '📝';
      return '';
  };

  const renderItem = (item: Notification) => {
    const isFeedback = item.type === 'feedback' || item.title.toLowerCase().includes('how was');
    
    return (
      <View style={styles.notificationItem} key={item.id}>
        <View style={[styles.iconContainer, { backgroundColor: isDark ? colors.backgroundSecondary : '#F5F0E6', borderColor: colors.borderLight }]}>
            {isFeedback ? <FeedbackIcon /> : <DocumentIcon />}
        </View>
        <View style={styles.contentContainer}>
            <View style={styles.headerRow}>
                <Text style={[styles.title, { color: colors.primary }]} numberOfLines={1}>
                    {item.title} 
                    <Text style={styles.emoji}> {getEmojiForTitle(item.title, item.type)}</Text>
                </Text>
                <Text style={[styles.time, { color: colors.textTertiary }]}>{formatTime(item.created_at)}</Text>
            </View>
            <Text style={[styles.message, { color: isDark ? colors.textTertiary : colors.primary, opacity: isDark ? 1 : 0.6 }]} numberOfLines={2}>
                {item.message}
            </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? colors.background : colors.white }]}>
      <Header 
        title={t('Notifications')}
        backgroundColor={isDark ? colors.background : colors.white}
      />

      {isLoading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView 
            style={styles.listContainer} 
            contentContainerStyle={styles.listContent}
            refreshControl={
                <RefreshControl 
                    refreshing={refreshing} 
                    onRefresh={onRefresh} 
                    tintColor={colors.primary}
                    colors={[colors.primary]} // Android
                />
            }
        >
            {Object.keys(groupedNotifications).map((section) => (
                <View key={section}>
                    <View style={styles.sectionHeaderContainer}>
                        <Text style={[styles.sectionHeader, { color: colors.primary }]}>{section}</Text>
                        <View style={[styles.sectionDivider, { backgroundColor: colors.borderLight }]} />
                    </View>
                    {groupedNotifications[section].map((item: Notification) => renderItem(item))}
                </View>
            ))}
            
            {!isLoading && notifications.length === 0 && (
                <View style={styles.emptyState}>
                    <Text style={[styles.emptyText, { color: colors.textTertiary }]}>No notifications yet</Text>
                </View>
            )}
        </ScrollView>
      )}
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 8,
  },
  backButton: {
      width: 42,
      height: 42,
      borderRadius: 24,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 8,
  },
  headerTitle: {
    fontSize: 23,
    fontFamily: typography.fontFamily.medium,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  sectionHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 8,
  },
  sectionHeader: {
    fontSize: 13,
    fontFamily: typography.fontFamily.interRegular,
    marginRight: 12,
  },
  sectionDivider: {
    flex: 1,
    height: 1,
  },
  notificationItem: {
    flexDirection: 'row',
    marginBottom: 28,
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    borderWidth: 1,
  },
  contentContainer: {
    flex: 1,
    paddingTop: 4,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    fontFamily: typography.fontFamily.medium,
    flex: 1,
    marginRight: 8,
  },
  emoji: {
      fontSize: 16,
  },
  time: {
    fontSize: 12,
    marginTop: 4,
    fontFamily: typography.fontFamily.interRegular,
  },
  message: {
    fontSize: 12,
    lineHeight: 18,
    fontFamily: typography.fontFamily.interLight,
  },
  emptyState: {
      marginTop: 60,
      alignItems: 'center',
  },
  emptyText: {
      fontSize: 16,
      fontFamily: typography.fontFamily.medium,
  },
});
