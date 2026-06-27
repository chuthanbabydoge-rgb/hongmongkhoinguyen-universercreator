import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ShieldCheck, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");
const authFetch = (url: string, init: RequestInit = {}) =>
  fetch(`${BASE}${url}`, { ...init, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}`, ...(init.headers ?? {}) } });

type Quest = { id: number; name: string };
type ValidationResult = { valid: boolean; errors: Array<{ code: string; message: string }>; warnings: Array<{ code: string; message: string }> };

export default function QuestValidatorPage() {
  const [selectedId, setSelectedId] = useState<string>("");
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [loading, setLoading] = useState(false);

  const { data: quests = [] } = useQuery<Quest[]>({
    queryKey: ["/api/quest-editor"],
    queryFn: () => authFetch("/api/quest-editor?limit=100").then(r => r.json()),
  });

  const validate = async () => {
    if (!selectedId) return;
    setLoading(true);
    const r = await authFetch(`/api/quest-editor/${selectedId}/validate`, { method: "POST", body: JSON.stringify({}) });
    setResult(await r.json());
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Quest Validator</h1><p className="text-muted-foreground text-sm">Validate quest integrity before publishing</p></div>

      <Card><CardContent className="pt-4">
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="text-xs text-muted-foreground mb-1 block">Select Quest</label>
            <Select value={selectedId} onValueChange={setSelectedId}>
              <SelectTrigger><SelectValue placeholder="Select a quest to validate..." /></SelectTrigger>
              <SelectContent>{quests.map(q => <SelectItem key={q.id} value={String(q.id)}>{q.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <Button disabled={!selectedId || loading} onClick={validate}><ShieldCheck className="w-4 h-4 mr-2" />{loading ? "Validating..." : "Validate"}</Button>
        </div>
      </CardContent></Card>

      {result && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            {result.valid ? <CheckCircle className="w-6 h-6 text-green-500" /> : <XCircle className="w-6 h-6 text-destructive" />}
            <span className="text-lg font-semibold">{result.valid ? "Quest is valid and ready to publish" : "Quest has issues that must be resolved"}</span>
          </div>

          {result.errors.length > 0 && (
            <Card className="border-destructive/50">
              <CardHeader><CardTitle className="text-sm text-destructive flex items-center gap-2"><XCircle className="w-4 h-4" />Errors ({result.errors.length})</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {result.errors.map((e, i) => (
                  <div key={i} className="p-3 rounded bg-destructive/10 flex items-start gap-2">
                    <Badge variant="destructive" className="text-xs shrink-0">{e.code}</Badge>
                    <span className="text-sm">{e.message}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {result.warnings.length > 0 && (
            <Card className="border-yellow-500/30">
              <CardHeader><CardTitle className="text-sm text-yellow-500 flex items-center gap-2"><AlertTriangle className="w-4 h-4" />Warnings ({result.warnings.length})</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {result.warnings.map((w, i) => (
                  <div key={i} className="p-3 rounded bg-yellow-500/10 flex items-start gap-2">
                    <Badge variant="outline" className="text-xs text-yellow-500 shrink-0">{w.code}</Badge>
                    <span className="text-sm">{w.message}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {result.valid && result.warnings.length === 0 && (
            <Card><CardContent className="pt-4 text-center text-muted-foreground py-8"><CheckCircle className="w-10 h-10 mx-auto mb-2 text-green-500" /><p>No issues found. Quest is ready!</p></CardContent></Card>
          )}
        </div>
      )}
    </div>
  );
}
