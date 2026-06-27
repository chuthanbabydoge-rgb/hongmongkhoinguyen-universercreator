import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle, XCircle, Clock, RefreshCw, Upload, Cpu,
} from "lucide-react";
import { format } from "date-fns";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");

interface ProcessingJob {
  id: number; assetId: number; step: string; status: string;
  log: string | null; errorMessage: string | null;
  startedAt: string | null; completedAt: string | null; createdAt: string;
}

const STATUS_ICON: Record<string, React.ElementType> = {
  ready: CheckCircle, failed: XCircle, processing: RefreshCw, pending: Clock, uploading: Upload,
};
const STATUS_COLOR: Record<string, string> = {
  ready: "text-green-400", failed: "text-red-400", processing: "text-yellow-400",
  pending: "text-muted-foreground", uploading: "text-blue-400",
};
const STATUS_BG: Record<string, string> = {
  ready: "bg-green-500/10 border-green-500/20", failed: "bg-red-500/10 border-red-500/20",
  processing: "bg-yellow-500/10 border-yellow-500/20", pending: "bg-secondary/30 border-border/30",
  uploading: "bg-blue-500/10 border-blue-500/20",
};
const STEP_LABELS: Record<string, string> = {
  virus_scan: "Virus Scan", checksum: "Checksum", metadata_extract: "Metadata Extract",
  thumbnail: "Thumbnail", optimize: "Optimize", compress: "Compress",
};
const STEP_ORDER = ["virus_scan", "checksum", "metadata_extract", "thumbnail", "optimize", "compress"];

function useJobs() {
  return useQuery<{ items: ProcessingJob[] }>({
    queryKey: ["/api/pipeline/jobs"],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/pipeline/jobs?limit=50`, { headers: { Authorization: `Bearer ${token()}` } });
      if (!res.ok) return { items: [] };
      return res.json();
    },
    refetchInterval: 3000,
  });
}

export default function ProcessingQueue() {
  const { data, isLoading } = useJobs();
  const jobs = data?.items ?? [];

  const groupedByAsset = jobs.reduce<Record<number, ProcessingJob[]>>((acc, job) => {
    if (!acc[job.assetId]) acc[job.assetId] = [];
    acc[job.assetId]!.push(job);
    return acc;
  }, {});

  const processingCount = jobs.filter(j => j.status === "processing").length;
  const pendingCount = jobs.filter(j => j.status === "pending").length;
  const doneCount = jobs.filter(j => j.status === "ready").length;
  const failedCount = jobs.filter(j => j.status === "failed").length;

  const stats = [
    { label: "Processing", value: processingCount, color: "text-yellow-400", icon: RefreshCw },
    { label: "Pending", value: pendingCount, color: "text-muted-foreground", icon: Clock },
    { label: "Completed", value: doneCount, color: "text-green-400", icon: CheckCircle },
    { label: "Failed", value: failedCount, color: "text-red-400", icon: XCircle },
  ];

  return (
    <div className="space-y-6 pb-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <Cpu className="w-8 h-8 text-primary" />
          Processing Queue
        </h1>
        <p className="text-muted-foreground mt-1">Live view of asset processing pipeline — auto-refreshes every 3s</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="bg-card/50 border-border/50">
            <CardContent className="p-4 flex items-center gap-3">
              <s.icon className={`w-8 h-8 ${s.color} ${s.label === "Processing" && s.value > 0 ? "animate-spin" : ""}`} />
              <div>
                <div className="text-2xl font-bold font-mono">{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-32 w-full" />)}</div>
      ) : !jobs.length ? (
        <div className="text-center py-16 border border-dashed border-border rounded-xl text-muted-foreground">
          <Cpu className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No jobs in queue</p>
          <p className="text-sm mt-1">Upload assets to see processing jobs here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedByAsset).map(([assetIdStr, assetJobs]) => {
            const assetId = Number(assetIdStr);
            const sortedJobs = [...assetJobs].sort(
              (a, b) => STEP_ORDER.indexOf(a.step) - STEP_ORDER.indexOf(b.step)
            );
            const completedSteps = sortedJobs.filter(j => j.status === "ready").length;
            const totalSteps = sortedJobs.length;
            const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;
            const overallStatus = sortedJobs.some(j => j.status === "failed")
              ? "failed"
              : sortedJobs.some(j => j.status === "processing")
              ? "processing"
              : sortedJobs.every(j => j.status === "ready")
              ? "ready"
              : "pending";

            const OverallIcon = STATUS_ICON[overallStatus] ?? Clock;

            return (
              <Card key={assetId} className="bg-card/50 border-border/50">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <OverallIcon className={`w-5 h-5 ${STATUS_COLOR[overallStatus]} ${overallStatus === "processing" ? "animate-spin" : ""}`} />
                      <CardTitle className="text-sm">Asset #{assetId}</CardTitle>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">{completedSteps}/{totalSteps} steps</span>
                      <Badge variant={overallStatus === "ready" ? "default" : overallStatus === "failed" ? "destructive" : "outline"} className="capitalize">
                        {overallStatus}
                      </Badge>
                    </div>
                  </div>
                  <Progress value={progress} className="h-1.5 mt-2" />
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {sortedJobs.map((job) => {
                      const JobIcon = STATUS_ICON[job.status] ?? Clock;
                      return (
                        <div key={job.id} className={`p-2.5 rounded-lg border text-xs ${STATUS_BG[job.status] ?? "bg-secondary/30 border-border/30"}`}>
                          <div className="flex items-center gap-1.5 mb-1">
                            <JobIcon className={`w-3.5 h-3.5 shrink-0 ${STATUS_COLOR[job.status]} ${job.status === "processing" ? "animate-spin" : ""}`} />
                            <span className="font-medium">{STEP_LABELS[job.step] ?? job.step}</span>
                          </div>
                          {job.log && <p className="text-muted-foreground truncate">{job.log}</p>}
                          {job.errorMessage && <p className="text-destructive truncate">{job.errorMessage}</p>}
                          {job.completedAt && (
                            <p className="text-muted-foreground/60 mt-0.5 font-mono">
                              {format(new Date(job.completedAt), "HH:mm:ss")}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
