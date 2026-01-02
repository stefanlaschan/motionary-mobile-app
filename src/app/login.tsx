import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext'; // 1. Use the shared context

export default function LoginScreen() {
  const router = useRouter();
  const { onLogin } = useAuth(); // 2. Pull onLogin from Context

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLoginPress = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both username and password');
      return;
    }

    try {
      setLoading(true);
      // 3. Call the refactored function
      await onLogin(username.trim(), password);

      // 4. Navigate away
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Login Failed', error instanceof Error ? error.message : 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <MaterialIcons name="video-library" size={80} color="#007AFF" />
          <Text style={styles.title}>Motionary</Text>
          <Text style={styles.subtitle}>Practice Library</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <MaterialIcons name="person" size={20} color="#8E8E93" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Username"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              editable={!loading}
            />
          </View>

          <View style={styles.inputContainer}>
            <MaterialIcons name="lock" size={20} color="#8E8E93" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              editable={!loading}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <MaterialIcons
                name={showPassword ? 'visibility' : 'visibility-off'}
                size={20}
                color="#8E8E93"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
            onPress={handleLoginPress}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.loginButtonText}>Login</Text>}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/signup')}>
            <Text style={styles.signupLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

// ... styles remain unchanged
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: 32 },
  header: { alignItems: 'center', marginBottom: 48 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#000000', marginTop: 16 },
  subtitle: { fontSize: 16, color: '#8E8E93', marginTop: 4 },
  form: { width: '100%' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, paddingHorizontal: 16, marginBottom: 16, borderWidth: 1, borderColor: '#E5E5EA' },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, height: 50, fontSize: 16, color: '#000000' },
  loginButton: { backgroundColor: '#007AFF', borderRadius: 12, height: 50, justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  loginButtonDisabled: { opacity: 0.6 },
  loginButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 32 },
  footerText: { fontSize: 14, color: '#8E8E93' },
  signupLink: { fontSize: 14, color: '#007AFF', fontWeight: '600' },
});
