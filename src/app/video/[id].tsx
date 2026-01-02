import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import { MaterialIcons } from '@expo/vector-icons';
import { getVideoById } from '@/services/videoService';
import { VideoResponse } from '@/types/video';

export default function VideoDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [video, setVideo] = useState<VideoResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize player with a null check to avoid errors before data loads
  const player = useVideoPlayer(video?.videoUrl || '', (player) => {
    if (video?.videoUrl) {
      player.loop = true;
      player.play();
    }
  });

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        setLoading(true);
        const data = await getVideoById(id);
        setVideo(data);
      } catch (error) {
        Alert.alert('Error', 'Could not load video details');
      } finally {
        setLoading(false);
      }
    };
    fetchVideo();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!video) return null;

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen options={{ title: video.name }} />

      <View style={styles.videoWrapper}>
        <VideoView player={player} style={styles.videoPlayer} allowsFullscreen />
      </View>

      <View style={styles.detailsContainer}>
        <View style={styles.infoCard}>
          <Text style={styles.title}>{video.name}</Text>
          <View style={styles.tagsWrapper}>
            {video.tags?.map((tag, i) => (
              <View key={i} style={styles.tag}><Text style={styles.tagText}>{tag}</Text></View>
            ))}
          </View>
        </View>

        <Text style={styles.sectionTitle}>FILE DETAILS</Text>
        <View style={styles.metadataCard}>
          <DetailRow label="Size" value={`${((video.fileSize || 0) / 1024 / 1024).toFixed(2)} MB`} icon="storage" />
          <DetailRow label="Created" value={new Date(video.createdAt).toLocaleDateString()} icon="event" />
          <DetailRow label="Type" value={video.contentType} icon="code" />
        </View>
      </View>
    </ScrollView>
  );
}

const DetailRow = ({ label, value, icon }: { label: string, value?: string, icon: any }) => (
  <View style={styles.detailRow}>
    <View style={styles.labelGroup}>
      <MaterialIcons name={icon} size={20} color="#007AFF" />
      <Text style={styles.detailLabel}>{label}</Text>
    </View>
    <Text style={styles.detailValue}>{value || 'N/A'}</Text>
  </View>
);

// Reuse your previously defined styles here...
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  videoWrapper: { width: '100%', height: 240, backgroundColor: '#000' },
  videoPlayer: { flex: 1 },
  detailsContainer: { padding: 16 },
  infoCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  tagsWrapper: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: { backgroundColor: '#E5E5EA', padding: 6, borderRadius: 6 },
  tagText: { fontSize: 12, color: '#007AFF' },
  sectionTitle: { fontSize: 13, color: '#8E8E93', marginBottom: 8, marginLeft: 4 },
  metadataCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 16 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: '#E5E5EA' },
  labelGroup: { flexDirection: 'row', alignItems: 'center' },
  detailLabel: { marginLeft: 10, fontSize: 15 },
  detailValue: { color: '#8E8E93', fontSize: 15 },
});
