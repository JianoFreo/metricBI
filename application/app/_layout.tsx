import React from 'react';
import { Stack, Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { AuthProvider, useAuth } from '@/common/context/auth.context';
import { Loading } from '@/common/components';

export const unstable_settings = {
  anchor: 'dashboard',
};

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootNavigationWrapper />
      <StatusBar style="auto" />
    </AuthProvider>
  );
}

/**
 * Root Navigation Wrapper - Routes based on auth state
 */
function RootNavigationWrapper() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <Loading />;
  }

  return isAuthenticated ? <AppLayout /> : <AuthLayout />;
}

/**
 * Auth Stack - Login and Registration screens
 */
function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animationEnabled: true,
      }}
    >
      <Stack.Screen name="(auth)/login" />
      <Stack.Screen name="(auth)/register" />
    </Stack>
  );
}

/**
 * App Stack - Main app with bottom tab navigation
 */
function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E5E7EB',
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: '#4F46E5',
        tabBarInactiveTintColor: '#9CA3AF',
      }}
    >
      {/* Dashboard Tab */}
      <Tabs.Screen
        name="(dashboard)/index"
        options={{
          title: 'Dashboard',
          headerTitle: 'Dashboard',
          tabBarLabel: 'Dashboard',
        }}
      />

      {/* Assets Tab */}
      <Tabs.Screen
        name="(assets)/index"
        options={{
          title: 'Assets',
          headerTitle: 'Assets',
          tabBarLabel: 'Assets',
        }}
      />

      {/* Inventory Tab */}
      <Tabs.Screen
        name="(inventory)/index"
        options={{
          title: 'Inventory',
          headerTitle: 'Inventory',
          tabBarLabel: 'Inventory',
        }}
      />

      {/* Procurement Tab */}
      <Tabs.Screen
        name="(procurement)/index"
        options={{
          title: 'Procurement',
          headerTitle: 'Procurement',
          tabBarLabel: 'Procurement',
        }}
      />

      {/* AI Chat Tab */}
      <Tabs.Screen
        name="(chat)/index"
        options={{
          title: 'AI Chat',
          headerTitle: 'AI Chat',
          tabBarLabel: 'Chat',
        }}
      />

      {/* Reports Tab */}
      <Tabs.Screen
        name="(reports)/index"
        options={{
          title: 'Reports',
          headerTitle: 'Reports',
          tabBarLabel: 'Reports',
        }}
      />

      {/* Profile Tab */}
      <Tabs.Screen
        name="(profile)/index"
        options={{
          title: 'Profile',
          headerTitle: 'Profile',
          tabBarLabel: 'Profile',
        }}
      />
    </Tabs>
  );
}
