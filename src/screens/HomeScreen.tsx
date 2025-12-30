import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { getAllVideos, uploadVideo, deleteVideo } from '../services/videoService';
import type { VideoResponse } from '../types/video';

export const HomeScreen: React.FC = () => {
  const [videos, setVideos] = useState<VideoResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Load videos when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadVideos();
    }, [searchQuery, selectedTag])
  );

  const loadVideos = async () => {
    try {
      setLoading(true);
      const data = await getAllVideos(searchQuery || undefined, selectedTag || undefined);
      setVideos(data);
    } catch (error) {
      console.error('Failed to load videos:', error);
      Alert.alert('Error', 'Failed to load videos');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadVideos();
    setRefreshing(false);
  };

  const handlePickVideo = async () => {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera roll permissions');
        return;
      }

      // Pick video
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];

        // Prompt for video name
        Alert.prompt(
          'Video Name',
          'Enter a name for this video',
          async (name) => {
            if (name && name.trim()) {
              await uploadVideo(asset.uri, name.trim());
            }
          },
          'plain-text',
          '',
          'default'
        );
      }
    } catch (error) {
      console.error('Error picking video:', error);
      Alert.alert('Error', 'Failed to pick video');
    }
  };

  const uploadVideo = async (uri: string, name: string) => {
    try {
      setUploading(true);
      await uploadVideo(uri, name, []);
      Alert.alert('Success', 'Video uploaded successfully');
      await loadVideos();
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Error', 'Failed to upload video');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteVideo = async (id: string) => {
    Alert.alert(
      'Delete Video',
      'Are you sure you want to delete this video?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteVideo(id);
              Alert.alert('Success', 'Video deleted');
              await loadVideos();
            } catch (error) {
              console.error('Delete error:', error);
              Alert.alert('Error', 'Failed to delete video');
            }
          },
        },
      ]
    );
  };

  const getAllTags = () => {
    const tags = new Set<string>();
    videos.forEach(video => {
      video.tags?.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  };

  const renderVideoItem = ({ item }: { item: VideoResponse }) => (
    <TouchableOpacity style={styles.videoCard}>
      <View style={styles.videoContent}>
        <MaterialIcons name="movie" size={40} color="#007AFF" />
        <View style={styles.videoInfo}>
          <Text style={styles.videoName} numberOfLines={2}>
            {item.name}
          </Text>
          {item.tags && item.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {item.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          )}
          <Text style={styles.videoDate}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
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

  const renderTagFilter = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={[
        styles.filterTag,
        selectedTag === item && styles.filterTagSelected,
      ]}
      onPress={() => setSelectedTag(selectedTag === item ? null : item)}
    >
      <Text
        style={[
          styles.filterTagText,
          selectedTag === item && styles.filterTagTextSelected,
        ]}
      >
        {item}
      </Text>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  const allTags = getAllTags();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Practice Library</Text>
        <TouchableOpacity
          onPress={handlePickVideo}
          style={styles.uploadButton}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator size="small" color="#007AFF" />
          ) : (
            <MaterialIcons name="add-circle" size={32} color="#007AFF" />
          )}
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
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

      {/* Tag Filters */}
      {allTags.length > 0 && (
        <View style={styles.tagsFilterContainer}>
          <FlatList
            horizontal
            data={allTags}
            renderItem={renderTagFilter}
            keyExtractor={(item) => item}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tagsFilterList}
          />
        </View>
      )}

      {/* Videos List */}
      <FlatList
        data={videos}
        renderItem={renderVideoItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="video-library" size={64} color="#C7C7CC" />
            <Text style={styles.emptyText}>No videos yet</Text>
            <Text style={styles.emptySubtext}>
              Tap the + button to upload your first video
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
  },
  uploadButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    margin: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#000000',
  },
  tagsFilterContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  tagsFilterList: {
    paddingHorizontal: 16,
  },
  filterTag: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
    marginRight: 8,
  },
  filterTagSelected: {
    backgroundColor: '#007AFF',
  },
  filterTagText: {
    fontSize: 14,
    color: '#000000',
  },
  filterTagTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
  },
  videoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  videoContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  videoInfo: {
    flex: 1,
    marginLeft: 12,
  },
  videoName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
    marginBottom: 4,
  },
  tag: {
    backgroundColor: '#E5E5EA',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 4,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#3C3C43',
  },
  videoDate: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
  },
  deleteButton: {
    padding: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#8E8E93',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#C7C7CC',
    marginTop: 8,
    textAlign: 'center',
  },
});