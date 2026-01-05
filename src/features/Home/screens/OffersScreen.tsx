import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../../hooks/useTheme';
import { typography } from '../../../theme';
import { useTranslation } from 'react-i18next';
import { useOffersQuery } from '../../../services/api/homeApi';
import { BASE_URL } from '../../../services/api/baseUrl';
import { Header } from '../../../components/common/Header';

export const OffersScreen = () => {
  const navigation = useNavigation<any>();
  const { colors, isDark } = useTheme();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const { data: offersResp, isLoading } = useOffersQuery();
  const offers = offersResp?.data || [];

  const handleBack = () => navigation.goBack();

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? colors.background : colors.bgLight,
        },
      ]}
    >
      {/* Header */}
      <Header 
        title={t('Offers')}
        backgroundColor={isDark ? colors.background : '#FFFFFF'}
        backIconSize={32}
      />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Offers Grid */}
        <View style={styles.offersGrid}>
          {offers.length > 0 ? (
            offers.map((offer: any) => {
              const imageUrl = isRTL 
                ? (offer.image_ar && `${BASE_URL}${offer.image_ar}`) 
                : (offer.image_en && `${BASE_URL}${offer.image_en}`);
                
              const offerName = isRTL 
                ? (offer.name_ar || offer.name_en) 
                : offer.name_en;

              return (
                <View key={offer.id} style={styles.offerContainer}>
                  {/* Discount Badge Above Card */}
                  {offer.offer_value && (
                    <View style={[styles.discountBadge, isRTL && { alignSelf: 'flex-end' }]}>
                      <Text style={styles.discountText}>
                        {offer.offer_value}% {t('OFF')}
                      </Text>
                    </View>
                  )}
                  
                  {/* Offer Image Card */}
                  <TouchableOpacity
                    style={styles.offerCard}
                    activeOpacity={0.9}
                    onPress={() =>
                      navigation.navigate('OfferDetails', {
                        offerId: offer.id,
                        offerName: offerName,
                      })
                    }
                  >
                    <Image
                      source={{ uri: imageUrl }}
                      style={styles.offerImage}
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                </View>
              );
            })
          ) : (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                {t('No offers available')}
              </Text>
            </View>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 20,
    paddingBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: typography.fontFamily.semiBold,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  offersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  offerContainer: {
    width: '48%',
    marginBottom: 24,
  },
  offerInfoTop: {
    marginBottom: 8,
  },
  offerCard: {
    width: '100%',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  offerImage: {
    width: '100%',
    height: 200,
    borderRadius: 20,
  },
  offerInfo: {
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  offerName: {
    fontSize: 14,
    fontFamily: typography.fontFamily.medium,
    marginBottom: 0,
  },
  discountBadge: {
    backgroundColor: '#B8935E',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  discountText: {
    fontSize: 12,
    fontFamily: typography.fontFamily.semiBold,
    color: '#FFFFFF',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: typography.fontFamily.interRegular,
  },
});
