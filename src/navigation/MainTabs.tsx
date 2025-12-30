import React from 'react';
import type { ComponentProps } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import { HomeScreen } from '../screens/HomeScreen';
import { ProfileScreen } from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();
type MaterialIconName = ComponentProps<typeof MaterialIcons>['name'];

type MainTabsProps = {
  onLogout: () => void;
};

export const MainTabs: React.FC<MainTabsProps> = ({ onLogout }) => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarIcon: ({ color, size }) => {
        let iconName: MaterialIconName;

        if (route.name === 'Home') {
          iconName = 'home-filled';
        } else {
          iconName = 'person';
        }

        return <MaterialIcons name={iconName} size={size} color={color} />;
      },
    })}
  >
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Profile">
      {() => <ProfileScreen onLogout={onLogout} />}
    </Tab.Screen>
  </Tab.Navigator>
);
