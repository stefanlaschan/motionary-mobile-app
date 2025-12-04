import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useAuth } from './src/hooks/useAuth';
import { LoginScreen } from './src/screens/LoginScreen';
import { MainTabs } from './src/navigation/MainTabs';

export default function App() {
  const { loggedIn, bootstrapping, handleLoginSuccess, handleLogout } = useAuth();

  if (bootstrapping) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
        <StatusBar style="auto" />
      </View>
    );
  }

  if (!loggedIn) {
    // Login page shown before authentication
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  // After login, show bottom tab navigation with Home & Profile
  return (
    <NavigationContainer>
      <MainTabs onLogout={handleLogout} />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
