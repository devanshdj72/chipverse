import { useUserContext } from "@/lib/user";
import { ACHIEVEMENTS, getUnlockedAchievements, AchievementStats } from "@/lib/achievements";
import { DOMAIN_LIST, ROADMAPS } from "@/lib/data";
import CircuitBackground from "@/components/CircuitBackground";
import { Trophy, Lock } from "lucide-react";

export default function Achievements() {
  const { profile } = useUserContext();

  const totalCompleted = Object.values(profile.completedLevels).reduce((s, a) => s + a.length, 0);
  const domainsStarted = Object.keys(profile.completedLevels).filter(d => (profile.completedLevels[d]?.length ?? 0) > 0).length;
  const domainsCompleted = DOMAIN_LIST.filter(d => {
    const levels = ROADMAPS[d.id as keyof typeof ROADMAPS] || [];
    const completed = profile.completedLevels[d.id] || [];
    return completed.length === levels.length && levels.length > 0;
  }).length;

  const stats: AchievementStats = {
    totalCompleted,
    totalXp: profile.xp,
    streak: profile.streak,
    domainsStarted,
    domainsCompleted,
  };

  const unlocked = getUnlockedAchievements(stats);
  const unlockedIds = unlocked.map(a => a.id);

  const categories = ["progress", "streak", "mastery", "special", "speed"] as const;
  const categoryLabels = {
    progress: "📈 Progress",
    streak: "🔥 Streak",
    mastery: "🎓 Mastery",
    special: "⭐ Special",
    speed: "⚡ Speed",
  };

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 relative bg-black">
      <CircuitBackground />
      <div className="max-w-5xl mx-auto relative z-10 pt-8">

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 font-['Orbitron'] flex items-center justify-center gap-3">
            <Trophy className="w-10 h-10 text-yellow-400" />
            Achievements
          </h1>
          <p className="text-gray-400 text-lg">
            {unlockedIds.length} / {ACHIEVEMENTS.length} unlocked
          </p>
          {/* Overall progress bar */}
          <div className="max-w-sm mx-auto mt-4">
            <div className="w-full h-2 bg-white/10 rounded-full">
              <div
                className="h-full rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all"
                style={{ width: `${(unlockedIds.length / ACHIEVEMENTS.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Categories */}
        {categories.map(cat => {
          const catAchievements = ACHIEVEMENTS.filter(a => a.category === cat);
          return (
            <div key={cat} className="mb-10">
              <h2 className="text-white font-bold font-['Orbitron'] text-sm uppercase tracking-wider mb-4">
                {categoryLabels[cat]}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {catAchievements.map(achievement => {
                  const isUnlocked = unlockedIds.includes(achievement.id);
                  return (
                    <div
                      key={achievement.id}
                      className={`relative p-4 rounded-2xl border text-center transition-all ${
                        isUnlocked
                          ? "bg-black/60 border-yellow-500/30 shadow-lg"
                          : "bg-black/20 border-white/5 opacity-50"
                      }`}
                      style={isUnlocked ? { boxShadow: "0 0 20px rgba(234,179,8,0.15)" } : {}}
                    >
                      {!isUnlocked && (
                        <div className="absolute top-2 right-2">
                          <Lock className="w-3 h-3 text-gray-600" />
                        </div>
                      )}
                      <div className={`text-4xl mb-3 ${!isUnlocked ? "grayscale" : ""}`}>
                        {achievement.icon}
                      </div>
                      <div className={`font-bold text-sm mb-1 ${isUnlocked ? "text-white" : "text-gray-600"}`}>
                        {achievement.title}
                      </div>
                      <div className="text-xs text-gray-500 mb-3 leading-relaxed">
                        {achievement.description}
                      </div>
                      <div className={`text-xs font-bold px-2 py-1 rounded-full inline-block ${
                        isUnlocked
                          ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                          : "bg-white/5 text-gray-600 border border-white/10"
                      }`}>
                        +{achievement.xpReward} XP
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}