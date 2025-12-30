import * as SecureStore from 'expo-secure-store';
import type { VideoResponse, VideoCreateRequest } from '../types/video';

const API_BASE_URL = 'http://localhost:8080/api';

/**
 * Private helper to retrieve the JWT and build headers.
 * We use SecureStore for consistency with your AuthService.
 */
const getAuthHeaders = async (isMultipart = false): Promise<HeadersInit> => {
  const token = await SecureStore.getItemAsync('access_token');
  const headers: Record<string, string> = {
    'Authorization': `Bearer ${token}`,
  };

  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }

  return headers;
};

export const getAllVideos = async (search?: string, tag?: string): Promise<VideoResponse[]> => {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (tag) params.append('tag', tag);

  const query = params.toString();
  const url = `${API_BASE_URL}/videos${query ? `?${query}` : ''}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: await getAuthHeaders(),
  });

  if (!response.ok) throw new Error(`Failed to fetch videos: ${response.status}`);
  return response.json();
};

export const getVideoById = async (id: string): Promise<VideoResponse> => {
  const response = await fetch(`${API_BASE_URL}/videos/${id}`, {
    method: 'GET',
    headers: await getAuthHeaders(),
  });

  if (!response.ok) throw new Error(`Failed to fetch video: ${response.status}`);
  return response.json();
};

export const uploadVideo = async (
  fileUri: string,
  name: string,
  tags: string[]
): Promise<VideoResponse> => {
  const formData = new FormData();
  const filename = fileUri.split('/').pop() || 'video.mp4';

  const file = {
    uri: fileUri,
    name: filename,
    type: 'video/mp4',
  } as any;

  formData.append('file', file);
  formData.append('name', name);
  tags.forEach(tag => formData.append('tags', tag));

  const response = await fetch(`${API_BASE_URL}/videos/upload`, {
    method: 'POST',
    headers: await getAuthHeaders(true), // true for multipart
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to upload video: ${error}`);
  }

  return response.json();
};

export const createVideoWithUrl = async (data: VideoCreateRequest): Promise<VideoResponse> => {
  const response = await fetch(`${API_BASE_URL}/videos/url`, {
    method: 'POST',
    headers: await getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) throw new Error(`Failed to create video: ${response.status}`);
  return response.json();
};

export const deleteVideo = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/videos/${id}`, {
    method: 'DELETE',
    headers: await getAuthHeaders(),
  });

  if (!response.ok) throw new Error(`Failed to delete video: ${response.status}`);
};

export const getStreamUrl = (filename: string): string => {
  return `${API_BASE_URL}/videos/stream/${filename}`;
};
