import { Play, Pause, Square, Undo2, Redo2, ZoomIn, ZoomOut, Maximize2, Copy, Clipboard, Trash2, Save, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

interface ToolbarProps {
  graphName: string;
  executionState?: string;
  onPlay?: () => void;
  onPause?: () => void;
  onStop?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onFitView?: () => void;
  onCopy?: () => void;
  onPaste?: () => void;
  onDelete?: () => void;
  onSave?: () => void;
  onCompile?: () => void;
  zoom?: number;
  canUndo?: boolean;
  canRedo?: boolean;
  isSaving?: boolean;
}

const STATE_COLORS: Record<string, string> = {
  idle: "secondary",
  running: "default",
  paused: "outline",
  completed: "secondary",
  failed: "destructive",
  stopped: "secondary",
};

export default function GraphToolbar({
  graphName,
  executionState = "idle",
  onPlay, onPause, onStop,
  onUndo, onRedo,
  onZoomIn, onZoomOut, onFitView,
  onCopy, onPaste, onDelete,
  onSave, onCompile,
  zoom = 1,
  canUndo = false,
  canRedo = false,
  isSaving = false,
}: ToolbarProps) {
  const isRunning = executionState === "running";
  const isPaused = executionState === "paused";

  return (
    <div className="flex items-center gap-1 px-3 h-11 border-b border-border bg-card/80 backdrop-blur shrink-0">
      <span className="text-sm font-medium mr-2 truncate max-w-[160px]">{graphName}</span>
      <Badge variant={(STATE_COLORS[executionState] ?? "secondary") as "secondary" | "default" | "outline" | "destructive"} className="text-[10px] h-5">
        {executionState}
      </Badge>

      <Separator orientation="vertical" className="mx-2 h-5" />

      <Tip label="Run (F5)">
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onPlay} disabled={isRunning}>
          <Play className="h-3.5 w-3.5 text-green-400" />
        </Button>
      </Tip>
      <Tip label="Pause">
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onPause} disabled={!isRunning}>
          <Pause className="h-3.5 w-3.5 text-yellow-400" />
        </Button>
      </Tip>
      <Tip label="Stop">
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onStop} disabled={!isRunning && !isPaused}>
          <Square className="h-3.5 w-3.5 text-red-400" />
        </Button>
      </Tip>

      <Separator orientation="vertical" className="mx-2 h-5" />

      <Tip label="Compile">
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onCompile}>
          <Code2 className="h-3.5 w-3.5 text-cyan-400" />
        </Button>
      </Tip>
      <Tip label={`Save${isSaving ? " (saving…)" : " (Ctrl+S)"}`}>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onSave} disabled={isSaving}>
          <Save className="h-3.5 w-3.5" />
        </Button>
      </Tip>

      <Separator orientation="vertical" className="mx-2 h-5" />

      <Tip label="Undo (Ctrl+Z)">
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onUndo} disabled={!canUndo}>
          <Undo2 className="h-3.5 w-3.5" />
        </Button>
      </Tip>
      <Tip label="Redo (Ctrl+Y)">
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onRedo} disabled={!canRedo}>
          <Redo2 className="h-3.5 w-3.5" />
        </Button>
      </Tip>

      <Separator orientation="vertical" className="mx-2 h-5" />

      <Tip label="Copy (Ctrl+C)">
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onCopy}>
          <Copy className="h-3.5 w-3.5" />
        </Button>
      </Tip>
      <Tip label="Paste (Ctrl+V)">
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onPaste}>
          <Clipboard className="h-3.5 w-3.5" />
        </Button>
      </Tip>
      <Tip label="Delete (Del)">
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onDelete}>
          <Trash2 className="h-3.5 w-3.5 text-red-400" />
        </Button>
      </Tip>

      <div className="ml-auto flex items-center gap-1">
        <Tip label="Zoom Out">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onZoomOut}>
            <ZoomOut className="h-3.5 w-3.5" />
          </Button>
        </Tip>
        <span className="text-xs text-muted-foreground w-12 text-center">{Math.round(zoom * 100)}%</span>
        <Tip label="Zoom In">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onZoomIn}>
            <ZoomIn className="h-3.5 w-3.5" />
          </Button>
        </Tip>
        <Tip label="Fit to View">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onFitView}>
            <Maximize2 className="h-3.5 w-3.5" />
          </Button>
        </Tip>
      </div>
    </div>
  );
}

function Tip({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs">{label}</TooltipContent>
    </Tooltip>
  );
}
