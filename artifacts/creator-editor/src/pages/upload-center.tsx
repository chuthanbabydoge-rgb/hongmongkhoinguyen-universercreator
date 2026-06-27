import { useState, useRef, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Upload, X, CheckCircle, XCircle, RefreshCw, FileText, Image as ImageIcon,
  Music, Video, Box, Layers, Cpu, Zap, Plus, FolderOpen,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");

const ASSET_TYPES = ["image","audio","video","model","texture","icon","document","font","script","material","animation","prefab"] as const;
type AssetType = typeof ASSET_TYPES[number];

interface UploadItem {
  id: string;
  file: File;
  name: string;
  type: AssetType;
  status: "pending" | "uploading" | "done" | "error";
  progress: number;
  error?: string;
  assetId?: number;
}

const TYPE_ICONS: Record<string, React.ElementType> = {
  image: ImageIcon, audio: Music, video: Video, model: Box, document: FileText,
  texture: Layers, icon: ImageIcon, font: FileText, script: Cpu, material: Layers,
  animation: Zap, prefab: Box,
};

function guessType(file: File): AssetType {
  const mime = file.type;
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("audio/")) return "audio";
  if (mime.startsWith("video/")) return "video";
  if (mime.startsWith("font/") || file.name.match(/\.(ttf|otf|woff2?)$/i)) return "font";
  if (file.name.match(/\.(glb|gltf|fbx|obj|dae|blend)$/i)) return "model";
  if (file.name.match(/\.(js|ts|lua|py|sh)$/i)) return "script";
  return "document";
}

interface AssetFolder { id: number; name: string; }

