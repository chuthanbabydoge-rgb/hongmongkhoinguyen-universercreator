import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useGetDashboard, getGetDashboardQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderGit2, Upload, FileText, Send, Activity, Box, Building2, Bell, Star, Mail, Bookmark, BookmarkCheck, Layers, RefreshCw, CheckCircle, Clock, XCircle, HardDrive } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");

interface OrgMembership {
  org: { id: number; name: string; description: string | null };
  role: string;
}

interface Notification {
  id: number; type: string; title: string; message: string; isRead: boolean; createdAt: string;
}

interface ActivityItem {
  id: number; type: string; description: string; projectName: string | null; createdAt: string;
}

function useOrganizations() {
  return useQuery<{ items: OrgMembership[] }>({
    queryKey: ["/api/organizations"],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/organizations`, { headers: { Authorization: `Bearer ${token()}` } });
      if (!res.ok) return { items: [] };
      return res.json();
    },
  });
}

function useNotifications() {
  return useQuery<{ items: Notification[]; unreadCount: number }>({
    queryKey: ["/api/notifications"],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/notifications?limit=5`, { headers: { Authorization: `Bearer ${token()}` } });
      if (!res.ok) return { items: [], unreadCount: 0 };
      return res.json();
    },
    refetchInterval: 30000,
  });
}

function useActivity() {
  return useQuery<{ items: ActivityItem[] }>({
    queryKey: ["/api/activity"],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/activity?limit=5`, { headers: { Authorization: `Bearer ${token()}` } });
      if (!res.ok) return { items: [] };
      return res.json();
    },
  });
}

function useInvitations() {
  return useQuery<{ items: Array<{ status: string }> }>({
    queryKey: ["/api/invitations"],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/invitations`, { headers: { Authorization: `Bearer ${token()}` } });
      if (!res.ok) return { items: [] };
      return res.json();
    },
  });
}

interface DocItem {
  id: number; type: string; name: string; status: string; updatedAt: string;
}

function useRecentDocuments() {
  return useQuery<{ items: DocItem[]; total: number }>({
    queryKey: ["/api/documents", { sort: "updated", limit: "5" }],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/documents?sort=updated&limit=5`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (!res.ok) return { items: [], total: 0 };
      return res.json();
    },
  });
}

function useBookmarkedDocuments() {
  return useQuery<{ items: DocItem[] }>({
    queryKey: ["/api/documents/bookmarks/me"],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/documents/bookmarks/me`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (!res.ok) return { items: [] };
      return res.json();
    },
  });
}

interface PipelineAssetItem { id: number; name: string; type: string; status: string; size: number | null; }
interface ProcessingJobItem { id: number; assetId: number; step: string; status: string; }

function useRecentAssets() {
  return useQuery<{ items: PipelineAssetItem[]; total: number }>({
    queryKey: ["/api/pipeline", { sort: "newest", limit: 5 }],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/pipeline?sort=newest&limit=5`, { headers: { Authorization: `Bearer ${token()}` } });
      if (!res.ok) return { items: [], total: 0 };
      return res.json();
    },
  });
}

function useRecentProcessingJobs() {
  return useQuery<{ items: ProcessingJobItem[] }>({
    queryKey: ["/api/pipeline/jobs", { limit: 5 }],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/pipeline/jobs?limit=5`, { headers: { Authorization: `Bearer ${token()}` } });
      if (!res.ok) return { items: [] };
      return res.json();
    },
    refetchInterval: 5000,
  });
}

const DOC_EMOJIS: Record<string, string> = {
  world: "🌍", npc: "👤", quest: "📜", boss: "🐉", dungeon: "🏰",
  item: "⚔️", skill: "✨", pet: "🐾", mount: "🐴", dialogue: "💬",
  company: "🏢", course: "📚", tournament: "🏆", city: "🏙️", building: "🏗️",
  education: "🎓", sports: "⚽", land: "🗺️", nation: "🚩",
};

const STATUS_COLORS: Record<string, string> = {
  draft: "secondary", review: "outline", approved: "outline",
  published: "default", archived: "outline",
};

