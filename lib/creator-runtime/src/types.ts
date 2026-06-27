export type DocumentType =
  | "world"
  | "npc"
  | "quest"
  | "boss"
  | "dungeon"
  | "item"
  | "skill"
  | "pet"
  | "company"
  | "education"
  | "sports"
  | "land"
  | "nation";

export interface RuntimeDocument {
  id: string;
  type: DocumentType;
  name: string;
  version: number;
  content: Record<string, unknown>;
}

export interface RuntimePackage {
  name: string;
  version: string;
  documents: RuntimeDocument[];
  manifest: Record<string, unknown>;
}

export interface RuntimeModule {
  id: string;
  name: string;
  load(): Promise<void>;
  unload(): Promise<void>;
}

export interface PublishPayload {
  projectId: number;
  packageName: string;
  version: string;
  documents: RuntimeDocument[];
}

export interface PublishResult {
  jobId: number;
  status: "pending" | "processing" | "success" | "failed";
  downloadUrl?: string;
}
