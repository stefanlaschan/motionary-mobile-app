import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useAuth } from './src/hooks/useAuth';
import { LoginScreen } from './src/screens/LoginScreen';
import { MainTabs } from './src/navigation/MainTabs';
import { SignupScreen } from './src/screens/SignupScreen';

export default function App() {
  const { loggedIn, bootstrapping, handleLoginSuccess, handleLogout } = useAuth();

  // 1. Local state to track if we should show Signup instead of Login
  const [isSignupVisible, setIsSignupVisible] = useState(false);

  // 2. The method that only handles the navigation logic
  const handleNavigateToSignup = () => {
    setIsSignupVisible(true);
  };

  if (bootstrapping) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
        <StatusBar style="auto" />
      </View>
    );
  }

  if (!loggedIn) {
    // 3. If the method was triggered, show SignupScreen
    if (isSignupVisible) {
      return (
        <SignupScreen
          onNavigateToLogin={() => setIsSignupVisible(false)}
          onSignupSuccess={handleLoginSuccess}
        />
      );
    }

    // 4. Otherwise show LoginScreen and pass the method as a prop
    return (
      <LoginScreen
        onLogin={handleLoginSuccess}
        onNavigateToSignup={handleNavigateToSignup}
      />
    );
  }

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

