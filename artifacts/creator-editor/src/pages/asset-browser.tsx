import { useState } from "react";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Image as ImageIcon, Music, Video, Box, FileText, Layers, Cpu, Upload,
  Grid3X3, List, Search, SlidersHorizontal, MoreHorizontal, Copy, FolderInput,
  Trash2, RefreshCw, CheckCircle, XCircle, Clock, Zap, Plus,
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");

interface PipelineAsset {
  id: number; name: string; type: string; status: string; size: number | null;
  filename: string; mimeType: string | null; thumbnail: string | null;
  createdAt: string; updatedAt: string; tags: string[];
}

const TYPES = ["image","audio","video","model","texture","icon","document","font","script","material","animation","prefab"];
const STATUSES = ["pending","uploading","processing","ready","failed"];

const TYPE_ICONS: Record<string, React.ElementType> = {
  image: ImageIcon, audio: Music, video: Video, model: Box, document: FileText,
  texture: Layers, icon: ImageIcon, font: FileText, script: Cpu,
  material: Layers, animation: Zap, prefab: Box,
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
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function useAssets(params: { q?: string; type?: string; status?: string; sort?: string; limit?: number; offset?: number }) {
  const qs = new URLSearchParams();
  if (params.q) qs.set("q", params.q);
  if (params.type) qs.set("type", params.type);
  if (params.status) qs.set("status", params.status);
  if (params.sort) qs.set("sort", params.sort);
  qs.set("limit", String(params.limit ?? 24));
  qs.set("offset", String(params.offset ?? 0));

  const endpoint = params.q ? "search" : "";
  return useQuery<{ items: PipelineAsset[]; total: number }>({
    queryKey: ["/api/pipeline", params],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/pipeline${endpoint ? "/" + endpoint : ""}?${qs}`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (!res.ok) return { items: [], total: 0 };
      return res.json();
    },
  });
}

export default function AssetBrowser() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [view, setView] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(0);
  const limit = 24;

  const { data, isLoading } = useAssets({
    q: search || undefined,
    type: typeFilter !== "all" ? typeFilter : undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
    sort,
    limit,
    offset: page * limit,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`${BASE}/api/pipeline/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message ?? "Delete failed");
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/pipeline"] });
      toast({ title: "Asset deleted" });
    },
    onError: (err: Error) => toast({ title: "Cannot delete", description: err.message, variant: "destructive" }),
  });

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6 pb-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Asset Browser</h1>
          <p className="text-muted-foreground mt-1">{total.toLocaleString()} assets</p>
        </div>
        <Link href="/upload-center">
          <Button className="gap-2"><Plus className="w-4 h-4" />Upload</Button>
        </Link>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search assets..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            className="pl-9 bg-background/50"
          />
        </div>

        <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(0); }}>
          <SelectTrigger className="w-36 bg-background/50">
            <SlidersHorizontal className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {TYPES.map(t => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(0); }}>
          <SelectTrigger className="w-36 bg-background/50">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {STATUSES.map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="w-36 bg-background/50">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="oldest">Oldest</SelectItem>
            <SelectItem value="largest">Largest</SelectItem>
            <SelectItem value="smallest">Smallest</SelectItem>
            <SelectItem value="alpha">Alphabetical</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex gap-1 ml-auto">
          <Button variant={view === "grid" ? "secondary" : "ghost"} size="icon" className="h-9 w-9" onClick={() => setView("grid")}>
            <Grid3X3 className="w-4 h-4" />
          </Button>
          <Button variant={view === "list" ? "secondary" : "ghost"} size="icon" className="h-9 w-9" onClick={() => setView("list")}>
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className={view === "grid" ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4" : "space-y-2"}>
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className={view === "grid" ? "aspect-square rounded-xl" : "h-14 w-full rounded-lg"} />
          ))}
        </div>
      ) : !items.length ? (
        <div className="text-center py-16 text-muted-foreground border border-dashed border-border rounded-xl">
          <Upload className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No assets found</p>
          <p className="text-sm mt-1">Try adjusting your filters or upload new assets</p>
          <Link href="/upload-center">
            <Button className="mt-4" size="sm">Upload Assets</Button>
          </Link>
        </div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {items.map((asset) => {
            const Icon = TYPE_ICONS[asset.type] ?? FileText;
            const StatusIcon = STATUS_ICON[asset.status] ?? Clock;
            return (
              <div key={asset.id} className="group relative">
                <Link href={`/asset-detail/${asset.id}`}>
                  <Card className="bg-card/50 border-border/50 hover:border-primary/30 transition-all cursor-pointer overflow-hidden">
                    <div className="aspect-square bg-secondary/20 flex items-center justify-center relative">
                      {asset.thumbnail ? (
                        <img src={asset.thumbnail} alt={asset.name} className="w-full h-full object-cover" />
                      ) : (
                        <Icon className={`w-10 h-10 ${TYPE_COLORS[asset.type] ?? "text-muted-foreground"} opacity-60`} />
                      )}
                      <div className="absolute top-2 right-2">
                        <StatusIcon className={`w-4 h-4 ${STATUS_COLOR[asset.status] ?? "text-muted-foreground"} drop-shadow ${asset.status === "processing" ? "animate-spin" : ""}`} />
                      </div>
                    </div>
                    <CardContent className="p-2">
                      <p className="text-xs font-medium truncate">{asset.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{asset.type}</p>
                    </CardContent>
                  </Card>
                </Link>
                <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="secondary" size="icon" className="h-7 w-7 shadow-md">
                        <MoreHorizontal className="w-3.5 h-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuItem asChild><Link href={`/asset-detail/${asset.id}`}><FileText className="w-4 h-4 mr-2" />View Detail</Link></DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toast({ title: "Coming soon", description: "Copy asset" })}>
                        <Copy className="w-4 h-4 mr-2" />Copy
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toast({ title: "Coming soon", description: "Move asset" })}>
                        <FolderInput className="w-4 h-4 mr-2" />Move
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => deleteMutation.mutate(asset.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((asset) => {
            const Icon = TYPE_ICONS[asset.type] ?? FileText;
            const StatusIcon = STATUS_ICON[asset.status] ?? Clock;
            return (
              <Link key={asset.id} href={`/asset-detail/${asset.id}`}>
                <div className="flex items-center gap-4 p-3 rounded-lg border border-border/50 bg-card/30 hover:bg-secondary/20 transition-colors cursor-pointer">
                  <div className="w-10 h-10 rounded-lg bg-secondary/50 flex items-center justify-center shrink-0">
                    <Icon className={`w-5 h-5 ${TYPE_COLORS[asset.type] ?? "text-muted-foreground"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{asset.name}</div>
                    <div className="text-xs text-muted-foreground">{asset.filename}</div>
                  </div>
                  <div className="hidden sm:flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="capitalize">{asset.type}</span>
                    <span>{formatBytes(asset.size)}</span>
                    <span className="font-mono">{format(new Date(asset.updatedAt), "MMM d, yyyy")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {asset.tags.slice(0, 2).map(t => (
                      <Badge key={t} variant="outline" className="text-xs hidden md:flex">{t}</Badge>
                    ))}
                    <StatusIcon className={`w-4 h-4 ${STATUS_COLOR[asset.status] ?? "text-muted-foreground"} ${asset.status === "processing" ? "animate-spin" : ""}`} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>Previous</Button>
          <span className="text-sm text-muted-foreground">Page {page + 1} of {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>Next</Button>
        </div>
      )}
    </div>
  );
}
