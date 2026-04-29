import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  max: number;
  color?: string;
  className?: string;
}

export default function ProgressBar({ value, max, color = "#3b82f6", className }: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={cn("h-2 bg-white/10 rounded-full overflow-hidden", className)}>
      <div
        className="h-full transition-all duration-500 ease-out rounded-full"
        style={{
          width: `${percentage}%`,
          backgroundColor: color,
          boxShadow: `0 0 10px ${color}80`
        }}
      />
    </div>
  );
}
