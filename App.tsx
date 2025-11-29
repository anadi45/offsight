import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DarkTheme, DefaultTheme, NavigationContainer, ThemeProvider } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { StatusBar } from 'react-native';
import 'react-native-reanimated';

import ExploreScreen from './app/(tabs)/explore';
import HomeScreen from './app/(tabs)/index';
import CameraScreen from './app/camera';
import ModalScreen from './app/modal';
import { HapticTab } from './components/haptic-tab';
import { IconSymbol } from './components/ui/icon-symbol';
import { Colors } from './constants/theme';
import { useColorScheme } from './hooks/use-color-scheme';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabNavigator() {
  const colorScheme = useColorScheme();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tab.Screen
        name="Explore"
        component={ExploreScreen}
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <NavigationContainer>
        <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
        <Stack.Navigator>
          <Stack.Screen name="(tabs)" component={TabNavigator} options={{ headerShown: false }} />
          <Stack.Screen
            name="modal"
            component={ModalScreen}
            options={{ presentation: 'modal', title: 'Modal' }}
          />
          <Stack.Screen
            name="camera"
            component={CameraScreen}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </ThemeProvider>
  );
}

