import { useEffect, useState } from "react";
import { Trophy, Medal, Flame, Crown, Loader2, Swords, Users } from "lucide-react";
import CircuitBackground from "@/components/CircuitBackground";
import { DOMAIN_THEMES } from "@/lib/themes";
import api from "@/lib/api";
import { useUser } from "@/lib/user";

type Leader = {
  rank: number; userId: string; name: string; avatarUrl?: string;
  xp: number; streak: number; rank_title: string; topDomain: string;
  totalLevelsCompleted: number; battlesWon?: number; isMe?: boolean;
};

// ── NEW: Avatar display with image support ────────────────────────────────────
function LeaderAvatar({
  name, avatarUrl, size = "md", borderColor, glowColor, isMe,
}: {
  name: string; avatarUrl?: string;
  size?: "sm" | "md" | "lg";
  borderColor?: string; glowColor?: string; isMe?: boolean;
}) {
  const [imgFailed, setImgFailed] = useState(false);
  const glow   = isMe ? "#a855f7" : (glowColor ?? borderColor ?? "#4169e1");
  const showImg = avatarUrl && !imgFailed;

  // ── LARGE: Frameless floating character for podium ──────────────────────────
  if (size === "lg") {
    return (
      <div style={{
        position: "relative", width: 130, height: 200, flexShrink: 0,
        // Dark gradient bg — screen blend mode needs near-black background
        background: `radial-gradient(ellipse at 50% 80%, ${glow}22 0%, #05050f 70%)`,
        borderRadius: 16,
        overflow: "hidden",
      }}>
        {/* Ground glow */}
        <div style={{
          position: "absolute", bottom: 8, left: "50%",
          transform: "translateX(-50%)",
          width: 90, height: 18,
          background: `radial-gradient(ellipse, ${glow}99, transparent 70%)`,
          filter: "blur(8px)",
        }}/>

        {showImg ? (
          <img
            src={avatarUrl}
            alt={name}
            style={{
              position: "absolute", inset: 0,
              width: "100%", height: "100%",
              objectFit: "contain",
              objectPosition: "center bottom",
              // KEY: removes black PNG background just like in avatar picker
              mixBlendMode: "screen",
              filter: `drop-shadow(0 0 12px ${glow}) drop-shadow(0 0 24px ${glow}88)`,
              animation: "char3D 5s ease-in-out infinite",
            }}
            onError={() => setImgFailed(true)}
          />
        ) : (
          <div style={{
            width: "100%", height: "100%",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 40, fontWeight: 800, color: "#fff",
            filter: `drop-shadow(0 0 20px ${glow})`,
            animation: "char3D 5s ease-in-out infinite",
          }}>
            {name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
    );
  }

  // ── SMALL/MED: List rows ────────────────────────────────────────────────────
  const dim = size === "sm" ? 34 : 44;
  return (
    <div style={{
      width: dim, height: dim * 1.4, flexShrink: 0, position: "relative",
      background: `radial-gradient(ellipse at 50% 80%, ${glow}22, #05050f)`,
      borderRadius: 8, overflow: "hidden",
    }}>
      {showImg ? (
        <img
          src={avatarUrl}
          alt={name}
          style={{
            width: "100%", height: "100%",
            objectFit: "contain",
            objectPosition: "center bottom",
            mixBlendMode: "screen",
            filter: `drop-shadow(0 0 6px ${glow}88)`,
            animation: "leaderFloat 3.5s ease-in-out infinite",
          }}
          onError={() => setImgFailed(true)}
        />
      ) : (
        <div style={{
          width: "100%", height: "100%",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 15, fontWeight: 700, color: "#fff",
        }}>
          {name.charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  );
}

export default function Leaderboard() {
  const { user, isAuthenticated } = useUser();
  const [tab, setTab] = useState<"global" | "friends">("global");
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [friendsLb, setFriendsLb] = useState<Leader[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalUsers: 0, totalLevelsCompleted: 0, totalXp: 0 });

  useEffect(() => { loadGlobal(); }, []);

  useEffect(() => {
    if (tab === "friends" && isAuthenticated) loadFriends();
  }, [tab, isAuthenticated]);

  const loadGlobal = async () => {
    try {
      setLoading(true);
      const [lbRes, statsRes] = await Promise.all([
        api.user.getLeaderboard(),
        api.user.getSiteStats(),
      ]);
      setLeaders(lbRes.data);
      setStats(statsRes.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const loadFriends = async () => {
    try {
      setLoading(true);
      const res = await api.friends.getLeaderboard();
      setFriendsLb(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-300" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
    return <span className="text-gray-500 font-mono text-sm w-5 text-center">#{rank}</span>;
  };

  const getTheme = (domain: string) => DOMAIN_THEMES[domain] ?? DOMAIN_THEMES["rtl"];
  const displayList = tab === "global" ? leaders : friendsLb;

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 relative bg-black">
      <style>{`
        @keyframes leaderFloat {
          0%,100% { transform: translateY(0px); }
          50%      { transform: translateY(-6px); }
        }
        @keyframes char3D {
          0%   { transform: perspective(400px) rotateY(0deg)   translateY(0px);  }
          25%  { transform: perspective(400px) rotateY(-12deg) translateY(-10px); }
          50%  { transform: perspective(400px) rotateY(0deg)   translateY(-14px); }
          75%  { transform: perspective(400px) rotateY(12deg)  translateY(-10px); }
          100% { transform: perspective(400px) rotateY(0deg)   translateY(0px);  }
        }
      `}</style>
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

        {/* Tabs */}
        <div className="flex gap-2 mb-8 bg-white/5 p-1 rounded-xl border border-white/10">
          <button onClick={() => setTab("global")}
            className={`flex-1 py-2.5 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 ${tab === "global" ? "bg-yellow-500 text-black" : "text-gray-400 hover:text-white"}`}>
            <Trophy className="w-4 h-4" /> Global
          </button>
          {isAuthenticated && (
            <button onClick={() => setTab("friends")}
              className={`flex-1 py-2.5 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 ${tab === "friends" ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white"}`}>
              <Users className="w-4 h-4" /> Friends
            </button>
          )}
        </div>

        {/* Site Stats */}
        {tab === "global" && (
          <div className="grid grid-cols-3 gap-4 mb-10">
            {[
              { label: "Total Engineers",    value: stats.totalUsers.toLocaleString()          },
              { label: "Levels Completed",   value: stats.totalLevelsCompleted.toLocaleString() },
              { label: "Total XP Earned",    value: stats.totalXp.toLocaleString()             },
            ].map((s, i) => (
              <div key={i} className="bg-black/40 border border-white/10 rounded-2xl p-4 text-center backdrop-blur-md">
                <div className="text-2xl font-bold text-white font-mono">{s.value}</div>
                <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 text-yellow-400 animate-spin" />
          </div>
        ) : (
          <>
            {/* Top 3 Podium */}
            {displayList.length >= 3 && (
              <div className="grid grid-cols-3 gap-4 mb-10">
                {[displayList[1], displayList[0], displayList[2]].map((leader, i) => {
                  const podiumOrder = [2, 1, 3];
                  const heights = ["h-24", "h-32", "h-20"];
                  const theme = getTheme(leader.topDomain);
                  return (
                    <div key={leader.userId} className="flex flex-col items-center">

                      {/* ── UPDATED: uses LeaderAvatar ── */}
                      <div className="mb-2">
                        <LeaderAvatar
                          name={leader.name}
                          avatarUrl={leader.avatarUrl}
                          size="lg"
                          borderColor={theme.primary}
                          glowColor={leader.isMe ? "#a855f740" : theme.glow}
                          isMe={leader.isMe}
                        />
                      </div>

                      <div className="text-white font-bold text-sm text-center mb-1">
                        {leader.name} {leader.isMe && "(You)"}
                      </div>
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
            {displayList.length === 0 && (
              <div className="text-center py-20 text-gray-500">
                <Trophy className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p className="text-lg">{tab === "friends" ? "Add friends to see them here!" : "No engineers yet."}</p>
              </div>
            )}

            {/* Full List */}
            <div className="space-y-3">
              {displayList.map((leader) => {
                const theme = getTheme(leader.topDomain);
                return (
                  <div key={leader.userId}
                    className={`flex items-center gap-4 p-4 rounded-2xl border backdrop-blur-md transition-all ${leader.isMe ? "border-purple-500/50 bg-purple-500/5" : "border-white/10 bg-black/40 hover:border-white/20"}`}>

                    <div className="w-8 flex justify-center shrink-0">{getRankIcon(leader.rank)}</div>

                    {/* ── UPDATED: uses LeaderAvatar ── */}
                    <LeaderAvatar
                      name={leader.name}
                      avatarUrl={leader.avatarUrl}
                      size="md"
                      borderColor={theme.primary}
                      isMe={leader.isMe}
                    />

                    <div className="flex-1 min-w-0">
                      <div className="text-white font-bold truncate">
                        {leader.name} {leader.isMe && <span className="text-purple-400 text-xs">(You)</span>}
                      </div>
                      <div className="text-xs text-gray-500 capitalize">
                        {leader.topDomain?.replace("-", " ")} · {leader.rank_title}
                        {leader.battlesWon !== undefined && ` · ⚔️ ${leader.battlesWon} wins`}
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
          </>
        )}
      </div>
    </div>
  );
}