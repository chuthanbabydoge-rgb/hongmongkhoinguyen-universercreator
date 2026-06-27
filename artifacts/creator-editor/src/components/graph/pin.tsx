import { cn } from "@/lib/utils";

export interface PinData {
  id: number;
  pinKey: string;
  label: string;
  type: string;
  isInput: boolean;
  isRequired: boolean;
  connected?: boolean;
}

const PIN_COLORS: Record<string, string> = {
  execution: "#e2e8f0",
  boolean: "#ef4444",
  integer: "#22c55e",
  float: "#84cc16",
  string: "#f472b6",
  vector: "#facc15",
  object: "#60a5fa",
  array: "#a78bfa",
  map: "#34d399",
  struct: "#fb923c",
  enum: "#f87171",
  wildcard: "#94a3b8",
  event: "#c084fc",
};

const PIN_SHAPES: Record<string, string> = {
  execution: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
};

interface PinProps {
  pin: PinData;
  isRight?: boolean;
  onMouseDown?: (pinId: number) => void;
  onMouseUp?: (pinId: number) => void;
}

export default function Pin({ pin, isRight = false, onMouseDown, onMouseUp }: PinProps) {
  const color = PIN_COLORS[pin.type] ?? "#94a3b8";
  const isExecution = pin.type === "execution";

  return (
    <div
      className={cn("flex items-center gap-1.5 group cursor-crosshair", isRight && "flex-row-reverse")}
    >
      <div
        className={cn(
          "w-3 h-3 shrink-0 border-2 transition-transform group-hover:scale-125",
          pin.connected ? "bg-current" : "bg-background",
          isExecution ? "" : "rounded-full",
        )}
        style={{
          borderColor: color,
          color,
          clipPath: isExecution ? PIN_SHAPES.execution : undefined,
        }}
        onMouseDown={(e) => { e.stopPropagation(); onMouseDown?.(pin.id); }}
        onMouseUp={(e) => { e.stopPropagation(); onMouseUp?.(pin.id); }}
      />
      <span className={cn("text-[10px] text-muted-foreground group-hover:text-foreground leading-none", pin.isRequired && "font-semibold")}>
        {pin.label}
      </span>
    </div>
  );
}
