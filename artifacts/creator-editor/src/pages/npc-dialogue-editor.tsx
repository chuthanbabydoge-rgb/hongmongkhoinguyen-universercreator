import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Plus, Trash2, ChevronRight, Save } from "lucide-react";
import { useState } from "react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const auth = () => ({ Authorization: `Bearer ${localStorage.getItem("creator_token")}` });
async function apiFetch(path: string, init?: RequestInit) {
  const res = await fetch(`${BASE}${path}`, { ...init, headers: { ...auth(), "Content-Type": "application/json", ...(init?.headers ?? {}) } });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

const DIALOGUE_TYPES = ["greeting","quest","trade","combat","ambient","lore","farewell","custom"];

export default function NpcDialogueEditor() {
  const { id } = useParams<{ id: string }>();
  const npcId = Number(id);
  const qc = useQueryClient();
  const [selectedDialogue, setSelectedDialogue] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState("greeting");
  const [newNodeText, setNewNodeText] = useState("");
  const [newNodeKey, setNewNodeKey] = useState("");

  const { data: npc } = useQuery({ queryKey: ["/api/npc-editor", npcId], queryFn: () => apiFetch(`/api/npc-editor/${npcId}`) });
  const { data: dialogues = [] } = useQuery({ queryKey: ["/api/npc-editor", npcId, "dialogues"], queryFn: () => apiFetch(`/api/npc-editor/${npcId}/dialogues`) });
  const { data: nodes = [] } = useQuery({
    queryKey: ["/api/npc-editor", npcId, "dialogues", selectedDialogue, "nodes"],
    queryFn: () => selectedDialogue ? apiFetch(`/api/npc-editor/${npcId}/dialogues/${selectedDialogue}/nodes`) : Promise.resolve([]),
    enabled: !!selectedDialogue,
  });

  const createDialogue = useMutation({
    mutationFn: (data: Record<string, unknown>) => apiFetch(`/api/npc-editor/${npcId}/dialogues`, { method: "POST", body: JSON.stringify(data) }),
    onSuccess: (d: any) => { qc.invalidateQueries({ queryKey: ["/api/npc-editor", npcId, "dialogues"] }); setSelectedDialogue(d.id); setCreating(false); setNewName(""); },
  });

  const deleteDialogue = useMutation({
    mutationFn: (dId: number) => apiFetch(`/api/npc-editor/${npcId}/dialogues/${dId}`, { method: "DELETE" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/npc-editor", npcId, "dialogues"] }); setSelectedDialogue(null); },
  });

  const createNode = useMutation({
    mutationFn: (data: Record<string, unknown>) => apiFetch(`/api/npc-editor/${npcId}/dialogues/${selectedDialogue}/nodes`, { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/npc-editor", npcId, "dialogues", selectedDialogue, "nodes"] }); setNewNodeText(""); setNewNodeKey(""); },
  });

  const deleteNode = useMutation({
    mutationFn: (nodeId: number) => apiFetch(`/api/npc-editor/${npcId}/dialogues/${selectedDialogue}/nodes/${nodeId}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/npc-editor", npcId, "dialogues", selectedDialogue, "nodes"] }),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><MessageSquare className="w-6 h-6 text-primary" /> Dialogue Editor</h1>
          <p className="text-muted-foreground text-sm mt-1">{npc?.name ?? `NPC #${npcId}`}</p>
        </div>
        <Button onClick={() => setCreating(true)}><Plus className="w-4 h-4 mr-2" /> Add Dialogue</Button>
      </div>

      {creating && (
        <Card className="border-primary/50">
          <CardContent className="pt-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="Dialogue name" value={newName} onChange={(e) => setNewName(e.target.value)} />
              <select className="bg-background border border-border rounded-md px-3 py-2 text-sm" value={newType} onChange={(e) => setNewType(e.target.value)}>
                {DIALOGUE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => createDialogue.mutate({ name: newName, dialogueType: newType, isDefault: (dialogues as any[]).length === 0 })} disabled={!newName || createDialogue.isPending}>Create</Button>
              <Button variant="ghost" onClick={() => setCreating(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Dialogues</h2>
          {(dialogues as any[]).length === 0 ? (
            <Card><CardContent className="py-8 text-center"><MessageSquare className="w-8 h-8 mx-auto text-muted-foreground/30 mb-2" /><p className="text-xs text-muted-foreground">No dialogues</p></CardContent></Card>
          ) : (
            (dialogues as any[]).map((d: any) => (
              <Card key={d.id} className={`cursor-pointer transition-colors ${selectedDialogue === d.id ? "border-primary" : "hover:border-primary/40"}`} onClick={() => setSelectedDialogue(d.id)}>
                <CardContent className="py-3 px-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{d.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{d.dialogueType}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {d.isDefault && <Badge className="text-xs bg-primary/20 text-primary border-primary/30">Default</Badge>}
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={(e) => { e.stopPropagation(); deleteDialogue.mutate(d.id); }}><Trash2 className="w-3 h-3" /></Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <div className="lg:col-span-2">
          {!selectedDialogue ? (
            <Card><CardContent className="py-16 text-center"><MessageSquare className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" /><p className="text-muted-foreground">Select a dialogue to edit nodes</p></CardContent></Card>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Dialogue Nodes ({(nodes as any[]).length})</h2>
                <Button size="sm" onClick={() => { if (!newNodeKey) { setNewNodeKey(`node_${Date.now()}`); } }}><Plus className="w-3 h-3 mr-1" /> Add Node</Button>
              </div>

              {newNodeKey && (
                <Card className="border-primary/50">
                  <CardContent className="pt-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <Input placeholder="Node key (unique)" value={newNodeKey} onChange={(e) => setNewNodeKey(e.target.value)} />
                      <Input placeholder="Speaker (npc/player)" defaultValue="npc" />
                    </div>
                    <Textarea placeholder="Dialogue text..." value={newNodeText} onChange={(e) => setNewNodeText(e.target.value)} rows={2} />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => createNode.mutate({ nodeKey: newNodeKey, text: newNodeText, isStart: (nodes as any[]).length === 0 })} disabled={!newNodeText || createNode.isPending}>Save Node</Button>
                      <Button size="sm" variant="ghost" onClick={() => { setNewNodeKey(""); setNewNodeText(""); }}>Cancel</Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-2">
                {(nodes as any[]).map((node: any) => (
                  <Card key={node.id}>
                    <CardContent className="py-3 px-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <code className="text-xs bg-muted/40 px-1.5 py-0.5 rounded">{node.nodeKey}</code>
                            {node.isStart && <Badge className="text-xs bg-blue-500/20 text-blue-400 border-blue-500/30">Start</Badge>}
                            {node.isEnd && <Badge className="text-xs bg-red-500/20 text-red-400 border-red-500/30">End</Badge>}
                          </div>
                          <p className="text-sm">{node.text}</p>
                          <p className="text-xs text-muted-foreground mt-1 capitalize">Speaker: {node.speaker}</p>
                        </div>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive shrink-0" onClick={() => deleteNode.mutate(node.id)}><Trash2 className="w-3 h-3" /></Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
