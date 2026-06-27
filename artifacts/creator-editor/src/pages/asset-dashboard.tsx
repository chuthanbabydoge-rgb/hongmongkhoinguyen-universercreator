import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  Image as ImageIcon, Music, Video, Box, FileText, Layers, Cpu, Upload,
  RefreshCw, CheckCircle, XCircle, Clock, HardDrive, Zap, TrendingUp
} from "lucide-react";
import { format } from "date-fns";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");

interface PipelineAsset { id: number; name: string; type: string; status: string; size: number | null; createdAt: string; }
interface ProcessingJob { id: number; assetId: number; step: string; status: string; createdAt: string; }

function useRecentUploads() {
  return useQuery<{ items: PipelineAsset[]; total: number }>({
    queryKey: ["/api/pipeline", { sort: "newest", limit: 6 }],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/pipeline?limit=6&sort=newest`, { headers: { Authorization: `Bearer ${token()}` } });
      if (!res.ok) return { items: [], total: 0 };
      return res.json();
    },
  });
}

function useAllAssets() {
  return useQuery<{ items: PipelineAsset[]; total: number }>({
    queryKey: ["/api/pipeline", { limit: 100 }],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/pipeline?limit=100`, { headers: { Authorization: `Bearer ${token()}` } });
      if (!res.ok) return { items: [], total: 0 };
      return res.json();
    },
  });
}

