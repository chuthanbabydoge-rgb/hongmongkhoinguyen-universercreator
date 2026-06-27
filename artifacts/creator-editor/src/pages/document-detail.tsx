import { useState } from "react";
import { useRoute, Link, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Save,
  Lock,
  Unlock,
  BookmarkPlus,
  BookmarkMinus,
  Copy,
  History,
  GitBranch,
  Link2,
  Plus,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-secondary text-secondary-foreground",
  review: "bg-yellow-500/20 text-yellow-400",
  approved: "bg-blue-500/20 text-blue-400",
  published: "bg-green-500/20 text-green-400",
  archived: "bg-muted text-muted-foreground",
};

interface DocumentDetail {
  id: number;
  projectId: number;
  type: string;
  name: string;
  slug: string | null;
  description: string | null;
  thumbnail: string | null;
  icon: string | null;
  status: string;
  visibility: string;
  content: Record<string, unknown>;
  metadata: Record<string, unknown>;
  version: number;
  tags: string[];
  folderId: number | null;
  updatedBy: number | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  lock: { lockedBy: number; lockedAt: string; expiresAt: string | null } | null;
  isBookmarked: boolean;
}

interface Relation {
  id: number;
  sourceId: number;
  targetId: number;
  relationType: string;
  label: string | null;
}

