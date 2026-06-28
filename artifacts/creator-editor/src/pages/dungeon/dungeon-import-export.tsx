import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Download, Upload, FileJson, Package, BookOpen } from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");
function apiFetch(path: string, init?: RequestInit) {
  return fetch(`${BASE}${path}`, { ...init, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}`, ...(init?.headers ?? {}) } });
}

interface Dungeon { id: number; name: string; }

export default function DungeonImportExport() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [selectedDungeon, setSelectedDungeon] = useState<string>("");
  const [exportType, setExportType] = useState("json");
  const [importType, setImportType] = useState("json");
  const [importData, setImportData] = useState("");
  const [exportResult, setExportResult] = useState<Record<string, unknown> | null>(null);

  const { data: dungeons, isLoading } = useQuery<{ items: Dungeon[] }>({ queryKey: ["/api/dungeons"], queryFn: async () => { const r = await apiFetch("/api/dungeons?limit=100"); return r.json(); } });

  const exportMut = useMutation({
    mutationFn: async () => {
      if (!selectedDungeon) throw new Error("Select a dungeon first");
      const r = await apiFetch(`/api/dungeons/${selectedDungeon}/export`, { method: "POST", body: JSON.stringify({ type: exportType }) });
      return r.json();
    },
    onSuccess: (d) => { setExportResult(d); toast({ title: "Export successful" }); },
    onError: () => toast({ title: "Export failed", variant: "destructive" }),
  });

  const importMut = useMutation({
    mutationFn: async () => {
      const parsed = JSON.parse(importData);
      const r = await apiFetch("/api/dungeons/import", { method: "POST", body: JSON.stringify({ type: importType, data: parsed }) });
      return r.json();
    },
    onSuccess: (d) => { qc.invalidateQueries({ queryKey: ["/api/dungeons"] }); toast({ title: `Dungeon imported: ${d.name}` }); setImportData(""); window.location.href = `${BASE}/dungeon-editor/${d.id}`; },
    onError: () => toast({ title: "Import failed — invalid JSON or format", variant: "destructive" }),
  });

  const downloadExport = () => {
    if (!exportResult) return;
    const blob = new Blob([JSON.stringify(exportResult.payload, null, 2)], { type: "application/json" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `dungeon-export-${exportType}.json`; a.click();
  };

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Dungeon Import / Export</h1><p className="text-muted-foreground">Transfer dungeon data across projects</p></div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Download className="w-4 h-4" />Export Dungeon</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? <Skeleton className="h-10" /> : (
              <div className="space-y-1"><Label>Select Dungeon</Label>
                <Select value={selectedDungeon} onValueChange={setSelectedDungeon}>
                  <SelectTrigger><SelectValue placeholder="Select dungeon…" /></SelectTrigger>
                  <SelectContent>{(dungeons?.items ?? []).map((d) => <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-1"><Label>Export Format</Label>
              <Select value={exportType} onValueChange={setExportType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="json"><div className="flex items-center gap-2"><FileJson className="w-4 h-4" />JSON</div></SelectItem>
                  <SelectItem value="template"><div className="flex items-center gap-2"><BookOpen className="w-4 h-4" />Template</div></SelectItem>
                  <SelectItem value="package"><div className="flex items-center gap-2"><Package className="w-4 h-4" />Package (full)</div></SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full" onClick={() => exportMut.mutate()} disabled={!selectedDungeon || exportMut.isPending}><Download className="w-4 h-4 mr-2" />Export</Button>
            {exportResult && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2"><Badge variant="outline">SHA256</Badge><code className="text-xs truncate max-w-32">{String(exportResult.checksum ?? "").slice(0, 16)}…</code></div>
                  <Button size="sm" variant="outline" onClick={downloadExport}><Download className="w-3 h-3 mr-1" />Download</Button>
                </div>
                <Textarea readOnly value={JSON.stringify(exportResult.payload, null, 2)} rows={8} className="text-xs font-mono" />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Upload className="w-4 h-4" />Import Dungeon</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1"><Label>Import Format</Label>
              <Select value={importType} onValueChange={setImportType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="template">Template</SelectItem>
                  <SelectItem value="package">Package</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label>Paste JSON Data</Label><Textarea placeholder='{"dungeon": {...}, "rooms": [...], "bosses": [...]}' value={importData} onChange={(e) => setImportData(e.target.value)} rows={10} className="text-xs font-mono" /></div>
            <Button className="w-full" onClick={() => importMut.mutate()} disabled={!importData.trim() || importMut.isPending}><Upload className="w-4 h-4 mr-2" />Import</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
