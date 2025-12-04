import React from 'react';
import type { ComponentProps } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from '@expo/vector-icons/Ionicons';
import { HomeScreen } from '../screens/HomeScreen';
import { ProfileScreen } from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();
type IoniconsName = ComponentProps<typeof Ionicons>['name'];

type MainTabsProps = {
  onLogout: () => void;
};

export const MainTabs: React.FC<MainTabsProps> = ({ onLogout }) => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarIcon: ({ color, size }) => {
        let iconName: IoniconsName;

        if (route.name === 'Home') {
          iconName = 'home';
        } else {
          iconName = 'person';
        }

        return <Ionicons name={iconName} size={size} color={color} />;
      },
    })}
  >
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Profile">
      {() => <ProfileScreen onLogout={onLogout} />}
    </Tab.Screen>
  </Tab.Navigator>
);
