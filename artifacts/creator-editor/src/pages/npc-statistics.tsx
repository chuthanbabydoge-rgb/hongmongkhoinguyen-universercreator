import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart2, Bot, Sword, Backpack, Brain, MessageSquare, MapPin, Route, Users, History, GitBranch } from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const auth = () => ({ Authorization: `Bearer ${localStorage.getItem("creator_token")}` });
async function apiFetch(path: string) {
  const res = await fetch(`${BASE}${path}`, { headers: auth() });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export default function NpcStatistics() {
  const { id } = useParams<{ id: string }>();
  const npcId = Number(id);

  const { data: npc } = useQuery({ queryKey: ["/api/npc-editor", npcId], queryFn: () => apiFetch(`/api/npc-editor/${npcId}`) });
  const { data: stats, isLoading } = useQuery({ queryKey: ["/api/npc-editor", npcId, "statistics"], queryFn: () => apiFetch(`/api/npc-editor/${npcId}/statistics`) });
  const { data: combatStats } = useQuery({ queryKey: ["/api/npc-editor", npcId, "stats"], queryFn: () => apiFetch(`/api/npc-editor/${npcId}/stats`) });
  const { data: attributes } = useQuery({ queryKey: ["/api/npc-editor", npcId, "attributes"], queryFn: () => apiFetch(`/api/npc-editor/${npcId}/attributes`) });

  const counters = [
    { label: "Skills", value: stats?.skillCount, icon: Sword, color: "text-blue-400" },
    { label: "Inventory Items", value: stats?.inventoryCount, icon: Backpack, color: "text-yellow-400" },
    { label: "Behaviors", value: stats?.behaviorCount, icon: Brain, color: "text-purple-400" },
    { label: "Dialogues", value: stats?.dialogueCount, icon: MessageSquare, color: "text-emerald-400" },
    { label: "Spawn Points", value: stats?.spawnCount, icon: MapPin, color: "text-red-400" },
    { label: "Patrol Paths", value: stats?.patrolCount, icon: Route, color: "text-orange-400" },
    { label: "Relations", value: stats?.relationCount, icon: Users, color: "text-cyan-400" },
    { label: "Versions", value: stats?.versionCount, icon: GitBranch, color: "text-pink-400" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><BarChart2 className="w-6 h-6 text-primary" /> NPC Statistics</h1>
        <p className="text-muted-foreground text-sm mt-1">{npc?.name ?? `NPC #${npcId}`}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {counters.map((c) => (
          <Card key={c.label}>
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center gap-3">
                <c.icon className={`w-7 h-7 ${c.color}`} />
                <div>
                  <p className="text-2xl font-bold">{isLoading ? "…" : c.value ?? 0}</p>
                  <p className="text-xs text-muted-foreground">{c.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Combat Stats</CardTitle></CardHeader>
          <CardContent>
            {combatStats ? (
              <div className="space-y-3">
                {[
                  ["HP", combatStats.maxHp, combatStats.maxHp],
                  ["MP", combatStats.maxMp, combatStats.maxMp],
                  ["Attack", combatStats.attackPower, 200],
                  ["Defense", combatStats.defense, 200],
                  ["Speed", combatStats.speed, 10],
                ].map(([label, val, max]) => (
                  <div key={label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="font-mono">{val}</span>
                    </div>
                    <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${Math.min(100, (Number(val) / Number(max)) * 100)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : <p className="text-sm text-muted-foreground">Loading…</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Attributes</CardTitle></CardHeader>
          <CardContent>
            {attributes ? (
              <div className="space-y-3">
                {[
                  ["Strength", attributes.strength],
                  ["Dexterity", attributes.dexterity],
                  ["Intelligence", attributes.intelligence],
                  ["Wisdom", attributes.wisdom],
                  ["Charisma", attributes.charisma],
                  ["Constitution", attributes.constitution],
                ].map(([label, val]) => (
                  <div key={label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="font-mono">{val}</span>
                    </div>
                    <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${Math.min(100, (Number(val) / 30) * 100)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : <p className="text-sm text-muted-foreground">Loading…</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
