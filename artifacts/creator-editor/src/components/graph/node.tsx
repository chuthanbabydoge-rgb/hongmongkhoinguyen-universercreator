import { useState, useRef, useCallback, type MouseEvent } from "react";
import { cn } from "@/lib/utils";
import Pin, { type PinData } from "./pin";

export interface NodeData {
  id: number;
  nodeKey: string;
  type: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  collapsed: boolean;
  disabled: boolean;
  color?: string;
  comment?: string;
  inputPins: PinData[];
  outputPins: PinData[];
}

const NODE_TYPE_COLORS: Record<string, string> = {
  start: "#16a34a",
  end: "#dc2626",
  event: "#7c3aed",
  branch: "#0ea5e9",
  function: "#d97706",
  macro: "#db2777",
  loop: "#0891b2",
  while: "#0891b2",
  for_each: "#0891b2",
  math: "#6366f1",
  compare: "#6366f1",
  set_variable: "#4f46e5",
  get_variable: "#4f46e5",
  log: "#64748b",
  print: "#64748b",
  default: "#1e293b",
};

interface NodeProps {
  node: NodeData;
  selected: boolean;
  onSelect: (id: number, multi: boolean) => void;
  onMove: (id: number, dx: number, dy: number) => void;
  onPinMouseDown?: (pinId: number, isInput: boolean, nodeId: number) => void;
  onPinMouseUp?: (pinId: number, isInput: boolean, nodeId: number) => void;
  zoom: number;
}

export default function GraphNode({ node, selected, onSelect, onMove, onPinMouseDown, onPinMouseUp, zoom }: NodeProps) {
  const [collapsed, setCollapsed] = useState(node.collapsed);
  const dragStart = useRef<{ mx: number; my: number } | null>(null);
  const moved = useRef(false);

  const headerColor = node.color ?? NODE_TYPE_COLORS[node.type] ?? NODE_TYPE_COLORS.default;

  const handleMouseDown = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (e.button !== 0) return;
      e.stopPropagation();
      dragStart.current = { mx: e.clientX, my: e.clientY };
      moved.current = false;

      const onMove_ = (me: globalThis.MouseEvent) => {
        if (!dragStart.current) return;
        const dx = (me.clientX - dragStart.current.mx) / zoom;
        const dy = (me.clientY - dragStart.current.my) / zoom;
        if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
          moved.current = true;
          dragStart.current = { mx: me.clientX, my: me.clientY };
          onMove(node.id, dx, dy);
        }
      };

      const onUp = (me: globalThis.MouseEvent) => {
        document.removeEventListener("mousemove", onMove_);
        document.removeEventListener("mouseup", onUp);
        if (!moved.current) {
          onSelect(node.id, me.ctrlKey || me.metaKey || me.shiftKey);
        }
      };

      document.addEventListener("mousemove", onMove_);
      document.addEventListener("mouseup", onUp);
    },
    [node.id, zoom, onMove, onSelect],
  );

  return (
    <div
      style={{ position: "absolute", left: node.x, top: node.y, width: node.width, zIndex: selected ? 10 : 1 }}
      className={cn(
        "rounded-lg border bg-card shadow-lg transition-shadow",
        selected ? "border-primary ring-1 ring-primary" : "border-border",
        node.disabled && "opacity-50",
      )}
      onMouseDown={handleMouseDown}
    >
      <div
        className="flex items-center justify-between px-3 py-1.5 rounded-t-lg cursor-grab active:cursor-grabbing"
        style={{ background: headerColor }}
      >
        <span className="text-xs font-semibold text-white truncate">{node.title}</span>
        <button
          className="text-white/70 hover:text-white ml-2 shrink-0 text-xs"
          onClick={(e) => { e.stopPropagation(); setCollapsed((c) => !c); }}
        >
          {collapsed ? "▸" : "▾"}
        </button>
      </div>

      {!collapsed && (
        <div className="flex gap-2 p-2 min-h-[40px]">
          <div className="flex flex-col gap-1.5 items-start">
            {node.inputPins.map((pin) => (
              <Pin
                key={pin.id}
                pin={pin}
                onMouseDown={(pinId) => onPinMouseDown?.(pinId, true, node.id)}
                onMouseUp={(pinId) => onPinMouseUp?.(pinId, true, node.id)}
              />
            ))}
          </div>
          <div className="flex-1" />
          <div className="flex flex-col gap-1.5 items-end">
            {node.outputPins.map((pin) => (
              <Pin
                key={pin.id}
                pin={pin}
                isRight
                onMouseDown={(pinId) => onPinMouseDown?.(pinId, false, node.id)}
                onMouseUp={(pinId) => onPinMouseUp?.(pinId, false, node.id)}
              />
            ))}
          </div>
        </div>
      )}

      {node.comment && (
        <div className="px-3 pb-2 text-xs text-muted-foreground italic">{node.comment}</div>
      )}
    </div>
  );
}
