import { useRef, useState, useCallback, type ReactNode, type WheelEvent, type MouseEvent } from "react";
import { cn } from "@/lib/utils";

export interface Viewport {
  x: number;
  y: number;
  zoom: number;
}

interface CanvasProps {
  viewport: Viewport;
  onViewportChange: (vp: Viewport) => void;
  children?: ReactNode;
  showGrid?: boolean;
  gridSize?: number;
  onBackgroundClick?: () => void;
}

export default function Canvas({
  viewport,
  onViewportChange,
  children,
  showGrid = true,
  gridSize = 16,
  onBackgroundClick,
}: CanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef<{ mx: number; my: number; vx: number; vy: number } | null>(null);

  const handleWheel = useCallback(
    (e: WheelEvent<HTMLDivElement>) => {
      e.preventDefault();
      const factor = e.deltaY < 0 ? 1.1 : 0.9;
      const rect = containerRef.current!.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      const newZoom = Math.min(Math.max(viewport.zoom * factor, 0.1), 4);
      const scale = newZoom / viewport.zoom;
      const newX = cx - scale * (cx - viewport.x);
      const newY = cy - scale * (cy - viewport.y);
      onViewportChange({ x: newX, y: newY, zoom: newZoom });
    },
    [viewport, onViewportChange],
  );

  const handleMouseDown = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (e.button === 1 || (e.button === 0 && e.altKey)) {
        e.preventDefault();
        setIsPanning(true);
        panStart.current = { mx: e.clientX, my: e.clientY, vx: viewport.x, vy: viewport.y };
      }
    },
    [viewport],
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (!isPanning || !panStart.current) return;
      const dx = e.clientX - panStart.current.mx;
      const dy = e.clientY - panStart.current.my;
      onViewportChange({ ...viewport, x: panStart.current.vx + dx, y: panStart.current.vy + dy });
    },
    [isPanning, viewport, onViewportChange],
  );

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
    panStart.current = null;
  }, []);

  const handleClick = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) onBackgroundClick?.();
    },
    [onBackgroundClick],
  );

  const scaledGrid = gridSize * viewport.zoom;
  const offsetX = ((viewport.x % scaledGrid) + scaledGrid) % scaledGrid;
  const offsetY = ((viewport.y % scaledGrid) + scaledGrid) % scaledGrid;

  return (
    <div
      ref={containerRef}
      className={cn("relative w-full h-full overflow-hidden select-none", isPanning && "cursor-grabbing")}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={handleClick}
    >
      {showGrid && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)`,
            backgroundSize: `${scaledGrid}px ${scaledGrid}px`,
            backgroundPosition: `${offsetX}px ${offsetY}px`,
          }}
        />
      )}
      <div
        style={{
          transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
          transformOrigin: "0 0",
          position: "absolute",
          top: 0,
          left: 0,
        }}
      >
        {children}
      </div>
    </div>
  );
}
