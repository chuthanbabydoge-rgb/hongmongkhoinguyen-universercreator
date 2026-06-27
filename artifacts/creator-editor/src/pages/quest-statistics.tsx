import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { BarChart2, Target, Gift, MessageSquare, GitBranch, CheckSquare, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");
const authFetch = (url: string, init: RequestInit = {}) =>
  fetch(`${BASE}${url}`, { ...init, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}`, ...(init.headers ?? {}) } });

type Stats = { totalSteps: number; totalObjectives: number; totalRewards: number; totalDialogues: number; totalBranches: number; completionRate: number; playCount: number };

export default function QuestStatistics() {
  const { id } = useParams<{ id: string }>();
  const qid = Number(id);

  const { data: stats, isLoading } = useQuery<Stats>({
    queryKey: [`/api/quest-editor/${qid}/statistics`],
    queryFn: () => authFetch(`/api/quest-editor/${qid}/statistics`).then(r => r.json()),
  });

  const items = [
    { label: "Steps", value: stats?.totalSteps ?? 0, icon: CheckSquare, color: "text-blue-400" },
    { label: "Objectives", value: stats?.totalObjectives ?? 0, icon: Target, color: "text-red-400" },
    { label: "Rewards", value: stats?.totalRewards ?? 0, icon: Gift, color: "text-yellow-400" },
    { label: "Dialogues", value: stats?.totalDialogues ?? 0, icon: MessageSquare, color: "text-green-400" },
    { label: "Branches", value: stats?.totalBranches ?? 0, icon: GitBranch, color: "text-purple-400" },
    { label: "Play Count", value: stats?.playCount ?? 0, icon: BarChart2, color: "text-cyan-400" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/quest-editor/${qid}`}><Button size="sm" variant="ghost"><ArrowLeft className="w-4 h-4" /></Button></Link>
        <div><h1 className="text-2xl font-bold">Quest Statistics</h1><p className="text-muted-foreground text-sm">Analytics and usage data</p></div>
      </div>
      {isLoading ? <div className="text-muted-foreground">Loading...</div> : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {items.map(({ label, value, icon: Icon, color }) => (
              <Card key={label}><CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{label}</CardTitle><Icon className={`w-4 h-4 ${color}`} />
              </CardHeader><CardContent><div className="text-2xl font-bold">{value}</div></CardContent></Card>
            ))}
          </div>
          <Card><CardHeader><CardTitle className="text-sm">Completion Rate</CardTitle></CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{((stats?.completionRate ?? 0) * 100).toFixed(1)}%</div>
              <div className="w-full bg-secondary rounded-full h-2 mt-2"><div className="bg-primary h-2 rounded-full" style={{ width: `${(stats?.completionRate ?? 0) * 100}%` }} /></div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
