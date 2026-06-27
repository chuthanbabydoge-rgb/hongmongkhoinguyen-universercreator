import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { CheckCircle, AlertCircle, AlertTriangle, Zap, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");
const authFetch = (url: string, init: RequestInit = {}) =>
  fetch(`${BASE}${url}`, { ...init, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}`, ...(init.headers ?? {}) } });

type Skill = { id: number; name: string; skillType: string };
type Issue = { code: string; message: string };
type ValidationResult = { valid: boolean; errors: Issue[]; warnings: Issue[] };

export default function SkillValidatorPage() {
  const { toast } = useToast();
  const [selectedId, setSelectedId] = useState<number>(0);
  const [result, setResult] = useState<ValidationResult | null>(null);

  const { data: skills = [] } = useQuery<Skill[]>({
    queryKey: ["/api/skills"],
    queryFn: () => authFetch("/api/skills?limit=200").then((r) => r.json()),
  });

  const validateMutation = useMutation({
    mutationFn: () => authFetch(`/api/skills/${selectedId}/validate`, { method: "POST" }).then((r) => r.json()),
    onSuccess: (res: ValidationResult) => {
      setResult(res);
      toast({ title: res.valid ? "Validation passed" : "Validation failed", variant: res.valid ? "default" : "destructive" });
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Skill Validator</h1>
        <p className="text-muted-foreground text-sm mt-1">Check skills for configuration errors before publishing</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm">Select Skill</CardTitle></CardHeader>
        <CardContent className="flex gap-3">
          <select value={selectedId} onChange={e => setSelectedId(Number(e.target.value))}
            className="flex-1 bg-background border border-input rounded-md px-3 py-2 text-sm">
            <option value={0}>— Choose a skill —</option>
            {skills.map(s => <option key={s.id} value={s.id}>{s.name} ({s.skillType})</option>)}
          </select>
          <Button onClick={() => validateMutation.mutate()} disabled={!selectedId || validateMutation.isPending}>
            <ShieldCheck className="w-4 h-4 mr-2" />Validate
          </Button>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-4">
          <div className={`flex items-center gap-3 p-4 rounded-lg border ${result.valid ? "border-green-500/40 bg-green-500/10" : "border-red-500/40 bg-red-500/10"}`}>
            {result.valid ? <CheckCircle className="w-5 h-5 text-green-400" /> : <AlertCircle className="w-5 h-5 text-red-400" />}
            <div>
              <p className={`font-medium ${result.valid ? "text-green-400" : "text-red-400"}`}>
                {result.valid ? "All checks passed" : `${result.errors.length} error${result.errors.length !== 1 ? "s" : ""} found`}
              </p>
              <p className="text-xs text-muted-foreground">{result.warnings.length} warning{result.warnings.length !== 1 ? "s" : ""}</p>
            </div>
          </div>

          {result.errors.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-sm flex items-center gap-2 text-red-400"><AlertCircle className="w-4 h-4" />Errors</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {result.errors.map((e, i) => (
                  <div key={i} className="flex items-start gap-3 p-2 rounded bg-red-500/5 text-sm">
                    <Badge variant="destructive" className="text-xs shrink-0 mt-0.5">{e.code}</Badge>
                    <span>{e.message}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {result.warnings.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-sm flex items-center gap-2 text-yellow-400"><AlertTriangle className="w-4 h-4" />Warnings</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {result.warnings.map((w, i) => (
                  <div key={i} className="flex items-start gap-3 p-2 rounded bg-yellow-500/5 text-sm">
                    <Badge variant="outline" className="text-xs shrink-0 mt-0.5 text-yellow-400 border-yellow-500/40">{w.code}</Badge>
                    <span>{w.message}</span>
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
