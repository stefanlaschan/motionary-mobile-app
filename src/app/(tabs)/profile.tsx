import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Alert, Switch, ActivityIndicator, Platform
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

import { getAllVideos } from '@/services/videoService';
import { logout } from '@/services/authService';
import { useAuth } from '@/context/AuthContext';

export default function ProfileScreen() {
  const router = useRouter();
  const [videoCount, setVideoCount] = useState<number>(0);
  const [totalSize, setTotalSize] = useState<number>(0);
  const [notifications, setNotifications] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const { user: { username, email, firstName, lastName } } = useAuth();

  useEffect(() => {
    loadStats();
  }, []);

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
            await logout();

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
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          {/* HEADER SECTION - Modern Gradient-like Blue */}
          <View style={styles.header}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>
                {firstName?.charAt(0)}{lastName?.charAt(0)}
              </Text>
            </View>
            <Text style={styles.fullName}>{firstName} {lastName}</Text>
            <Text style={styles.username}>@{username}</Text>
            <View style={styles.badge}>
              <Text style={styles.emailText}>{email}</Text>
            </View>
          </View>

          {/* STATS CARD - Clean floating look */}
          <View style={styles.statsCard}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{videoCount}</Text>
              <Text style={styles.statLabel}>Videos</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{formatBytes(totalSize)}</Text>
              <Text style={styles.statLabel}>Used</Text>
            </View>
          </View>

          {/* SETTINGS SECTION */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>PREFERENCES</Text>
            <View style={styles.card}>
              <View style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <View style={[styles.iconBox, { backgroundColor: '#E8F2FF' }]}>
                    <MaterialIcons name="notifications" size={22} color="#007AFF" />
                  </View>
                  <Text style={styles.settingText}>Push Notifications</Text>
                </View>
                <Switch
                  value={notifications}
                  onValueChange={setNotifications}
                  trackColor={{ false: '#D1D1D6', true: '#34C759' }}
                  ios_backgroundColor="#D1D1D6"
                />
              </View>

              <TouchableOpacity
                 style={[styles.settingItem, { borderBottomWidth: 0 }]}
                 onPress={() => router.push('/profile/storage')}
              >
                <View style={styles.settingLeft}>
                  <View style={[styles.iconBox, { backgroundColor: '#F0F0F5' }]}>
                    <MaterialIcons name="storage" size={22} color="#8E8E93" />
                  </View>
                  <Text style={styles.settingText}>Storage Management</Text>
                </View>
                <View style={styles.settingRight}>
                  <Text style={styles.settingValue}>{formatBytes(totalSize)}</Text>
                  <MaterialIcons name="chevron-right" size={24} color="#C7C7CC" />
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* DANGER ZONE */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ACCOUNT</Text>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
              disabled={loggingOut}
            >
              {loggingOut ? (
                <ActivityIndicator color="#FF3B30" />
              ) : (
                <>
                  <MaterialIcons name="logout" size={20} color="#FF3B30" />
                  <Text style={styles.logoutText}>Sign Out</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      );
    }

    const styles = StyleSheet.create({
      container: { flex: 1, backgroundColor: '#F8F9FA' },
      header: {
        alignItems: 'center',
        paddingTop: 60,
        paddingBottom: 40,
        backgroundColor: '#007AFF',
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
      },
      avatarContainer: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 } }),
      },
      avatarText: { fontSize: 32, fontWeight: '700', color: '#007AFF' },
      fullName: { fontSize: 24, fontWeight: '700', color: '#FFFFFF' },
      username: { fontSize: 16, color: 'rgba(255,255,255,0.7)', marginBottom: 12 },
      badge: {
        backgroundColor: 'rgba(255,255,255,0.15)',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 20
      },
      emailText: { color: '#FFFFFF', fontSize: 13, fontWeight: '500' },

      statsCard: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        marginHorizontal: 20,
        marginTop: -30,
        borderRadius: 20,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.05,
        shadowRadius: 20,
        elevation: 5,
      },
      statItem: { flex: 1, alignItems: 'center' },
      statValue: { fontSize: 20, fontWeight: '800', color: '#1C1C1E' },
      statLabel: { fontSize: 12, color: '#8E8E93', fontWeight: '600', textTransform: 'uppercase', marginTop: 4 },
      statDivider: { width: 1, height: '80%', backgroundColor: '#F2F2F7', alignSelf: 'center' },

      section: { marginTop: 32, paddingHorizontal: 20 },
      sectionTitle: { fontSize: 12, fontWeight: '700', color: '#8E8E93', marginLeft: 8, marginBottom: 12, letterSpacing: 1 },
      card: { backgroundColor: '#FFFFFF', borderRadius: 20, overflow: 'hidden' },
      settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F2F2F7'
      },
      iconBox: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
      settingLeft: { flexDirection: 'row', alignItems: 'center' },
      settingText: { fontSize: 16, fontWeight: '500', marginLeft: 12, color: '#1C1C1E' },
      settingRight: { flexDirection: 'row', alignItems: 'center' },
      settingValue: { fontSize: 15, color: '#8E8E93', marginRight: 4 },

      logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFF0F0',
        marginBottom: 50,
        padding: 18,
        borderRadius: 20
      },
      logoutText: { fontSize: 16, color: '#FF3B30', fontWeight: '700', marginLeft: 8 },
    });
