import { DocumentLoader, ModuleLoader, PackageLoader } from "./loaders";
import type { PublishPayload, PublishResult, RuntimeDocument } from "./types";

export interface RuntimeEngineConfig {
  apiBaseUrl: string;
  authToken?: string;
}

export class RuntimeEngine {
  readonly documents: DocumentLoader;
  readonly packages: PackageLoader;
  readonly modules: ModuleLoader;

  private config: RuntimeEngineConfig;
  private initialized = false;

  constructor(config: RuntimeEngineConfig) {
    this.config = config;
    this.documents = new DocumentLoader();
    this.packages = new PackageLoader();
    this.modules = new ModuleLoader();
  }

  async init(): Promise<void> {
    if (this.initialized) return;
    await this.modules.loadAll();
    this.initialized = true;
  }

  async destroy(): Promise<void> {
    await this.modules.unloadAll();
    this.initialized = false;
  }

  async receivePublish(payload: PublishPayload): Promise<void> {
    for (const doc of payload.documents) {
      await this.documents.load(doc.id, {
        type: doc.type,
        name: doc.name,
        version: doc.version,
        content: doc.content,
      });
    }
  }

  getDocument(id: string): RuntimeDocument | undefined {
    return this.documents.getAll().find((d) => d.id === id);
  }

  private get headers(): Record<string, string> {
    const h: Record<string, string> = { "Content-Type": "application/json" };
    if (this.config.authToken) {
      h["Authorization"] = `Bearer ${this.config.authToken}`;
    }
    return h;
  }

  async fetchPublishStatus(jobId: number): Promise<PublishResult> {
    const res = await fetch(
      `${this.config.apiBaseUrl}/publish/${jobId}`,
      { headers: this.headers },
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = (await res.json()) as { id: number; status: string };
    return {
      jobId: data.id,
      status: data.status as PublishResult["status"],
    };
  }
}
