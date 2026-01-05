import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  TextInput, ActivityIndicator, RefreshControl, Alert, Platform
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
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

useFocusEffect(
  useCallback(() => {
    loadVideos(true);
  }, [])
);

useEffect(() => {
  loadVideos(true);
}, [searchQuery, selectedTag]);

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
  await loadVideos(true);
  setRefreshing(false);
}, [searchQuery, selectedTag]);

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

  const renderVideoItem = ({ item }) => (
      <TouchableOpacity
        style={styles.videoCard}
        onPress={() => handleShowVideoDetails(item)}
        activeOpacity={0.7}
      >
        <View style={styles.videoContent}>
          {/* Placeholder for Thumbnail/Icon */}
          <View style={styles.thumbnailContainer}>
            <MaterialIcons name="play-circle-filled" size={32} color="#007AFF" />
          </View>

          <View style={styles.videoInfo}>
            <Text style={styles.videoName} numberOfLines={1}>{item.name}</Text>

            <View style={styles.metaRow}>
              <Text style={styles.videoDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
              <View style={styles.dot} />
              <Text style={styles.videoSize}>{((item.fileSize || 0) / 1024 / 1024).toFixed(1)} MB</Text>
            </View>

            {item.tags && item.tags.length > 0 && (
              <View style={styles.tagsContainer}>
                {item.tags.slice(0, 3).map((tag, idx) => (
                  <View key={idx} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          <TouchableOpacity
            onPress={() => handleDeleteVideo(item.id)}
            style={styles.deleteIconButton}
          >
            <MaterialIcons name="more-vert" size={22} color="#C7C7CC" />
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
        {/* HEADER SECTION - Matches Profile Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Practice Videos</Text>
          </View>
          <TouchableOpacity
            onPress={handlePickVideo}
            disabled={uploading}
            style={styles.addButton}
          >
            {uploading ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <MaterialIcons name="add" size={28} color="#FFF" />
            )}
          </TouchableOpacity>
        </View>

        {/* SEARCH & FILTERS SECTION */}
        <View style={styles.filterSection}>
          <View style={styles.searchBar}>
            <MaterialIcons name="search" size={20} color="#8E8E93" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search your library..."
              placeholderTextColor="#8E8E93"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <MaterialIcons name="cancel" size={20} color="#C7C7CC" />
              </TouchableOpacity>
            )}
          </View>

          {allTags.length > 0 && (
            <FlatList
              horizontal
              data={allTags}
              keyExtractor={(item) => item}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tagList}
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
          )}
        </View>

        <FlatList
          data={videos}
          renderItem={renderVideoItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#007AFF" />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconBox}>
                <MaterialIcons name="video-library" size={48} color="#D1D1D6" />
              </View>
              <Text style={styles.emptyText}>No videos found</Text>
              <Text style={styles.emptySubtext}>Upload your first practice session to get started.</Text>
            </View>
          }
        />
      </View>
    );
  }

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      paddingHorizontal: 20,
      paddingTop: 60,
      paddingBottom: 20,
      backgroundColor: '#FFFFFF'
    },
    headerTitle: { fontSize: 28, fontWeight: '800', color: '#1C1C1E' },
    addButton: { backgroundColor: '#007AFF', borderRadius: 12, width: 44, height: 44, justifyContent: 'center', alignItems: 'center', elevation: 4, shadowColor: '#007AFF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
    filterSection: { backgroundColor: '#FFFFFF', paddingBottom: 15, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
    searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F2F2F7', marginHorizontal: 20, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 14, marginBottom: 15 },
    searchInput: { flex: 1, marginLeft: 8, fontSize: 16, color: '#1C1C1E' },
    tagList: { paddingHorizontal: 15 },
    filterTag: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F2F2F7', marginRight: 8, borderWidth: 1, borderColor: 'transparent' },
    filterTagSelected: { backgroundColor: '#E8F2FF', borderColor: '#007AFF' },
    filterTagText: { fontSize: 14, fontWeight: '600', color: '#8E8E93' },
    filterTagTextSelected: { color: '#007AFF' },
    videoCard: { backgroundColor: '#FFFFFF', marginHorizontal: 20, marginBottom: 12, borderRadius: 20, padding: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
    videoContent: { flexDirection: 'row', alignItems: 'center' },
    thumbnailContainer: { width: 60, height: 60, borderRadius: 14, backgroundColor: '#F0F7FF', justifyContent: 'center', alignItems: 'center' },
    videoInfo: { flex: 1, marginLeft: 16 },
    videoName: { fontSize: 17, fontWeight: '700', color: '#1C1C1E', marginBottom: 2 },
    metaRow: { flexDirection: 'row', alignItems: 'center' },
    videoDate: { fontSize: 13, color: '#8E8E93' },
    videoSize: { fontSize: 13, color: '#8E8E93' },
    dot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: '#C7C7CC', marginHorizontal: 6 },
    tagsContainer: { flexDirection: 'row', marginTop: 8 },
    tag: { backgroundColor: '#F2F2F7', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, marginRight: 6 },
    tagText: { fontSize: 11, fontWeight: '600', color: '#3A3A3C', textTransform: 'uppercase' },
    deleteIconButton: { padding: 4 },
    listContent: { paddingTop: 15, paddingBottom: 40 },
    emptyContainer: { alignItems: 'center', marginTop: 80, paddingHorizontal: 40 },
    emptyIconBox: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#F2F2F7', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
    emptyText: { fontSize: 18, fontWeight: '700', color: '#1C1C1E' },
    emptySubtext: { fontSize: 14, color: '#8E8E93', textAlign: 'center', marginTop: 8, lineHeight: 20 },
  });
