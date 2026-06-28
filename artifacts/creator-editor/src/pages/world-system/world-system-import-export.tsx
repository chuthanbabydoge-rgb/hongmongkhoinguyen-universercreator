import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Package, Download, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");

export default function WorldSystemImportExport() {
  const { toast } = useToast();
  const [worldId, setWorldId] = useState("");
  const [importPayload, setImportPayload] = useState("");
  const [exportResult, setExportResult] = useState("");

  const { data: worlds } = useQuery<{ items: Record<string, unknown>[] }>({
    queryKey: ["/api/world-system"],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/world-system?limit=100`, { headers: { Authorization: `Bearer ${token()}` } });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const exportMutation = useMutation({
    mutationFn: async () => {
      if (!worldId) throw new Error("Select a world");
      const res = await fetch(`${BASE}/api/world-system/${worldId}/export`, { method: "POST", headers: { Authorization: `Bearer ${token()}` } });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: (data) => {
      setExportResult(JSON.stringify(data.payload, null, 2));
      toast({ title: "Exported", description: `Checksum: ${String(data.checksum).substring(0, 16)}…` });
    },
    onError: (e) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const importMutation = useMutation({
    mutationFn: async () => {
      if (!worldId) throw new Error("Select a world");
      const payload = JSON.parse(importPayload);
      const res = await fetch(`${BASE}/api/world-system/${worldId}/import`, { method: "POST", headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" }, body: JSON.stringify({ payload }) });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: (data) => {
      if (data.ok) toast({ title: "Imported successfully" });
      else toast({ title: "Import errors", description: data.errors?.join(", "), variant: "destructive" });
    },
    onError: (e) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Package className="w-6 h-6 text-purple-500" />World Import / Export</h1>
        <p className="text-muted-foreground">Export world configurations and import them back.</p>
      </div>
      <div className="max-w-xs"><Label>Select World</Label>
        <Select value={worldId} onValueChange={setWorldId}>
          <SelectTrigger><SelectValue placeholder="Choose a world..." /></SelectTrigger>
          <SelectContent>{(worlds?.items ?? []).map(w => <SelectItem key={String(w.id)} value={String(w.id)}>{String(w.name)}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <Tabs defaultValue="export">
        <TabsList><TabsTrigger value="export">Export</TabsTrigger><TabsTrigger value="import">Import</TabsTrigger></TabsList>
        <TabsContent value="export" className="mt-4 space-y-4">
          <Button variant="outline" disabled={!worldId || exportMutation.isPending} onClick={() => exportMutation.mutate()}><Download className="w-4 h-4 mr-2" />Export World JSON</Button>
          {exportResult && <Card><CardHeader><CardTitle className="text-sm">Export Result</CardTitle></CardHeader><CardContent>
            <Textarea rows={12} readOnly value={exportResult} className="font-mono text-xs" />
            <Button className="mt-2" size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(exportResult); toast({ title: "Copied" }); }}>Copy</Button>
          </CardContent></Card>}
        </TabsContent>
        <TabsContent value="import" className="mt-4">
          <Card><CardHeader><CardTitle>Import JSON</CardTitle></CardHeader><CardContent className="space-y-4">
            <div className="space-y-1"><Label>Paste export payload</Label>
              <Textarea rows={10} className="font-mono text-xs" value={importPayload} onChange={e => setImportPayload(e.target.value)} placeholder='{"type": "world_system_export", "version": 1, ...}' />
            </div>
            <Button disabled={!worldId || !importPayload || importMutation.isPending} onClick={() => importMutation.mutate()}><Upload className="w-4 h-4 mr-2" />Import</Button>
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
