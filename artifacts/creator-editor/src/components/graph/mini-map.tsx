import type { NodeData } from "./node";
import type { Viewport } from "./canvas";

interface MiniMapProps {
  nodes: NodeData[];
  viewport: Viewport;
  containerWidth: number;
  containerHeight: number;
}

const MAP_W = 180;
const MAP_H = 120;

export default function MiniMap({ nodes, viewport, containerWidth, containerHeight }: MiniMapProps) {
  if (nodes.length === 0) return null;

  const minX = Math.min(...nodes.map((n) => n.x));
  const minY = Math.min(...nodes.map((n) => n.y));
  const maxX = Math.max(...nodes.map((n) => n.x + n.width));
  const maxY = Math.max(...nodes.map((n) => n.y + (n.height ?? 80)));

  const rangeX = Math.max(maxX - minX, 400);
  const rangeY = Math.max(maxY - minY, 300);

  const scaleX = MAP_W / rangeX;
  const scaleY = MAP_H / rangeY;
  const scale = Math.min(scaleX, scaleY) * 0.85;

  const viewW = containerWidth / viewport.zoom;
  const viewH = containerHeight / viewport.zoom;
  const viewX = -viewport.x / viewport.zoom;
  const viewY = -viewport.y / viewport.zoom;

  const toMapX = (x: number) => (x - minX) * scale + 8;
  const toMapY = (y: number) => (y - minY) * scale + 8;

  return (
    <div
      className="absolute bottom-4 right-4 border border-border rounded-md bg-card/90 backdrop-blur overflow-hidden shadow-lg"
      style={{ width: MAP_W + 16, height: MAP_H + 16 }}
    >
      <svg width={MAP_W + 16} height={MAP_H + 16}>
        {nodes.map((n) => (
          <rect
            key={n.id}
            x={toMapX(n.x)}
            y={toMapY(n.y)}
            width={Math.max(n.width * scale, 4)}
            height={Math.max((n.height ?? 80) * scale, 3)}
            rx={1}
            fill={n.color ?? "#334155"}
            opacity={0.8}
          />
        ))}
        <rect
          x={toMapX(viewX)}
          y={toMapY(viewY)}
          width={viewW * scale}
          height={viewH * scale}
          fill="rgba(99,102,241,0.1)"
          stroke="#6366f1"
          strokeWidth={1}
        />
      </svg>
    </div>
  );
}