export default function DocumentDetail() {
  const [, params] = useRoute("/documents/:id");
  const [, setLocation] = useLocation();
  const id = Number(params?.id);
  const qc = useQueryClient();
  const { toast } = useToast();

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    status: "",
    visibility: "",
    tags: "",
    metadata: "{}",
  });

  const { data: doc, isLoading } = useQuery<DocumentDetail>({
    queryKey: ["/api/documents", id],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/documents/${id}`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (!res.ok) throw new Error("Not found");
      return res.json();
    },
    enabled: !!id,
  });

  const { data: relationsData } = useQuery<{ items: Relation[] }>({
    queryKey: ["/api/documents", id, "relations"],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/documents/${id}/relations`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (!res.ok) return { items: [] };
      return res.json();
    },
    enabled: !!id,
  });

  const startEdit = () => {
    if (!doc) return;
    setForm({
      name: doc.name,
      description: doc.description ?? "",
      status: doc.status,
      visibility: doc.visibility,
      tags: doc.tags.join(", "),
      metadata: JSON.stringify(doc.metadata, null, 2),
    });
    setEditing(true);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      let parsedMeta: Record<string, unknown> = {};
      try { parsedMeta = JSON.parse(form.metadata); } catch { /* invalid json */ }
      const res = await fetch(`${BASE}/api/documents/${id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          description: form.description || undefined,
          status: form.status,
          visibility: form.visibility,
          tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
          metadata: parsedMeta,
        }),
      });
      if (!res.ok) throw new Error("Save failed");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/documents", id] });
      setEditing(false);
      toast({ title: "Saved", description: "Document updated and new version created" });
    },
    onError: (err) => toast({ title: "Error", description: String(err), variant: "destructive" }),
  });

  const lockMutation = useMutation({
    mutationFn: async (lock: boolean) => {
      const res = await fetch(`${BASE}/api/documents/${id}/${lock ? "lock" : "unlock"}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: (_, lock) => {
      qc.invalidateQueries({ queryKey: ["/api/documents", id] });
      toast({ title: lock ? "Document locked" : "Document unlocked" });
    },
  });

  const bookmarkMutation = useMutation({
    mutationFn: async (add: boolean) => {
      const res = await fetch(`${BASE}/api/documents/${id}/bookmark`, {
        method: add ? "POST" : "DELETE",
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/documents", id] });
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${BASE}/api/documents/${id}/duplicate`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: (newDoc: DocumentDetail) => {
      qc.invalidateQueries({ queryKey: ["/api/documents"] });
      toast({ title: "Duplicated" });
      setLocation(`/documents/${newDoc.id}`);
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-[600px] rounded-xl" />
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Document not found</p>
        <Link href="/documents">
          <Button className="mt-4">Back to Documents</Button>
        </Link>
      </div>
    );
  }

  const isLocked = !!doc.lock;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-8">
      <div className="flex items-center gap-4">
        <Link href="/documents">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold truncate">{doc.name}</h1>
          <p className="text-muted-foreground text-sm capitalize">
            {doc.type} · v{doc.version} ·{" "}
            {format(new Date(doc.updatedAt), "MMM d, yyyy HH:mm")}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => bookmarkMutation.mutate(!doc.isBookmarked)}
          >
            {doc.isBookmarked ? (
              <BookmarkMinus className="w-4 h-4 mr-1" />
            ) : (
              <BookmarkPlus className="w-4 h-4 mr-1" />
            )}
            {doc.isBookmarked ? "Unbookmark" : "Bookmark"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => lockMutation.mutate(!isLocked)}
          >
            {isLocked ? (
              <Unlock className="w-4 h-4 mr-1" />
            ) : (
              <Lock className="w-4 h-4 mr-1" />
            )}
            {isLocked ? "Unlock" : "Lock"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => duplicateMutation.mutate()}
          >
            <Copy className="w-4 h-4 mr-1" />Duplicate
          </Button>
          <Link href={`/documents/${id}/history`}>
            <Button variant="outline" size="sm">
              <History className="w-4 h-4 mr-1" />History
            </Button>
          </Link>
          {!editing ? (
            <Button size="sm" onClick={startEdit} disabled={isLocked && !doc.isBookmarked}>
              Edit
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setEditing(false)}>Cancel</Button>
              <Button size="sm" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
                <Save className="w-4 h-4 mr-1" />
                {saveMutation.isPending ? "Saving..." : "Save"}
              </Button>
            </div>
          )}
        </div>
      </div>

      {isLocked && (
        <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-sm flex items-center gap-2">
          <Lock className="w-4 h-4" />
          This document is locked for editing. Locked at{" "}
          {format(new Date(doc.lock!.lockedAt), "MMM d, HH:mm")}
        </div>
      )}

      <Tabs defaultValue="content">
        <TabsList>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="metadata">Metadata</TabsTrigger>
          <TabsTrigger value="relations">Relations</TabsTrigger>
          <TabsTrigger value="versions">
            <GitBranch className="w-4 h-4 mr-1" />Versions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-4 mt-4">
          <Card className="bg-card/50 border-border/50">
            <CardContent className="pt-6 space-y-4">
              {editing ? (
                <>
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input
                      value={form.name}
                      onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={form.description}
                      onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select
                        value={form.status}
                        onValueChange={(v) => setForm((p) => ({ ...p, status: v }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="review">Review</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="published">Published</SelectItem>
                          <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Visibility</Label>
                      <Select
                        value={form.visibility}
                        onValueChange={(v) => setForm((p) => ({ ...p, visibility: v }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="private">Private</SelectItem>
                          <SelectItem value="internal">Internal</SelectItem>
                          <SelectItem value="public">Public</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Tags (comma-separated)</Label>
                    <Input
                      value={form.tags}
                      onChange={(e) => setForm((p) => ({ ...p, tags: e.target.value }))}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="flex flex-wrap gap-2 items-center">
                    <Badge variant="outline" className={`capitalize ${STATUS_COLORS[doc.status]}`}>
                      {doc.status}
                    </Badge>
                    <Badge variant="outline" className="capitalize">
                      {doc.visibility}
                    </Badge>
                    <Badge variant="outline">{doc.type}</Badge>
                  </div>
                  {doc.description && (
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {doc.description}
                    </p>
                  )}
                  {doc.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {doc.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-1 bg-secondary/50 rounded-full text-muted-foreground"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4 text-sm pt-2 border-t border-border/50">
                    <div>
                      <p className="text-muted-foreground text-xs">Created</p>
                      <p className="font-mono">{format(new Date(doc.createdAt), "MMM d, yyyy")}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Version</p>
                      <p className="font-mono">v{doc.version}</p>
                    </div>
                    {doc.publishedAt && (
                      <div>
                        <p className="text-muted-foreground text-xs">Published</p>
                        <p className="font-mono">{format(new Date(doc.publishedAt), "MMM d, yyyy")}</p>
                      </div>
                    )}
                    {doc.slug && (
                      <div>
                        <p className="text-muted-foreground text-xs">Slug</p>
                        <p className="font-mono text-xs truncate">{doc.slug}</p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metadata" className="mt-4">
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="text-sm">
                Type-Specific Metadata · {doc.type}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {editing ? (
                <div className="space-y-2">
                  <Label>Metadata JSON</Label>
                  <Textarea
                    value={form.metadata}
                    onChange={(e) => setForm((p) => ({ ...p, metadata: e.target.value }))}
                    className="font-mono text-xs"
                    rows={16}
                  />
                </div>
              ) : (
                <pre className="text-xs font-mono bg-secondary/30 p-4 rounded-lg overflow-auto max-h-[400px]">
                  {JSON.stringify(doc.metadata, null, 2)}
                </pre>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="relations" className="mt-4">
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Link2 className="w-4 h-4" />Relations
                </CardTitle>
                <Button size="sm" variant="outline" disabled>
                  <Plus className="w-4 h-4 mr-1" />Add Relation
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {!relationsData?.items.length ? (
                <div className="text-center py-8 text-muted-foreground text-sm border border-dashed border-border rounded-lg">
                  No relations yet. Link this document to others.
                </div>
              ) : (
                <div className="space-y-2">
                  {relationsData.items.map((rel) => (
                    <div
                      key={rel.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-background/50"
                    >
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="text-xs capitalize">
                          {rel.relationType}
                        </Badge>
                        <span className="text-sm">
                          {rel.sourceId === id
                            ? `→ #${rel.targetId}`
                            : `← #${rel.sourceId}`}
                        </span>
                        {rel.label && (
                          <span className="text-xs text-muted-foreground">{rel.label}</span>
                        )}
                      </div>
                      <Link href={`/documents/${rel.sourceId === id ? rel.targetId : rel.sourceId}`}>
                        <Button variant="ghost" size="sm">View</Button>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="versions" className="mt-4">
          <DocumentVersions documentId={id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function DocumentVersions({ documentId }: { documentId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();

  interface Version {
    id: number;
    version: number;
    name: string;
    status: string;
    createdAt: string;
  }

  const { data, isLoading } = useQuery<{ items: Version[] }>({
    queryKey: ["/api/documents", documentId, "versions"],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/documents/${documentId}/versions`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (!res.ok) return { items: [] };
      return res.json();
    },
  });

  const restoreMutation = useMutation({
    mutationFn: async (versionId: number) => {
      const res = await fetch(
        `${BASE}/api/documents/${documentId}/restore/${versionId}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token()}` },
        },
      );
      if (!res.ok) throw new Error("Restore failed");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/documents", documentId] });
      qc.invalidateQueries({ queryKey: ["/api/documents", documentId, "versions"] });
      toast({ title: "Restored", description: "Document restored to selected version" });
    },
  });

  if (isLoading) return <Skeleton className="h-48 rounded-xl" />;

  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <GitBranch className="w-4 h-4" />Version History ({data?.items.length ?? 0})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!data?.items.length ? (
          <div className="text-center py-8 text-muted-foreground text-sm">No versions yet</div>
        ) : (
          <div className="space-y-2">
            {data.items.map((v, idx) => (
              <div
                key={v.id}
                className={`flex items-center justify-between p-3 rounded-lg border ${idx === 0 ? "border-primary/30 bg-primary/5" : "border-border/50 bg-background/50"}`}
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-semibold">v{v.version}</span>
                  <span className="text-sm truncate max-w-[200px]">{v.name}</span>
                  <Badge variant="outline" className="text-xs capitalize">{v.status}</Badge>
                  {idx === 0 && <Badge className="text-xs bg-primary/20 text-primary">Latest</Badge>}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground font-mono">
                    {format(new Date(v.createdAt), "MMM d, HH:mm")}
                  </span>
                  {idx !== 0 && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => restoreMutation.mutate(v.id)}
                      disabled={restoreMutation.isPending}
                    >
                      Restore
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
