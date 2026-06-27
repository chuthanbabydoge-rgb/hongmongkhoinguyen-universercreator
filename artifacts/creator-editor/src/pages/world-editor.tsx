import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Globe, Save, Play, Eye, GitBranch, Settings2, Layers, MapPin,
  Sun, Cloud, Zap, Navigation, ArrowLeft, Archive, Star,
  CheckCircle, AlertTriangle, Copy, History,
} from "lucide-react";
import { useState } from "react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const auth = () => ({ Authorization: `Bearer ${localStorage.getItem("creator_token")}` });

async function apiFetch(path: string, init?: RequestInit) {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { ...auth(), "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export default function WorldEditorPage() {
  const { id } = useParams<{ id: string }>();
  const [, nav] = useLocation();
  const qc = useQueryClient();
  const worldId = Number(id);
  const [editName, setEditName] = useState(false);
  const [nameVal, setNameVal] = useState("");
  const [tab, setTab] = useState("overview");

  const { data: world, isLoading } = useQuery({
    queryKey: ["/api/world-editor", worldId],
    queryFn: () => apiFetch(`/api/world-editor/${worldId}`),
    enabled: !!worldId,
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/world-editor", worldId, "statistics"],
    queryFn: () => apiFetch(`/api/world-editor/${worldId}/statistics`),
    enabled: !!worldId,
  });

  const { data: regions = [] } = useQuery<any[]>({
    queryKey: ["/api/world-editor", worldId, "regions"],
    queryFn: () => apiFetch(`/api/world-editor/${worldId}/regions`),
    enabled: !!worldId,
  });

  const { data: layers = [] } = useQuery<any[]>({
    queryKey: ["/api/world-editor", worldId, "layers"],
    queryFn: () => apiFetch(`/api/world-editor/${worldId}/layers`),
    enabled: !!worldId,
  });

  const updateWorld = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiFetch(`/api/world-editor/${worldId}`, { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/world-editor", worldId] }),
  });

  const validateWorld = useMutation({
    mutationFn: () => apiFetch(`/api/world-editor/${worldId}/validate`, { method: "POST" }),
  });

  const publishWorld = useMutation({
    mutationFn: () => apiFetch(`/api/world-editor/${worldId}/publish`, { method: "POST" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/world-editor", worldId] }),
  });

  const previewWorld = useMutation({
    mutationFn: () => apiFetch(`/api/world-editor/${worldId}/preview`, { method: "POST" }),
  });

  const saveVersion = useMutation({
    mutationFn: () => apiFetch(`/api/world-editor/${worldId}/versions`, { method: "POST", body: JSON.stringify({ label: "Manual save" }) }),
  });

  const handleRename = () => {
    if (!nameVal.trim()) return;
    updateWorld.mutate({ name: nameVal.trim() });
    setEditName(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!world) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">World not found</p>
        <Button className="mt-4" onClick={() => nav("/world-editor-dashboard")}>Back to Dashboard</Button>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    draft: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
    published: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    archived: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => nav("/world-editor-dashboard")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            {editName ? (
              <div className="flex items-center gap-2">
                <input
                  autoFocus
                  className="bg-background border border-border rounded px-2 py-1 text-xl font-bold focus:outline-none focus:ring-1 focus:ring-primary"
                  value={nameVal}
                  onChange={(e) => setNameVal(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleRename(); if (e.key === "Escape") setEditName(false); }}
                />
                <Button size="sm" onClick={handleRename}>Save</Button>
                <Button size="sm" variant="ghost" onClick={() => setEditName(false)}>Cancel</Button>
              </div>
            ) : (
              <h1
                className="text-3xl font-bold cursor-pointer hover:text-primary transition-colors"
                onClick={() => { setNameVal(world.name); setEditName(true); }}
                title="Click to rename"
              >
                {world.name}
              </h1>
            )}
            <div className="flex items-center gap-2 mt-1">
              <Badge className={`text-xs border ${statusColors[world.status] ?? "bg-zinc-500/20 text-zinc-400"}`}>
                {world.status}
              </Badge>
              <span className="text-xs text-muted-foreground capitalize">{world.worldType} · {world.environment}</span>
              <span className="text-xs text-muted-foreground">v{world.version}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => saveVersion.mutate()} disabled={saveVersion.isPending}>
            <Save className="w-4 h-4 mr-1" /> Save Version
          </Button>
          <Button variant="outline" size="sm" onClick={() => validateWorld.mutate()}>
            <CheckCircle className="w-4 h-4 mr-1" /> Validate
          </Button>
          <Button variant="outline" size="sm" onClick={() => previewWorld.mutate()}>
            <Eye className="w-4 h-4 mr-1" /> Preview
          </Button>
          {world.status !== "published" && (
            <Button size="sm" onClick={() => publishWorld.mutate()}>
              <Star className="w-4 h-4 mr-1" /> Publish
            </Button>
          )}
        </div>
      </div>

      {validateWorld.data && (
        <Card className={`border ${validateWorld.data.valid ? "border-emerald-500/30 bg-emerald-500/5" : "border-red-500/30 bg-red-500/5"}`}>
          <CardContent className="py-3 px-4">
            <div className="flex items-center gap-2 mb-2">
              {validateWorld.data.valid
                ? <CheckCircle className="w-4 h-4 text-emerald-400" />
                : <AlertTriangle className="w-4 h-4 text-red-400" />}
              <span className="text-sm font-medium">
                {validateWorld.data.valid ? "World is valid" : `${validateWorld.data.errors.length} error(s) found`}
              </span>
            </div>
            {validateWorld.data.errors.map((e: any) => (
              <p key={e.code} className="text-xs text-red-400">• {e.message}</p>
            ))}
            {validateWorld.data.warnings.map((w: any) => (
              <p key={w.code} className="text-xs text-yellow-400">⚠ {w.message}</p>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Regions", value: stats?.regionCount ?? regions.length, icon: Globe },
          { label: "Spawnpoints", value: stats?.spawnpointCount ?? 0, icon: MapPin },
          { label: "Portals", value: stats?.portalCount ?? 0, icon: Zap },
          { label: "Layers", value: stats?.layerCount ?? layers.length, icon: Layers },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center gap-2">
                <s.icon className="w-5 h-5 text-primary/70" />
                <div>
                  <p className="text-xl font-bold">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="regions" onClick={() => nav(`/world-regions/${worldId}`)}>Regions</TabsTrigger>
          <TabsTrigger value="layers" onClick={() => nav(`/world-layers/${worldId}`)}>Layers</TabsTrigger>
          <TabsTrigger value="environment" onClick={() => nav(`/world-environment/${worldId}`)}>Environment</TabsTrigger>
          <TabsTrigger value="spawns" onClick={() => nav(`/world-spawn-manager/${worldId}`)}>Spawns</TabsTrigger>
          <TabsTrigger value="portals" onClick={() => nav(`/world-portal-manager/${worldId}`)}>Portals</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-base">World Info</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Name</span><span>{world.name}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Type</span><span className="capitalize">{world.worldType}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Environment</span><span className="capitalize">{world.environment}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Visibility</span><span className="capitalize">{world.visibility}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Version</span><span>v{world.version}</span></div>
                {world.seed && <div className="flex justify-between"><span className="text-muted-foreground">Seed</span><span className="font-mono text-xs">{world.seed}</span></div>}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Quick Actions</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {[
                  { label: "Manage Regions", icon: Globe, path: `/world-regions/${worldId}` },
                  { label: "Edit Layers", icon: Layers, path: `/world-layers/${worldId}` },
                  { label: "Environment Settings", icon: Sun, path: `/world-environment/${worldId}` },
                  { label: "Weather Editor", icon: Cloud, path: `/world-weather/${worldId}` },
                  { label: "Lighting Settings", icon: Zap, path: `/world-lighting/${worldId}` },
                  { label: "Spawn Manager", icon: MapPin, path: `/world-spawn-manager/${worldId}` },
                  { label: "Portal Manager", icon: Navigation, path: `/world-portal-manager/${worldId}` },
                  { label: "Navigation Mesh", icon: Navigation, path: `/world-navigation/${worldId}` },
                  { label: "Import / Export", icon: Copy, path: `/world-import-export/${worldId}` },
                  { label: "Statistics", icon: History, path: `/world-statistics/${worldId}` },
                ].map((action) => (
                  <Button
                    key={action.path}
                    variant="ghost"
                    className="w-full justify-start text-sm h-9"
                    onClick={() => nav(action.path)}
                  >
                    <action.icon className="w-4 h-4 mr-2 text-primary/70" />
                    {action.label}
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
