import { useState } from "react";
import { Search, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface NodeDefinition {
  type: string;
  title: string;
  category: string;
  description: string;
  color?: string;
}

export const BUILT_IN_NODES: NodeDefinition[] = [
  { type: "start", title: "Start", category: "Flow", description: "Entry point of the graph", color: "#16a34a" },
  { type: "end", title: "End", category: "Flow", description: "Exit point of the graph", color: "#dc2626" },
  { type: "event", title: "Event", category: "Flow", description: "Listen to an event", color: "#7c3aed" },
  { type: "branch", title: "Branch", category: "Flow", description: "If/else conditional", color: "#0ea5e9" },
  { type: "switch", title: "Switch", category: "Flow", description: "Multi-way branch", color: "#0ea5e9" },
  { type: "sequence", title: "Sequence", category: "Flow", description: "Execute pins in order", color: "#0891b2" },
  { type: "delay", title: "Delay", category: "Flow", description: "Wait for a duration", color: "#0891b2" },
  { type: "loop", title: "Loop", category: "Flow", description: "Loop N times", color: "#0891b2" },
  { type: "while", title: "While", category: "Flow", description: "Loop while condition is true", color: "#0891b2" },
  { type: "for_each", title: "For Each", category: "Flow", description: "Iterate over array", color: "#0891b2" },
  { type: "math", title: "Math", category: "Math", description: "Arithmetic operation", color: "#6366f1" },
  { type: "compare", title: "Compare", category: "Math", description: "Compare two values", color: "#6366f1" },
  { type: "random", title: "Random", category: "Math", description: "Generate random value", color: "#6366f1" },
  { type: "get_variable", title: "Get Variable", category: "Variables", description: "Read a variable", color: "#4f46e5" },
  { type: "set_variable", title: "Set Variable", category: "Variables", description: "Write a variable", color: "#4f46e5" },
  { type: "function", title: "Function", category: "Functions", description: "Call a function", color: "#d97706" },
  { type: "macro", title: "Macro", category: "Macros", description: "Expand a macro", color: "#db2777" },
  { type: "custom_event", title: "Custom Event", category: "Events", description: "Dispatch a custom event", color: "#7c3aed" },
  { type: "log", title: "Log", category: "Debug", description: "Log to execution console", color: "#64748b" },
  { type: "print", title: "Print", category: "Debug", description: "Print a value", color: "#64748b" },
];

const CATEGORIES = [...new Set(BUILT_IN_NODES.map((n) => n.category))];

interface NodeLibraryProps {
  onAddNode: (def: NodeDefinition) => void;
}

export default function NodeLibrary({ onAddNode }: NodeLibraryProps) {
  const [search, setSearch] = useState("");
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set(CATEGORIES));

  const filtered = search
    ? BUILT_IN_NODES.filter(
        (n) =>
          n.title.toLowerCase().includes(search.toLowerCase()) ||
          n.description.toLowerCase().includes(search.toLowerCase()),
      )
    : BUILT_IN_NODES;

  const byCategory = CATEGORIES.reduce<Record<string, NodeDefinition[]>>((acc, cat) => {
    acc[cat] = filtered.filter((n) => n.category === cat);
    return acc;
  }, {});

  const toggleCat = (cat: string) => {
    setExpandedCats((prev) => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });
  };

  return (
    <div className="flex flex-col h-full border-r border-border bg-sidebar w-56 shrink-0">
      <div className="p-3 border-b border-border">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">Node Library</p>
        <div className="relative">
          <Search className="absolute left-2 top-2 h-3 w-3 text-muted-foreground" />
          <Input
            className="h-7 pl-7 text-xs"
            placeholder="Search nodes…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {CATEGORIES.map((cat) => {
            const items = byCategory[cat];
            if (!items || items.length === 0) return null;
            const expanded = expandedCats.has(cat);
            return (
              <div key={cat}>
                <button
                  className="w-full flex items-center justify-between px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-widest hover:text-foreground"
                  onClick={() => toggleCat(cat)}
                >
                  <span>{cat}</span>
                  <span>{expanded ? "▾" : "▸"}</span>
                </button>
                {expanded && (
                  <div className="space-y-0.5 mt-0.5">
                    {items.map((def) => (
                      <button
                        key={def.type}
                        className={cn(
                          "w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs text-left hover:bg-accent group",
                        )}
                        onClick={() => onAddNode(def)}
                        title={def.description}
                      >
                        <span
                          className="w-2 h-2 rounded-sm shrink-0"
                          style={{ background: def.color ?? "#334155" }}
                        />
                        <span className="flex-1 truncate">{def.title}</span>
                        <Plus className="h-3 w-3 opacity-0 group-hover:opacity-60 shrink-0" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