function useFolders() {
  return useQuery<{ items: AssetFolder[] }>({
    queryKey: ["/api/pipeline/folders"],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/pipeline/folders`, { headers: { Authorization: `Bearer ${token()}` } });
      if (!res.ok) return { items: [] };
      return res.json();
    },
  });
}

export default function UploadCenter() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const { data: foldersData } = useFolders();
  const [queue, setQueue] = useState<UploadItem[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [globalFolder, setGlobalFolder] = useState<string>("none");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((files: FileList | File[]) => {
    const items: UploadItem[] = Array.from(files).map((f) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      file: f,
      name: f.name.replace(/\.[^.]+$/, ""),
      type: guessType(f),
      status: "pending",
      progress: 0,
    }));
    setQueue(q => [...q, ...items]);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    addFiles(e.dataTransfer.files);
  }, [addFiles]);

  const updateItem = (id: string, updates: Partial<UploadItem>) => {
    setQueue(q => q.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  const uploadMutation = useMutation({
    mutationFn: async (item: UploadItem) => {
      updateItem(item.id, { status: "uploading", progress: 10 });

      const ext = item.file.name.split(".").pop() ?? "";
      const body = {
        name: item.name,
        filename: item.file.name,
        type: item.type,
        mimeType: item.file.type,
        extension: ext,
        size: item.file.size,
        folderId: globalFolder !== "none" ? Number(globalFolder) : undefined,
      };

      updateItem(item.id, { progress: 50 });

      const res = await fetch(`${BASE}/api/pipeline`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message ?? "Upload failed");
      }

      const asset = await res.json();
      updateItem(item.id, { status: "done", progress: 100, assetId: asset.id });
      return asset;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/pipeline"] });
    },
    onError: (err: Error, item: UploadItem) => {
      updateItem(item.id, { status: "error", error: err.message });
    },
  });

  const uploadAll = () => {
    const pending = queue.filter(i => i.status === "pending");
    pending.forEach(item => uploadMutation.mutate(item));
  };

  const retryItem = (item: UploadItem) => {
    updateItem(item.id, { status: "pending", progress: 0, error: undefined });
    uploadMutation.mutate({ ...item, status: "pending", progress: 0 });
  };

  const removeItem = (id: string) => {
    setQueue(q => q.filter(i => i.id !== id));
  };

  const pendingCount = queue.filter(i => i.status === "pending").length;
  const doneCount = queue.filter(i => i.status === "done").length;
  const errorCount = queue.filter(i => i.status === "error").length;

  return (
    <div className="space-y-6 pb-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Upload Center</h1>
          <p className="text-muted-foreground mt-1">Drag and drop or select files to upload</p>
        </div>
        {doneCount > 0 && (
          <Link href="/asset-browser">
            <Button variant="outline" size="sm">View Uploaded Assets →</Button>
          </Link>
        )}
      </div>

      <div
        onDrop={onDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${
          dragOver
            ? "border-primary bg-primary/5 scale-[1.01]"
            : "border-border hover:border-primary/50 hover:bg-secondary/10"
        }`}
      >
        <Upload className={`w-12 h-12 mx-auto mb-4 transition-colors ${dragOver ? "text-primary" : "text-muted-foreground/40"}`} />
        <p className="text-lg font-medium mb-1">Drop files here</p>
        <p className="text-sm text-muted-foreground mb-6">
          Supports images, audio, video, 3D models, fonts, scripts, and more
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button onClick={() => fileInputRef.current?.click()} className="gap-2">
            <Plus className="w-4 h-4" />Select Files
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => e.target.files && addFiles(e.target.files)}
          />
        </div>
      </div>

      {queue.length > 0 && (
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                Upload Queue — {queue.length} files
                {doneCount > 0 && <span className="ml-2 text-green-400 text-sm">({doneCount} done)</span>}
                {errorCount > 0 && <span className="ml-2 text-red-400 text-sm">({errorCount} failed)</span>}
              </CardTitle>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <FolderOpen className="w-4 h-4 text-muted-foreground" />
                  <Select value={globalFolder} onValueChange={setGlobalFolder}>
                    <SelectTrigger className="w-40 h-8 text-xs bg-background/50">
                      <SelectValue placeholder="No folder" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No folder</SelectItem>
                      {(foldersData?.items ?? []).map(f => (
                        <SelectItem key={f.id} value={String(f.id)}>{f.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {pendingCount > 0 && (
                  <Button onClick={uploadAll} disabled={uploadMutation.isPending} className="gap-2 h-8" size="sm">
                    <Upload className="w-3.5 h-3.5" />Upload All ({pendingCount})
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {queue.map((item) => {
                const Icon = TYPE_ICONS[item.type] ?? FileText;
                return (
                  <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg bg-background/30 border border-border/30">
                    <div className="w-9 h-9 rounded-lg bg-secondary/50 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-muted-foreground" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <Input
                          value={item.name}
                          onChange={(e) => updateItem(item.id, { name: e.target.value })}
                          className="h-6 text-sm py-0 border-0 bg-transparent p-0 font-medium focus-visible:ring-0 focus-visible:ring-offset-0"
                          disabled={item.status !== "pending"}
                        />
                        <Select
                          value={item.type}
                          onValueChange={(v) => updateItem(item.id, { type: v as AssetType })}
                          disabled={item.status !== "pending"}
                        >
                          <SelectTrigger className="h-6 w-28 text-xs border-0 bg-secondary/30 py-0 px-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ASSET_TYPES.map(t => <SelectItem key={t} value={t} className="text-xs capitalize">{t}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {item.file.name} · {(item.file.size / 1024).toFixed(1)} KB
                      </div>
                      {item.status === "uploading" && (
                        <Progress value={item.progress} className="h-1 mt-1.5" />
                      )}
                      {item.error && <p className="text-xs text-destructive mt-0.5">{item.error}</p>}
                    </div>

                    <div className="flex items-center gap-2">
                      {item.status === "pending" && (
                        <Button size="sm" variant="secondary" className="h-7 text-xs" onClick={() => uploadMutation.mutate(item)}>
                          Upload
                        </Button>
                      )}
                      {item.status === "uploading" && (
                        <RefreshCw className="w-4 h-4 text-yellow-400 animate-spin" />
                      )}
                      {item.status === "done" && (
                        <Badge className="gap-1 bg-green-500/20 text-green-400 border-green-500/30">
                          <CheckCircle className="w-3 h-3" /> Done
                        </Badge>
                      )}
                      {item.status === "error" && (
                        <Button size="sm" variant="destructive" className="h-7 text-xs" onClick={() => retryItem(item)}>
                          <RefreshCw className="w-3 h-3 mr-1" />Retry
                        </Button>
                      )}
                      <Button
                        variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => removeItem(item.id)}
                        disabled={item.status === "uploading"}
                      >
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
