export interface SDKConfig {
  apiBaseUrl: string;
  token?: string;
}

export interface CreateProjectOptions {
  name: string;
  description?: string;
  tags?: string[];
  templateId?: number;
}

export interface PublishOptions {
  projectId: number;
  payload?: Record<string, unknown>;
}

export interface UploadAssetOptions {
  name: string;
  filename: string;
  url: string;
  type: "image" | "audio" | "video" | "model" | "document" | "other";
  projectId?: number;
  size?: number;
  mimeType?: string;
}

export interface SDKProject {
  id: number;
  name: string;
  slug: string;
  status: "draft" | "published" | "archived";
  createdAt: string;
}

export interface SDKPublishJob {
  jobId: number;
  status: "pending" | "processing" | "success" | "failed";
  errorMessage?: string;
}
