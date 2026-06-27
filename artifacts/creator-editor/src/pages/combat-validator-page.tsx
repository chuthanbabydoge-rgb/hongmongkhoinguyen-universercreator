import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ShieldAlert, CheckCircle, XCircle, AlertTriangle, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");
const apiFetch = (path: string, opts?: RequestInit) =>
  fetch(`${BASE}${path}`, { ...opts, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}`, ...opts?.headers } });

type Issue = { code: string; message: string };
type ValResult = { valid: boolean; errors: Issue[]; warnings: Issue[] };

export default function CombatValidatorPage() {
  const [selectedCombat, setSelectedCombat] = useState("");
  const [result, setResult] = useState<ValResult | null>(null);
  const [loading, setLoading] = useState(false);

  const { data: combatList } = useQuery({
    queryKey: ["/api/combat"],
    queryFn: () => apiFetch("/api/combat?limit=50").then(r => r.json()),
  });

  const validate = async () => {
    if (!selectedCombat) return;
    setLoading(true);
    try {
      const r = await apiFetch(`/api/combat/${selectedCombat}/validate`, { method: "POST" });
      setResult(await r.json());
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <ShieldAlert className="w-6 h-6 text-red-400" />
        <div>
          <h1 className="text-2xl font-bold">Combat Validator</h1>
          <p className="text-muted-foreground">Validate combat definitions for errors and warnings</p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6 flex gap-4 items-end">
          <div className="flex-1">
            <Label>Select Combat</Label>
            <Select value={selectedCombat} onValueChange={setSelectedCombat}>
              <SelectTrigger><SelectValue placeholder="Choose a combat…" /></SelectTrigger>
              <SelectContent>
                {(combatList?.items ?? []).map((c: { id: number; name: string }) => (
                  <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={validate} disabled={!selectedCombat || loading}>
            <Play className="w-4 h-4 mr-2" />{loading ? "Validating…" : "Validate"}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-4">
          <div className={`flex items-center gap-3 p-4 rounded-lg border ${result.valid ? "border-green-500/30 bg-green-500/5" : "border-destructive/30 bg-destructive/5"}`}>
            {result.valid ? <CheckCircle className="w-6 h-6 text-green-500" /> : <XCircle className="w-6 h-6 text-destructive" />}
            <div>
              <p className="font-semibold">{result.valid ? "Validation Passed" : "Validation Failed"}</p>
              <p className="text-sm text-muted-foreground">{result.errors.length} error(s), {result.warnings.length} warning(s)</p>
            </div>
          </div>

          {result.errors.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-destructive flex items-center gap-2"><XCircle className="w-4 h-4" />Errors ({result.errors.length})</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {result.errors.map((e, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-destructive/5 rounded border border-destructive/20">
                    <Badge variant="destructive" className="text-xs shrink-0">{e.code}</Badge>
                    <p className="text-sm">{e.message}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {result.warnings.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-yellow-500 flex items-center gap-2"><AlertTriangle className="w-4 h-4" />Warnings ({result.warnings.length})</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {result.warnings.map((w, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-yellow-500/5 rounded border border-yellow-500/20">
                    <Badge className="text-xs shrink-0 bg-yellow-500/20 text-yellow-500 border-yellow-500/30">{w.code}</Badge>
                    <p className="text-sm">{w.message}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
