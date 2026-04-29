import { useUserContext } from "@/lib/user";
import { Zap, Flame } from "lucide-react";

export default function XPMultiplierBanner() {
  const { profile } = useUserContext();
  const streak = profile.streak;

  const multiplier = streak >= 7 ? 2 : streak >= 3 ? 1.5 : 1;
  const nextMilestone = streak >= 7 ? null : streak >= 3 ? 7 : 3;
  const daysToNext = nextMilestone ? nextMilestone - streak : 0;

  if (multiplier === 1) return null;

  return (
    <div
      className="relative overflow-hidden rounded-2xl p-4 border border-orange-500/30 mb-6"
      style={{ background: "linear-gradient(135deg, rgba(249,115,22,0.15), rgba(234,179,8,0.1))" }}
    >
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center border border-orange-500/30">
          <Flame className="w-6 h-6 text-orange-400" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-white font-bold">XP Multiplier Active!</span>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-500/30 border border-orange-400/40">
              <Zap className="w-3 h-3 text-orange-300" />
              <span className="text-orange-300 text-xs font-bold">{multiplier}x XP</span>
            </div>
          </div>
          <div className="text-sm text-gray-400">
            {streak} day streak 🔥
            {nextMilestone && ` · ${daysToNext} more days for ${multiplier === 1.5 ? "2x" : "3x"} XP!`}
          </div>
        </div>
      </div>
    </div>
  );
}