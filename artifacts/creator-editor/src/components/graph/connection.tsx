interface ConnectionProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  type?: string;
  selected?: boolean;
  color?: string;
}

const TYPE_COLORS: Record<string, string> = {
  execution: "#e2e8f0",
  data: "#60a5fa",
  event: "#c084fc",
};

export default function Connection({ x1, y1, x2, y2, type = "execution", selected, color }: ConnectionProps) {
  const c = color ?? TYPE_COLORS[type] ?? "#60a5fa";
  const cx = Math.abs(x2 - x1) * 0.5;
  const path = `M ${x1} ${y1} C ${x1 + cx} ${y1}, ${x2 - cx} ${y2}, ${x2} ${y2}`;

  return (
    <path
      d={path}
      stroke={c}
      strokeWidth={selected ? 3 : 2}
      fill="none"
      strokeLinecap="round"
      opacity={selected ? 1 : 0.75}
      className="pointer-events-stroke cursor-pointer"
    />
  );
}

interface ConnectionLayerProps {
  children: React.ReactNode;
  width: number;
  height: number;
}

export function ConnectionLayer({ children, width, height }: ConnectionLayerProps) {
  return (
    <svg
      className="absolute inset-0 pointer-events-none overflow-visible"
      width={width}
      height={height}
      style={{ zIndex: 0 }}
    >
      {children}
    </svg>
  );
}
