import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  FileText,
  Plus,
  Search,
  MoreVertical,
  Copy,
  Trash2,
  BookmarkPlus,
  Lock,
  History,
  Filter,
  Globe,
  Swords,
  Scroll,
  Zap,
  MessageSquare,
  Map,
  Building,
  GraduationCap,
  Trophy,
  Users,
  Package,
  Star,
  Sparkles,
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");

const TYPE_ICONS: Record<string, React.ReactNode> = {
  world: <Globe className="w-4 h-4" />,
  npc: <Users className="w-4 h-4" />,
  quest: <Scroll className="w-4 h-4" />,
  boss: <Swords className="w-4 h-4" />,
  dungeon: <Building className="w-4 h-4" />,
  item: <Package className="w-4 h-4" />,
  skill: <Zap className="w-4 h-4" />,
  pet: <Star className="w-4 h-4" />,
  mount: <Sparkles className="w-4 h-4" />,
  dialogue: <MessageSquare className="w-4 h-4" />,
  company: <Building className="w-4 h-4" />,
  course: <GraduationCap className="w-4 h-4" />,
  tournament: <Trophy className="w-4 h-4" />,
  city: <Map className="w-4 h-4" />,
  building: <Building className="w-4 h-4" />,
  education: <GraduationCap className="w-4 h-4" />,
  sports: <Trophy className="w-4 h-4" />,
  land: <Map className="w-4 h-4" />,
  nation: <Globe className="w-4 h-4" />,
};

const TYPE_EMOJIS: Record<string, string> = {
  world: "🌍", npc: "👤", quest: "📜", boss: "🐉", dungeon: "🏰",
  item: "⚔️", skill: "✨", pet: "🐾", mount: "🐴", dialogue: "💬",
  company: "🏢", course: "📚", tournament: "🏆", city: "🏙️", building: "🏗️",
  education: "🎓", sports: "⚽", land: "🗺️", nation: "🚩",
};

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-secondary text-secondary-foreground",
  review: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  approved: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  published: "bg-green-500/20 text-green-400 border-green-500/30",
  archived: "bg-muted text-muted-foreground",
};

