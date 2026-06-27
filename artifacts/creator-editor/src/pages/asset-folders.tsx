import { useState } from "react";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Folder, FolderOpen, Plus, MoreHorizontal, Pencil, Trash2, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");

interface AssetFolder {
  id: number; name: string; parentId: number | null; color: string | null;
  icon: string | null; createdAt: string; updatedAt: string;
}

function useFolders() {
  return useQuery<{ items: AssetFolder[] }>({
    queryKey: ["/api/pipeline/folders"],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/pipeline/folders`, { headers: { Authorization: `Bearer ${token()}` } });
      if (!res.ok) return { items: [] };
      return res.json();
    },
  });
}

function buildTree(folders: AssetFolder[], parentId: number | null = null): AssetFolder[] {
  return folders.filter(f => f.parentId === parentId);
}

function FolderTree({ folders, parentId, depth = 0 }: { folders: AssetFolder[]; parentId: number | null; depth?: number }) {
  const children = buildTree(folders, parentId);
  const { toast } = useToast();
  const qc = useQueryClient();
  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`${BASE}/api/pipeline/folders/${id}`, {
        method: "DELETE", headers: { Authorization: `Bearer ${token()}` },
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.message); }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/pipeline/folders"] });
      toast({ title: "Folder deleted" });
    },
    onError: (err: Error) => toast({ title: "Cannot delete", description: err.message, variant: "destructive" }),
  });

  const renameMutation = useMutation({
    mutationFn: async ({ id, name }: { id: number; name: string }) => {
      const res = await fetch(`${BASE}/api/pipeline/folders/${id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error("Rename failed");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/pipeline/folders"] });
      setEditId(null);
      toast({ title: "Folder renamed" });
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  if (!children.length) return null;

  return (
    <div className={`space-y-1 ${depth > 0 ? "ml-5 mt-1" : ""}`}>
      {children.map((folder) => {
        const childCount = folders.filter(f => f.parentId === folder.id).length;
        return (
          <div key={folder.id}>
            <div
              className="group flex items-center gap-2 p-2.5 rounded-lg hover:bg-secondary/20 transition-colors cursor-pointer"
              style={{ paddingLeft: depth > 0 ? `${depth * 12 + 10}px` : undefined }}
            >
              {childCount > 0 ? (
                <FolderOpen className="w-4 h-4 text-yellow-400 shrink-0" />
              ) : (
                <Folder className="w-4 h-4 text-yellow-400 shrink-0" />
              )}

              {editId === folder.id ? (
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") renameMutation.mutate({ id: folder.id, name: editName });
                    if (e.key === "Escape") setEditId(null);
                  }}
                  className="h-6 text-sm py-0 flex-1"
                  autoFocus
                />
              ) : (
                <span className="text-sm flex-1 truncate">{folder.name}</span>
              )}

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {childCount > 0 && (
                  <Badge variant="outline" className="text-xs h-5 px-1.5">{childCount}</Badge>
                )}
                <Link href={`/asset-browser?folderId=${folder.id}`}>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <ChevronRight className="w-3 h-3" />
                  </Button>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <MoreHorizontal className="w-3.5 h-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => { setEditId(folder.id); setEditName(folder.name); }}>
                      <Pencil className="w-4 h-4 mr-2" />Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => deleteMutation.mutate(folder.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <FolderTree folders={folders} parentId={folder.id} depth={depth + 1} />
          </div>
        );
      })}
    </div>
  );
}

export default function AssetFolders() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const { data, isLoading } = useFolders();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState<number | null>(null);
  const [color, setColor] = useState("#f59e0b");

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${BASE}/api/pipeline/folders`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
        body: JSON.stringify({ name, parentId: parentId ?? undefined, color }),
      });
      if (!res.ok) throw new Error("Failed to create folder");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/pipeline/folders"] });
      toast({ title: "Folder created" });
      setOpen(false);
      setName("");
      setParentId(null);
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const folders = data?.items ?? [];

  return (
    <div className="space-y-6 pb-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Asset Folders</h1>
          <p className="text-muted-foreground mt-1">Organize assets with nested folders</p>
        </div>
        <Button onClick={() => setOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />New Folder
        </Button>
      </div>

      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Folder className="w-4 h-4 text-yellow-400" />
            Folder Tree — {folders.length} folders
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">{[1,2,3,4].map(i => <Skeleton key={i} className="h-10 w-full" />)}</div>
          ) : !folders.length ? (
            <div className="text-center py-10 text-muted-foreground border border-dashed border-border rounded-lg">
              <Folder className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No folders yet. Create one to organize your assets.</p>
            </div>
          ) : (
            <FolderTree folders={folders} parentId={null} />
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>New Folder</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input placeholder="My Folder" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Parent Folder (optional)</Label>
              <select
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                value={parentId ?? ""}
                onChange={(e) => setParentId(e.target.value ? Number(e.target.value) : null)}
              >
                <option value="">— Root Level —</option>
                {folders.map(f => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex items-center gap-3">
                <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-10 h-8 rounded cursor-pointer" />
                <span className="text-sm text-muted-foreground font-mono">{color}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => createMutation.mutate()} disabled={!name || createMutation.isPending}>
              Create Folder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
