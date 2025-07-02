import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from 'react-native-splash-screen';
import { StatusBar } from 'react-native';

import TabNavigator from './screens/TabNavigator';
import NotFoundScreen from './screens/NotFoundScreen'; // fixed import path

const Stack = createNativeStackNavigator();

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hide(); // immediately hide splash once loaded
  }, []);

  return (
    <>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Tabs" component={TabNavigator} />
          <Stack.Screen name="NotFound" component={NotFoundScreen} />
        </Stack.Navigator>
      </NavigationContainer>
      <StatusBar barStyle="dark-content" />
    </>
  );
}
const styles = StyleSheet.create({
    text: {
      fontFamily: 'Inter-Medium',
      fontSize: 16,
      color: '#000',
    },
  });
  