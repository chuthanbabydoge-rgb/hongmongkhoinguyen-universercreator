import type {
  CreateProjectOptions,
  PublishOptions,
  SDKConfig,
  SDKProject,
  SDKPublishJob,
  UploadAssetOptions,
} from "./types";

export class CreatorClient {
  private config: SDKConfig;

  constructor(config: SDKConfig) {
    this.config = config;
  }

  private get headers(): Record<string, string> {
    const h: Record<string, string> = { "Content-Type": "application/json" };
    if (this.config.token) {
      h["Authorization"] = `Bearer ${this.config.token}`;
    }
    return h;
  }

  private async request<T>(
    path: string,
    options: RequestInit = {},
  ): Promise<T> {
    const res = await fetch(`${this.config.apiBaseUrl}${path}`, {
      ...options,
      headers: { ...this.headers, ...(options.headers ?? {}) },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error((err as { error: string }).error ?? res.statusText);
    }
    if (res.status === 204) return undefined as T;
    return res.json() as Promise<T>;
  }

  async createProject(options: CreateProjectOptions): Promise<SDKProject> {
    return this.request<SDKProject>("/projects", {
      method: "POST",
      body: JSON.stringify(options),
    });
  }

  async listProjects(): Promise<SDKProject[]> {
    const result = await this.request<{ items: SDKProject[] }>("/projects");
    return result.items;
  }

  async getProject(id: number): Promise<SDKProject> {
    return this.request<SDKProject>(`/projects/${id}`);
  }

  async deleteProject(id: number): Promise<void> {
    return this.request<void>(`/projects/${id}`, { method: "DELETE" });
  }

  async publish(options: PublishOptions): Promise<SDKPublishJob> {
    const result = await this.request<{ id: number; status: string }>("/publish", {
      method: "POST",
      body: JSON.stringify(options),
    });
    return { jobId: result.id, status: result.status as SDKPublishJob["status"] };
  }

  async getPublishJob(jobId: number): Promise<SDKPublishJob> {
    const result = await this.request<{ id: number; status: string; errorMessage?: string }>(
      `/publish/${jobId}`,
    );
    return {
      jobId: result.id,
      status: result.status as SDKPublishJob["status"],
      errorMessage: result.errorMessage,
    };
  }

  async loadTemplate(templateId: number): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>(`/templates/${templateId}`);
  }

  async uploadAsset(options: UploadAssetOptions): Promise<{ id: number; url: string }> {
    return this.request<{ id: number; url: string }>("/assets", {
      method: "POST",
      body: JSON.stringify(options),
    });
  }

  async downloadPackage(packageId: number): Promise<{ downloadUrl: string }> {
    return this.request<{ downloadUrl: string }>(`/packages/${packageId}`);
  }

  setToken(token: string): void {
    this.config.token = token;
  }
}

export function createCreatorClient(config: SDKConfig): CreatorClient {
  return new CreatorClient(config);
}