interface Document {
  id: number;
  projectId: number;
  type: string;
  name: string;
  slug: string | null;
  description: string | null;
  status: string;
  version: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface DocumentType {
  value: string;
  label: string;
  icon: string;
}

interface Project {
  id: number;
  name: string;
}

function useDocuments(params: Record<string, string>) {
  return useQuery<{ items: Document[]; total: number }>({
    queryKey: ["/api/documents", params],
    queryFn: async () => {
      const qs = new URLSearchParams(params).toString();
      const res = await fetch(`${BASE}/api/documents?${qs}`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (!res.ok) return { items: [], total: 0 };
      return res.json();
    },
  });
}

function useDocumentTypes() {
  return useQuery<{ types: DocumentType[] }>({
    queryKey: ["/api/documents/types"],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/documents/types`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (!res.ok) return { types: [] };
      return res.json();
    },
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

export default function Documents() {
  const [, setLocation] = useLocation();
  const qc = useQueryClient();
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("updated");
  const [projectFilter, setProjectFilter] = useState("all");
  const [showCreate, setShowCreate] = useState(false);

  const [newDoc, setNewDoc] = useState({
    name: "",
    type: "world",
    description: "",
    projectId: "",
    visibility: "private",
    tags: "",
  });

  const params: Record<string, string> = { sort: sortBy, limit: "30" };
  if (typeFilter !== "all") params["type"] = typeFilter;
  if (statusFilter !== "all") params["status"] = statusFilter;
  if (projectFilter !== "all") params["projectId"] = projectFilter;

  const { data, isLoading } = useDocuments(params);
  const { data: typesData } = useDocumentTypes();
  const { data: projectsData } = useProjects();

  const items = data?.items ?? [];
  const filtered = search
    ? items.filter(
        (d) =>
          d.name.toLowerCase().includes(search.toLowerCase()) ||
          d.description?.toLowerCase().includes(search.toLowerCase()),
      )
    : items;

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${BASE}/api/documents`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId: Number(newDoc.projectId),
          type: newDoc.type,
          name: newDoc.name,
          description: newDoc.description || undefined,
          visibility: newDoc.visibility,
          tags: newDoc.tags
            ? newDoc.tags.split(",").map((t) => t.trim()).filter(Boolean)
            : [],
        }),
      });
      if (!res.ok) throw new Error("Failed to create document");
      return res.json();
    },
    onSuccess: (doc: Document) => {
      qc.invalidateQueries({ queryKey: ["/api/documents"] });
      setShowCreate(false);
      setNewDoc({ name: "", type: "world", description: "", projectId: "", visibility: "private", tags: "" });
      toast({ title: "Document created", description: doc.name });
      setLocation(`/documents/${doc.id}`);
    },
    onError: () => toast({ title: "Error", description: "Failed to create document", variant: "destructive" }),
  });

  const duplicateMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`${BASE}/api/documents/${id}/duplicate`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (!res.ok) throw new Error("Failed to duplicate");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/documents"] });
      toast({ title: "Duplicated", description: "Document duplicated" });
    },
  });

  const bookmarkMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`${BASE}/api/documents/${id}/bookmark`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (!res.ok) throw new Error("Failed to bookmark");
      return res.json();
    },
    onSuccess: () => toast({ title: "Bookmarked" }),
  });

  const lockMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`${BASE}/api/documents/${id}/lock`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (!res.ok) throw new Error("Already locked");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/documents"] });
      toast({ title: "Document locked" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`${BASE}/api/documents/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (!res.ok) throw new Error("Failed to delete");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/documents"] });
      toast({ title: "Deleted" });
    },
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
          <p className="text-muted-foreground mt-1">
            {data?.total ?? 0} documents across all projects
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Document
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search documents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40">
            <Filter className="w-3 h-3 mr-2" />
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {typesData?.types.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.icon} {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="review">Review</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
        <Select value={projectFilter} onValueChange={setProjectFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Project" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            {projectsData?.items.map((p) => (
              <SelectItem key={p.id} value={String(p.id)}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="updated">Last Updated</SelectItem>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="oldest">Oldest</SelectItem>
            <SelectItem value="alpha">Alphabetical</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border rounded-xl bg-secondary/10">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="font-semibold text-lg mb-1">No documents found</h3>
          <p className="text-muted-foreground text-sm mb-4">
            {search ? "No results match your search" : "Start creating your first document"}
          </p>
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="w-4 h-4 mr-2" />New Document
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((doc) => (
            <Card
              key={doc.id}
              className="bg-card/50 backdrop-blur border-border/50 hover:border-primary/30 transition-colors group"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-lg shrink-0">
                      {TYPE_EMOJIS[doc.type] ?? "📄"}
                    </div>
                    <div className="min-w-0">
                      <Link href={`/documents/${doc.id}`}>
                        <CardTitle className="text-sm font-semibold truncate cursor-pointer hover:text-primary transition-colors">
                          {doc.name}
                        </CardTitle>
                      </Link>
                      <p className="text-xs text-muted-foreground capitalize mt-0.5">
                        {doc.type} · v{doc.version}
                      </p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setLocation(`/documents/${doc.id}`)}>
                        <FileText className="w-4 h-4 mr-2" />View
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => duplicateMutation.mutate(doc.id)}>
                        <Copy className="w-4 h-4 mr-2" />Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => bookmarkMutation.mutate(doc.id)}>
                        <BookmarkPlus className="w-4 h-4 mr-2" />Bookmark
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => lockMutation.mutate(doc.id)}>
                        <Lock className="w-4 h-4 mr-2" />Lock
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setLocation(`/documents/${doc.id}/history`)}>
                        <History className="w-4 h-4 mr-2" />History
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => deleteMutation.mutate(doc.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {doc.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {doc.description}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  <Badge
                    variant="outline"
                    className={`text-xs capitalize ${STATUS_COLORS[doc.status] ?? ""}`}
                  >
                    {doc.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground font-mono">
                    {format(new Date(doc.updatedAt), "MMM d, yyyy")}
                  </span>
                </div>
                {doc.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {doc.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-1.5 py-0.5 bg-secondary/50 rounded text-muted-foreground"
                      >
                        #{tag}
                      </span>
                    ))}
                    {doc.tags.length > 3 && (
                      <span className="text-xs text-muted-foreground">+{doc.tags.length - 3}</span>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New Document</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Project *</Label>
              <Select
                value={newDoc.projectId}
                onValueChange={(v) => setNewDoc((p) => ({ ...p, projectId: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select project..." />
                </SelectTrigger>
                <SelectContent>
                  {projectsData?.items.map((p) => (
                    <SelectItem key={p.id} value={String(p.id)}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Document Type *</Label>
              <Select
                value={newDoc.type}
                onValueChange={(v) => setNewDoc((p) => ({ ...p, type: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {typesData?.types.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.icon} {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input
                placeholder="Document name..."
                value={newDoc.name}
                onChange={(e) => setNewDoc((p) => ({ ...p, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="What is this document about?"
                value={newDoc.description}
                onChange={(e) => setNewDoc((p) => ({ ...p, description: e.target.value }))}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>Tags (comma-separated)</Label>
              <Input
                placeholder="epic, main-quest, boss-fight"
                value={newDoc.tags}
                onChange={(e) => setNewDoc((p) => ({ ...p, tags: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => createMutation.mutate()}
              disabled={!newDoc.name || !newDoc.projectId || createMutation.isPending}
            >
              {createMutation.isPending ? "Creating..." : "Create Document"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
