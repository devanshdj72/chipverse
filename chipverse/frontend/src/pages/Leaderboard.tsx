import { useEffect, useState } from "react";
import { Trophy, Medal, Flame, Crown, Loader2 } from "lucide-react";
import CircuitBackground from "@/components/CircuitBackground";
import { DOMAIN_THEMES } from "@/lib/themes";
import api from "@/lib/api";

type Leader = {
  rank: number;
  userId: string;
  name: string;
  avatarUrl?: string;
  xp: number;
  streak: number;
  rank_title: string;
  topDomain: string;
  totalLevelsCompleted: number;
};

export default function Leaderboard() {
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalUsers: 0, totalLevelsCompleted: 0, totalXp: 0 });

  useEffect(() => {
    const fetch = async () => {
      try {
        const [lbRes, statsRes] = await Promise.all([
          api.user.getLeaderboard(),
          api.user.getSiteStats(),
        ]);
        setLeaders(lbRes.data);
        setStats(statsRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-300" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
    return <span className="text-gray-500 font-mono text-sm w-5 text-center">#{rank}</span>;
  };

  const getTheme = (domain: string) => DOMAIN_THEMES[domain] ?? DOMAIN_THEMES["rtl"];

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 relative bg-black">
      <CircuitBackground />
      <div className="max-w-4xl mx-auto relative z-10 pt-8">

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 font-['Orbitron'] flex items-center justify-center gap-3">
            <Trophy className="w-10 h-10 text-yellow-400" />
            Leaderboard
          </h1>
          <p className="text-gray-400 text-lg">Top engineers on ChipVerse ranked by XP</p>
        </div>

        {/* Site Stats */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { label: "Total Engineers", value: stats.totalUsers.toLocaleString() },
            { label: "Levels Completed", value: stats.totalLevelsCompleted.toLocaleString() },
            { label: "Total XP Earned", value: stats.totalXp.toLocaleString() },
          ].map((s, i) => (
            <div key={i} className="bg-black/40 border border-white/10 rounded-2xl p-4 text-center backdrop-blur-md">
              <div className="text-2xl font-bold text-white font-mono">{s.value}</div>
              <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Top 3 Podium */}
        {leaders.length >= 3 && (
          <div className="grid grid-cols-3 gap-4 mb-10">
            {[leaders[1], leaders[0], leaders[2]].map((leader, i) => {
              const podiumOrder = [2, 1, 3];
              const heights = ["h-24", "h-32", "h-20"];
              const theme = getTheme(leader.topDomain);
              return (
                <div key={leader.userId} className="flex flex-col items-center">
                  {leader.avatarUrl ? (
                    <img src={leader.avatarUrl} alt={leader.name}
                      className="w-16 h-16 rounded-full object-cover mb-2 border-2"
                      style={{ borderColor: theme.primary, boxShadow: `0 0 20px ${theme.glow}` }} />
                  ) : (
                    <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white mb-2 border-2"
                      style={{ background: theme.card, borderColor: theme.primary, boxShadow: `0 0 20px ${theme.glow}` }}>
                      {leader.name.charAt(0)}
                    </div>
                  )}
                  <div className="text-white font-bold text-sm text-center mb-1">{leader.name}</div>
                  <div className="text-xs font-mono mb-2" style={{ color: theme.primary }}>
                    {leader.xp.toLocaleString()} XP
                  </div>
                  <div className={`w-full ${heights[i]} rounded-t-xl flex items-center justify-center`}
                    style={{ background: theme.card, border: `1px solid ${theme.border}` }}>
                    {getRankIcon(podiumOrder[i])}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {leaders.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            <Trophy className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p className="text-lg">No engineers on the leaderboard yet.</p>
            <p className="text-sm mt-2">Complete levels to appear here!</p>
          </div>
        )}

        {/* Full List */}
        <div className="space-y-3">
          {leaders.map((leader) => {
            const theme = getTheme(leader.topDomain);
            return (
              <div key={leader.userId}
                className="flex items-center gap-4 p-4 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md hover:border-white/20 transition-all">
                <div className="w-8 flex justify-center shrink-0">
                  {getRankIcon(leader.rank)}
                </div>
                {leader.avatarUrl ? (
                  <img src={leader.avatarUrl} alt={leader.name}
                    className="w-10 h-10 rounded-full object-cover border shrink-0"
                    style={{ borderColor: theme.primary }} />
                ) : (
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white border shrink-0"
                    style={{ background: theme.card, borderColor: theme.primary }}>
                    {leader.name.charAt(0)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-white font-bold truncate">{leader.name}</div>
                  <div className="text-xs text-gray-500 capitalize">
                    {leader.topDomain.replace("-", " ")} · {leader.rank_title} · {leader.totalLevelsCompleted} levels
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="flex items-center gap-1 text-orange-400">
                    <Flame className="w-4 h-4" />
                    <span className="text-sm font-bold">{leader.streak}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold font-mono" style={{ color: theme.primary }}>
                      {leader.xp.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">XP</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}