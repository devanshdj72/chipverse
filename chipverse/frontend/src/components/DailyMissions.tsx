import { useEffect } from "react";
import { useUserContext } from "@/lib/user";
import { getTodaysMissions } from "@/lib/missions";
import { useGamification } from "@/lib/useGamification";
import { DOMAIN_LIST, ROADMAPS } from "@/lib/data";
import ProgressBar from "./ProgressBar";
import { Zap } from "lucide-react";

export default function DailyMissions() {
  const { profile } = useUserContext();

  const totalCompleted  = Object.values(profile.completedLevels).reduce((s, a) => s + a.length, 0);
  const domainsStarted  = Object.keys(profile.completedLevels).filter(d => (profile.completedLevels[d]?.length ?? 0) > 0).length;
  const domainsCompleted = DOMAIN_LIST.filter(d => {
    const levels    = ROADMAPS[d.id as keyof typeof ROADMAPS] || [];
    const completed = profile.completedLevels[d.id] || [];
    return completed.length === levels.length && levels.length > 0;
  }).length;

  const { todaysMissions, getMissionProgress, updateMissionProgress, streakMultiplier } = useGamification({
    totalCompleted,
    totalXp: profile.xp,
    streak:  profile.streak,
    domainsStarted,
    domainsCompleted,
  });

  // ── Auto-complete streak mission when user has an active streak ───────────
  useEffect(() => {
    if (profile.streak > 0) {
      const streakMission = todaysMissions.find(m => m.type === "streak");
      if (streakMission) {
        const current = getMissionProgress(streakMission);
        if (current < streakMission.target) {
          updateMissionProgress("streak", streakMission.target);
        }
      }
    }
  }, [profile.streak, todaysMissions]);

  return (
    <div className="bg-black/40 border border-white/10 rounded-2xl p-5 backdrop-blur-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-bold text-sm font-['Orbitron'] uppercase tracking-wider">
          Daily Missions
        </h3>
        {streakMultiplier > 1 && (
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-orange-500/20 border border-orange-500/30">
            <Zap className="w-3 h-3 text-orange-400" />
            <span className="text-orange-400 text-xs font-bold">{streakMultiplier}x XP</span>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {todaysMissions.map(mission => {
          const progress = getMissionProgress(mission);
          const percent  = Math.min((progress / mission.target) * 100, 100);
          const done     = progress >= mission.target;

          return (
            <div key={mission.id}
              className={`p-3 rounded-xl border transition-all ${done ? "bg-green-500/10 border-green-500/30" : "bg-white/5 border-white/10"}`}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{mission.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <span className={`text-sm font-bold ${done ? "text-green-400" : "text-white"}`}>
                      {mission.title} {done && "✓"}
                    </span>
                    <span className="text-xs font-mono text-yellow-400">+{mission.xpReward} XP</span>
                  </div>
                  <div className="text-xs text-gray-500">{mission.description}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <ProgressBar
                    value={Math.min(progress, mission.target)}
                    max={mission.target}
                    color={done ? "#22c55e" : "#3b82f6"}
                  />
                </div>
                <span className="text-xs text-gray-500 shrink-0 font-mono">
                  {Math.min(progress, mission.target)}/{mission.target}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}