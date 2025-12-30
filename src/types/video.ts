export interface VideoResponse {
  id: string;
  name: string;
  videoUrl: string;
  fileName?: string;
  fileSize?: number;
  contentType?: string;
  tags?: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface VideoCreateRequest {
  name: string;
  videoUrl: string;
  tags?: string[];
}