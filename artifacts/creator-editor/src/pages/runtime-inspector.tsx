import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Layers, Component, Settings2, ChevronDown, ChevronRight } from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const auth = () => ({ Authorization: `Bearer ${localStorage.getItem("creator_token")}` });
async function apiFetch(path: string) {
  const res = await fetch(`${BASE}${path}`, { headers: auth() });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export default function RuntimeInspector() {
  const { id } = useParams<{ id: string }>();
  const sessionId = Number(id);
  const [selected, setSelected] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  const { data: entityData } = useQuery({
    queryKey: ["/api/runtime", sessionId, "entities"],
    queryFn: () => apiFetch(`/api/runtime/${sessionId}/entities?limit=200`),
    refetchInterval: 3000,
  });

  const { data: componentData } = useQuery({
    queryKey: ["/api/runtime", sessionId, "components"],
    queryFn: () => apiFetch(`/api/runtime/${sessionId}/components?limit=500`),
    refetchInterval: 5000,
    enabled: selected !== null,
  });

  const entities: any[] = (entityData?.items ?? []).filter((e: any) =>
    !search || e.name?.toLowerCase().includes(search.toLowerCase()) || e.tag?.toLowerCase().includes(search.toLowerCase())
  );

  const selectedEntity = entities.find((e: any) => e.id === selected);
  const entityComponents = (componentData?.items ?? []).filter((c: any) => c.entityId === selected);

  const toggleExpand = (id: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Settings2 className="w-6 h-6" />Runtime Inspector</h1>
        <p className="text-muted-foreground text-sm">Session #{sessionId} · Inspect entities and components</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[70vh]">
        {/* Entity Hierarchy */}
        <Card className="flex flex-col overflow-hidden">
          <CardHeader className="pb-2 shrink-0">
            <CardTitle className="text-sm flex items-center gap-2"><Layers className="w-4 h-4" />Hierarchy ({entities.length})</CardTitle>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
              <Input placeholder="Search entities…" className="pl-8 h-7 text-xs" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-2">
            {entities.length === 0 ? (
              <p className="text-muted-foreground text-xs p-2">No entities. Start the runtime engine first.</p>
            ) : entities.filter((e: any) => !e.parentId).map((e: any) => (
              <div key={e.id}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`w-full justify-start text-xs h-7 ${selected === e.id ? "bg-secondary/80" : ""}`}
                  onClick={() => { setSelected(e.id); }}
                >
                  <span className="mr-1 opacity-50">
                    {entities.some((c: any) => c.parentId === e.id)
                      ? (expanded.has(e.id) ? <ChevronDown className="w-3 h-3 inline" /> : <ChevronRight className="w-3 h-3 inline" />)
                      : "  "}
                  </span>
                  {e.name}
                  {e.tag && <Badge variant="outline" className="ml-auto text-[9px] h-4">{e.tag}</Badge>}
                </Button>
                {expanded.has(e.id) && entities.filter((c: any) => c.parentId === e.id).map((child: any) => (
                  <Button
                    key={child.id}
                    variant="ghost"
                    size="sm"
                    className={`w-full justify-start text-xs h-7 pl-6 ${selected === child.id ? "bg-secondary/80" : ""}`}
                    onClick={() => setSelected(child.id)}
                  >
                    {child.name}
                  </Button>
                ))}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Inspector Panel */}
        <div className="md:col-span-2 flex flex-col gap-4 overflow-y-auto">
          {!selectedEntity ? (
            <Card className="flex-1">
              <CardContent className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <Settings2 className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>Select an entity to inspect</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">Entity: {selectedEntity.name}</CardTitle></CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      ["ID", selectedEntity.id],
                      ["UUID", selectedEntity.entityUuid?.slice(0, 12) + "…"],
                      ["Layer", selectedEntity.layer],
                      ["Tag", selectedEntity.tag ?? "—"],
                      ["Enabled", selectedEntity.enabled ? "Yes" : "No"],
                      ["Destroyed", selectedEntity.destroyed ? "Yes" : "No"],
                    ].map(([k, v]) => (
                      <div key={k as string} className="flex justify-between text-xs p-2 bg-secondary/30 rounded">
                        <span className="text-muted-foreground">{k}</span>
                        <span className="font-mono">{v as string}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-2">
                    <p className="text-xs font-semibold mb-2 text-muted-foreground">Transform</p>
                    {["position", "rotation", "scale"].map((axis) => {
                      const t = selectedEntity.transform?.[axis] ?? { x: 0, y: 0, z: 0 };
                      return (
                        <div key={axis} className="flex items-center gap-2 text-xs mb-1">
                          <span className="w-16 capitalize text-muted-foreground">{axis}</span>
                          {["x", "y", "z"].map((k) => (
                            <span key={k} className="flex-1 font-mono bg-secondary/30 rounded px-2 py-1">
                              <span className="text-muted-foreground">{k}:</span> {(t[k] ?? 0).toFixed(2)}
                            </span>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Component className="w-4 h-4" />Components ({entityComponents.length})</CardTitle></CardHeader>
                <CardContent>
                  {entityComponents.length === 0 ? (
                    <p className="text-muted-foreground text-xs">No components attached.</p>
                  ) : entityComponents.map((c: any) => (
                    <div key={c.id} className="mb-3 border border-border rounded-lg overflow-hidden">
                      <div className="flex items-center justify-between px-3 py-2 bg-secondary/30 cursor-pointer" onClick={() => toggleExpand(c.id)}>
                        <span className="text-sm font-medium capitalize">{c.type.replace("_", " ")}</span>
                        <Badge className={`text-xs ${c.enabled ? "bg-emerald-500/20 text-emerald-400" : "bg-zinc-500/20 text-zinc-400"}`}>
                          {c.enabled ? "enabled" : "disabled"}
                        </Badge>
                      </div>
                      {expanded.has(c.id) && (
                        <div className="p-3 text-xs font-mono">
                          <pre className="text-muted-foreground overflow-auto">{JSON.stringify(c.data, null, 2)}</pre>
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
