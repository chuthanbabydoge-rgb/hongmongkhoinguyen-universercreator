import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Folder, FolderOpen, Plus, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");

interface FolderItem {
  id: number;
  name: string;
  projectId: number;
  parentId: number | null;
  color: string | null;
  icon: string | null;
  createdAt: string;
}

interface Project {
  id: number;
  name: string;
}

function useFolders(projectId: string) {
  return useQuery<{ items: FolderItem[] }>({
    queryKey: ["/api/documents/folders", projectId],
    queryFn: async () => {
      if (!projectId || projectId === "all") return { items: [] };
      const res = await fetch(`${BASE}/api/documents/folders?projectId=${projectId}`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (!res.ok) return { items: [] };
      return res.json();
    },
    enabled: !!projectId && projectId !== "all",
  });
}

function useProjects() {
  return useQuery<{ items: Project[] }>({
    queryKey: ["/api/projects"],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/projects?limit=100`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (!res.ok) return { items: [] };
      return res.json();
    },
  });
}

export default function Folders() {
  const qc = useQueryClient();
  const { toast } = useToast();

  const [selectedProject, setSelectedProject] = useState("all");
  const [showCreate, setShowCreate] = useState(false);
  const [editFolder, setEditFolder] = useState<FolderItem | null>(null);
  const [newFolder, setNewFolder] = useState({ name: "", color: "#6366f1", icon: "📁" });

  const { data: projectsData } = useProjects();
  const { data: foldersData, isLoading } = useFolders(selectedProject);

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${BASE}/api/documents/folders`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId: Number(selectedProject),
          name: newFolder.name,
          color: newFolder.color,
          icon: newFolder.icon,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/documents/folders", selectedProject] });
      setShowCreate(false);
      setNewFolder({ name: "", color: "#6366f1", icon: "📁" });
      toast({ title: "Folder created" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (f: FolderItem) => {
      const res = await fetch(`${BASE}/api/documents/folders/${f.id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: f.name, color: f.color, icon: f.icon }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/documents/folders", selectedProject] });
      setEditFolder(null);
      toast({ title: "Folder updated" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`${BASE}/api/documents/folders/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (!res.ok) throw new Error("Failed");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/documents/folders", selectedProject] });
      toast({ title: "Folder deleted" });
    },
  });

  const folders = foldersData?.items ?? [];
  const rootFolders = folders.filter((f) => !f.parentId);
  const getChildren = (parentId: number) => folders.filter((f) => f.parentId === parentId);

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Folders</h1>
          <p className="text-muted-foreground mt-1">Organize your documents into folders</p>
        </div>
        <Button
          onClick={() => setShowCreate(true)}
          disabled={selectedProject === "all"}
        >
          <Plus className="w-4 h-4 mr-2" />New Folder
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <Select value={selectedProject} onValueChange={setSelectedProject}>
          <SelectTrigger className="w-56">
            <SelectValue placeholder="Select project..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Select a project</SelectItem>
            {projectsData?.items.map((p) => (
              <SelectItem key={p.id} value={String(p.id)}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedProject === "all" && (
          <p className="text-sm text-muted-foreground">Select a project to view folders</p>
        )}
      </div>

      {selectedProject !== "all" && (
        <>
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
            </div>
          ) : rootFolders.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-border rounded-xl">
              <Folder className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">No folders yet</p>
              <Button className="mt-4" onClick={() => setShowCreate(true)}>
                <Plus className="w-4 h-4 mr-2" />Create First Folder
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rootFolders.map((folder) => (
                <FolderCard
                  key={folder.id}
                  folder={folder}
                  children={getChildren(folder.id)}
                  onEdit={setEditFolder}
                  onDelete={(id) => deleteMutation.mutate(id)}
                />
              ))}
            </div>
          )}
        </>
      )}

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Folder</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input
                placeholder="Folder name..."
                value={newFolder.name}
                onChange={(e) => setNewFolder((p) => ({ ...p, name: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Icon</Label>
                <Input
                  placeholder="📁"
                  value={newFolder.icon}
                  onChange={(e) => setNewFolder((p) => ({ ...p, icon: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Color</Label>
                <Input
                  type="color"
                  value={newFolder.color}
                  onChange={(e) => setNewFolder((p) => ({ ...p, color: e.target.value }))}
                  className="h-10 p-1"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button
              onClick={() => createMutation.mutate()}
              disabled={!newFolder.name || createMutation.isPending}
            >
              Create Folder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {editFolder && (
        <Dialog open={!!editFolder} onOpenChange={() => setEditFolder(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Folder</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={editFolder.name}
                  onChange={(e) => setEditFolder((p) => p ? { ...p, name: e.target.value } : p)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Icon</Label>
                  <Input
                    value={editFolder.icon ?? ""}
                    onChange={(e) => setEditFolder((p) => p ? { ...p, icon: e.target.value } : p)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Color</Label>
                  <Input
                    type="color"
                    value={editFolder.color ?? "#6366f1"}
                    onChange={(e) => setEditFolder((p) => p ? { ...p, color: e.target.value } : p)}
                    className="h-10 p-1"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditFolder(null)}>Cancel</Button>
              <Button onClick={() => updateMutation.mutate(editFolder)} disabled={updateMutation.isPending}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function FolderCard({
  folder,
  children,
  onEdit,
  onDelete,
}: {
  folder: FolderItem;
  children: FolderItem[];
  onEdit: (f: FolderItem) => void;
  onDelete: (id: number) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Card className="bg-card/50 border-border/50 hover:border-primary/30 transition-colors">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <button
            className="flex items-center gap-3 flex-1 min-w-0"
            onClick={() => setOpen(!open)}
          >
            <span className="text-xl">{folder.icon ?? "📁"}</span>
            <div className="min-w-0">
              <CardTitle className="text-sm truncate">{folder.name}</CardTitle>
              <p className="text-xs text-muted-foreground">{children.length} subfolders</p>
            </div>
            {open ? <FolderOpen className="w-4 h-4 text-muted-foreground ml-auto" /> : <Folder className="w-4 h-4 text-muted-foreground ml-auto" />}
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 ml-2">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/documents?folderId=${folder.id}&projectId=${folder.projectId}`}>
                  View Documents
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(folder)}>
                <Pencil className="w-4 h-4 mr-2" />Edit
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive" onClick={() => onDelete(folder.id)}>
                <Trash2 className="w-4 h-4 mr-2" />Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      {open && children.length > 0 && (
        <CardContent className="pt-0">
          <div className="pl-8 space-y-1 border-l border-border/50">
            {children.map((child) => (
              <div key={child.id} className="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-secondary/20 transition-colors">
                <span>{child.icon ?? "📁"}</span>
                <span className="text-sm">{child.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
