/**
 * Main Bottom Tab Navigator
 */
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { MainTabParamList } from './types';
import { Platform, StyleSheet, View } from 'react-native';

// Tab Screens
import { HomeScreen } from '../features/Home/screens/HomeScreen';
import { CartScreen } from '../features/Cart/screens/CartScreen';
import { OrdersScreen } from '../features/Orders/screens/OrdersScreen';
import { MessagesScreen } from '../features/Messages/screens/MessagesScreen';

// Tab Icons
import { HomeTabIcon } from '../components/icons/HomeTabIcon';
import { CartTabIcon } from '../components/icons/CartTabIcon';
import { OrdersTabIcon } from '../components/icons/OrdersTabIcon';
import { MessageTabIcon } from '../components/icons/MessageTabIcon';

import { useTheme } from '../hooks/useTheme';
import { useTranslation } from 'react-i18next';

const Tab = createBottomTabNavigator<MainTabParamList>();

export const MainTabs = () => {
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();

  const renderTabIcon = (Icon: React.FC<any>, focused: boolean, color: string, size: number) => {
    return (
      <View
        style={{
          backgroundColor: focused ? colors.primary : 'transparent',
          width: 50,
          height: 50,
          borderRadius: 25,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Icon 
          size={24} 
          color={focused ? '#FFFFFF' : (isDark ? colors.secondary : colors.primary)} 
        />
      </View>
    );
  };
  
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: isDark ? colors.secondary : colors.primary,
        tabBarInactiveTintColor: isDark ? colors.secondary : colors.primary,
        tabBarShowLabel: true,
        tabBarStyle: {
          backgroundColor: isDark ? colors.backgroundSecondary : '#FDF8F0', // Light beige bg as per image
          borderTopWidth: 0,
          elevation: 0, 
          height: Platform.OS === 'ios' ? 100 : 90,
          paddingTop: 12,
          paddingBottom: Platform.OS === 'ios' ? 30 : 16,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
          fontFamily: 'PlayfairDisplay-Medium', 
          color: isDark ? colors.secondary : colors.primary,
          
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: t('Home'),
          tabBarIcon: ({ focused, color, size }) => renderTabIcon(HomeTabIcon, focused, color, size),
        }}
      />
      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{
          tabBarLabel: t('Cart'),
          tabBarIcon: ({ focused, color, size }) => renderTabIcon(CartTabIcon, focused, color, size),
        }}
      />
      <Tab.Screen
        name="Orders"
        component={OrdersScreen}
        options={{
          tabBarLabel: t('Orders'),
          tabBarIcon: ({ focused, color, size }) => renderTabIcon(OrdersTabIcon, focused, color, size),
        }}
      />
      <Tab.Screen
        name="Message"
        component={MessagesScreen}
        options={{
          tabBarLabel: t('Message'), 
          tabBarIcon: ({ focused, color, size }) => renderTabIcon(MessageTabIcon, focused, color, size),
        }}
      />
    </Tab.Navigator>
  );
};
