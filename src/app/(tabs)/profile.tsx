import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Alert, Switch, ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router'; // 1. Use Expo Router
import * as SecureStore from 'expo-secure-store';

// Update these paths to match your new src structure
import { getAllVideos } from '@/services/videoService';
import { logout } from '@/services/authService';

export default function ProfileScreen() {
  const router = useRouter(); // 2. Initialize router
  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [videoCount, setVideoCount] = useState<number>(0);
  const [totalSize, setTotalSize] = useState<number>(0);
  const [notifications, setNotifications] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    loadUserData();
    loadStats();
  }, []);

  const loadUserData = async () => {
    try {
      const [storedUsername, storedEmail] = await Promise.all([
        SecureStore.getItemAsync('username'),
        SecureStore.getItemAsync('email')
      ]);
      if (storedUsername) setUsername(storedUsername);
      if (storedEmail) setEmail(storedEmail);
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  };

  const loadStats = async () => {
    try {
      const videos = await getAllVideos();
      setVideoCount(videos.length);
      const size = videos.reduce((acc, v) => acc + (v.fileSize || 0), 0);
      setTotalSize(size);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            setLoggingOut(true);
            await logout(); // Backend logout

            // 3. Navigation handling:
            // If your layout.tsx watches auth state, it will auto-redirect.
            // Otherwise, manually navigate to the login route:
            router.replace('/login');
          } catch (error) {
            Alert.alert('Error', 'Failed to logout. Please try again.');
          } finally {
            setLoggingOut(false);
          }
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <MaterialIcons name="person" size={60} color="#FFFFFF" />
        </View>
        <Text style={styles.username}>{username}</Text>
        <Text style={styles.email}>{email}</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{videoCount}</Text>
          <Text style={styles.statLabel}>Videos</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{formatBytes(totalSize)}</Text>
          <Text style={styles.statLabel}>Total Size</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>SETTINGS</Text>
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <MaterialIcons name="notifications" size={24} color="#007AFF" />
            <Text style={styles.settingText}>Notifications</Text>
          </View>
          <Switch
            value={notifications}
            onValueChange={setNotifications}
            trackColor={{ false: '#E5E5EA', true: '#34C759' }}
          />
        </View>

        {/* Navigation to sub-screens in Expo Router */}
        <TouchableOpacity
           style={styles.settingItem}
           onPress={() => router.push('/profile/storage')}
        >
          <View style={styles.settingLeft}>
            <MaterialIcons name="storage" size={24} color="#007AFF" />
            <Text style={styles.settingText}>Storage</Text>
          </View>
          <View style={styles.settingRight}>
            <Text style={styles.settingValue}>{formatBytes(totalSize)}</Text>
            <MaterialIcons name="chevron-right" size={24} color="#C7C7CC" />
          </View>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
        disabled={loggingOut}
      >
        {loggingOut ? (
          <ActivityIndicator color="#FF3B30" />
        ) : (
          <>
            <MaterialIcons name="logout" size={24} color="#FF3B30" />
            <Text style={styles.logoutText}>Logout</Text>
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  header: { alignItems: 'center', padding: 30, backgroundColor: '#007AFF' },
  avatarContainer: { width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  username: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF' },
  email: { fontSize: 16, color: 'rgba(255,255,255,0.8)', marginTop: 5 },
  statsContainer: { flexDirection: 'row', backgroundColor: '#FFFFFF', margin: 15, borderRadius: 12, padding: 20, elevation: 2 },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 18, fontWeight: 'bold', color: '#1C1C1E' },
  statLabel: { fontSize: 14, color: '#8E8E93', marginTop: 4 },
  statDivider: { width: 1, backgroundColor: '#E5E5EA' },
  section: { marginTop: 20 },
  sectionTitle: { fontSize: 13, color: '#8E8E93', marginLeft: 15, marginBottom: 8 },
  settingItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFFFFF', padding: 15, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#C7C7CC' },
  settingLeft: { flexDirection: 'row', alignItems: 'center' },
  settingText: { fontSize: 17, marginLeft: 15, color: '#1C1C1E' },
  settingRight: { flexDirection: 'row', alignItems: 'center' },
  settingValue: { fontSize: 17, color: '#8E8E93', marginRight: 5 },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', marginTop: 30, marginBottom: 50, padding: 15, borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: '#C7C7CC' },
  logoutText: { fontSize: 17, color: '#FF3B30', fontWeight: '600', marginLeft: 10 },
});
