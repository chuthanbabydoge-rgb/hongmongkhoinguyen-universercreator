import { useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { 
  useGetProject, 
  getGetProjectQueryKey,
  useUpdateProject,
  usePublishProject,
  useGetPublishJob,
  getGetPublishJobQueryKey
} from "@workspace/api-client-react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { 
  ArrowLeft, Save, Send, Settings, Activity, Loader2, Globe, Database
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

const updateProjectSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  tags: z.string().optional(),
});

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const projectId = parseInt(id, 10);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [activeJobId, setActiveJobId] = useState<number | null>(null);

  const { data: project, isLoading: isProjectLoading } = useGetProject(projectId, {
    query: {
      enabled: !!projectId,
      queryKey: getGetProjectQueryKey(projectId)
    }
  });

  const { data: publishJob } = useGetPublishJob(activeJobId as number, {
    query: {
      enabled: !!activeJobId,
      queryKey: getGetPublishJobQueryKey(activeJobId as number),
      refetchInterval: (query) => {
        const status = query.state.data?.status;
        return status === "pending" || status === "processing" ? 2000 : false;
      }
    }
  });

  // Watch for job completion
  useEffect(() => {
    if (publishJob?.status === "success") {
      toast({ title: "Project published successfully!" });
      queryClient.invalidateQueries({ queryKey: getGetProjectQueryKey(projectId) });
      setActiveJobId(null);
    } else if (publishJob?.status === "failed") {
      toast({ variant: "destructive", title: "Publish failed", description: publishJob.errorMessage || "Unknown error" });
      setActiveJobId(null);
    }
  }, [publishJob?.status, publishJob?.errorMessage, projectId, queryClient, toast]);

  const updateMutation = useUpdateProject();
  const publishMutation = usePublishProject();

  const form = useForm<z.infer<typeof updateProjectSchema>>({
    resolver: zodResolver(updateProjectSchema),
    defaultValues: { name: "", description: "", tags: "" },
  });

  // Init form
  useEffect(() => {
    if (project) {
      form.reset({
        name: project.name,
        description: project.description || "",
        tags: project.tags?.join(", ") || "",
      });
    }
  }, [project, form]);

  const onUpdate = (values: z.infer<typeof updateProjectSchema>) => {
    const tagsArray = values.tags ? values.tags.split(",").map(t => t.trim()).filter(Boolean) : [];
    updateMutation.mutate(
      { id: projectId, data: { name: values.name, description: values.description, tags: tagsArray } },
      {
        onSuccess: (updated) => {
          queryClient.setQueryData(getGetProjectQueryKey(projectId), updated);
          toast({ title: "Project settings saved" });
        }
      }
    );
  };

  const handlePublish = () => {
    publishMutation.mutate(
      { data: { projectId } },
      {
        onSuccess: () => {
          // The API might not return the job ID properly according to schema, let's just invalidate project
          toast({ title: "Publish job queued" });
          queryClient.invalidateQueries({ queryKey: getGetProjectQueryKey(projectId) });
        },
        onError: (err) => {
          toast({ variant: "destructive", title: "Failed to queue publish", description: err.error?.message });
        }
      }
    );
  };

  if (isProjectLoading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-20 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="md:col-span-2 h-[400px] w-full" />
          <Skeleton className="h-[300px] w-full" />
        </div>
      </div>
    );
  }

  if (!project) return <div>Project not found</div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <Link href="/projects" className="hover:text-primary flex items-center transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Projects
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
            <Badge variant={project.status === "published" ? "default" : "secondary"}>
              {project.status}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1 font-mono text-xs">
            ID: {project.slug} • Last updated: {format(new Date(project.updatedAt), "MMM d, yyyy HH:mm")}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={handlePublish} disabled={publishMutation.isPending || activeJobId !== null}>
            {publishMutation.isPending || activeJobId !== null ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Send className="w-4 h-4 mr-2" />
            )}
            Publish World
          </Button>
        </div>
      </div>

      {(publishMutation.isPending || activeJobId !== null) && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="flex items-center gap-4 p-4">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <div className="flex-1">
              <h3 className="font-medium">Publishing in progress...</h3>
              <p className="text-sm text-muted-foreground">Compiling assets and rendering universe data. This might take a moment.</p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 bg-card border-border">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-chart-2" />
              <CardTitle>Project Settings</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onUpdate)} className="space-y-6">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Name</FormLabel>
                    <FormControl><Input {...field} className="bg-background" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} className="bg-background min-h-[120px] resize-none" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="tags" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <FormControl><Input {...field} className="bg-background" placeholder="fantasy, magic, medieval" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                
                <div className="flex justify-end pt-4">
                  <Button type="submit" disabled={updateMutation.isPending} variant="secondary">
                    {updateMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    Save Changes
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-chart-1" />
                <CardTitle>Status</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex justify-between border-b border-border/50 pb-2">
                <span className="text-muted-foreground">Created</span>
                <span className="font-mono">{format(new Date(project.createdAt), "MMM d, yyyy")}</span>
              </div>
              <div className="flex justify-between border-b border-border/50 pb-2">
                <span className="text-muted-foreground">Current State</span>
                <span className="capitalize">{project.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Assets</span>
                <span className="font-mono">--</span> {/* Would fetch from /assets?projectId */}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-chart-3" />
                <CardTitle>Metadata</CardTitle>
              </div>
              <CardDescription>Raw project data</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-background p-4 rounded-lg overflow-x-auto border border-border/50 text-muted-foreground">
                {JSON.stringify(project.metadata || {}, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
