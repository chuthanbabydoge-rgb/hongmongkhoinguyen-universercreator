import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { useEffect, useState } from "react";
import { Save, Zap, Globe, Archive, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const token = () => localStorage.getItem("creator_token");
const authFetch = (url: string, init: RequestInit = {}) =>
  fetch(`${BASE}${url}`, { ...init, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}`, ...(init.headers ?? {}) } });

type Skill = {
  id: number; name: string; description?: string; flavorText?: string;
  skillType: string; skillTarget: string; castType: string; damageType: string; resourceType: string;
  maxLevel: number; baseRange: number; baseRadius: number; baseCastTime: number;
  baseCooldown: number; baseResourceCost: number; baseDamage: number; baseHeal: number;
  isPublished: boolean; isArchived: boolean; graphRef?: string;
};

const SKILL_TYPES = ["active", "passive", "toggle", "ultimate", "aura", "reaction", "summon"];
const TARGETS = ["self", "ally", "enemy", "area", "point", "direction"];
const CAST_TYPES = ["instant", "cast", "channel"];
const DAMAGE_TYPES = ["physical", "magic", "true", "heal"];
const RESOURCE_TYPES = ["mana", "energy", "stamina", "rage", "none"];

function SubPanel({ label, endpoint, linkHref }: { label: string; endpoint: string; linkHref: string }) {
  const { data = [], isLoading } = useQuery<unknown[]>({
    queryKey: [endpoint],
    queryFn: () => authFetch(endpoint).then((r) => r.json()),
  });
  const [, setLocation] = useLocation();
  if (isLoading) return <div className="text-xs text-muted-foreground py-4">Loading…</div>;
  if (!data.length)
    return (
      <div className="text-xs text-muted-foreground py-4">
        No {label.toLowerCase()} yet.{" "}
        <button className="underline text-primary" onClick={() => setLocation(linkHref)}>Add {label}</button>
      </div>
    );
  return (
    <div className="space-y-2">
      {(data as Array<Record<string, unknown>>).map((row, i) => (
        <div key={i} className="flex items-center justify-between p-2 rounded border border-border text-sm">
          <span>{String(row["effectName"] ?? row["buffName"] ?? row["debuffName"] ?? row["projectileName"] ?? row["animationType"] ?? row["audioType"] ?? row["visualType"] ?? `${label} ${i + 1}`)}</span>
          <span className="text-muted-foreground text-xs">{String(row["magnitude"] ?? row["value"] ?? row["amount"] ?? row["speed"] ?? row["duration"] ?? "")}</span>
        </div>
      ))}
      <Button size="sm" variant="outline" className="w-full mt-2" onClick={() => setLocation(linkHref)}>
        Manage {label}
      </Button>
    </div>
  );
}

export default function SkillEditorPage() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: skill, isLoading } = useQuery<Skill>({
    queryKey: [`/api/skills/${id}`],
    queryFn: () => authFetch(`/api/skills/${id}`).then((r) => r.json()),
    enabled: !!id,
  });

  const [form, setForm] = useState<Partial<Skill>>({});
  useEffect(() => { if (skill) setForm(skill); }, [skill]);

  const updateMutation = useMutation({
    mutationFn: (data: Partial<Skill>) =>
      authFetch(`/api/skills/${id}`, { method: "PATCH", body: JSON.stringify(data) }).then((r) => r.json()),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: [`/api/skills/${id}`] }); toast({ title: "Saved" }); },
    onError: () => toast({ title: "Error", description: "Failed to save", variant: "destructive" }),
  });

  const publishMutation = useMutation({
    mutationFn: () => authFetch(`/api/skills/${id}/publish`, { method: "POST" }).then((r) => r.json()),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: [`/api/skills/${id}`] }); toast({ title: "Published!" }); },
    onError: (err) => toast({ title: "Publish failed", description: String(err), variant: "destructive" }),
  });

  const archiveMutation = useMutation({
    mutationFn: () => authFetch(`/api/skills/${id}/archive`, { method: "POST" }).then((r) => r.json()),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: [`/api/skills/${id}`] }); setLocation("/skill-browser"); },
  });

  const field =
    (key: keyof Skill) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const val =
        e.target.type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : e.target.type === "number"
            ? Number(e.target.value)
            : e.target.value;
      setForm((f) => ({ ...f, [key]: val }));
    };

  if (isLoading) return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading…</div>;
  if (!skill) return <div className="text-center py-16 text-muted-foreground">Skill not found.</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="cursor-pointer hover:text-foreground" onClick={() => setLocation("/skill-dashboard")}>Skill Editor</span>
        <ChevronRight className="w-3 h-3" />
        <span className="text-foreground">{skill.name}</span>
      </div>

      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Zap className="w-6 h-6 text-primary" />
          <div>
            <h1 className="text-xl font-bold">{skill.name}</h1>
            <p className="text-sm text-muted-foreground capitalize">{skill.skillType} · {skill.damageType} · {skill.castType}</p>
          </div>
          <Badge variant={skill.isPublished ? "default" : "secondary"}>{skill.isPublished ? "Published" : "Draft"}</Badge>
        </div>
        <div className="flex gap-2 flex-wrap justify-end">
          <Button variant="outline" size="sm" onClick={() => updateMutation.mutate(form)} disabled={updateMutation.isPending}>
            <Save className="w-4 h-4 mr-1" />Save
          </Button>
          {!skill.isPublished && (
            <Button size="sm" onClick={() => publishMutation.mutate()} disabled={publishMutation.isPending}>
              <Globe className="w-4 h-4 mr-1" />Publish
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={() => archiveMutation.mutate()} disabled={archiveMutation.isPending}>
            <Archive className="w-4 h-4 mr-1" />Archive
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="levels">Levels</TabsTrigger>
          <TabsTrigger value="cost">Cost</TabsTrigger>
          <TabsTrigger value="cooldown">Cooldown</TabsTrigger>
          <TabsTrigger value="effects">Effects</TabsTrigger>
          <TabsTrigger value="buffs">Buffs</TabsTrigger>
          <TabsTrigger value="debuffs">Debuffs</TabsTrigger>
          <TabsTrigger value="projectile">Projectile</TabsTrigger>
          <TabsTrigger value="animation">Animation</TabsTrigger>
          <TabsTrigger value="audio">Audio</TabsTrigger>
          <TabsTrigger value="visuals">Visual FX</TabsTrigger>
          <TabsTrigger value="requirements">Requirements</TabsTrigger>
          <TabsTrigger value="statistics">Statistics</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4 mt-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">Identity</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div><label className="text-xs text-muted-foreground">Name</label>
                <Input value={form.name ?? ""} onChange={field("name")} className="mt-1" /></div>
              <div><label className="text-xs text-muted-foreground">Description</label>
                <Textarea value={form.description ?? ""} onChange={field("description")} className="mt-1 resize-none" rows={3} /></div>
              <div><label className="text-xs text-muted-foreground">Flavor Text</label>
                <Textarea value={form.flavorText ?? ""} onChange={field("flavorText")} className="mt-1 resize-none italic" rows={2} /></div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { label: "Skill Type", key: "skillType", opts: SKILL_TYPES },
              { label: "Target", key: "skillTarget", opts: TARGETS },
              { label: "Cast Type", key: "castType", opts: CAST_TYPES },
              { label: "Damage Type", key: "damageType", opts: DAMAGE_TYPES },
              { label: "Resource Type", key: "resourceType", opts: RESOURCE_TYPES },
            ].map(({ label, key, opts }) => (
              <div key={key}><label className="text-xs text-muted-foreground">{label}</label>
                <select value={String(form[key as keyof Skill] ?? "")} onChange={field(key as keyof Skill)}
                  className="mt-1 w-full bg-background border border-input rounded-md px-3 py-2 text-sm">
                  {opts.map((o) => <option key={o} value={o}>{o.replace(/_/g, " ")}</option>)}
                </select>
              </div>
            ))}
            <div><label className="text-xs text-muted-foreground">Max Level</label>
              <Input type="number" value={form.maxLevel ?? 5} onChange={field("maxLevel")} className="mt-1" /></div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Base Range", key: "baseRange" }, { label: "Base Radius", key: "baseRadius" },
              { label: "Cast Time (s)", key: "baseCastTime" }, { label: "Cooldown (s)", key: "baseCooldown" },
              { label: "Resource Cost", key: "baseResourceCost" }, { label: "Base Damage", key: "baseDamage" },
              { label: "Base Heal", key: "baseHeal" },
            ].map(({ label, key }) => (
              <div key={key}><label className="text-xs text-muted-foreground">{label}</label>
                <Input type="number" step="0.1" value={Number(form[key as keyof Skill] ?? 0)} onChange={field(key as keyof Skill)} className="mt-1" />
              </div>
            ))}
          </div>
        </TabsContent>

        {[
          { value: "levels", label: "Levels", endpoint: `/api/skills/${id}/levels`, linkHref: `/skill-editor/${id}` },
          { value: "cost", label: "Costs", endpoint: `/api/skills/${id}/costs`, linkHref: `/skill-cost/${id}` },
          { value: "cooldown", label: "Cooldown", endpoint: `/api/skills/${id}/cooldowns`, linkHref: `/skill-cooldown/${id}` },
          { value: "effects", label: "Effects", endpoint: `/api/skills/${id}/effects`, linkHref: `/skill-effects/${id}` },
          { value: "buffs", label: "Buffs", endpoint: `/api/skills/${id}/buffs`, linkHref: `/skill-buffs/${id}` },
          { value: "debuffs", label: "Debuffs", endpoint: `/api/skills/${id}/debuffs`, linkHref: `/skill-debuffs/${id}` },
          { value: "projectile", label: "Projectiles", endpoint: `/api/skills/${id}/projectiles`, linkHref: `/skill-projectile/${id}` },
          { value: "animation", label: "Animations", endpoint: `/api/skills/${id}/animations`, linkHref: `/skill-animation/${id}` },
          { value: "audio", label: "Audio", endpoint: `/api/skills/${id}/audio`, linkHref: `/skill-editor/${id}` },
          { value: "visuals", label: "Visuals", endpoint: `/api/skills/${id}/visuals`, linkHref: `/skill-editor/${id}` },
          { value: "requirements", label: "Requirements", endpoint: `/api/skills/${id}/requirements`, linkHref: `/skill-editor/${id}` },
          { value: "statistics", label: "Statistics", endpoint: `/api/skills/${id}/statistics`, linkHref: `/skill-statistics/${id}` },
          { value: "history", label: "History", endpoint: `/api/skills/${id}/history`, linkHref: `/skill-history/${id}` },
        ].map(({ value, label, endpoint, linkHref }) => (
          <TabsContent key={value} value={value} className="mt-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">{label}</CardTitle>
                  <Button size="sm" variant="outline" onClick={() => setLocation(linkHref)}>
                    Manage {label}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <SubPanel label={label} endpoint={endpoint} linkHref={linkHref} />
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
