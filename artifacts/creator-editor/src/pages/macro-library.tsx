import { useState } from "react";
import { Search, Plus, Code2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface Macro { id: number; name: string; description?: string; inputs: unknown[]; outputs: unknown[]; tags: string[]; isPublic: boolean; }

const BUILT_IN_MACROS: Macro[] = [
  { id: -1, name: "Clamp", description: "Clamp a value between min and max", inputs: [{ label: "Value" }, { label: "Min" }, { label: "Max" }], outputs: [{ label: "Result" }], tags: ["math"], isPublic: true },
  { id: -2, name: "Lerp", description: "Linear interpolation between two values", inputs: [{ label: "A" }, { label: "B" }, { label: "T" }], outputs: [{ label: "Result" }], tags: ["math"], isPublic: true },
  { id: -3, name: "String Format", description: "Format a string with placeholders", inputs: [{ label: "Template" }, { label: "Args" }], outputs: [{ label: "Result" }], tags: ["string"], isPublic: true },
  { id: -4, name: "Random Range", description: "Random number between min and max", inputs: [{ label: "Min" }, { label: "Max" }], outputs: [{ label: "Value" }], tags: ["math", "random"], isPublic: true },
  { id: -5, name: "Array Contains", description: "Check if array contains a value", inputs: [{ label: "Array" }, { label: "Value" }], outputs: [{ label: "Contains" }], tags: ["array"], isPublic: true },
  { id: -6, name: "Gate", description: "Allow execution to pass only when open", inputs: [{ label: "Exec" }, { label: "Toggle" }], outputs: [{ label: "Out" }], tags: ["flow"], isPublic: true },
];

export default function MacroLibrary() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", tags: "" });

  const filtered = BUILT_IN_MACROS.filter((m) =>
    !search ||
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    (m.description ?? "").toLowerCase().includes(search.toLowerCase()) ||
    m.tags.some((t) => t.toLowerCase().includes(search.toLowerCase())),
  );

  const handleCreate = () => {
    toast({ title: "Macro created", description: form.name });
    setCreating(false);
    setForm({ name: "", description: "", tags: "" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Macro Library</h1>
          <p className="text-muted-foreground">Reusable graph macros for common operations.</p>
        </div>
        <Button onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4 mr-2" />New Macro
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search macros…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((macro) => (
          <Card key={macro.id} className="hover:border-primary/50 transition-colors">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Code2 className="h-4 w-4 text-pink-400" />
                <CardTitle className="text-sm">{macro.name}</CardTitle>
              </div>
              <CardDescription className="text-xs">{macro.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 text-xs text-muted-foreground mb-3">
                <span>{(macro.inputs as unknown[]).length} inputs</span>
                <span>{(macro.outputs as unknown[]).length} outputs</span>
              </div>
              <div className="flex flex-wrap gap-1 mb-3">
                {macro.tags.map((t) => <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>)}
              </div>
              <Button variant="outline" size="sm" className="w-full" onClick={() => toast({ title: "Macro added to graph", description: macro.name })}>
                Add to Graph
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center h-40 text-center">
          <Code2 className="h-10 w-10 text-muted-foreground/40 mb-3" />
          <p className="text-muted-foreground">No macros found.</p>
        </div>
      )}

      <Dialog open={creating} onOpenChange={setCreating}>
        <DialogContent>
          <DialogHeader><DialogTitle>New Macro</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Name *</Label><Input className="mt-1" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></div>
            <div><Label>Description</Label><Input className="mt-1" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} /></div>
            <div><Label>Tags (comma separated)</Label><Input className="mt-1" value={form.tags} onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreating(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!form.name}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