export default function Dashboard() {
  const { data: dashboard, isLoading } = useGetDashboard({ query: { queryKey: getGetDashboardQueryKey() } });
  const { data: orgsData } = useOrganizations();
  const { data: notifsData } = useNotifications();
  const { data: activityData } = useActivity();
  const { data: invitesData } = useInvitations();
  const { data: recentDocs } = useRecentDocuments();
  const { data: bookmarkedDocs } = useBookmarkedDocuments();
  const { data: recentAssets } = useRecentAssets();
  const { data: processingAssets } = useRecentProcessingJobs();

  const storageBytes = recentAssets?.items?.reduce((s, a) => s + (a.size ?? 0), 0) ?? 0;
  const pendingInvites = invitesData?.items?.filter(i => i.status === "pending") ?? [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div><Skeleton className="h-8 w-64 mb-2" /><Skeleton className="h-4 w-96" /></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-[400px] w-full rounded-xl lg:col-span-2" />
          <Skeleton className="h-[400px] w-full rounded-xl" />
        </div>
      </div>
    );
  }

  const stats = [
    { title: "Total Projects", value: dashboard?.totalProjects || 0, icon: FolderGit2, color: "text-primary" },
    { title: "Published Worlds", value: dashboard?.publishedProjects || 0, icon: Send, color: "text-chart-2" },
    { title: "Asset Library", value: dashboard?.totalAssets || 0, icon: Upload, color: "text-chart-3" },
    { title: "Design Docs", value: dashboard?.totalDocuments || 0, icon: FileText, color: "text-chart-4" },
  ];

  const TYPE_EMOJI: Record<string, string> = {
    project_created:"🌍", published:"🚀", starred:"⭐", joined:"👋", asset_uploaded:"📁",
    permission_changed:"🔑", watched:"👁️", forked:"🍴", commented:"💬", project_deleted:"🗑️",
  };

  return (
    <div className="space-y-8 pb-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Command Center</h1>
        <p className="text-muted-foreground mt-1">Overview of your creative output</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="bg-card/50 backdrop-blur border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-mono tracking-tighter">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-card/50 backdrop-blur border-border/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Box className="w-5 h-5 text-primary" />
              <CardTitle>Recent Projects</CardTitle>
            </div>
            <CardDescription>Your latest world-building efforts</CardDescription>
          </CardHeader>
          <CardContent>
            {!dashboard?.recentProjects?.length ? (
              <div className="text-center py-8 text-muted-foreground border border-dashed border-border rounded-lg bg-secondary/20">
                No projects yet. Start building!
              </div>
            ) : (
              <div className="space-y-3">
                {dashboard.recentProjects.map((project) => (
                  <Link key={project.id} href={`/projects/${project.id}`}>
                    <div className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-background/50 hover:bg-secondary/20 transition-colors cursor-pointer">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center shrink-0">
                          <FolderGit2 className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">{project.name}</div>
                          <div className="text-xs text-muted-foreground font-mono">
                            Updated {format(new Date(project.updatedAt), "MMM d, yyyy")}
                          </div>
                        </div>
                      </div>
                      <Badge variant={project.status === "published" ? "default" : project.status === "draft" ? "secondary" : "outline"}>
                        {project.status}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-chart-2" />
                  <CardTitle className="text-sm">Recent Activity</CardTitle>
                </div>
                <Link href="/activity">
                  <Button variant="ghost" size="sm" className="h-6 text-xs text-muted-foreground">All →</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {!activityData?.items?.length ? (
                <div className="text-center py-4 text-xs text-muted-foreground">No activity yet</div>
              ) : (
                <div className="space-y-3">
                  {activityData.items.slice(0, 4).map((item) => (
                    <div key={item.id} className="flex items-start gap-2">
                      <span className="text-sm mt-0.5">{TYPE_EMOJI[item.type] ?? "·"}</span>
                      <div>
                        <div className="text-xs font-medium leading-tight">{item.description}</div>
                        <div className="text-xs text-muted-foreground/60 font-mono">{format(new Date(item.createdAt), "MMM d, HH:mm")}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {(notifsData?.unreadCount ?? 0) > 0 && (
            <Card className="bg-card/50 backdrop-blur border-primary/30 border">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-primary" />
                    <CardTitle className="text-sm">Notifications</CardTitle>
                    <Badge className="h-5 px-1.5 text-xs bg-primary/20 text-primary border border-primary/30">
                      {notifsData?.unreadCount}
                    </Badge>
                  </div>
                  <Link href="/notifications">
                    <Button variant="ghost" size="sm" className="h-6 text-xs text-muted-foreground">View →</Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {notifsData?.items?.filter(n => !n.isRead).slice(0, 3).map((n) => (
                    <div key={n.id} className="text-xs p-2 rounded-lg bg-primary/5 border border-primary/10">
                      <div className="font-medium">{n.title}</div>
                      <div className="text-muted-foreground mt-0.5">{n.message}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-chart-3" />
                <CardTitle className="text-sm">My Organizations</CardTitle>
              </div>
              <Link href="/organizations">
                <Button variant="ghost" size="sm" className="h-6 text-xs text-muted-foreground">All →</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {!orgsData?.items?.length ? (
              <Link href="/organizations">
                <div className="text-center py-6 text-xs text-muted-foreground border border-dashed border-border rounded-lg cursor-pointer hover:bg-secondary/10 transition-colors">
                  No organizations yet. Create one →
                </div>
              </Link>
            ) : (
              <div className="space-y-2">
                {orgsData.items.slice(0, 3).map(({ org, role }) => (
                  <Link key={org.id} href={`/organizations/${org.id}`}>
                    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary/20 transition-colors cursor-pointer">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded bg-primary/10 flex items-center justify-center shrink-0">
                          <Building2 className="w-3 h-3 text-primary" />
                        </div>
                        <span className="text-sm font-medium truncate">{org.name}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">{role}</Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {pendingInvites.length > 0 && (
          <Card className="bg-card/50 backdrop-blur border-yellow-500/30 border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-yellow-400" />
                  <CardTitle className="text-sm">Pending Invites</CardTitle>
                  <Badge className="h-5 px-1.5 text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                    {pendingInvites.length}
                  </Badge>
                </div>
                <Link href="/invitations">
                  <Button variant="ghost" size="sm" className="h-6 text-xs text-muted-foreground">View →</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                You have {pendingInvites.length} pending invitation{pendingInvites.length > 1 ? "s" : ""} waiting for your response.
              </p>
              <Link href="/invitations">
                <Button size="sm" className="w-full mt-3 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/30">
                  Review Invitations
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-400" />
                <CardTitle className="text-sm">Starred Projects</CardTitle>
              </div>
              <Link href="/projects">
                <Button variant="ghost" size="sm" className="h-6 text-xs text-muted-foreground">Projects →</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6 text-xs text-muted-foreground border border-dashed border-border rounded-lg">
              Star projects to pin them here
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-chart-4" />
                <CardTitle className="text-sm">Recent Documents</CardTitle>
              </div>
              <Link href="/documents">
                <Button variant="ghost" size="sm" className="h-6 text-xs text-muted-foreground">All →</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {!recentDocs?.items?.length ? (
              <Link href="/documents">
                <div className="text-center py-6 text-xs text-muted-foreground border border-dashed border-border rounded-lg cursor-pointer hover:bg-secondary/10 transition-colors">
                  No documents yet. Create your first →
                </div>
              </Link>
            ) : (
              <div className="space-y-2">
                {recentDocs.items.map((doc) => (
                  <Link key={doc.id} href={`/documents/${doc.id}`}>
                    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary/20 transition-colors cursor-pointer">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{DOC_EMOJIS[doc.type] ?? "📄"}</span>
                        <div>
                          <div className="text-sm font-medium truncate max-w-[180px]">{doc.name}</div>
                          <div className="text-xs text-muted-foreground capitalize">{doc.type}</div>
                        </div>
                      </div>
                      <Badge variant={STATUS_COLORS[doc.status] as "default" | "secondary" | "outline" ?? "outline"} className="text-xs capitalize">
                        {doc.status}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookmarkCheck className="w-4 h-4 text-primary" />
                <CardTitle className="text-sm">Bookmarked Documents</CardTitle>
              </div>
              <Link href="/bookmarks">
                <Button variant="ghost" size="sm" className="h-6 text-xs text-muted-foreground">All →</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {!bookmarkedDocs?.items?.length ? (
              <Link href="/documents">
                <div className="text-center py-6 text-xs text-muted-foreground border border-dashed border-border rounded-lg cursor-pointer hover:bg-secondary/10 transition-colors">
                  Bookmark documents to pin them here →
                </div>
              </Link>
            ) : (
              <div className="space-y-2">
                {bookmarkedDocs.items.slice(0, 5).map((doc) => (
                  <Link key={doc.id} href={`/documents/${doc.id}`}>
                    <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-secondary/20 transition-colors cursor-pointer">
                      <Bookmark className="w-3 h-3 text-primary shrink-0" />
                      <span className="text-base">{DOC_EMOJIS[doc.type] ?? "📄"}</span>
                      <span className="text-sm truncate">{doc.name}</span>
                      <Badge variant="outline" className="ml-auto text-xs capitalize shrink-0">{doc.type}</Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-card/50 backdrop-blur border-border/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4 text-chart-3" />
                <CardTitle className="text-sm">Recent Uploads</CardTitle>
              </div>
              <Link href="/asset-browser">
                <Button variant="ghost" size="sm" className="h-6 text-xs text-muted-foreground">Browser →</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {!recentAssets?.items?.length ? (
              <Link href="/upload-center">
                <div className="text-center py-6 text-xs text-muted-foreground border border-dashed border-border rounded-lg cursor-pointer hover:bg-secondary/10 transition-colors">
                  No assets yet. Upload your first asset →
                </div>
              </Link>
            ) : (
              <div className="space-y-2">
                {recentAssets.items.map((asset) => {
                  const statusColors: Record<string, string> = {
                    ready: "text-green-400", failed: "text-red-400",
                    processing: "text-yellow-400", pending: "text-muted-foreground",
                  };
                  const StatusDot = asset.status === "processing" ? RefreshCw
                    : asset.status === "ready" ? CheckCircle
                    : asset.status === "failed" ? XCircle : Clock;
                  return (
                    <Link key={asset.id} href={`/asset-detail/${asset.id}`}>
                      <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/20 transition-colors cursor-pointer">
                        <div className="w-8 h-8 rounded-lg bg-secondary/50 flex items-center justify-center shrink-0">
                          <Layers className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate max-w-[200px]">{asset.name}</div>
                          <div className="text-xs text-muted-foreground capitalize">{asset.type}</div>
                        </div>
                        <StatusDot className={`w-3.5 h-3.5 shrink-0 ${statusColors[asset.status] ?? "text-muted-foreground"} ${asset.status === "processing" ? "animate-spin" : ""}`} />
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
                  {(processingAssets?.items?.filter(j => j.status === "processing").length ?? 0) > 0 && (
                    <Badge className="h-5 px-1.5 text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                      {processingAssets?.items?.filter(j => j.status === "processing").length}
                    </Badge>
                  )}
                </div>
                <Link href="/processing-queue">
                  <Button variant="ghost" size="sm" className="h-6 text-xs text-muted-foreground">All →</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {!processingAssets?.items?.length ? (
                <div className="text-center py-4 text-xs text-muted-foreground">No active jobs</div>
              ) : (
                <div className="space-y-2">
                  {processingAssets.items.slice(0, 5).map((job) => {
                    const jobColors: Record<string, string> = {
                      ready: "text-green-400", failed: "text-red-400",
                      processing: "text-yellow-400", pending: "text-muted-foreground",
                    };
                    const JobIcon = job.status === "processing" ? RefreshCw
                      : job.status === "ready" ? CheckCircle
                      : job.status === "failed" ? XCircle : Clock;
                    return (
                      <div key={job.id} className="flex items-center gap-2 p-2 rounded-lg bg-secondary/10">
                        <JobIcon className={`w-3.5 h-3.5 shrink-0 ${jobColors[job.status] ?? ""} ${job.status === "processing" ? "animate-spin" : ""}`} />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium capitalize">{job.step.replace(/_/g, " ")}</div>
                          <div className="text-xs text-muted-foreground/60">Asset #{job.assetId}</div>
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
                <HardDrive className="w-4 h-4 text-chart-2" />
                <CardTitle className="text-sm">Storage Usage</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono tracking-tighter">
                {storageBytes < 1024 * 1024
                  ? `${(storageBytes / 1024).toFixed(1)} KB`
                  : `${(storageBytes / 1024 / 1024).toFixed(1)} MB`}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{recentAssets?.total ?? 0} total assets</p>
              <Link href="/asset-pipeline">
                <Button variant="ghost" className="w-full mt-3 h-7 text-xs text-muted-foreground">View Pipeline →</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
