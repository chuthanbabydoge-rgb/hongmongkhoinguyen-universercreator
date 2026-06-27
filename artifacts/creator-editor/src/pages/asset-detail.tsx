import { useState } from "react";
import { useParams, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft, Image as ImageIcon, Music, Video, Box, FileText, Layers, Cpu,
  CheckCircle, XCircle, Clock, RefreshCw, Upload, GitBranch, Link2,
  Activity, Zap, HardDrive, Copy, FolderInput, Trash2,
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");

interface PipelineAsset {
  id: number; name: string; type: string; status: string; size: number | null;
  filename: string; mimeType: string | null; extension: string | null;
  description: string | null; thumbnail: string | null; preview: string | null;
  checksum: string | null; width: number | null; height: number | null;
  duration: number | null; polygonCount: number | null; tags: string[];
  metadata: Record<string, unknown>; createdAt: string; updatedAt: string;
  processingJobs: ProcessingJob[]; thumbnails: Thumbnail[]; versions: Version[];
  dependencies: Dependency[];
}

interface ProcessingJob { id: number; step: string; status: string; log: string | null; createdAt: string; completedAt: string | null; }
interface Thumbnail { id: number; thumbnailType: string; url: string; width: number | null; height: number | null; }
interface Version { id: number; version: number; filename: string; size: number | null; note: string | null; createdAt: string; }
interface Dependency { id: number; assetId: number; dependsOnId: number; label: string | null; }
interface UsageItem { id: number; entityType: string; entityId: number; entityName: string | null; usedAt: string; }

const TYPE_ICONS: Record<string, React.ElementType> = {
  image: ImageIcon, audio: Music, video: Video, model: Box, document: FileText,
  texture: Layers, icon: ImageIcon, font: FileText, script: Cpu, material: Layers,
  animation: Zap, prefab: Box,
};
const TYPE_COLORS: Record<string, string> = {
  image: "text-chart-1", audio: "text-chart-2", video: "text-chart-3",
  model: "text-chart-4", texture: "text-chart-5", icon: "text-primary",
  font: "text-muted-foreground", script: "text-yellow-400", material: "text-chart-1",
  animation: "text-chart-2", prefab: "text-chart-3", document: "text-chart-4",
};
const STATUS_ICON: Record<string, React.ElementType> = {
  ready: CheckCircle, failed: XCircle, processing: RefreshCw, pending: Clock, uploading: Upload,
};
const STATUS_COLOR: Record<string, string> = {
  ready: "text-green-400", failed: "text-red-400", processing: "text-yellow-400",
  pending: "text-muted-foreground", uploading: "text-blue-400",
};
const STEP_LABELS: Record<string, string> = {
  virus_scan: "Virus Scan", checksum: "Checksum", metadata_extract: "Metadata Extract",
  thumbnail: "Thumbnail", optimize: "Optimize", compress: "Compress",
};

function formatBytes(bytes: number | null) {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function useAsset(id: number) {
  return useQuery<PipelineAsset>({
    queryKey: ["/api/pipeline", id],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/pipeline/${id}`, { headers: { Authorization: `Bearer ${token()}` } });
      if (!res.ok) throw new Error("Asset not found");
      return res.json();
    },
  });
}

function useUsage(id: number) {
  return useQuery<{ items: UsageItem[] }>({
    queryKey: ["/api/pipeline", id, "usage"],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/pipeline/${id}/usage`, { headers: { Authorization: `Bearer ${token()}` } });
      if (!res.ok) return { items: [] };
      return res.json();
    },
  });
}

