import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert, ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router'; // Use Expo Router
import { signup } from '@/services/authService';

export default function SignupScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '', email: '', firstName: '', lastName: '', password: '', confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    if (!formData.username.trim()) { Alert.alert('Error', 'Username required'); return false; }
    if (!formData.email.trim() || !formData.email.includes('@')) { Alert.alert('Error', 'Valid email required'); return false; }
    if (formData.password.length < 8) { Alert.alert('Error', 'Password must be 8+ chars'); return false; }
    if (formData.password !== formData.confirmPassword) { Alert.alert('Error', 'Passwords mismatch'); return false; }
    return true;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      await signup({
        username: formData.username.trim(),
        email: formData.email.trim(),
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        password: formData.password,
      });

      Alert.alert(
        'Account Created',
        'Your account is ready. Please login with your credentials.',
        [
          {
            text: 'Go to Login',
            onPress: () => router.replace('/login')
          }
        ]
      );
    } catch (error) {
      Alert.alert('Signup Failed', error instanceof Error ? error.message : 'Failed');
    } finally {
      setLoading(false);
    }
  };


  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.title}>Create Account</Text>
        </View>

        {/* Form */}
            <View style={styles.form}>
                  {/* Username */}
                  <View style={styles.inputContainer}>
                    <MaterialIcons name="person" size={20} color="#8E8E93" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Username"
                      value={formData.username}
                      onChangeText={(text) => updateField('username', text)}
                      autoCapitalize="none"
                      autoCorrect={false}
                      editable={!loading}
                    />
                  </View>

                  {/* Email */}
                  <View style={styles.inputContainer}>
                    <MaterialIcons name="email" size={20} color="#8E8E93" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Email"
                      value={formData.email}
                      onChangeText={(text) => updateField('email', text)}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      editable={!loading}
                    />
                  </View>

                  {/* First Name */}
                  <View style={styles.inputContainer}>
                    <MaterialIcons name="badge" size={20} color="#8E8E93" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="First Name"
                      value={formData.firstName}
                      onChangeText={(text) => updateField('firstName', text)}
                      autoCapitalize="words"
                      editable={!loading}
                    />
                  </View>

                  {/* Last Name */}
                  <View style={styles.inputContainer}>
                    <MaterialIcons name="badge" size={20} color="#8E8E93" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Last Name"
                      value={formData.lastName}
                      onChangeText={(text) => updateField('lastName', text)}
                      autoCapitalize="words"
                      editable={!loading}
                    />
                  </View>

                  {/* Password */}
                  <View style={styles.inputContainer}>
                    <MaterialIcons name="lock" size={20} color="#8E8E93" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Password"
                      value={formData.password}
                      onChangeText={(text) => updateField('password', text)}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                      editable={!loading}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.eyeIcon}
                      disabled={loading}
                    >
                      <MaterialIcons
                        name={showPassword ? 'visibility' : 'visibility-off'}
                        size={20}
                        color="#8E8E93"
                      />
                    </TouchableOpacity>
                  </View>

                  {/* Confirm Password */}
                  <View style={styles.inputContainer}>
                    <MaterialIcons name="lock" size={20} color="#8E8E93" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Confirm Password"
                      value={formData.confirmPassword}
                      onChangeText={(text) => updateField('confirmPassword', text)}
                      secureTextEntry={!showConfirmPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                      editable={!loading}
                    />
                    <TouchableOpacity
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={styles.eyeIcon}
                      disabled={loading}
                    >
                      <MaterialIcons
                        name={showConfirmPassword ? 'visibility' : 'visibility-off'}
                        size={20}
                        color="#8E8E93"
                      />
                    </TouchableOpacity>
                  </View>

          <TouchableOpacity style={styles.signupButton} onPress={handleSignup} disabled={loading}>
            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.signupButtonText}>Sign Up</Text>}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/login')}>
            <Text style={styles.loginLink}>Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  scrollContent: { paddingHorizontal: 32, paddingBottom: 40 },
  header: { marginTop: 60, marginBottom: 30 },
  backButton: { marginBottom: 20 },
  title: { fontSize: 32, fontWeight: 'bold' },
  form: { width: '100%' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 12, paddingHorizontal: 16, marginBottom: 16, height: 50 },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 16 },
  signupButton: { backgroundColor: '#007AFF', borderRadius: 12, height: 50, justifyContent: 'center', alignItems: 'center', marginTop: 20 },
  signupButtonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 30 },
  loginLink: { color: '#007AFF', fontWeight: '600' }
});
