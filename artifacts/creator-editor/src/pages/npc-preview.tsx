import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, Eye, Brain, MessageSquare, Zap, MapPin } from "lucide-react";
import { useState } from "react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const auth = () => ({ Authorization: `Bearer ${localStorage.getItem("creator_token")}` });
async function apiFetch(path: string, init?: RequestInit) {
  const res = await fetch(`${BASE}${path}`, { ...init, headers: { ...auth(), "Content-Type": "application/json", ...(init?.headers ?? {}) } });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export default function NpcPreview() {
  const { id } = useParams<{ id: string }>();
  const npcId = Number(id);
  const [previewData, setPreviewData] = useState<Record<string, unknown> | null>(null);
  const [previewMode, setPreviewMode] = useState<string | null>(null);

  const { data: npc } = useQuery({ queryKey: ["/api/npc-editor", npcId], queryFn: () => apiFetch(`/api/npc-editor/${npcId}`) });

  const previewNpc = useMutation({
    mutationFn: (mode: string) => {
      const urls: Record<string, string> = {
        main: `/api/npc-editor/${npcId}/preview`,
        behavior: `/api/npc-editor/${npcId}/preview/behavior`,
        dialogue: `/api/npc-editor/${npcId}/preview/dialogue`,
        animation: `/api/npc-editor/${npcId}/preview/animation`,
        spawn: `/api/npc-editor/${npcId}/preview/spawn`,
      };
      return apiFetch(urls[mode]!, { method: "POST", body: JSON.stringify({}) });
    },
    onSuccess: (data: any, mode: string) => { setPreviewData(data); setPreviewMode(mode); },
  });

  const PREVIEW_MODES = [
    { id: "main", label: "Full Preview", icon: Eye, desc: "Complete NPC overview" },
    { id: "behavior", label: "Behavior", icon: Brain, desc: "Behavior tree state" },
    { id: "dialogue", label: "Dialogue", icon: MessageSquare, desc: "Default dialogue tree" },
    { id: "animation", label: "Animation", icon: Zap, desc: "Current animation state" },
    { id: "spawn", label: "Spawn", icon: MapPin, desc: "Spawn point configuration" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Eye className="w-6 h-6 text-primary" /> NPC Preview</h1>
          <p className="text-muted-foreground text-sm mt-1">{npc?.name ?? `NPC #${npcId}`}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {PREVIEW_MODES.map((mode) => (
          <Button key={mode.id} variant={previewMode === mode.id ? "default" : "outline"} className="h-auto py-3 flex-col gap-1" onClick={() => previewNpc.mutate(mode.id)} disabled={previewNpc.isPending}>
            <mode.icon className="w-5 h-5" />
            <span className="text-xs font-medium">{mode.label}</span>
            <span className="text-[10px] text-muted-foreground">{mode.desc}</span>
          </Button>
        ))}
      </div>

      {previewData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Bot className="w-5 h-5 text-primary" />
                {previewMode === "main" ? "NPC Overview" : `${previewMode} Preview`}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {previewMode === "main" && (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      {[["Name", previewData["name"]], ["Type", previewData["npcType"]], ["State", previewData["state"]], ["Behavior", previewData["behavior"]], ["Level", previewData["level"]], ["Ready", previewData["ready"] ? "Yes" : "No"]].map(([k, v]) => (
                        <div key={String(k)} className="flex justify-between items-center p-2 bg-muted/20 rounded">
                          <span className="text-xs text-muted-foreground capitalize">{String(k)}</span>
                          <span className="text-sm font-medium capitalize">{String(v)}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
                {previewMode === "behavior" && (
                  <div className="space-y-2">
                    <p className="text-sm"><span className="text-muted-foreground">Current State:</span> <Badge variant="outline" className="capitalize">{String(previewData["currentState"])}</Badge></p>
                    <p className="text-sm text-muted-foreground">{(previewData["behaviors"] as unknown[])?.length ?? 0} behaviors · Tree: {(previewData["behaviorTree"] as any)?.name ?? "none"}</p>
                  </div>
                )}
                {previewMode === "dialogue" && previewData["dialogue"] && (
                  <div className="space-y-2">
                    <p className="font-medium text-sm">{(previewData["dialogue"] as any).name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{(previewData["dialogue"] as any).dialogueType}</p>
                    <p className="text-xs text-muted-foreground">{(previewData["dialogue"] as any).nodes?.length ?? 0} nodes</p>
                  </div>
                )}
                {previewMode === "animation" && (
                  <div className="space-y-2">
                    <p className="text-sm"><span className="text-muted-foreground">State:</span> <Badge variant="outline">{String(previewData["state"])}</Badge></p>
                    <p className="text-sm"><span className="text-muted-foreground">Animation:</span> <Badge variant="outline">{String(previewData["currentAnimation"])}</Badge></p>
                  </div>
                )}
                {previewMode === "spawn" && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">{String(previewData["name"])}</p>
                    <p className="text-xs text-muted-foreground">{(previewData["spawnPoints"] as unknown[])?.length ?? 0} spawn points configured</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Raw Data</CardTitle></CardHeader>
            <CardContent>
              <pre className="text-xs bg-muted/20 rounded p-3 overflow-auto max-h-96 font-mono">{JSON.stringify(previewData, null, 2)}</pre>
            </CardContent>
          </Card>
        </div>
      )}

      {!previewData && (
        <Card>
          <CardContent className="py-16 text-center">
            <Eye className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground">Select a preview mode above to inspect this NPC</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
