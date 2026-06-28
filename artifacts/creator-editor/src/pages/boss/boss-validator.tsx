import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ShieldAlert, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");

interface ValidationIssue {
  field: string;
  message: string;
  severity: "error" | "warning";
}

export default function BossValidator() {
  const [bossId, setBossId] = useState("");
  const [result, setResult] = useState<{ valid: boolean; issues: ValidationIssue[] } | null>(null);

  const { data: bosses } = useQuery<{ items: Record<string, unknown>[] }>({
    queryKey: ["/api/bosses"],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/bosses?limit=100`, { headers: { Authorization: `Bearer ${token()}` } });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const validateMutation = useMutation({
    mutationFn: async () => {
      if (!bossId) throw new Error("Select a boss");
      const res = await fetch(`${BASE}/api/bosses/${bossId}/validate`, { headers: { Authorization: `Bearer ${token()}` } });
      if (!res.ok) throw new Error("Failed");
      return res.json() as Promise<{ valid: boolean; issues: ValidationIssue[] }>;
    },
    onSuccess: (data) => setResult(data),
  });

  const errors = result?.issues.filter(i => i.severity === "error") ?? [];
  const warnings = result?.issues.filter(i => i.severity === "warning") ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><ShieldAlert className="w-6 h-6 text-orange-500" />Boss Validator</h1>
        <p className="text-muted-foreground">Check for configuration issues, missing data, and design problems.</p>
      </div>

      <div className="flex gap-4 items-end">
        <div className="space-y-1 flex-1 max-w-xs">
          <Label>Select Boss</Label>
          <Select value={bossId} onValueChange={v => { setBossId(v); setResult(null); }}>
            <SelectTrigger><SelectValue placeholder="Choose a boss..." /></SelectTrigger>
            <SelectContent>
              {(bosses?.items ?? []).map((b: Record<string, unknown>) => (
                <SelectItem key={String(b.id)} value={String(b.id)}>{String(b.name)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button disabled={!bossId || validateMutation.isPending} onClick={() => validateMutation.mutate()}>
          <ShieldAlert className="w-4 h-4 mr-2" />{validateMutation.isPending ? "Validating..." : "Validate"}
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
            <Card>
              <CardHeader><CardTitle>Issues Found</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {result.issues.map((issue, i) => (
                  <div key={i} className="flex items-start gap-3 py-2 border-b border-border last:border-0">
                    {issue.severity === "error"
                      ? <XCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                      : <AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={issue.severity === "error" ? "destructive" : "secondary"} className="text-xs">{issue.field}</Badge>
                        <span className="text-sm">{issue.message}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {result.valid && result.issues.length === 0 && (
            <Card><CardContent className="py-6 text-center text-green-500 font-medium">No issues found. Boss is properly configured!</CardContent></Card>
          )}
        </div>
      )}
    </div>
  );
}
