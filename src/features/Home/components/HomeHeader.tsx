import React, { useMemo } from 'react';
import { useNavigation } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ImageBackground,
  Platform,
  StatusBar,
  TextInput,
} from 'react-native';
import { spacing, typography } from '../../../theme';
import { useProfileQuery } from '../../../services/api/homeApi';
import { useAppSelector } from '../../../state/hooks';
import { useRTL } from '../../../hooks/useRTL';
import { useTheme } from '../../../hooks/useTheme';
import { useTranslation } from 'react-i18next';
import NotificationBell from '../../../components/icons/NotificationBell';
import SearchIcon from '../../../components/icons/SearchIcon';
import MyOrdersIcon from '../../../components/icons/MyOrdersIcon';
import PendingOrdersIcon from '../../../components/icons/PendingOrdersIcon';
import RepeatOrderIcon from '../../../components/icons/RepeatOrderIcon';
import CartIcon from '../../../components/icons/CartIcon';

interface Employer {
  employer_name?: string;
  logo?: string | null;
}
interface ProfileData {
  name_en?: string;
  name_ar?: string;
  designation?: string;
  photo?: string | null;
  employer?: Employer | null;
}

interface HomeHeaderProps {
  profile?: ProfileData;
  searchTerm?: string;
  onSearchChange?: (text: string) => void;
}

export const HomeHeader = ({ profile, searchTerm = '', onSearchChange }: HomeHeaderProps) => {
  const { textAlign, flexDirection } = useRTL();
  const { colors } = useTheme();
  const { i18n, t } = useTranslation();
  const navigation = useNavigation<any>();
  const employeeId = useAppSelector(state => state.auth.employeeId);
  const token = useAppSelector(state => state.auth.token);

  // Fetch profile if not provided via props
  // No UI logs; API calls are logged in baseQuery

  const { data: apiProfile } = useProfileQuery(employeeId ?? undefined, {
    skip: !employeeId || !token,
  });

  const mergedProfile = useMemo<ProfileData | undefined>(() => {
    // RTK Query response shape: { success, data }
    const serverData = (apiProfile as any)?.data;
    if (profile) return profile;
    if (serverData) {
      return {
        name_en: serverData?.name_en,
        name_ar: serverData?.name_ar,
        designation: serverData?.designation,
        photo: serverData?.photo,
        employer: serverData?.employer
          ? { employer_name: serverData?.employer?.employer_name, logo: null }
          : null,
      };
    }
    return undefined;
  }, [profile, apiProfile]);

  // Use Arabic name if language is Arabic and name_ar exists, otherwise use English name
  const isArabic = i18n.language === 'ar';
  const name = isArabic && mergedProfile?.name_ar 
    ? mergedProfile.name_ar 
    : mergedProfile?.name_en || '';
  const avatarUri = mergedProfile?.photo || undefined;

  // Get first letter of name (capitalized)
  const getInitial = () => {
    if (!name) return '?';
    return name.charAt(0).toUpperCase();
  };

  // Get current date in "Today DD Mon" format
  const getCurrentDate = () => {
    const today = new Date();
    const day = today.getDate();
    const month = today.toLocaleDateString('en-US', { month: 'short' });
    return `Today ${day} ${month}`;
  };

  const handleProfilePress = () => {
    navigation.navigate('Profile');
  };

  // Calculate status bar height
  const statusBarHeight =
    Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 0;

  return (
    <ImageBackground
      source={require('../../../assets/images/homeBg.png')}
      style={[styles.container, { paddingTop: statusBarHeight + spacing[4] }]}
      resizeMode="cover"
    >
      <View style={styles.topRow}>
        <TouchableOpacity
          style={styles.avatarWrap}
          onPress={handleProfilePress}
        >
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.avatar} />
          ) : (
            <View
              style={[
                styles.avatarPlaceholder,
                { backgroundColor: colors.white },
              ]}
            >
              <Text
                style={[styles.avatarInitial, { color: colors.profileInitial }]}
              >
                {getInitial()}
              </Text>
            </View>
          )}
        </TouchableOpacity>
        <View style={styles.titleWrap}>
          <Text style={[styles.greeting, { writingDirection: isArabic ? 'rtl' : 'ltr' }]}>
            {isArabic ? `مرحباً، ${name}` : `Hello, ${name}`}
          </Text>
          <Text style={styles.subtitle}>
            {getCurrentDate()}
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.bellBtn}
          onPress={() => navigation.navigate('Notifications')}
        >
          <NotificationBell size={24} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchWrap}>
        <View style={[styles.searchBar, { backgroundColor: colors.backgroundSecondary }]}>
          <SearchIcon size={20} color={colors.primary} />
          <TextInput
            style={[styles.searchInput, { color: colors.textPrimary, writingDirection: isArabic ? 'rtl' : 'ltr' }]}
            placeholder={isArabic ? "ماذا تبحث عن..." : "What are looking for..."}
            placeholderTextColor={colors.textPrimary}
            value={searchTerm}
            onChangeText={onSearchChange}
          />
        </View>
      </View>

      {/* Quick Action Buttons */}
      <View style={styles.quickActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation.navigate('Orders')}
        >
          <MyOrdersIcon size={65} />
          <Text style={styles.actionText}>{t('My Orders')}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation.navigate('PendingOrders')}
        >
          <PendingOrdersIcon size={65} />
          <Text style={styles.actionText}>{t('Pending Orders')}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation.navigate('RepeatOrders')}
        >
          <RepeatOrderIcon size={65} />
          <Text style={styles.actionText}>{t('Repeat Last Order')}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation.navigate('Cart')}
        >
          <CartIcon size={65} />
          <Text style={styles.actionText}>{t('Cart')}</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing[6],
    paddingTop: spacing[6],
    paddingBottom: spacing[2],
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing[1],
  },
  avatarWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 20,
    fontWeight: '600',
  },
  titleWrap: { flex: 1 },
  greeting: {
    fontSize: 20,
    color: '#FFFFFF',
    fontFamily: 'PlayfairDisplay-Bold',
  },
  subtitle: {
    fontSize: 12,
    color: '#FCE9C3',
  },
  bellBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  searchWrap: {
    marginTop: spacing[5],
    marginBottom: spacing[3],
  },
  searchBar: {
    borderRadius: 24,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 0,
    fontFamily:typography.fontFamily.regular
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing[4],
  },
  actionButton: {
    alignItems: 'center',
    width: 70,
  },
  actionText: {
    fontSize: 11,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 14,
    marginTop: 8,
  },
  departmentRow: {
    marginTop: spacing[5],
    flexDirection: 'row',
    alignItems: 'center',
  },
  departmentLabel: {
    color: '#FFFFFF',
    marginRight: spacing[3],
  },
  departmentPill: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: 999,
  },
  departmentText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default HomeHeader;
