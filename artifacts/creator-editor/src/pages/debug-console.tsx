import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Terminal, AlertCircle, AlertTriangle, Bug } from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const auth = () => ({ Authorization: `Bearer ${localStorage.getItem("creator_token")}` });
async function apiFetch(path: string) {
  const res = await fetch(`${BASE}${path}`, { headers: auth() });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export default function DebugConsole() {
  const { id } = useParams<{ id: string }>();
  const sessionId = Number(id);

  const { data: logData } = useQuery({
    queryKey: ["/api/runtime", sessionId, "logs-debug"],
    queryFn: () => apiFetch(`/api/runtime/${sessionId}/logs?limit=200`),
    refetchInterval: 2000,
  });

  const { data: errData } = useQuery({
    queryKey: ["/api/runtime", sessionId, "errors"],
    queryFn: () => apiFetch(`/api/runtime/${sessionId}/logs?limit=200`),
    refetchInterval: 2000,
  });

  const logs: any[] = logData?.items ?? [];
  const allErrors = logs.filter((l: any) => l.level === "error" || l.level === "fatal");
  const allWarns = logs.filter((l: any) => l.level === "warn");

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Bug className="w-6 h-6" />Debug Console</h1>
        <p className="text-muted-foreground text-sm">Session #{sessionId} · Debugging and error tracking</p>
      </div>

      <div className="flex gap-4">
        <Card className="flex-1 p-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Total Logs</span>
            <span className="ml-auto font-bold">{logs.length}</span>
          </div>
        </Card>
        <Card className="flex-1 p-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span className="text-sm font-medium">Errors</span>
            <span className="ml-auto font-bold text-red-400">{allErrors.length}</span>
          </div>
        </Card>
        <Card className="flex-1 p-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-medium">Warnings</span>
            <span className="ml-auto font-bold text-yellow-400">{allWarns.length}</span>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="console">
        <TabsList>
          <TabsTrigger value="console">Console</TabsTrigger>
          <TabsTrigger value="errors">Errors {allErrors.length > 0 && <Badge className="ml-1 bg-red-500/20 text-red-400 text-xs">{allErrors.length}</Badge>}</TabsTrigger>
          <TabsTrigger value="warnings">Warnings {allWarns.length > 0 && <Badge className="ml-1 bg-yellow-500/20 text-yellow-400 text-xs">{allWarns.length}</Badge>}</TabsTrigger>
        </TabsList>

        {[
          { key: "console", entries: logs, emptyMsg: "No console output yet." },
          { key: "errors", entries: allErrors, emptyMsg: "No errors — runtime is clean." },
          { key: "warnings", entries: allWarns, emptyMsg: "No warnings." },
        ].map(({ key, entries, emptyMsg }) => (
          <TabsContent key={key} value={key} className="mt-4">
            <Card>
              <CardContent className="p-4">
                {entries.length === 0 ? (
                  <p className="text-muted-foreground text-sm font-mono">{emptyMsg}</p>
                ) : (
                  <div className="font-mono text-xs space-y-0.5 max-h-[55vh] overflow-y-auto">
                    {entries.map((l: any) => (
                      <div key={l.id} className={`flex items-start gap-2 p-1.5 rounded hover:bg-secondary/30 ${l.level === "error" || l.level === "fatal" ? "text-red-400" : l.level === "warn" ? "text-yellow-300" : "text-foreground"}`}>
                        <span className="uppercase text-[9px] font-bold w-8 shrink-0 mt-0.5 opacity-70">{l.level}</span>
                        <span className="text-muted-foreground w-8 shrink-0">{l.tick}</span>
                        {l.system && <span className="text-primary/60 shrink-0">[{l.system}]</span>}
                        <span className="flex-1 break-all">{l.message}</span>
                        <span className="text-muted-foreground/40 shrink-0 text-[10px]">{new Date(l.createdAt).toLocaleTimeString()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
