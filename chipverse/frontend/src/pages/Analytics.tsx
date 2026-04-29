import { useUserContext } from "@/lib/user";
import { ROADMAPS, DOMAIN_LIST } from "@/lib/data";
import { DOMAIN_THEMES } from "@/lib/themes";
import CircuitBackground from "@/components/CircuitBackground";
import ProgressBar from "@/components/ProgressBar";
import { Trophy, Flame, Target, TrendingUp } from "lucide-react";

export default function Analytics() {
  const { profile } = useUserContext();

  const domainStats = DOMAIN_LIST.map((domain) => {
    const levels = ROADMAPS[domain.id as keyof typeof ROADMAPS] || [];
    const completed = profile.completedLevels[domain.id] || [];
    const percent = levels.length ? Math.round((completed.length / levels.length) * 100) : 0;
    const xpEarned = levels.filter(l => completed.includes(l.id)).reduce((sum, l) => sum + l.xp, 0);
    const theme = DOMAIN_THEMES[domain.id];
    return { ...domain, levels, completed, percent, xpEarned, theme };
  });

  const totalLevels = domainStats.reduce((sum, d) => sum + d.levels.length, 0);
  const totalCompleted = domainStats.reduce((sum, d) => sum + d.completed.length, 0);
  const activeDomains = domainStats.filter(d => d.completed.length > 0).length;

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 relative bg-black">
      <CircuitBackground />
      <div className="max-w-5xl mx-auto relative z-10 pt-8">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-white font-['Orbitron'] mb-2 flex items-center gap-3">
            <TrendingUp className="w-9 h-9 text-blue-400" /> Progress Analytics
          </h1>
          <p className="text-gray-400">Your learning journey across all domains</p>
        </div>

        {/* Top Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { icon: <Trophy className="w-6 h-6 text-yellow-400" />, value: profile.xp, label: "Total XP" },
            { icon: <Flame className="w-6 h-6 text-orange-400" />, value: profile.streak, label: "Day Streak" },
            { icon: <Target className="w-6 h-6 text-blue-400" />, value: totalCompleted, label: "Levels Done" },
            { icon: <TrendingUp className="w-6 h-6 text-green-400" />, value: activeDomains, label: "Active Domains" },
          ].map((stat, i) => (
            <div key={i} className="bg-black/40 border border-white/10 rounded-2xl p-5 flex flex-col items-center text-center backdrop-blur-md">
              {stat.icon}
              <div className="text-3xl font-bold text-white font-mono mt-2">{stat.value}</div>
              <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Overall Progress */}
        <div className="bg-black/40 border border-white/10 rounded-2xl p-6 mb-8 backdrop-blur-md">
          <h2 className="text-white font-bold text-lg font-['Orbitron'] mb-4">Overall Completion</h2>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">{totalCompleted} of {totalLevels} levels completed</span>
            <span className="text-white font-mono">{totalLevels ? Math.round((totalCompleted / totalLevels) * 100) : 0}%</span>
          </div>
          <ProgressBar value={totalCompleted} max={totalLevels} color="#3b82f6" />
        </div>

        {/* Per Domain */}
        <h2 className="text-white font-bold text-lg font-['Orbitron'] mb-4">Domain Breakdown</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {domainStats.map((domain) => (
            <div key={domain.id} className="bg-black/40 border border-white/10 rounded-2xl p-5 backdrop-blur-md hover:border-white/20 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl" style={{ background: domain.theme.card }}>
                  <domain.theme.icon className="w-5 h-5" style={{ color: domain.theme.primary }} />
                </div>
                <div className="flex-1">
                  <div className="text-white font-bold text-sm">{domain.name}</div>
                  <div className="text-xs text-gray-500">{domain.completed.length}/{domain.levels.length} levels · {domain.xpEarned} XP</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold font-mono" style={{ color: domain.theme.primary }}>{domain.percent}%</div>
                </div>
              </div>
              <ProgressBar value={domain.completed.length} max={domain.levels.length} color={domain.theme.primary} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}