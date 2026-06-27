import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download, Upload, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");
const apiFetch = (path: string, opts?: RequestInit) =>
  fetch(`${BASE}${path}`, { ...opts, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}`, ...opts?.headers } });

export default function CombatImportExport() {
  const { toast } = useToast();
  const [selectedCombat, setSelectedCombat] = useState("");
  const [exportPayload, setExportPayload] = useState("");
  const [importData, setImportData] = useState("");
  const [exportType, setExportType] = useState("json");

  const { data: combatList } = useQuery({ queryKey: ["/api/combat"], queryFn: () => apiFetch("/api/combat?limit=50").then(r => r.json()) });

  const doExport = async () => {
    if (!selectedCombat) return;
    const path = exportType === "template" ? "export/template" : exportType === "package" ? "export/package" : "export";
    const r = await apiFetch(`/api/combat/${selectedCombat}/${path}`, { method: "POST", body: JSON.stringify({ name: "exported" }) });
    const d = await r.json();
    setExportPayload(d.payload ?? JSON.stringify(d, null, 2));
    toast({ title: "Exported successfully" });
  };

  const doImport = async () => {
    if (!importData) return;
    const r = await apiFetch("/api/combat/import", { method: "POST", body: JSON.stringify({ data: importData }) });
    const d = await r.json();
    if (r.ok) toast({ title: "Imported", description: `Combat ID: ${d.combat?.id}` });
    else toast({ title: "Import failed", description: JSON.stringify(d), variant: "destructive" });
  };

  const download = () => {
    const blob = new Blob([exportPayload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `combat-export-${selectedCombat}.json`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Package className="w-6 h-6 text-red-400" />
        <div><h1 className="text-2xl font-bold">Combat Import / Export</h1><p className="text-muted-foreground">Transfer combat definitions between environments</p></div>
      </div>

      <Tabs defaultValue="export">
        <TabsList><TabsTrigger value="export"><Download className="w-4 h-4 mr-1" />Export</TabsTrigger><TabsTrigger value="import"><Upload className="w-4 h-4 mr-1" />Import</TabsTrigger></TabsList>

        <TabsContent value="export" className="space-y-4 mt-4">
          <Card>
            <CardHeader><CardTitle>Export Combat</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Combat</Label>
                <Select value={selectedCombat} onValueChange={setSelectedCombat}>
                  <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                  <SelectContent>{(combatList?.items ?? []).map((c: { id: number; name: string }) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Format</Label>
                <Select value={exportType} onValueChange={setExportType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="json">JSON</SelectItem><SelectItem value="template">Template</SelectItem><SelectItem value="package">Package</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button onClick={doExport} disabled={!selectedCombat}><Download className="w-4 h-4 mr-2" />Export</Button>
                {exportPayload && <Button variant="outline" onClick={download}><Package className="w-4 h-4 mr-2" />Download File</Button>}
              </div>
              {exportPayload && <Textarea value={exportPayload} readOnly rows={12} className="font-mono text-xs" />}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="import" className="space-y-4 mt-4">
          <Card>
            <CardHeader><CardTitle>Import Combat</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Paste JSON</Label>
                <Textarea value={importData} onChange={e => setImportData(e.target.value)} placeholder='{"format":"combat","combat":{…}}' rows={12} className="font-mono text-xs" />
              </div>
              <Button onClick={doImport} disabled={!importData}><Upload className="w-4 h-4 mr-2" />Import</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
