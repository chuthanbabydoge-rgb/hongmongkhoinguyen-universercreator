import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Download, Upload, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");
const authFetch = (url: string, opts?: RequestInit) =>
  fetch(url, { ...opts, headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json", ...opts?.headers } });

export default function BuildingImportExport() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [templateName, setTemplateName] = useState("");

  const { data: exports = [] } = useQuery<Record<string, unknown>[]>({
    queryKey: [`/api/buildings/${id}/exports`],
    queryFn: async () => {
      const res = await authFetch(`${BASE}/api/buildings/${id}/exports`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: !!id,
  });

  const { data: imports = [] } = useQuery<Record<string, unknown>[]>({
    queryKey: [`/api/buildings/${id}/imports`],
    queryFn: async () => {
      const res = await authFetch(`${BASE}/api/buildings/${id}/imports`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: !!id,
  });

  const exportJsonMutation = useMutation({
    mutationFn: async () => {
      const res = await authFetch(`${BASE}/api/buildings/${id}/export/json`, { method: "POST" });
      if (!res.ok) throw new Error("Failed");
      const d = await res.json();
      const blob = new Blob([JSON.stringify(d.payload, null, 2)], { type: "application/json" });
      const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `building-${id}.json`; a.click();
      return d;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: [`/api/buildings/${id}/exports`] }); toast({ title: "Exported as JSON" }); },
    onError: () => toast({ title: "Error", variant: "destructive" }),
  });

  const exportTemplateMutation = useMutation({
    mutationFn: async () => {
      const res = await authFetch(`${BASE}/api/buildings/${id}/export/template`, { method: "POST", body: JSON.stringify({ name: templateName, description: "" }) });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => { setTemplateName(""); qc.invalidateQueries({ queryKey: [`/api/buildings/${id}/exports`] }); toast({ title: "Template saved" }); },
    onError: () => toast({ title: "Error", variant: "destructive" }),
  });

  const exportPackageMutation = useMutation({
    mutationFn: async () => {
      const res = await authFetch(`${BASE}/api/buildings/${id}/export/package`, { method: "POST" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: [`/api/buildings/${id}/exports`] }); toast({ title: "Package exported" }); },
    onError: () => toast({ title: "Error", variant: "destructive" }),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3"><Download className="w-6 h-6 text-orange-500" /><h1 className="text-2xl font-bold">Import / Export</h1></div>
      <Tabs defaultValue="export">
        <TabsList>
          <TabsTrigger value="export"><Download className="w-3 h-3 mr-1" />Export</TabsTrigger>
          <TabsTrigger value="import"><Upload className="w-3 h-3 mr-1" />Import</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>
        <TabsContent value="export" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-sm">JSON Export</CardTitle></CardHeader>
              <CardContent><Button className="w-full" onClick={() => exportJsonMutation.mutate()} disabled={exportJsonMutation.isPending}><Download className="w-4 h-4 mr-2" />Download JSON</Button></CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-sm">Save as Template</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                <Input placeholder="Template name" value={templateName} onChange={e => setTemplateName(e.target.value)} />
                <Button className="w-full" onClick={() => exportTemplateMutation.mutate()} disabled={exportTemplateMutation.isPending || !templateName}>Save Template</Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-sm">Export Package</CardTitle></CardHeader>
              <CardContent><Button className="w-full" variant="outline" onClick={() => exportPackageMutation.mutate()} disabled={exportPackageMutation.isPending}><Package className="w-4 h-4 mr-2" />Export Package</Button></CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="import" className="mt-4">
          <Card><CardContent className="py-8 text-center text-muted-foreground">Upload a JSON or package file to import a building configuration.</CardContent></Card>
        </TabsContent>
        <TabsContent value="history" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle>Exports ({exports.length})</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {exports.slice(0, 5).map((e: Record<string, unknown>) => (
                  <div key={String(e.id)} className="flex items-center justify-between p-2 border rounded text-sm">
                    <span className="capitalize">{String(e.format)}</span>
                    <span className="text-xs text-muted-foreground">{new Date(String(e.createdAt)).toLocaleDateString()}</span>
                  </div>
                ))}
                {exports.length === 0 && <div className="text-muted-foreground text-sm">No exports yet.</div>}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Imports ({imports.length})</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {imports.slice(0, 5).map((i: Record<string, unknown>) => (
                  <div key={String(i.id)} className="flex items-center justify-between p-2 border rounded text-sm">
                    <span className="capitalize">{String(i.format)}</span>
                    <span className="text-xs text-muted-foreground">{String(i.status)}</span>
                  </div>
                ))}
                {imports.length === 0 && <div className="text-muted-foreground text-sm">No imports yet.</div>}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
