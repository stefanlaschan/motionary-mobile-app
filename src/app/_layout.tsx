import { Slot, Stack } from 'expo-router';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { MenuProvider } from 'react-native-popup-menu';

function RootLayoutContent() {
  const { bootstrapping } = useAuth();

  if (bootstrapping) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <Stack
        screenOptions={{
          headerShown: false,
          headerBackTitle: 'Back',
          headerTintColor: '#007AFF',
        }}
      >
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
            name="video/[id]"
            options={{
              headerShown: true,
              headerBackTitleVisible: true, // Set to false if you only want the arrow
              headerTitle: 'Video Details',
            }}
          />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <MenuProvider>
        <RootLayoutContent />
      </MenuProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
