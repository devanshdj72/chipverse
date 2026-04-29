import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";

interface XPBadgeProps {
  xp: number;
  streak: number;
  className?: string;
}

export default function XPBadge({ xp, streak, className }: XPBadgeProps) {
  return (
    <div className={cn("flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3 py-1", className)}>
      <span className="text-sm text-gray-300 font-bold">{xp} XP</span>
      <div className="w-px h-4 bg-white/20"></div>
      <div className="flex items-center gap-1 text-orange-500">
        <Flame className="w-4 h-4 fill-orange-500" />
        <span className="text-sm font-bold">{streak}</span>
      </div>
    </div>
  );
}
