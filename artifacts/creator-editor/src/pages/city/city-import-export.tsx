import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Download, Upload, FileJson, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");
const headers = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${token()}` });

export default function CityImportExport() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [selectedCityId, setSelectedCityId] = useState<number | null>(null);
  const [importJson, setImportJson] = useState("");
  const [exportResult, setExportResult] = useState<string | null>(null);

  const { data: citiesData } = useQuery<{ items: Record<string, unknown>[] }>({
    queryKey: ["/api/cities"],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/cities`, { headers: headers() });
      if (!res.ok) throw new Error("Failed to load cities");
      return res.json();
    },
  });

  const { data: exports = [] } = useQuery<Record<string, unknown>[]>({
    queryKey: [`/api/cities/${selectedCityId}/exports`],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/cities/${selectedCityId}/exports`, { headers: headers() });
      if (!res.ok) throw new Error("Failed to load exports");
      return res.json();
    },
    enabled: !!selectedCityId,
  });

  const { data: imports = [] } = useQuery<Record<string, unknown>[]>({
    queryKey: [`/api/cities/${selectedCityId}/imports`],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/cities/${selectedCityId}/imports`, { headers: headers() });
      if (!res.ok) throw new Error("Failed to load imports");
      return res.json();
    },
    enabled: !!selectedCityId,
  });

  const exportJsonMut = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${BASE}/api/cities/${selectedCityId}/export/json`, { method: "POST", headers: headers(), body: JSON.stringify({}) });
      if (!res.ok) throw new Error("Export failed");
      return res.json();
    },
    onSuccess: (data) => {
      setExportResult(JSON.stringify(data.payload, null, 2));
      qc.invalidateQueries({ queryKey: [`/api/cities/${selectedCityId}/exports`] });
      toast({ title: "City exported as JSON" });
    },
    onError: () => toast({ title: "Error", description: "Export failed", variant: "destructive" }),
  });

  const exportPkgMut = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${BASE}/api/cities/${selectedCityId}/export/package`, { method: "POST", headers: headers(), body: JSON.stringify({}) });
      if (!res.ok) throw new Error("Export failed");
      return res.json();
    },
    onSuccess: (data) => {
      setExportResult(JSON.stringify(data.payload, null, 2));
      qc.invalidateQueries({ queryKey: [`/api/cities/${selectedCityId}/exports`] });
      toast({ title: "City exported as package" });
    },
    onError: () => toast({ title: "Error", description: "Export failed", variant: "destructive" }),
  });

  const importMut = useMutation({
    mutationFn: async () => {
      const payload = JSON.parse(importJson);
      const res = await fetch(`${BASE}/api/cities/import`, { method: "POST", headers: headers(), body: JSON.stringify({ cityId: selectedCityId, payload }) });
      if (!res.ok) throw new Error("Import failed");
      return res.json();
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: [`/api/cities/${selectedCityId}/imports`] });
      setImportJson("");
      if (data.errors?.length) toast({ title: "Partial import", description: `${data.errors.length} errors`, variant: "destructive" });
      else toast({ title: "Import successful" });
    },
    onError: () => toast({ title: "Error", description: "Import failed — check JSON format", variant: "destructive" }),
  });

  const cities = citiesData?.items ?? [];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold flex items-center gap-2"><Package className="w-6 h-6 text-blue-500" /> City Import / Export</h1>

      <Card>
        <CardHeader><CardTitle>Select City</CardTitle></CardHeader>
        <CardContent>
          <select className="w-full border rounded px-3 py-2 text-sm bg-background" value={selectedCityId ?? ""} onChange={(e) => setSelectedCityId(Number(e.target.value))}>
            <option value="">-- Select a city --</option>
            {cities.map((c: Record<string, unknown>) => (
              <option key={String(c.id)} value={String(c.id)}>{String(c.name)}</option>
            ))}
          </select>
        </CardContent>
      </Card>

      {selectedCityId && (
        <Tabs defaultValue="export">
          <TabsList><TabsTrigger value="export">Export</TabsTrigger><TabsTrigger value="import">Import</TabsTrigger><TabsTrigger value="history">History</TabsTrigger></TabsList>

          <TabsContent value="export" className="space-y-4 mt-4">
            <div className="flex gap-2">
              <Button onClick={() => exportJsonMut.mutate()} disabled={exportJsonMut.isPending}><FileJson className="w-4 h-4 mr-2" />Export JSON</Button>
              <Button variant="outline" onClick={() => exportPkgMut.mutate()} disabled={exportPkgMut.isPending}><Package className="w-4 h-4 mr-2" />Export Package</Button>
            </div>
            {exportResult && (
              <Card>
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm">Export Result</CardTitle>
                  <Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(exportResult); toast({ title: "Copied to clipboard" }); }}>Copy</Button>
                </CardHeader>
                <CardContent>
                  <Textarea value={exportResult} readOnly rows={12} className="font-mono text-xs" />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="import" className="space-y-4 mt-4">
            <Card>
              <CardHeader><CardTitle className="text-sm">Import JSON</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <Textarea placeholder="Paste city JSON data here..." value={importJson} onChange={(e) => setImportJson(e.target.value)} rows={12} className="font-mono text-xs" />
                <Button onClick={() => importMut.mutate()} disabled={importMut.isPending || !importJson.trim()}><Upload className="w-4 h-4 mr-2" />Import</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4 mt-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Export History ({exports.length})</h3>
              {exports.length === 0 ? <p className="text-sm text-muted-foreground">No exports yet.</p> : (
                <div className="space-y-1">
                  {exports.map((e: Record<string, unknown>) => (
                    <Card key={String(e.id)}>
                      <CardContent className="py-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="capitalize">{String(e.exportType)}</Badge>
                          <code className="text-xs text-muted-foreground">{String(e.checksum).slice(0, 12)}...</code>
                        </div>
                        <span className="text-xs text-muted-foreground">{new Date(String(e.createdAt)).toLocaleDateString()}</span>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
            <div>
              <h3 className="text-sm font-medium mb-2">Import History ({imports.length})</h3>
              {imports.length === 0 ? <p className="text-sm text-muted-foreground">No imports yet.</p> : (
                <div className="space-y-1">
                  {imports.map((i: Record<string, unknown>) => (
                    <Card key={String(i.id)}>
                      <CardContent className="py-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant={i.status === "success" ? "default" : i.status === "partial" ? "secondary" : "destructive"} className="capitalize">{String(i.status)}</Badge>
                          <Badge variant="outline" className="capitalize">{String(i.importType)}</Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">{new Date(String(i.createdAt)).toLocaleDateString()}</span>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
