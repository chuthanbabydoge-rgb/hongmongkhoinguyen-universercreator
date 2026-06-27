import { useGetDashboard, getGetDashboardQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderGit2, Upload, FileText, Send, Activity, Box } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  const { data: dashboard, isLoading } = useGetDashboard({
    query: {
      queryKey: getGetDashboardQueryKey(),
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
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
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
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
            {dashboard?.recentProjects?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground border border-dashed border-border rounded-lg bg-secondary/20">
                No projects yet. Start building!
              </div>
            ) : (
              <div className="space-y-4">
                {dashboard?.recentProjects?.map((project) => (
                  <div key={project.id} className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-background/50 hover:bg-secondary/20 transition-colors">
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
                    <Badge variant={
                      project.status === "published" ? "default" :
                      project.status === "draft" ? "secondary" : "outline"
                    }>
                      {project.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-chart-2" />
              <CardTitle>Activity Feed</CardTitle>
            </div>
            <CardDescription>System log of your actions</CardDescription>
          </CardHeader>
          <CardContent>
            {dashboard?.recentActivity?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground border border-dashed border-border rounded-lg bg-secondary/20">
                System idle.
              </div>
            ) : (
              <div className="relative pl-4 space-y-6 before:absolute before:inset-y-0 before:left-[11px] before:w-px before:bg-border">
                {dashboard?.recentActivity?.map((activity) => (
                  <div key={activity.id} className="relative">
                    <div className="absolute -left-[25px] mt-1.5 w-2 h-2 rounded-full bg-chart-2 ring-4 ring-background" />
                    <div className="text-sm font-medium">{activity.action}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{activity.message}</div>
                    <div className="text-xs text-muted-foreground/50 font-mono mt-1">
                      {format(new Date(activity.createdAt), "MMM d, HH:mm")}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
