import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Linking } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import { useGetContactQuery } from '../../../services/api/miscApi';
import { colors, typography } from '../../../theme';
import { useTranslation } from 'react-i18next';
import { PhoneIcon } from '../../../components/icons/PhoneIcon';
import { EmailIcon } from '../../../components/icons/EmailIcon';
import { WhatsAppIcon } from '../../../components/icons/WhatsAppIcon';
import LocationIcon from '../../../components/icons/LocationIcon';
import { Header } from '../../../components/common/Header';

export const HelpScreen = () => {
  const { colors, isDark } = useTheme();
  const { t, i18n } = useTranslation();
  const { data: apiResponse, isLoading, error } = useGetContactQuery();

  const contactData = apiResponse?.data;
  const isArabic = i18n.language === 'ar';
  
  const handleCall = (phoneno: string) => {
      if (!phoneno) return;
      Linking.openURL(`tel:${phoneno}`);
  };

  const handleEmail = (email: string) => {
      if (!email) return;
      Linking.openURL(`mailto:${email}`);
  };

  const handleWhatsApp = (whatsapp: string) => {
      if (!whatsapp) return;
      Linking.openURL(`whatsapp://send?phone=${whatsapp}`);
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? colors.background : colors.white }]}>
      {/* Header */}
      <Header 
        title={t('Help & Support')}
        backgroundColor={colors.backgroundSecondary}
      />

      {/* Content */}
      <ScrollView contentContainerStyle={styles.content}>
        {isLoading ? (
             <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
        ) : error ? (
             <View />
        ) : contactData ? (
            <View style={styles.infoContainer}>
                
                {/* Description */}
                <Text style={[styles.introText, { color: colors.textSecondary }]}>
                    {t('If you have any questions or need assistance, feel free to contact us.')}
                </Text>

                {/* Contact Items */}
                <View style={[styles.card, { backgroundColor: colors.backgroundSecondary, borderColor: colors.borderLight }]}>
                    
                    {/* Phone */}
                    {contactData.phone && (
                        <TouchableOpacity style={styles.contactItem} onPress={() => handleCall(contactData.phone)}>
                            <View style={[styles.iconBox, { backgroundColor: colors.primary + '20' }]}>
                                <PhoneIcon size={20} color={colors.primary} />
                            </View>
                            <View style={styles.contactText}>
                                <Text style={[styles.label, { color: colors.textTertiary }]}>{t('Phone')}</Text>
                                <Text style={[styles.value, { color: colors.textPrimary }]}>{contactData.phone}</Text>
                            </View>
                        </TouchableOpacity>
                    )}

                     {/* Mobile */}
                     {contactData.mobile && (
                        <TouchableOpacity style={styles.contactItem} onPress={() => handleCall(contactData.mobile)}>
                            <View style={[styles.iconBox, { backgroundColor: colors.primary + '20' }]}>
                                <PhoneIcon size={20} color={colors.primary} />
                            </View>
                            <View style={styles.contactText}>
                                <Text style={[styles.label, { color: colors.textTertiary }]}>{t('Mobile')}</Text>
                                <Text style={[styles.value, { color: colors.textPrimary }]}>{contactData.mobile}</Text>
                            </View>
                        </TouchableOpacity>
                    )}

                    {/* Email */}
                    {contactData.email && (
                        <TouchableOpacity style={styles.contactItem} onPress={() => handleEmail(contactData.email)}>
                            <View style={[styles.iconBox, { backgroundColor: colors.primary + '20' }]}>
                                <EmailIcon size={20} color={colors.primary} />
                            </View>
                            <View style={styles.contactText}>
                                <Text style={[styles.label, { color: colors.textTertiary }]}>{t('Email')}</Text>
                                <Text style={[styles.value, { color: colors.textPrimary }]}>{contactData.email}</Text>
                            </View>
                        </TouchableOpacity>
                    )}

                    {/* WhatsApp */}
                    {contactData.whatsapp_no && (
                        <TouchableOpacity style={styles.contactItem} onPress={() => handleWhatsApp(contactData.whatsapp_no)}>
                            <View style={[styles.iconBox, { backgroundColor: colors.primary + '20' }]}>
                                <WhatsAppIcon size={20} color={colors.primary} />
                            </View>
                            <View style={styles.contactText}>
                                <Text style={[styles.label, { color: colors.textTertiary }]}>{t('WhatsApp')}</Text>
                                <Text style={[styles.value, { color: colors.textPrimary }]}>{contactData.whatsapp_no}</Text>
                            </View>
                        </TouchableOpacity>
                    )}

                    {/* Address */}
                    {(contactData.address_en || contactData.address_ar) && (
                        <View style={styles.contactItem}>
                            <View style={[styles.iconBox, { backgroundColor: colors.primary + '20' }]}>
                                <LocationIcon size={20} color={colors.primary} />
                            </View>
                            <View style={styles.contactText}>
                                <Text style={[styles.label, { color: colors.textTertiary }]}>{t('Address')}</Text>
                                <Text style={[styles.value, { color: colors.textPrimary, writingDirection: isArabic ? 'rtl' : 'ltr' }]}>
                                    {isArabic ? (contactData.address_ar || contactData.address_en) : (contactData.address_en || contactData.address_ar)}
                                </Text>
                            </View>
                        </View>
                    )}
                </View>

            </View>
        ) : (
            <Text style={[styles.errorText, { color: colors.textTertiary }]}>No contact information available.</Text>
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
  introText: {
      fontSize: 15,
      textAlign: 'center',
      marginBottom: 30,
      lineHeight: 22,
      fontFamily: typography.fontFamily.regular,
  },
  infoContainer: {
      flex: 1,
  },
  card: {
      borderRadius: 16,
      borderWidth: 1,
      padding: 20,
      gap: 24,
  },
  contactItem: {
      flexDirection: 'row',
      alignItems: 'center',
  },
  iconBox: {
      width: 44,
      height: 44,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 16,
  },
  contactText: {
      flex: 1,
  },
  label: {
      fontSize: 12,
      marginBottom: 4,
      fontFamily: typography.fontFamily.medium,
  },
  value: {
      fontSize: 15,
      fontFamily: typography.fontFamily.interRegular,
  },
  errorText: {
      textAlign: 'center',
      marginTop: 40,
      fontSize: 16,
  }
});
