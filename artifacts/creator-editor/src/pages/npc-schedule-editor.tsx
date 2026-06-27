import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Calendar, Plus, Trash2, Save, Clock } from "lucide-react";
import { useState } from "react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const auth = () => ({ Authorization: `Bearer ${localStorage.getItem("creator_token")}` });
async function apiFetch(path: string, init?: RequestInit) {
  const res = await fetch(`${BASE}${path}`, { ...init, headers: { ...auth(), "Content-Type": "application/json", ...(init?.headers ?? {}) } });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

type ScheduleEntry = { hour: number; activity: string; location?: string; notes?: string };

export default function NpcScheduleEditor() {
  const { id } = useParams<{ id: string }>();
  const npcId = Number(id);
  const qc = useQueryClient();
  const [entries, setEntries] = useState<ScheduleEntry[]>([]);
  const [loaded, setLoaded] = useState(false);

  const { data: npc } = useQuery({ queryKey: ["/api/npc-editor", npcId], queryFn: () => apiFetch(`/api/npc-editor/${npcId}`) });
  const { data: schedule } = useQuery({
    queryKey: ["/api/npc-editor", npcId, "schedule"],
    queryFn: () => apiFetch(`/api/npc-editor/${npcId}/schedule`),
    onSuccess: (d: any) => { if (!loaded) { setEntries((d?.entries as ScheduleEntry[]) ?? []); setLoaded(true); } },
  });

  const updateSchedule = useMutation({
    mutationFn: (data: Record<string, unknown>) => apiFetch(`/api/npc-editor/${npcId}/schedule`, { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/npc-editor", npcId, "schedule"] }),
  });

  const addEntry = () => setEntries([...entries, { hour: 8, activity: "idle" }]);
  const removeEntry = (i: number) => setEntries(entries.filter((_, j) => j !== i));
  const updateEntry = (i: number, field: keyof ScheduleEntry, value: string | number) => {
    const updated = [...entries];
    updated[i] = { ...updated[i], [field]: value };
    setEntries(updated.sort((a, b) => a.hour - b.hour));
  };
  const save = () => updateSchedule.mutate({ entries });

  const HOURS = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Calendar className="w-6 h-6 text-primary" /> Schedule Editor</h1>
          <p className="text-muted-foreground text-sm mt-1">{npc?.name ?? `NPC #${npcId}`}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={addEntry}><Plus className="w-4 h-4 mr-2" /> Add Entry</Button>
          <Button onClick={save} disabled={updateSchedule.isPending}><Save className="w-4 h-4 mr-2" /> Save</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Daily Schedule</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {entries.length === 0 ? (
              <div className="py-8 text-center">
                <Calendar className="w-10 h-10 mx-auto text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">No schedule entries. Add entries to define daily routine.</p>
              </div>
            ) : (
              entries.map((entry, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg">
                  <select className="w-20 bg-background border border-border rounded px-2 py-1.5 text-sm" value={entry.hour} onChange={(e) => updateEntry(i, "hour", Number(e.target.value))}>
                    {HOURS.map((h) => <option key={h} value={h}>{String(h).padStart(2, "0")}:00</option>)}
                  </select>
                  <Input className="flex-1" placeholder="Activity..." value={entry.activity} onChange={(e) => updateEntry(i, "activity", e.target.value)} />
                  <Input className="flex-1" placeholder="Location..." value={entry.location ?? ""} onChange={(e) => updateEntry(i, "location", e.target.value)} />
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive shrink-0" onClick={() => removeEntry(i)}><Trash2 className="w-3 h-3" /></Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Timeline Preview</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-1">
              {HOURS.map((h) => {
                const entry = entries.find((e) => e.hour === h);
                return (
                  <div key={h} className={`flex items-center gap-3 py-1.5 px-2 rounded text-sm ${entry ? "bg-primary/10 border border-primary/20" : "text-muted-foreground/30"}`}>
                    <Clock className="w-3 h-3 shrink-0" />
                    <span className="w-12 font-mono text-xs">{String(h).padStart(2, "0")}:00</span>
                    {entry ? (
                      <span className="text-xs capitalize">{entry.activity}{entry.location ? ` @ ${entry.location}` : ""}</span>
                    ) : (
                      <span className="text-xs">—</span>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
