import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { 
  useListAssets, 
  getListAssetsQueryKey,
  useCreateAsset,
  useDeleteAsset,
  useListProjects,
  getListProjectsQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { 
  Image as ImageIcon, Plus, Search, Trash2, FileAudio, FileVideo, Box, FileText, FileQuestion, Loader2 
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

const createAssetSchema = z.object({
  name: z.string().min(2, "Name required"),
  filename: z.string().min(1, "Filename required"),
  url: z.string().url("Must be a valid URL"),
  type: z.enum(["image", "audio", "video", "model", "document", "other"]),
  projectId: z.string().optional(),
});

const TYPE_ICONS: Record<string, any> = {
  image: ImageIcon,
  audio: FileAudio,
  video: FileVideo,
  model: Box,
  document: FileText,
  other: FileQuestion,
};

export default function Assets() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { data: assetsData, isLoading } = useListAssets(
    { type: filterType !== "all" ? (filterType as any) : undefined }, 
    { query: { queryKey: getListAssetsQueryKey({ type: filterType !== "all" ? filterType : undefined } as any) } }
  );

  const { data: projectsData } = useListProjects({}, { query: { queryKey: getListProjectsQueryKey({}) } });

  const createMutation = useCreateAsset();
  const deleteMutation = useDeleteAsset();

  const form = useForm<z.infer<typeof createAssetSchema>>({
    resolver: zodResolver(createAssetSchema),
    defaultValues: { name: "", filename: "", url: "", type: "image", projectId: "none" },
  });

  const onSubmit = (values: z.infer<typeof createAssetSchema>) => {
    createMutation.mutate(
      { 
        data: { 
          name: values.name, 
          filename: values.filename, 
          url: values.url, 
          type: values.type as any,
          projectId: values.projectId && values.projectId !== "none" ? parseInt(values.projectId) : undefined 
        } 
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListAssetsQueryKey() });
          toast({ title: "Asset registered" });
          setIsCreateOpen(false);
          form.reset();
        },
        onError: (err) => {
          toast({ variant: "destructive", title: "Registration failed", description: err.error?.message });
        }
      }
    );
  };

  const handleDelete = (id: number) => {
    if (!confirm("Delete this asset?")) return;
    deleteMutation.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListAssetsQueryKey() });
        toast({ title: "Asset deleted" });
      }
    });
  };

  const filteredAssets = assetsData?.items.filter(a => 
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.filename.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Asset Library</h1>
          <p className="text-muted-foreground mt-1">Manage global universe assets</p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Register Asset
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle>Register External Asset</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Asset Name</FormLabel>
                    <FormControl><Input placeholder="Hero Sword" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="filename" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Filename</FormLabel>
                      <FormControl><Input placeholder="sword_01.png" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="type" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="image">Image</SelectItem>
                          <SelectItem value="audio">Audio</SelectItem>
                          <SelectItem value="video">Video</SelectItem>
                          <SelectItem value="model">3D Model</SelectItem>
                          <SelectItem value="document">Document</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="url" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Remote URL</FormLabel>
                    <FormControl><Input placeholder="https://..." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="projectId" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bind to Project (Optional)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Global (No project)" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Global (No project)</SelectItem>
                        {projectsData?.items.map(p => (
                          <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <DialogFooter>
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    Save
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search assets..." 
            className="pl-9 bg-card border-border"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-full sm:w-[180px] bg-card border-border">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="image">Images</SelectItem>
            <SelectItem value="audio">Audio</SelectItem>
            <SelectItem value="video">Video</SelectItem>
            <SelectItem value="model">3D Models</SelectItem>
            <SelectItem value="document">Documents</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[1,2,3,4,5,6,7,8].map(i => <Skeleton key={i} className="h-40 w-full rounded-xl" />)}
        </div>
      ) : filteredAssets?.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border rounded-xl bg-card/30">
          <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium">No assets found</h3>
          <p className="text-muted-foreground">Register your first asset to populate the library.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredAssets?.map(asset => {
            const Icon = TYPE_ICONS[asset.type] || FileQuestion;
            return (
              <Card key={asset.id} className="group bg-card/50 hover:bg-card border-border overflow-hidden flex flex-col relative">
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <Button variant="destructive" size="icon" className="h-7 w-7" onClick={() => handleDelete(asset.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
                
                <div className="aspect-square bg-background/50 flex items-center justify-center p-4 border-b border-border/50 relative">
                  {asset.type === 'image' && asset.url ? (
                    <img src={asset.url} alt={asset.name} className="w-full h-full object-cover rounded-sm opacity-80" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }} />
                  ) : null}
                  <Icon className={`w-12 h-12 text-muted-foreground ${asset.type === 'image' ? 'hidden absolute' : ''}`} />
                  <Badge variant="outline" className="absolute bottom-2 left-2 bg-background/80 backdrop-blur text-[10px] uppercase">
                    {asset.type}
                  </Badge>
                </div>
                
                <CardContent className="p-3 pb-1 flex-1">
                  <h4 className="font-medium text-sm truncate" title={asset.name}>{asset.name}</h4>
                  <p className="text-xs text-muted-foreground truncate font-mono mt-1" title={asset.filename}>{asset.filename}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