export default function AssetDetail() {
  const { id } = useParams<{ id: string }>();
  const assetId = Number(id);
  const { toast } = useToast();
  const qc = useQueryClient();
  const [tab, setTab] = useState("overview");

  const { data: asset, isLoading } = useAsset(assetId);
  const { data: usageData } = useUsage(assetId);

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${BASE}/api/pipeline/${assetId}`, {
        method: "DELETE", headers: { Authorization: `Bearer ${token()}` },
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.message ?? "Failed"); }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/pipeline"] });
      toast({ title: "Asset deleted" });
      window.history.back();
    },
    onError: (err: Error) => toast({ title: "Cannot delete", description: err.message, variant: "destructive" }),
  });

  const restoreMutation = useMutation({
    mutationFn: async (versionId: number) => {
      const res = await fetch(`${BASE}/api/pipeline/${assetId}/restore`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
        body: JSON.stringify({ versionId }),
      });
      if (!res.ok) throw new Error("Restore failed");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/pipeline", assetId] });
      toast({ title: "Asset restored to selected version" });
    },
    onError: (err: Error) => toast({ title: "Restore failed", description: err.message, variant: "destructive" }),
  });

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="aspect-square rounded-xl" />
          <div className="lg:col-span-2 space-y-4">
            {[1,2,3].map(i => <Skeleton key={i} className="h-20 w-full" />)}
          </div>
        </div>
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="max-w-5xl mx-auto text-center py-16">
        <p className="text-muted-foreground">Asset not found</p>
        <Link href="/asset-browser"><Button className="mt-4" variant="outline">← Back to Browser</Button></Link>
      </div>
    );
  }

  const Icon = TYPE_ICONS[asset.type] ?? FileText;
  const StatusIcon = STATUS_ICON[asset.status] ?? Clock;
  const processingProgress = asset.processingJobs.length
    ? Math.round((asset.processingJobs.filter(j => j.status === "ready").length / asset.processingJobs.length) * 100)
    : 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-8">
      <div className="flex items-center gap-3">
        <Link href="/asset-browser">
          <Button variant="ghost" size="icon"><ArrowLeft className="w-4 h-4" /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{asset.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className="capitalize">{asset.type}</Badge>
            <div className={`flex items-center gap-1 text-xs ${STATUS_COLOR[asset.status]}`}>
              <StatusIcon className={`w-3.5 h-3.5 ${asset.status === "processing" ? "animate-spin" : ""}`} />
              <span className="capitalize">{asset.status}</span>
            </div>
          </div>
        </div>
        <div className="ml-auto flex gap-2">
          <Button variant="outline" size="sm" onClick={() => toast({ title: "Copy asset", description: "Feature ready via API" })}>
            <Copy className="w-4 h-4 mr-2" />Copy
          </Button>
          <Button variant="outline" size="sm" onClick={() => toast({ title: "Move asset", description: "Feature ready via API" })}>
            <FolderInput className="w-4 h-4 mr-2" />Move
          </Button>
          <Button variant="destructive" size="sm" onClick={() => deleteMutation.mutate()} disabled={deleteMutation.isPending}>
            <Trash2 className="w-4 h-4 mr-2" />Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-4">
          <Card className="bg-card/50 border-border/50 overflow-hidden">
            <div className="aspect-square bg-secondary/20 flex items-center justify-center">
              {asset.thumbnail ? (
                <img src={asset.thumbnail} alt={asset.name} className="w-full h-full object-contain" />
              ) : (
                <Icon className={`w-20 h-20 ${TYPE_COLORS[asset.type] ?? "text-muted-foreground"} opacity-40`} />
              )}
            </div>
          </Card>

          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-4 space-y-3">
              {[
                { label: "Filename", value: asset.filename },
                { label: "Type", value: asset.type, className: "capitalize" },
                { label: "Extension", value: asset.extension ?? "—" },
                { label: "Size", value: formatBytes(asset.size) },
                { label: "MIME", value: asset.mimeType ?? "—" },
                ...(asset.width ? [{ label: "Dimensions", value: `${asset.width} × ${asset.height}` }] : []),
                ...(asset.duration ? [{ label: "Duration", value: `${asset.duration}s` }] : []),
                ...(asset.polygonCount ? [{ label: "Polygons", value: asset.polygonCount.toLocaleString() }] : []),
                ...(asset.checksum ? [{ label: "Checksum", value: asset.checksum.slice(0, 16) + "…" }] : []),
                { label: "Created", value: format(new Date(asset.createdAt), "MMM d, yyyy HH:mm") },
                { label: "Updated", value: format(new Date(asset.updatedAt), "MMM d, yyyy HH:mm") },
              ].map(({ label, value, className }) => (
                <div key={label} className="flex items-start justify-between gap-2">
                  <span className="text-xs text-muted-foreground shrink-0">{label}</span>
                  <span className={`text-xs font-mono text-right break-all ${className ?? ""}`}>{value}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="w-full grid grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
              <TabsTrigger value="versions">Versions</TabsTrigger>
              <TabsTrigger value="deps">Deps</TabsTrigger>
              <TabsTrigger value="usage">Usage</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 mt-4">
              {asset.description && (
                <Card className="bg-card/50 border-border/50">
                  <CardHeader className="pb-2"><CardTitle className="text-sm">Description</CardTitle></CardHeader>
                  <CardContent><p className="text-sm text-muted-foreground">{asset.description}</p></CardContent>
                </Card>
              )}
              {asset.tags.length > 0 && (
                <Card className="bg-card/50 border-border/50">
                  <CardHeader className="pb-2"><CardTitle className="text-sm">Tags</CardTitle></CardHeader>
                  <CardContent className="flex flex-wrap gap-2">
                    {asset.tags.map(t => <Badge key={t} variant="secondary">{t}</Badge>)}
                  </CardContent>
                </Card>
              )}
              {asset.thumbnails.length > 0 && (
                <Card className="bg-card/50 border-border/50">
                  <CardHeader className="pb-2"><CardTitle className="text-sm">Thumbnails</CardTitle></CardHeader>
                  <CardContent className="flex gap-4">
                    {asset.thumbnails.map(th => (
                      <div key={th.id} className="text-center">
                        <img src={th.url} alt={th.thumbnailType} className="w-16 h-16 rounded object-cover border border-border" />
                        <p className="text-xs text-muted-foreground mt-1 capitalize">{th.thumbnailType}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
              <Card className="bg-card/50 border-border/50">
                <CardHeader className="pb-2"><CardTitle className="text-sm">Raw Metadata</CardTitle></CardHeader>
                <CardContent>
                  <pre className="text-xs text-muted-foreground bg-secondary/20 p-3 rounded-lg overflow-auto max-h-32 font-mono">
                    {JSON.stringify(asset.metadata, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="pipeline" className="mt-4">
              <Card className="bg-card/50 border-border/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">Processing Pipeline</CardTitle>
                    <span className="text-xs text-muted-foreground">{processingProgress}% complete</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {asset.processingJobs.map((job) => {
                    const JobStatusIcon = STATUS_ICON[job.status] ?? Clock;
                    return (
                      <div key={job.id} className="flex items-start gap-3 p-3 rounded-lg bg-background/30">
                        <JobStatusIcon className={`w-4 h-4 mt-0.5 shrink-0 ${STATUS_COLOR[job.status] ?? "text-muted-foreground"} ${job.status === "processing" ? "animate-spin" : ""}`} />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium">{STEP_LABELS[job.step] ?? job.step}</div>
                          {job.log && <p className="text-xs text-muted-foreground mt-0.5 font-mono truncate">{job.log}</p>}
                          <div className="text-xs text-muted-foreground/60 mt-0.5">
                            {format(new Date(job.createdAt), "MMM d, HH:mm")}
                            {job.completedAt && ` → ${format(new Date(job.completedAt), "HH:mm")}`}
                          </div>
                        </div>
                        <Badge variant={job.status === "ready" ? "default" : job.status === "failed" ? "destructive" : "outline"} className="text-xs capitalize">
                          {job.status}
                        </Badge>
                      </div>
                    );
                  })}
                  {!asset.processingJobs.length && (
                    <div className="text-center py-6 text-xs text-muted-foreground">No processing jobs</div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="versions" className="mt-4">
              <Card className="bg-card/50 border-border/50">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <GitBranch className="w-4 h-4" />
                    <CardTitle className="text-sm">Version History</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {asset.versions.map((v) => (
                    <div key={v.id} className="flex items-center gap-3 p-3 rounded-lg bg-background/30">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-primary">v{v.version}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{v.filename}</div>
                        <div className="text-xs text-muted-foreground">
                          {formatBytes(v.size)} · {format(new Date(v.createdAt), "MMM d, yyyy")}
                        </div>
                        {v.note && <p className="text-xs text-muted-foreground/70 mt-0.5 italic">{v.note}</p>}
                      </div>
                      <Button variant="outline" size="sm" onClick={() => restoreMutation.mutate(v.id)} disabled={restoreMutation.isPending}>
                        Restore
                      </Button>
                    </div>
                  ))}
                  {!asset.versions.length && (
                    <div className="text-center py-6 text-xs text-muted-foreground">No versions yet. Versions are created on upload and update.</div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="deps" className="mt-4">
              <Card className="bg-card/50 border-border/50">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Link2 className="w-4 h-4" />
                    <CardTitle className="text-sm">Dependencies</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {asset.dependencies.map((dep) => (
                    <div key={dep.id} className="flex items-center gap-3 p-3 rounded-lg bg-background/30">
                      <HardDrive className="w-4 h-4 text-muted-foreground shrink-0" />
                      <div className="flex-1">
                        <div className="text-sm">
                          Asset #{dep.assetId} depends on Asset #{dep.dependsOnId}
                        </div>
                        {dep.label && <div className="text-xs text-muted-foreground">{dep.label}</div>}
                      </div>
                    </div>
                  ))}
                  {!asset.dependencies.length && (
                    <div className="text-center py-6 text-xs text-muted-foreground">No dependencies tracked</div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="usage" className="mt-4">
              <Card className="bg-card/50 border-border/50">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    <CardTitle className="text-sm">Usage Tracking</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {(usageData?.items ?? []).map((u) => (
                    <div key={u.id} className="flex items-center gap-3 p-3 rounded-lg bg-background/30">
                      <div className="w-8 h-8 rounded bg-secondary/50 flex items-center justify-center shrink-0">
                        <span className="text-xs capitalize">{u.entityType.slice(0, 2)}</span>
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{u.entityName ?? `${u.entityType} #${u.entityId}`}</div>
                        <div className="text-xs text-muted-foreground capitalize">
                          {u.entityType} · {format(new Date(u.usedAt), "MMM d, yyyy")}
                        </div>
                      </div>
                    </div>
                  ))}
                  {!usageData?.items?.length && (
                    <div className="text-center py-6 text-xs text-muted-foreground">
                      This asset is not currently in use. It can be safely deleted.
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
