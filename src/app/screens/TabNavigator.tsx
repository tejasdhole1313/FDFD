import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Platform } from 'react-native';
import {
  Chrome as HomeIcon,
  UserPlus,
  History,
  User,
  UserCheck,
} from 'lucide-react-native';

import HomeScreen from './index';
import SignUpScreen from './singip';
import RegisterScreen from './register';
import HistoryScreen from './history';
import ProfileScreen from './profile';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#6B7280',
        tabBarStyle: {
          position: 'absolute',
          bottom: 16,
          left: 16,
          right: 16,
          height: 65,
          borderRadius: 16,
          backgroundColor: '#FFFFFF',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 10,
          elevation: 5,
          borderTopWidth: 0,
          paddingBottom: Platform.OS === 'android' ? 10 : 20,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          marginBottom: 4,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <HomeIcon size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tab.Screen
        name="SignUp"
        component={SignUpScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <UserCheck size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tab.Screen
        name="Register"
        component={RegisterScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <UserPlus size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <History size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <User size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;
