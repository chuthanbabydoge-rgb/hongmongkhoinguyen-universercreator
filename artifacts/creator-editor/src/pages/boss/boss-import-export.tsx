import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Download, Upload, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");

export default function BossImportExport() {
  const { toast } = useToast();
  const [bossId, setBossId] = useState("");
  const [importPayload, setImportPayload] = useState("");
  const [exportResult, setExportResult] = useState("");

  const { data: bosses } = useQuery<{ items: Record<string, unknown>[] }>({
    queryKey: ["/api/bosses"],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/bosses?limit=100`, { headers: { Authorization: `Bearer ${token()}` } });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const exportJson = useMutation({
    mutationFn: async () => {
      if (!bossId) throw new Error("Select a boss");
      const res = await fetch(`${BASE}/api/bosses/${bossId}/export/json`, { method: "POST", headers: { Authorization: `Bearer ${token()}` } });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: (data) => { setExportResult(JSON.stringify(data.payload, null, 2)); toast({ title: "Exported", description: `Checksum: ${data.checksum.substring(0, 16)}...` }); },
    onError: (e) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const exportPackage = useMutation({
    mutationFn: async () => {
      if (!bossId) throw new Error("Select a boss");
      const res = await fetch(`${BASE}/api/bosses/${bossId}/export/package`, { method: "POST", headers: { Authorization: `Bearer ${token()}` } });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: (data) => { setExportResult(JSON.stringify(data.payload, null, 2)); toast({ title: "Package exported", description: `Checksum: ${data.checksum.substring(0, 16)}...` }); },
    onError: (e) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const importJson = useMutation({
    mutationFn: async () => {
      if (!bossId) throw new Error("Select a boss");
      const payload = JSON.parse(importPayload);
      const res = await fetch(`${BASE}/api/bosses/import`, { method: "POST", headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" }, body: JSON.stringify({ bossId: Number(bossId), payload }) });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: (data) => {
      if (data.ok) { toast({ title: "Imported successfully" }); }
      else { toast({ title: "Import errors", description: data.errors?.join(", "), variant: "destructive" }); }
    },
    onError: (e) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Package className="w-6 h-6 text-purple-500" />Import / Export</h1>
        <p className="text-muted-foreground">Export bosses as JSON or full packages, and import them back.</p>
      </div>

      <div className="max-w-xs">
        <Label>Select Boss</Label>
        <Select value={bossId} onValueChange={setBossId}>
          <SelectTrigger><SelectValue placeholder="Choose a boss..." /></SelectTrigger>
          <SelectContent>
            {(bosses?.items ?? []).map((b: Record<string, unknown>) => (
              <SelectItem key={String(b.id)} value={String(b.id)}>{String(b.name)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="export">
        <TabsList>
          <TabsTrigger value="export">Export</TabsTrigger>
          <TabsTrigger value="import">Import</TabsTrigger>
        </TabsList>

        <TabsContent value="export" className="space-y-4 mt-4">
          <div className="flex gap-3">
            <Button variant="outline" disabled={!bossId || exportJson.isPending} onClick={() => exportJson.mutate()}>
              <Download className="w-4 h-4 mr-2" />Export JSON
            </Button>
            <Button variant="outline" disabled={!bossId || exportPackage.isPending} onClick={() => exportPackage.mutate()}>
              <Package className="w-4 h-4 mr-2" />Export Package
            </Button>
          </div>
          {exportResult && (
            <Card>
              <CardHeader><CardTitle className="text-sm">Export Result</CardTitle></CardHeader>
              <CardContent>
                <Textarea rows={12} readOnly value={exportResult} className="font-mono text-xs" />
                <Button className="mt-2" size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(exportResult); toast({ title: "Copied to clipboard" }); }}>Copy</Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="import" className="space-y-4 mt-4">
          <Card>
            <CardHeader><CardTitle>Import JSON</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label>Paste JSON payload</Label>
                <Textarea rows={10} className="font-mono text-xs" value={importPayload} onChange={e => setImportPayload(e.target.value)} placeholder='{"type": "boss_json", "version": 1, "data": {...}}' />
              </div>
              <Button disabled={!bossId || !importPayload || importJson.isPending} onClick={() => importJson.mutate()}>
                <Upload className="w-4 h-4 mr-2" />Import
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
