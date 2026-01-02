import { Slot, Stack } from 'expo-router';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { AuthProvider, useAuth } from '@/context/AuthContext'; // Import the new context

function RootLayoutContent() {
  const { bootstrapping } = useAuth();

  if (bootstrapping) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // Use Stack so you can define screen-specific options
  return (
    <Stack
        screenOptions={{
          headerShown: false,
          headerBackTitle: 'Back', // Forces the text to say "Back" instead of "(tabs)"
          headerTintColor: '#007AFF', // Standard iOS Blue
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

// The RootLayout wraps the app in the AuthProvider
export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutContent />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
