import { Tabs } from 'expo-router';
import { Calendar, Home, User } from 'lucide-react-native'; // Import the icons
import React from 'react';
import { Platform } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#007AFF', // Blue for active tab
        tabBarInactiveTintColor: '#999',  // Gray for inactive
        headerShown: false,               // Hide the default top header
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',         // Transparent/floating effect on iOS
            borderTopWidth: 0,
          },
          default: {
            backgroundColor: '#fff',
            borderTopWidth: 1,
            borderTopColor: '#e5e5e5',
            height: 60,
            paddingBottom: 8,
            paddingTop: 8,
          },
        }),
      }}>
      
      {/* 1. HOME TAB */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
        }}
      />

      {/* 2. HISTORY TAB (Fixed: points to 'history.tsx') */}
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color }) => <Calendar size={24} color={color} />,
        }}
      />

      {/* 3. PROFILE TAB */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <User size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}