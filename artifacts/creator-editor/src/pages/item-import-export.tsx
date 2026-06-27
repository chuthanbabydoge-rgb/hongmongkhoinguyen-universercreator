import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useState } from "react";
import { Download, Upload, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");
const authFetch = (url: string, init: RequestInit = {}) =>
  fetch(`${BASE}${url}`, { ...init, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}`, ...(init.headers ?? {}) } });

type Item = { id: number; name: string; itemType: string; rarity: string };

export default function ItemImportExport() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [importJson, setImportJson] = useState("");
  const [importName, setImportName] = useState("");
  const [exportPayload, setExportPayload] = useState("");
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);

  const { data: items = [] } = useQuery<Item[]>({
    queryKey: ["/api/item-editor"],
    queryFn: () => authFetch("/api/item-editor?limit=200").then((r) => r.json()),
  });

  const exportMutation = useMutation({
    mutationFn: (id: number) => authFetch(`/api/item-editor/${id}/export`, { method: "POST" }).then((r) => r.json()),
    onSuccess: (res: { payload: string }) => {
      setExportPayload(res.payload);
      toast({ title: "Exported", description: "Item exported to JSON." });
    },
    onError: () => toast({ title: "Error", description: "Failed to export item", variant: "destructive" }),
  });

  const importMutation = useMutation({
    mutationFn: () => authFetch("/api/item-editor/import", { method: "POST", body: JSON.stringify({ data: importJson, nameOverride: importName || undefined }) }).then((r) => r.json()),
    onSuccess: (res: { item: { id: number } }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/item-editor"] });
      toast({ title: "Imported", description: "Item imported successfully." });
      setImportJson("");
      setImportName("");
      if (res.item?.id) setLocation(`/item-editor/${res.item.id}`);
    },
    onError: () => toast({ title: "Error", description: "Failed to import item", variant: "destructive" }),
  });

  const copyToClipboard = () => {
    navigator.clipboard.writeText(exportPayload);
    toast({ title: "Copied", description: "JSON copied to clipboard." });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Import / Export</h1>
      <p className="text-muted-foreground text-sm">Transfer items between projects or share them with other creators.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Download className="w-4 h-4" />Export Item</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div><label className="text-xs text-muted-foreground">Select Item</label>
              <select className="mt-1 w-full bg-background border border-input rounded-md px-3 py-2 text-sm"
                value={selectedItemId ?? ""} onChange={(e) => setSelectedItemId(Number(e.target.value) || null)}>
                <option value="">— choose an item —</option>
                {items.map((i) => <option key={i.id} value={i.id}>{i.name} (#{i.id})</option>)}
              </select>
            </div>
            <Button onClick={() => selectedItemId && exportMutation.mutate(selectedItemId)} disabled={!selectedItemId || exportMutation.isPending} className="w-full">
              <Download className="w-4 h-4 mr-2" />Export to JSON
            </Button>
            {exportPayload && (
              <>
                <Textarea value={exportPayload} readOnly className="font-mono text-xs resize-none h-40" />
                <Button variant="outline" size="sm" onClick={copyToClipboard} className="w-full">Copy to Clipboard</Button>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Upload className="w-4 h-4" />Import Item</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div><label className="text-xs text-muted-foreground">Name Override (optional)</label>
              <Input className="mt-1" placeholder="Leave blank to use exported name" value={importName} onChange={(e) => setImportName(e.target.value)} /></div>
            <div><label className="text-xs text-muted-foreground">JSON Payload</label>
              <Textarea className="mt-1 font-mono text-xs resize-none h-40" placeholder='Paste exported JSON here...' value={importJson} onChange={(e) => setImportJson(e.target.value)} /></div>
            <Button onClick={() => importMutation.mutate()} disabled={!importJson.trim() || importMutation.isPending} className="w-full">
              <Upload className="w-4 h-4 mr-2" />Import Item
            </Button>
          </CardContent>
        </Card>
      </div>

      {!!items.length && (
        <Card>
          <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Package className="w-4 h-4" />All Items ({items.length})</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-sm py-1 border-b border-border last:border-0">
                  <span>{item.name} <span className="text-muted-foreground text-xs">#{item.id}</span></span>
                  <span className="text-muted-foreground text-xs capitalize">{item.rarity} {item.itemType.replace("_", " ")}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
