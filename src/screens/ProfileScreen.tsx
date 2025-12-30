import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { videoService } from '../services/videoService';
import { logout } from '../services/authService';

type ProfileScreenProps = {
  onLogout: () => void;
};

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ onLogout }) => {
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
      const storedUsername = await AsyncStorage.getItem('username');
      const storedEmail = await AsyncStorage.getItem('email');

      if (storedUsername) setUsername(storedUsername);
      if (storedEmail) setEmail(storedEmail);
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  };

  const loadStats = async () => {
    try {
      const videos = await videoService.getAllVideos();
      setVideoCount(videos.length);

      const size = videos.reduce((acc, video) => {
        return acc + (video.fileSize || 0);
      }, 0);
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
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoggingOut(true);

              // Call backend logout endpoint (invalidates Keycloak session)
              await logout();

              // Trigger parent component logout (navigate to login screen)
              onLogout();
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            } finally {
              setLoggingOut(false);
            }
          },
        },
      ]
    );
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will clear all cached data.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Success', 'Cache cleared');
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <MaterialIcons name="person" size={60} color="#FFFFFF" />
        </View>
        <Text style={styles.username}>{username || 'User'}</Text>
        <Text style={styles.email}>{email || 'user@example.com'}</Text>
      </View>

      {/* Stats */}
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

      {/* Settings Section */}
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

        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <MaterialIcons name="language" size={24} color="#007AFF" />
            <Text style={styles.settingText}>Language</Text>
          </View>
          <View style={styles.settingRight}>
            <Text style={styles.settingValue}>English</Text>
            <MaterialIcons name="chevron-right" size={24} color="#C7C7CC" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
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

      {/* Data Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>DATA</Text>

        <TouchableOpacity style={styles.settingItem} onPress={handleClearCache}>
          <View style={styles.settingLeft}>
            <MaterialIcons name="delete-sweep" size={24} color="#007AFF" />
            <Text style={styles.settingText}>Clear Cache</Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color="#C7C7CC" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <MaterialIcons name="cloud-download" size={24} color="#007AFF" />
            <Text style={styles.settingText}>Export Data</Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color="#C7C7CC" />
        </TouchableOpacity>
      </View>

      {/* About Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ABOUT</Text>

        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <MaterialIcons name="help" size={24} color="#007AFF" />
            <Text style={styles.settingText}>Help & Support</Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color="#C7C7CC" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <MaterialIcons name="privacy-tip" size={24} color="#007AFF" />
            <Text style={styles.settingText}>Privacy Policy</Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color="#C7C7CC" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <MaterialIcons name="description" size={24} color="#007AFF" />
            <Text style={styles.settingText}>Terms of Service</Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color="#C7C7CC" />
        </TouchableOpacity>

        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <MaterialIcons name="info" size={24} color="#007AFF" />
            <Text style={styles.settingText}>Version</Text>
          </View>
          <Text style={styles.settingValue}>1.0.0</Text>
        </View>
      </View>

      {/* Logout Button */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
        disabled={loggingOut}
      >
        {loggingOut ? (
          <ActivityIndicator size="small" color="#FF3B30" />
        ) : (
          <>
            <MaterialIcons name="logout" size={24} color="#FF3B30" />
            <Text style={styles.logoutText}>Logout</Text>
          </>
        )}
      </TouchableOpacity>

      <View style={styles.footer} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#8E8E93',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#8E8E93',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E5EA',
    marginHorizontal: 20,
  },
  section: {
    marginTop: 32,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 8,
    marginLeft: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 1,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    fontSize: 16,
    color: '#000000',
    marginLeft: 12,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValue: {
    fontSize: 16,
    color: '#8E8E93',
    marginRight: 8,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 32,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B30',
    marginLeft: 8,
  },
  footer: {
    height: 40,
  },
});