function useProcessingJobs() {
  return useQuery<{ items: ProcessingJob[] }>({
    queryKey: ["/api/pipeline/jobs"],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/pipeline/jobs?limit=8`, { headers: { Authorization: `Bearer ${token()}` } });
      if (!res.ok) return { items: [] };
      return res.json();
    },
    refetchInterval: 5000,
  });
}

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

function formatBytes(bytes: number | null) {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

export default function AssetDashboard() {
  const { data: recentUploads, isLoading: loadingRecent } = useRecentUploads();
  const { data: allAssets } = useAllAssets();
  const { data: jobsData, isLoading: loadingJobs } = useProcessingJobs();

  const assets = allAssets?.items ?? [];
  const total = allAssets?.total ?? 0;

  const typeCounts = assets.reduce<Record<string, number>>((acc, a) => {
    acc[a.type] = (acc[a.type] ?? 0) + 1;
    return acc;
  }, {});

  const totalSize = assets.reduce((s, a) => s + (a.size ?? 0), 0);
  const readyCount = assets.filter(a => a.status === "ready").length;
  const processingCount = assets.filter(a => a.status === "processing" || a.status === "pending").length;

  const stats = [
    { label: "Total Assets", value: total, icon: HardDrive, color: "text-primary" },
    { label: "Ready", value: readyCount, icon: CheckCircle, color: "text-green-400" },
    { label: "Processing", value: processingCount, icon: RefreshCw, color: "text-yellow-400" },
    { label: "Storage", value: formatBytes(totalSize), icon: HardDrive, color: "text-chart-3", noFormat: true },
  ];

  const allTypes = ["image","audio","video","model","texture","icon","document","font","script","material","animation","prefab"];
  const maxCount = Math.max(...allTypes.map(t => typeCounts[t] ?? 0), 1);

  return (
    <div className="space-y-8 pb-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Asset Pipeline</h1>
          <p className="text-muted-foreground mt-1">Manage all your creative assets in one place</p>
        </div>
        <Link href="/upload-center">
          <Button className="gap-2">
            <Upload className="w-4 h-4" /> Upload Assets
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="bg-card/50 backdrop-blur border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-mono tracking-tighter">
                {stat.noFormat ? stat.value : stat.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-card/50 backdrop-blur border-border/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-primary" />
                <CardTitle>Recent Uploads</CardTitle>
              </div>
              <Link href="/asset-browser">
                <Button variant="ghost" size="sm" className="h-6 text-xs text-muted-foreground">All →</Button>
              </Link>
            </div>
            <CardDescription>Latest assets added to your pipeline</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingRecent ? (
              <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-14 w-full" />)}</div>
            ) : !recentUploads?.items?.length ? (
              <Link href="/upload-center">
                <div className="text-center py-10 text-muted-foreground border border-dashed border-border rounded-lg cursor-pointer hover:bg-secondary/10 transition-colors">
                  No assets yet. Upload your first asset →
                </div>
              </Link>
            ) : (
              <div className="space-y-2">
                {recentUploads.items.map((asset) => {
                  const Icon = TYPE_ICONS[asset.type] ?? FileText;
                  const StatusIcon = STATUS_ICON[asset.status] ?? Clock;
                  return (
                    <Link key={asset.id} href={`/asset-detail/${asset.id}`}>
                      <div className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-background/30 hover:bg-secondary/20 transition-colors cursor-pointer">
                        <div className={`w-9 h-9 rounded-lg bg-secondary/50 flex items-center justify-center shrink-0`}>
                          <Icon className={`w-4 h-4 ${TYPE_COLORS[asset.type] ?? "text-muted-foreground"}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{asset.name}</div>
                          <div className="text-xs text-muted-foreground font-mono">
                            {asset.type} · {formatBytes(asset.size)} · {format(new Date(asset.createdAt), "MMM d, HH:mm")}
                          </div>
                        </div>
                        <StatusIcon className={`w-4 h-4 shrink-0 ${STATUS_COLOR[asset.status] ?? "text-muted-foreground"} ${asset.status === "processing" ? "animate-spin" : ""}`} />
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-yellow-400" />
                  <CardTitle className="text-sm">Processing Queue</CardTitle>
                  {processingCount > 0 && (
                    <Badge className="h-5 px-1.5 text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                      {processingCount}
                    </Badge>
                  )}
                </div>
                <Link href="/processing-queue">
                  <Button variant="ghost" size="sm" className="h-6 text-xs text-muted-foreground">All →</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {loadingJobs ? (
                <div className="space-y-2">{[1,2].map(i => <Skeleton key={i} className="h-10 w-full" />)}</div>
              ) : !jobsData?.items?.length ? (
                <div className="text-center py-4 text-xs text-muted-foreground">No active jobs</div>
              ) : (
                <div className="space-y-2">
                  {jobsData.items.slice(0, 5).map((job) => {
                    const StatusIcon = STATUS_ICON[job.status] ?? Clock;
                    return (
                      <div key={job.id} className="flex items-center gap-2 p-2 rounded-lg bg-background/30">
                        <StatusIcon className={`w-3.5 h-3.5 shrink-0 ${STATUS_COLOR[job.status] ?? "text-muted-foreground"} ${job.status === "processing" ? "animate-spin" : ""}`} />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium capitalize">{job.step.replace(/_/g, " ")}</div>
                          <div className="text-xs text-muted-foreground">Asset #{job.assetId}</div>
                        </div>
                        <Badge variant="outline" className="text-xs capitalize">{job.status}</Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-chart-2" />
                <CardTitle className="text-sm">By Type</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {allTypes.filter(t => (typeCounts[t] ?? 0) > 0).slice(0, 6).map((type) => {
                  const Icon = TYPE_ICONS[type] ?? FileText;
                  const count = typeCounts[type] ?? 0;
                  return (
                    <div key={type} className="flex items-center gap-2">
                      <Icon className={`w-3.5 h-3.5 shrink-0 ${TYPE_COLORS[type] ?? "text-muted-foreground"}`} />
                      <span className="text-xs capitalize w-20 shrink-0">{type}</span>
                      <Progress value={(count / maxCount) * 100} className="flex-1 h-1.5" />
                      <span className="text-xs font-mono text-muted-foreground w-6 text-right">{count}</span>
                    </div>
                  );
                })}
                {total === 0 && <div className="text-xs text-muted-foreground text-center py-2">No assets yet</div>}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
