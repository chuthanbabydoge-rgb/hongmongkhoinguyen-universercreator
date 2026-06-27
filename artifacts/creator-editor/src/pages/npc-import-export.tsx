import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Download, Upload, Package, FileJson } from "lucide-react";
import { useState } from "react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const auth = () => ({ Authorization: `Bearer ${localStorage.getItem("creator_token")}` });
async function apiFetch(path: string, init?: RequestInit) {
  const res = await fetch(`${BASE}${path}`, { ...init, headers: { ...auth(), "Content-Type": "application/json", ...(init?.headers ?? {}) } });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export default function NpcImportExport() {
  const [, nav] = useLocation();
  const qc = useQueryClient();
  const [importJson, setImportJson] = useState("");
  const [importName, setImportName] = useState("");
  const [exportResult, setExportResult] = useState<string | null>(null);
  const [selectedNpcId, setSelectedNpcId] = useState<string>("");

  const { data: npcs = [] } = useQuery({ queryKey: ["/api/npc-editor"], queryFn: () => apiFetch("/api/npc-editor?limit=100") });

  const importNpc = useMutation({
    mutationFn: (data: Record<string, unknown>) => apiFetch("/api/npc-editor/import", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: (n: any) => { qc.invalidateQueries({ queryKey: ["/api/npc-editor"] }); nav(`/npc-editor/${n.id}`); },
  });

  const exportNpc = useMutation({
    mutationFn: (npcId: number) => apiFetch(`/api/npc-editor/${npcId}/export`, { method: "POST", body: JSON.stringify({ format: "json" }) }),
    onSuccess: (result: any) => setExportResult(JSON.stringify(result.data, null, 2)),
  });

  const handleImport = () => {
    if (!importJson.trim()) return;
    importNpc.mutate({ data: importJson, nameOverride: importName || undefined });
  };

  const downloadExport = () => {
    if (!exportResult) return;
    const blob = new Blob([exportResult], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "npc-export.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Package className="w-6 h-6 text-primary" /> NPC Import / Export</h1>
        <p className="text-muted-foreground text-sm mt-1">Backup and share NPC configurations</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Download className="w-4 h-4" /> Export NPC</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Select NPC to export</label>
              <select className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm" value={selectedNpcId} onChange={(e) => setSelectedNpcId(e.target.value)}>
                <option value="">Choose NPC…</option>
                {(npcs as any[]).map((n: any) => <option key={n.id} value={n.id}>{n.name}</option>)}
              </select>
            </div>
            <Button className="w-full" disabled={!selectedNpcId || exportNpc.isPending} onClick={() => exportNpc.mutate(Number(selectedNpcId))}>
              <FileJson className="w-4 h-4 mr-2" /> Export as JSON
            </Button>
            {exportResult && (
              <div>
                <Textarea value={exportResult} readOnly rows={8} className="text-xs font-mono" />
                <Button variant="outline" size="sm" className="mt-2 w-full" onClick={downloadExport}>
                  <Download className="w-3 h-3 mr-1" /> Download JSON File
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Upload className="w-4 h-4" /> Import NPC</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Name override (optional)</label>
              <Input placeholder="Leave blank to use original name" value={importName} onChange={(e) => setImportName(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Paste JSON data</label>
              <Textarea
                placeholder='{"npc": {"name": "...", ...}}'
                value={importJson}
                onChange={(e) => setImportJson(e.target.value)}
                rows={8}
                className="text-xs font-mono"
              />
            </div>
            <Button className="w-full" disabled={!importJson.trim() || importNpc.isPending} onClick={handleImport}>
              <Upload className="w-4 h-4 mr-2" /> Import NPC
            </Button>
            {importNpc.isError && <p className="text-xs text-destructive">{String(importNpc.error)}</p>}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">About NPC Packages</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>• <strong className="text-foreground">JSON Export</strong> — Exports a single NPC with all its sub-data (profile, stats, behaviors, dialogues, inventory, etc.).</p>
            <p>• <strong className="text-foreground">Template Export</strong> — Saves an NPC as a reusable template in the template library. Do this from the NPC editor page.</p>
            <p>• <strong className="text-foreground">JSON Import</strong> — Paste a previously exported NPC JSON to recreate it in your project.</p>
            <p>• <strong className="text-foreground">Template Import</strong> — Use the NPC Templates page to instantiate a template as a new NPC.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
