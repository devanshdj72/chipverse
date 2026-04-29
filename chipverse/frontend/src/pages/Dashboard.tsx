import { useUserContext } from "@/lib/user";
import DailyMissions from "@/components/DailyMissions";
import XPMultiplierBanner from "@/components/XPMultiplierBanner";
import AchievementToast from "@/components/AchievementToast";
import { useGamification } from "@/lib/useGamification";
import DashboardCard from "@/components/DashboardCard";
import CircuitBackground from "@/components/CircuitBackground";
import { Flame, Trophy, Target, BookOpen, Briefcase } from "lucide-react";
import { Link } from "wouter";
import ProgressBar from "@/components/ProgressBar";
import { DOMAIN_THEMES } from "@/lib/themes";
import { DOMAIN_LIST, ROADMAPS } from "@/lib/data";

export default function Dashboard() {
  const { user, profile } = useUserContext();

  const currentDomainInfo = DOMAIN_LIST.find(d => d.id === profile.currentDomain) || DOMAIN_LIST[0];
  const theme = DOMAIN_THEMES[currentDomainInfo.id];
  const levels = ROADMAPS[currentDomainInfo.id as keyof typeof ROADMAPS] || [];
  const completed = profile.completedLevels[currentDomainInfo.id] || [];
  const nextLevel = levels.find(l => !completed.includes(l.id)) || levels[levels.length - 1];

  const totalCompleted = Object.values(profile.completedLevels).reduce((s, a) => s + a.length, 0);
  const domainsStarted = Object.keys(profile.completedLevels).filter(d => (profile.completedLevels[d]?.length ?? 0) > 0).length;
  const domainsCompleted = DOMAIN_LIST.filter(d => {
    const ls = ROADMAPS[d.id as keyof typeof ROADMAPS] || [];
    const comp = profile.completedLevels[d.id] || [];
    return comp.length === ls.length && ls.length > 0;
  }).length;

  const { newAchievement, clearNewAchievement } = useGamification({
    totalCompleted,
    totalXp: profile.xp,
    streak: profile.streak,
    domainsStarted,
    domainsCompleted,
  });

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 relative bg-black">
      <CircuitBackground />

      <div className="max-w-7xl mx-auto relative z-10 pt-8">
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-white font-['Orbitron'] mb-3">
            Welcome back, {user.name}
          </h1>
          <p className="text-gray-400 text-lg">Ready to design some silicon today?</p>
        </div>

        {/* XP Multiplier Banner */}
        <XPMultiplierBanner />

        {/* Top Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
          <DashboardCard className="p-6 flex flex-col items-center justify-center text-center">
            <Trophy className="w-10 h-10 text-yellow-500 mb-3" />
            <div className="text-3xl font-bold text-white mb-1 font-mono">{profile.xp}</div>
            <div className="text-xs text-gray-400 uppercase tracking-wider font-medium">Total XP</div>
          </DashboardCard>
          <DashboardCard className="p-6 flex flex-col items-center justify-center text-center">
            <Flame className="w-10 h-10 text-orange-500 mb-3" />
            <div className="text-3xl font-bold text-white mb-1 font-mono">{profile.streak}</div>
            <div className="text-xs text-gray-400 uppercase tracking-wider font-medium">Day Streak</div>
          </DashboardCard>
          <DashboardCard className="p-6 flex flex-col items-center justify-center text-center">
            <Target className="w-10 h-10 text-blue-500 mb-3" />
            <div className="text-3xl font-bold text-white mb-1 font-mono">{totalCompleted}</div>
            <div className="text-xs text-gray-400 uppercase tracking-wider font-medium">Levels Completed</div>
          </DashboardCard>
          <DashboardCard className="p-6 flex flex-col items-center justify-center text-center">
            <AwardBadge rank={profile.rank} />
            <div className="text-xl font-bold text-white mt-4 mb-1 leading-tight">{profile.rank}</div>
            <div className="text-xs text-gray-400 uppercase tracking-wider font-medium">Current Rank</div>
          </DashboardCard>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Area */}
          <div className="lg:col-span-2 space-y-8">
            <DashboardCard className="relative overflow-hidden p-8">
              <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <theme.icon className="w-48 h-48" style={{ color: theme.primary }} />
              </div>
              <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3 font-['Orbitron']">
                <BookOpen className="w-6 h-6 text-blue-400" /> Continue Learning
              </h2>

              <div className="mb-8 relative z-10">
                <div className="flex justify-between text-base mb-3">
                  <span className="text-white font-bold">{currentDomainInfo.name} Path</span>
                  <span className="text-gray-400 font-mono">
                    {Math.round((completed.length / levels.length) * 100)}%
                  </span>
                </div>
                <ProgressBar value={completed.length} max={levels.length} color={theme.primary} className="h-3" />
              </div>

              <div className="bg-black/60 rounded-2xl p-6 border border-white/10 relative z-10 backdrop-blur-md">
                <div className="text-sm font-mono tracking-wider mb-2" style={{ color: theme.primary }}>
                  UP NEXT: LEVEL {nextLevel?.level}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{nextLevel?.title}</h3>
                <p className="text-gray-400 mb-5">{nextLevel?.difficulty} • {nextLevel?.hours} hours</p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {nextLevel?.topics.slice(0, 3).map((t: string) => (
                    <span key={t} className="text-xs px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-300">
                      {t}
                    </span>
                  ))}
                </div>
                <Link
                  href={`/path/${currentDomainInfo.id}`}
                  className="inline-flex px-8 py-3 rounded-xl font-bold text-black transition-all hover:opacity-90"
                  style={{ background: theme.gradient }}
                >
                  Resume Path
                </Link>
              </div>
            </DashboardCard>

            <DashboardCard className="p-8">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3 font-['Orbitron']">
                <Briefcase className="w-6 h-6 text-green-400" /> Recommended Jobs
              </h2>
              <div className="space-y-4">
                {[
                  { title: "Junior RTL Engineer", company: "Qualcomm", loc: "Bengaluru", match: "85%" },
                  { title: "Verification Intern", company: "NVIDIA", loc: "Pune", match: "72%" },
                  { title: "ASIC Design Engineer", company: "Intel", loc: "Hyderabad", match: "64%" },
                ].map((job, i) => (
                  <div key={i} className="p-5 rounded-2xl bg-white/5 border border-white/10 flex justify-between items-center hover:bg-white/10 transition-colors cursor-pointer">
                    <div>
                      <h4 className="text-white font-bold text-lg mb-1">{job.title}</h4>
                      <p className="text-sm text-gray-400">{job.company} • {job.loc}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-green-400 font-bold mb-2">{job.match} Match</div>
                      <span className="text-sm text-blue-400 hover:text-blue-300 hover:underline transition-colors">
                        Apply ↗
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </DashboardCard>
          </div>

          {/* Side Area */}
          <div className="space-y-6">
            {/* Daily Missions */}
            <DailyMissions />

            {/* Skills Graph */}
            <DashboardCard className="p-6">
              <h2 className="text-lg font-bold text-white mb-6 font-['Orbitron']">Skills Graph</h2>
              <div className="space-y-5">
                {[
                  { name: "Digital Logic", val: 80, color: "#38bdf8" },
                  { name: "Verilog", val: 65, color: "#a855f7" },
                  { name: "Scripting", val: 40, color: "#facc15" },
                  { name: "Architecture", val: 20, color: "#fb923c" },
                ].map((s, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-sm text-gray-300 mb-2 font-medium">
                      <span>{s.name}</span>
                      <span className="font-mono text-gray-400">{s.val}%</span>
                    </div>
                    <ProgressBar value={s.val} max={100} color={s.color} className="h-2.5" />
                  </div>
                ))}
              </div>
            </DashboardCard>
          </div>
        </div>
      </div>

      <AchievementToast achievement={newAchievement} onClose={clearNewAchievement} />
    </div>
  );
}

function AwardBadge({ rank }: { rank: string }) {
  return (
    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center transform rotate-45 shadow-lg shadow-purple-900/50">
      <div className="transform -rotate-45 text-white font-bold text-2xl font-['Orbitron']">
        {rank.charAt(0)}
      </div>
    </div>
  );
}