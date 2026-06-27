import { useState } from "react";
import { useLocation } from "wouter";
import { 
  useListTemplates, 
  getListTemplatesQueryKey,
  useUseTemplate
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { 
  LayoutTemplate, Search, Download, Star, Loader2 
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
  DialogFooter
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

export default function Templates() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [newProjectName, setNewProjectName] = useState("");

  const { data: templatesData, isLoading } = useListTemplates(
    {}, 
    { query: { queryKey: getListTemplatesQueryKey({}) } }
  );

  const useTemplateMutation = useUseTemplate();

  const handleUseTemplate = () => {
    if (!newProjectName.trim()) {
      toast({ variant: "destructive", title: "Project name required" });
      return;
    }

    useTemplateMutation.mutate(
      { id: selectedTemplate.id, data: { name: newProjectName } },
      {
        onSuccess: (project) => {
          toast({ title: "Project created from template!" });
          setSelectedTemplate(null);
          setNewProjectName("");
          setLocation(`/projects/${project.id}`);
        },
        onError: (err) => {
          toast({ variant: "destructive", title: "Failed to use template", description: err.error?.message });
        }
      }
    );
  };

  const filteredTemplates = templatesData?.items.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col justify-between items-start gap-2">
        <h1 className="text-3xl font-bold tracking-tight">World Templates</h1>
        <p className="text-muted-foreground mt-1">Accelerate your universe creation with pre-built foundations</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input 
          placeholder="Search templates..." 
          className="pl-9 max-w-md bg-card border-border"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-64 w-full rounded-xl" />)}
        </div>
      ) : filteredTemplates?.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border rounded-xl bg-card/30">
          <LayoutTemplate className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium">No templates found</h3>
          <p className="text-muted-foreground">Try adjusting your search terms.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredTemplates?.map(template => (
            <Card key={template.id} className="group bg-card/50 hover:bg-card border-border overflow-hidden flex flex-col relative">
              {template.category && (
                <Badge className="absolute top-3 left-3 z-10" variant="secondary">
                  {template.category}
                </Badge>
              )}
              <div className="h-32 bg-background/50 border-b border-border flex items-center justify-center relative overflow-hidden">
                <LayoutTemplate className="w-10 h-10 text-muted-foreground/30" />
                <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent opacity-80" />
              </div>
              <CardHeader className="pb-2 relative z-10 -mt-6">
                <CardTitle className="text-lg">{template.name}</CardTitle>
                <div className="flex items-center text-xs text-muted-foreground mt-1 gap-3">
                  <span className="flex items-center"><Download className="w-3 h-3 mr-1" /> {template.usageCount}</span>
                  <span className="flex items-center text-primary/80"><Star className="w-3 h-3 mr-1" /> Verified</span>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {template.description}
                </p>
                <div className="flex flex-wrap gap-1 mt-3">
                  {template.tags?.slice(0,3).map(tag => (
                    <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-secondary/50 text-secondary-foreground border border-border/50">
                      {tag}
                    </span>
                  ))}
                  {(template.tags?.length || 0) > 3 && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary/50 text-secondary-foreground border border-border/50">
                      +{(template.tags?.length || 0) - 3}
                    </span>
                  )}
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Button className="w-full" variant="secondary" onClick={() => setSelectedTemplate(template)}>
                  Use Template
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!selectedTemplate} onOpenChange={(open) => !open && setSelectedTemplate(null)}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Use Template: {selectedTemplate?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">New Project Name</label>
              <Input 
                placeholder="My Awesome Universe" 
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                autoFocus
              />
            </div>
            <div className="bg-secondary/30 p-3 rounded text-sm text-muted-foreground border border-border/50">
              This will create a new draft project pre-populated with entities from the {selectedTemplate?.name} template.
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setSelectedTemplate(null)}>Cancel</Button>
            <Button onClick={handleUseTemplate} disabled={useTemplateMutation.isPending}>
              {useTemplateMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Initialize Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
