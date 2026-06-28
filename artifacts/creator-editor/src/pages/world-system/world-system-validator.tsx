import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ShieldCheck, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");

interface Issue { field: string; message: string; severity: "error" | "warning" }

export default function WorldSystemValidator() {
  const [worldId, setWorldId] = useState("");
  const [result, setResult] = useState<{ valid: boolean; issues: Issue[] } | null>(null);

  const { data: worlds } = useQuery<{ items: Record<string, unknown>[] }>({
    queryKey: ["/api/world-system"],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/world-system?limit=100`, { headers: { Authorization: `Bearer ${token()}` } });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const validateMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${BASE}/api/world-system/${worldId}/validate`, { headers: { Authorization: `Bearer ${token()}` } });
      if (!res.ok) throw new Error("Failed");
      return res.json() as Promise<{ valid: boolean; issues: Issue[] }>;
    },
    onSuccess: (data) => setResult(data),
  });

  const errors = result?.issues.filter(i => i.severity === "error") ?? [];
  const warnings = result?.issues.filter(i => i.severity === "warning") ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><ShieldCheck className="w-6 h-6 text-green-500" />World Validator</h1>
        <p className="text-muted-foreground">Check world configuration for issues.</p>
      </div>
      <div className="flex gap-4 items-end">
        <div className="flex-1 max-w-xs space-y-1"><Label>Select World</Label>
          <Select value={worldId} onValueChange={v => { setWorldId(v); setResult(null); }}>
            <SelectTrigger><SelectValue placeholder="Choose a world..." /></SelectTrigger>
            <SelectContent>{(worlds?.items ?? []).map(w => <SelectItem key={String(w.id)} value={String(w.id)}>{String(w.name)}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <Button disabled={!worldId || validateMutation.isPending} onClick={() => validateMutation.mutate()}>
          <ShieldCheck className="w-4 h-4 mr-2" />{validateMutation.isPending ? "Validating…" : "Validate"}
        </Button>
      </div>
      {result && (
        <div className="space-y-4">
          <Card className={result.valid ? "border-green-500/50" : "border-red-500/50"}>
            <CardContent className="py-4 flex items-center gap-3">
              {result.valid ? <CheckCircle className="w-6 h-6 text-green-500" /> : <XCircle className="w-6 h-6 text-red-500" />}
              <div>
                <div className="font-semibold">{result.valid ? "Validation Passed" : "Validation Failed"}</div>
                <div className="text-sm text-muted-foreground">{errors.length} error{errors.length !== 1 ? "s" : ""}, {warnings.length} warning{warnings.length !== 1 ? "s" : ""}</div>
              </div>
            </CardContent>
          </Card>
          {result.issues.length > 0 && (
            <Card><CardHeader><CardTitle>Issues</CardTitle></CardHeader><CardContent className="space-y-2">
              {result.issues.map((issue, i) => (
                <div key={i} className="flex items-start gap-3 py-2 border-b border-border last:border-0">
                  {issue.severity === "error" ? <XCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" /> : <AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />}
                  <div className="flex items-center gap-2 flex-1">
                    <Badge variant={issue.severity === "error" ? "destructive" : "secondary"} className="text-xs">{issue.field}</Badge>
                    <span className="text-sm">{issue.message}</span>
                  </div>
                </div>
              ))}
            </CardContent></Card>
          )}
          {result.valid && result.issues.length === 0 && <Card><CardContent className="py-6 text-center text-green-500 font-medium">No issues found. World is properly configured!</CardContent></Card>}
        </div>
      )}
    </div>
  );
}
