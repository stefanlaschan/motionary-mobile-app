import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  TextInput, ActivityIndicator, RefreshControl, Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router'; // 1. Expo Router hooks
import * as ImagePicker from 'expo-image-picker';

import { getAllVideos, uploadVideo as uploadVideoService, deleteVideo } from '@/services/videoService';
import { useAuth } from '@/context/AuthContext';
import type { VideoResponse } from '@/types/video';

export default function HomeScreen() {
  const router = useRouter();
  const [videos, setVideos] = useState<VideoResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const { handleLogout } = useAuth();

// 1. Initial/Focus Load: Refreshes when you enter the tab
useFocusEffect(
  useCallback(() => {
    loadVideos(true);
  }, [])
);

// 2. Real-time Search: Refreshes as you type
useEffect(() => {
  loadVideos(true);
}, [searchQuery, selectedTag]); // Triggers on every keystroke or tag change

const loadVideos = async (isSilent = false) => {
  try {
    if (!isSilent) setLoading(true);

    const data = await getAllVideos(searchQuery || undefined, selectedTag || undefined);
    setVideos(data);
  } catch (error: any) {
    if (error.message.includes('401')) {
      handleLogout();
    } else {
      Alert.alert('Error', 'Failed to load videos');
    }
  } finally {
    setLoading(false);
  }
};

const onRefresh = useCallback(async () => {
  setRefreshing(true);
  await loadVideos(true); // Pass true to avoid full-screen loading state
  setRefreshing(false);
}, [searchQuery, selectedTag]); // Add dependencies for stability

  const handlePickVideo = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera roll permissions');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];

        Alert.prompt(
          'Video Name',
          'Enter a name for this video',
          async (name) => {
            if (name && name.trim()) {
              handleUpload(asset.uri, name.trim());
            }
          },
          'plain-text'
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick video');
    }
  };

  const handleUpload = async (uri: string, name: string) => {
    try {
      setUploading(true);
      await uploadVideoService(uri, name, []);
      Alert.alert('Success', 'Video uploaded successfully');
      await loadVideos();
    } catch (error) {
      Alert.alert('Error', 'Failed to upload video');
    } finally {
      setUploading(false);
    }
  };

  const handleShowVideoDetails = (video: VideoResponse) => {
    router.push(`/video/${video.id}`);
  };

  const handleDeleteVideo = async (id: string) => {
    Alert.alert('Delete Video', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteVideo(id);
            await loadVideos();
          } catch (error) {
            Alert.alert('Error', 'Failed to delete');
          }
        },
      },
    ]);
  };

  const getAllTags = () => {
    const tags = new Set<string>();
    videos.forEach(v => v.tags?.forEach(t => tags.add(t)));
    return Array.from(tags).sort();
  };

  const renderVideoItem = ({ item }: { item: VideoResponse }) => (
    <TouchableOpacity
      style={styles.videoCard}
      onPress={() => handleShowVideoDetails(item)} // 4. Added Card Press
    >
      <View style={styles.videoContent}>
        <MaterialIcons name="movie" size={40} color="#007AFF" />
        <View style={styles.videoInfo}>
          <Text style={styles.videoName} numberOfLines={2}>{item.name}</Text>
          {item.tags && item.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {item.tags.map((tag, idx) => (
                <View key={idx} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          )}
          <Text style={styles.videoDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
        </View>
        <TouchableOpacity
          onPress={() => handleDeleteVideo(item.id)}
          style={styles.deleteButton}
        >
          <MaterialIcons name="delete" size={24} color="#FF3B30" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const allTags = getAllTags();

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Practice Library</Text>
        <TouchableOpacity onPress={handlePickVideo} disabled={uploading}>
          {uploading ? <ActivityIndicator size="small" /> : <MaterialIcons name="add-circle" size={32} color="#007AFF" />}
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={20} color="#8E8E93" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search videos..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <MaterialIcons name="close" size={20} color="#8E8E93" />
          </TouchableOpacity>
        )}
      </View>

      {allTags.length > 0 && (
        <View style={styles.tagsFilterContainer}>
          <FlatList
            horizontal
            data={allTags}
            keyExtractor={(item) => item}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.filterTag, selectedTag === item && styles.filterTagSelected]}
                onPress={() => setSelectedTag(selectedTag === item ? null : item)}
              >
                <Text style={[styles.filterTagText, selectedTag === item && styles.filterTagTextSelected]}>
                  {item}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      <FlatList
        data={videos}
        renderItem={renderVideoItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="video-library" size={64} color="#C7C7CC" />
            <Text style={styles.emptyText}>No videos yet</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 60, backgroundColor: '#FFF' },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#1C1C1E' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E5E5EA', margin: 15, padding: 10, borderRadius: 10 },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 17 },
  tagsFilterContainer: { marginBottom: 10 },
  filterTag: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, backgroundColor: '#FFF', marginHorizontal: 5, borderWidth: 1, borderColor: '#E5E5EA' },
  filterTagSelected: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
  filterTagTextSelected: { color: '#FFF' },
  videoCard: { backgroundColor: '#FFF', marginHorizontal: 15, marginBottom: 10, borderRadius: 12, padding: 15 },
  videoContent: { flexDirection: 'row', alignItems: 'center' },
  videoInfo: { flex: 1, marginLeft: 15 },
  videoName: { fontSize: 17, fontWeight: '600' },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 },
  tag: { backgroundColor: '#E5E5EA', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, marginRight: 4, marginTop: 4 },
  tagText: { fontSize: 12, color: '#3A3A3C' },
  videoDate: { fontSize: 13, color: '#8E8E93', marginTop: 8 },
  deleteButton: { padding: 5 },
  listContent: { paddingBottom: 20 },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { fontSize: 18, color: '#8E8E93', marginTop: 10 }
});
