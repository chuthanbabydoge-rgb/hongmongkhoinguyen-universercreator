import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { NodeData } from "./node";

interface InspectorProps {
  selectedNode?: NodeData | null;
  onNodeChange?: (id: number, changes: Partial<NodeData>) => void;
}

export default function Inspector({ selectedNode, onNodeChange }: InspectorProps) {
  if (!selectedNode) {
    return (
      <div className="w-56 border-l border-border bg-sidebar flex items-center justify-center text-xs text-muted-foreground p-4 text-center">
        Select a node to inspect its properties
      </div>
    );
  }

  return (
    <div className="w-56 border-l border-border bg-sidebar flex flex-col shrink-0">
      <div className="p-3 border-b border-border">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">Inspector</p>
        <p className="text-sm font-medium truncate">{selectedNode.title}</p>
        <Badge variant="outline" className="text-[10px] mt-1">{selectedNode.type}</Badge>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Properties</p>
            <div className="space-y-2">
              <div>
                <Label className="text-xs">Title</Label>
                <Input
                  className="h-7 text-xs mt-1"
                  value={selectedNode.title}
                  onChange={(e) => onNodeChange?.(selectedNode.id, { title: e.target.value })}
                />
              </div>
              <div>
                <Label className="text-xs">Comment</Label>
                <Input
                  className="h-7 text-xs mt-1"
                  value={selectedNode.comment ?? ""}
                  placeholder="Add comment…"
                  onChange={(e) => onNodeChange?.(selectedNode.id, { comment: e.target.value })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-xs">Disabled</Label>
                <Switch
                  checked={selectedNode.disabled}
                  onCheckedChange={(v) => onNodeChange?.(selectedNode.id, { disabled: v })}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Position</p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">X</Label>
                <Input className="h-7 text-xs mt-1" value={Math.round(selectedNode.x)} readOnly />
              </div>
              <div>
                <Label className="text-xs">Y</Label>
                <Input className="h-7 text-xs mt-1" value={Math.round(selectedNode.y)} readOnly />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Input Pins</p>
            {selectedNode.inputPins.map((pin) => (
              <div key={pin.id} className="flex items-center gap-2 text-xs">
                <span className="text-muted-foreground truncate flex-1">{pin.label}</span>
                <Badge variant="outline" className="text-[9px] h-4">{pin.type}</Badge>
              </div>
            ))}
            {selectedNode.inputPins.length === 0 && (
              <p className="text-xs text-muted-foreground">None</p>
            )}
          </div>

          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Output Pins</p>
            {selectedNode.outputPins.map((pin) => (
              <div key={pin.id} className="flex items-center gap-2 text-xs">
                <span className="text-muted-foreground truncate flex-1">{pin.label}</span>
                <Badge variant="outline" className="text-[9px] h-4">{pin.type}</Badge>
              </div>
            ))}
            {selectedNode.outputPins.length === 0 && (
              <p className="text-xs text-muted-foreground">None</p>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
