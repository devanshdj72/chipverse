import { useState, useEffect, useRef } from "react";
import { Swords, Trophy, Clock, Zap, UserPlus, Search, Check, X, Loader2, History, Send, Shield, Wifi, WifiOff, Bell } from "lucide-react";
import CircuitBackground from "@/components/CircuitBackground";
import { useUser } from "@/lib/user";
import api from "@/lib/api";
import { Link, useLocation } from "wouter";
import { DOMAIN_THEMES } from "@/lib/themes";
import { DOMAIN_LIST } from "@/lib/data";

type Friend = { id: string; name: string; avatarUrl?: string; xp: number; streak: number; rank: string; };
type Battle = {
  id: string; status: string; domainId: string; betXp: number; mode?: string;
  challenger: { id: string; name: string; avatarUrl?: string };
  opponent: { id: string; name: string; avatarUrl?: string };
  challengerXp: number; opponentXp: number; winnerId?: string;
  createdAt: string;
};

// ─── Result Popup ─────────────────────────────────────────────
function ResultPopup({ battle, userId, onClose, onView }: {
  battle: Battle; userId: string; onClose: () => void; onView: () => void;
}) {
  const isChallenger = battle.challenger.id === userId;
  const opponent = isChallenger ? battle.opponent : battle.challenger;
  const myScore = isChallenger ? battle.challengerXp : battle.opponentXp;
  const oppScore = isChallenger ? battle.opponentXp : battle.challengerXp;
  const won = battle.winnerId === userId;
  const isDraw = battle.status === 'COMPLETED' && !battle.winnerId;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-gray-950 border border-purple-500/50 rounded-2xl p-6 text-center shadow-2xl shadow-purple-900/40 animate-in fade-in zoom-in duration-300">
        <div className="text-6xl mb-3">{isDraw ? "🤝" : won ? "🏆" : "💀"}</div>
        <h2 className="text-2xl font-bold text-white font-['Orbitron'] mb-1">
          {isDraw ? "It's a Draw!" : won ? "You Won!" : "You Lost!"}
        </h2>
        <p className="text-gray-400 text-sm mb-4">
          {isDraw ? "No XP transferred" : won ? `+${battle.betXp} XP added!` : `-${battle.betXp} XP deducted`}
        </p>

        {/* Score row */}
        <div className="grid grid-cols-3 gap-3 items-center mb-5">
          <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
            <div className="text-xl font-bold font-mono text-purple-400">
              {myScore === -1 ? "—" : myScore}
            </div>
            <div className="text-xs text-gray-500 mt-1">You</div>
          </div>
          <div className="text-gray-600 text-xs font-bold">VS</div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
            <div className="text-xl font-bold font-mono text-white">
              {oppScore === -1 ? "—" : oppScore}
            </div>
            <div className="text-xs text-gray-500 mt-1">{opponent.name}</div>
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-white/10 text-gray-400 text-sm font-bold hover:bg-white/5">
            Close
          </button>
          <button onClick={onView}
            className="flex-1 py-2.5 rounded-xl bg-purple-600 text-white text-sm font-bold hover:bg-purple-700">
            View Details
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BattleField() {
  const { user, profile } = useUser();
  const [, setLocation] = useLocation();
  const [tab, setTab] = useState<"battles" | "history" | "friends">("battles");
  const [friends, setFriends] = useState<Friend[]>([]);
  const [battles, setBattles] = useState<Battle[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [challengeModal, setChallengeModal] = useState<Friend | null>(null);
  const [selectedDomain, setSelectedDomain] = useState("rtl");
  const [betXp, setBetXp] = useState(50);
  const [challenging, setChallenging] = useState(false);
  const [battleMode, setBattleMode] = useState<'LIVE' | 'OFFLINE'>('OFFLINE');

  // Result popup state
  const [resultPopup, setResultPopup] = useState<Battle | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const seenCompletedRef = useRef<Set<string>>(new Set());

  useEffect(() => { loadData(); }, []);

  // ── Poll active battles every 5s to detect when opponent finishes ──
  useEffect(() => {
    if (pollRef.current) clearInterval(pollRef.current);

    pollRef.current = setInterval(async () => {
      try {
        const res = await api.battles.getAll();
        const updated: Battle[] = res.data;
        setBattles(updated);

        // Check if any battle just became COMPLETED and we haven't shown popup yet
        updated.forEach(b => {
          if (
            b.status === 'COMPLETED' &&
            !seenCompletedRef.current.has(b.id)
          ) {
            const isChallenger = b.challenger.id === user.id;
            const iSubmitted = isChallenger
              ? b.challengerXp !== -1
              : b.opponentXp !== -1;

            // Only show popup if I actually played this battle
            if (iSubmitted) {
              seenCompletedRef.current.add(b.id);
              setResultPopup(b);
            }
          }
        });
      } catch {
        // Silent fail
      }
    }, 5000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [user.id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [friendsRes, battlesRes, requestsRes] = await Promise.all([
        api.friends.getAll(),
        api.battles.getAll(),
        api.friends.getRequests(),
      ]);
      setFriends(friendsRes.data);
      setBattles(battlesRes.data);
      setPendingRequests(requestsRes.data);

      // Mark already-seen completed battles so we don't re-popup them on load
      battlesRes.data.forEach((b: Battle) => {
        if (b.status === 'COMPLETED') seenCompletedRef.current.add(b.id);
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (q: string) => {
    setSearchQuery(q);
    if (q.length < 2) { setSearchResults([]); return; }
    setSearching(true);
    try {
      const res = await api.friends.search(q);
      setSearchResults(res.data);
    } catch { } finally { setSearching(false); }
  };

  const handleSendRequest = async (userId: string) => {
    try {
      await api.friends.sendRequest(userId);
      setSearchResults(prev => prev.map(u => u.id === userId ? { ...u, requestPending: true } : u));
    } catch (err: any) { alert(err.message); }
  };

  const handleRespondRequest = async (requestId: string, action: 'accept' | 'reject') => {
    try {
      await api.friends.respondRequest(requestId, action);
      setPendingRequests(prev => prev.filter(r => r.id !== requestId));
      if (action === 'accept') loadData();
    } catch (err: any) { alert(err.message); }
  };

  const handleChallenge = async () => {
    if (!challengeModal) return;
    setChallenging(true);
    try {
      await api.battles.challenge(challengeModal.id, selectedDomain, betXp, battleMode);
      setChallengeModal(null);
      await loadData();
      alert(`⚔️ Challenge sent to ${challengeModal.name}!`);
    } catch (err: any) { alert(err.message); } finally { setChallenging(false); }
  };

  const handleRespondBattle = async (battleId: string, action: 'accept' | 'decline') => {
    try {
      await api.battles.respond(battleId, action);
      if (action === 'accept') {
        window.location.href = `/battle/${battleId}`;
      } else {
        await loadData();
      }
    } catch (err: any) { alert(err.message); }
  };

  // ── Check if current user already submitted their score ──
  const hasISubmitted = (battle: Battle): boolean => {
    const isChallenger = battle.challenger.id === user.id;
    return isChallenger
      ? battle.challengerXp !== -1
      : battle.opponentXp !== -1;
  };

  const getBattleStatus = (battle: Battle) => {
    const isChallenger = battle.challenger.id === user.id;
    if (battle.status === 'PENDING' && !isChallenger) return { label: 'Respond', color: 'text-yellow-400', action: true };
    if (battle.status === 'PENDING') return { label: 'Awaiting response', color: 'text-gray-400', action: false };
    if (battle.status === 'ACTIVE') return { label: '⚔️ LIVE', color: 'text-green-400', action: true };
    if (battle.status === 'DECLINED') return { label: 'Declined', color: 'text-red-400', action: false };
    if (battle.status === 'COMPLETED') {
      const won = battle.winnerId === user.id;
      const draw = !battle.winnerId;
      return { label: draw ? 'Draw' : won ? `+${battle.betXp} XP Won` : `-${battle.betXp} XP Lost`, color: draw ? 'text-gray-400' : won ? 'text-green-400' : 'text-red-400', action: false };
    }
    return { label: battle.status, color: 'text-gray-500', action: false };
  };

  const activeBattles = battles.filter(b => b.status === 'PENDING' || b.status === 'ACTIVE');
  const historyBattles = battles.filter(b => b.status === 'COMPLETED' || b.status === 'DECLINED');
  const incomingBattles = battles.filter(b => b.status === 'PENDING' && b.opponent.id === user.id);

  const getResultBadge = (battle: Battle) => {
    if (battle.status === 'DECLINED') return { text: 'DECLINED', cls: 'bg-gray-500/20 text-gray-400 border-gray-500/30' };
    if (!battle.winnerId) return { text: 'DRAW', cls: 'bg-gray-500/20 text-gray-300 border-gray-500/30' };
    if (battle.winnerId === user.id) return { text: 'WIN', cls: 'bg-green-500/20 text-green-400 border-green-500/30' };
    return { text: 'LOSS', cls: 'bg-red-500/20 text-red-400 border-red-500/30' };
  };

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 relative bg-black">
      <CircuitBackground />
      <div className="max-w-5xl mx-auto relative z-10 pt-8">

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 font-['Orbitron'] flex items-center justify-center gap-3">
            <Swords className="w-10 h-10 text-purple-400" />
            Battle Field
          </h1>
          <p className="text-gray-400 text-lg">Challenge friends · Wager XP · Prove your VLSI skills</p>
          <div className="mt-4 flex items-center justify-center gap-2 text-sm">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span className="text-yellow-400 font-bold font-mono">{profile.xp} XP</span>
            <span className="text-gray-500">available to wager</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 bg-white/5 p-1 rounded-xl border border-white/10">
          {[
            { id: 'battles', label: '⚔️ Battles', count: incomingBattles.length },
            { id: 'history', label: '📜 History', count: 0 },
            { id: 'friends', label: '👥 Friends', count: pendingRequests.length },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id as any)}
              className={`flex-1 py-2.5 rounded-lg font-bold text-sm transition-all relative ${tab === t.id ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}>
              {t.label}
              {t.count > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Battles Tab ── */}
        {tab === 'battles' && (
          <div className="space-y-6">
            <div className="bg-black/40 border border-purple-500/30 rounded-2xl p-6">
              <h2 className="text-white font-bold text-lg mb-4 font-['Orbitron']">⚔️ Challenge a Friend</h2>
              {friends.length === 0 ? (
                <p className="text-gray-500 text-sm">Add friends first to challenge them!</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {friends.map(friend => (
                    <button key={friend.id} onClick={() => setChallengeModal(friend)}
                      className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/50 transition-all text-left group">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-purple-600/30 border border-purple-500/30 flex items-center justify-center text-white font-bold">
                          {friend.name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-white font-bold text-sm">{friend.name}</div>
                          <div className="text-xs text-yellow-400 font-mono">{friend.xp} XP</div>
                        </div>
                      </div>
                      <div className="text-xs text-purple-400 group-hover:text-purple-300">⚔️ Challenge</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Incoming challenges */}
            {incomingBattles.length > 0 && (
              <div className="bg-black/40 border border-yellow-500/30 rounded-2xl p-6">
                <h2 className="text-white font-bold text-lg mb-4 font-['Orbitron'] flex items-center gap-2">
                  <Shield className="w-5 h-5 text-yellow-400" /> Incoming Challenges ({incomingBattles.length})
                </h2>
                <div className="space-y-3">
                  {incomingBattles.map(battle => (
                    <div key={battle.id} className="flex items-center gap-4 p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/20">
                      <div className="w-10 h-10 rounded-full bg-yellow-600/30 flex items-center justify-center font-bold text-white">
                        {battle.challenger.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-white font-bold text-sm">{battle.challenger.name} challenged you</div>
                        <div className="text-xs text-gray-500 capitalize mt-0.5 flex items-center gap-2">
                          <span>{battle.domainId.replace('-', ' ')} · Bet: <span className="text-yellow-400 font-mono">{battle.betXp} XP</span></span>
                          {battle.mode === 'LIVE'
                            ? <span className="flex items-center gap-1 text-red-400"><Wifi className="w-3 h-3" /> LIVE</span>
                            : <span className="flex items-center gap-1 text-blue-400"><WifiOff className="w-3 h-3" /> OFFLINE</span>
                          }
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button onClick={() => handleRespondBattle(battle.id, 'accept')}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-500/20 border border-green-500/30 text-green-400 text-xs font-bold hover:bg-green-500/30">
                          <Check className="w-3 h-3" /> Accept
                        </button>
                        <button onClick={() => handleRespondBattle(battle.id, 'decline')}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-bold hover:bg-red-500/30">
                          <X className="w-3 h-3" /> Decline
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Active battles */}
            <div>
              <h2 className="text-white font-bold text-lg mb-4 font-['Orbitron']">Active Battles</h2>
              {activeBattles.filter(b => !(b.status === 'PENDING' && b.opponent.id === user.id)).length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Swords className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>No active battles. Challenge a friend!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeBattles
                    .filter(b => !(b.status === 'PENDING' && b.opponent.id === user.id))
                    .map(battle => {
                      const isChallenger = battle.challenger.id === user.id;
                      const opponent = isChallenger ? battle.opponent : battle.challenger;
                      const status = getBattleStatus(battle);
                      const iAlreadySubmitted = battle.status === 'ACTIVE' && hasISubmitted(battle);

                      return (
                        <div key={battle.id} className="flex items-center gap-4 p-4 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md">
                          <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-bold text-white">
                            {opponent.name.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-white font-bold">
                              {isChallenger ? `You vs ${opponent.name}` : `${opponent.name} challenged you`}
                            </div>
                            <div className="text-xs text-gray-500 capitalize flex items-center gap-2 mt-0.5">
                              <span>{battle.domainId.replace('-', ' ')} · Bet: <span className="text-yellow-400">{battle.betXp} XP</span></span>
                              {battle.mode === 'LIVE'
                                ? <span className="flex items-center gap-1 text-red-400"><Wifi className="w-3 h-3" /> LIVE</span>
                                : <span className="flex items-center gap-1 text-blue-400"><WifiOff className="w-3 h-3" /> OFFLINE</span>
                              }
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {battle.status === 'ACTIVE' && iAlreadySubmitted ? (
                              // ✅ User already submitted — show waiting state
                              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/25">
                                <Loader2 className="w-3 h-3 text-yellow-400 animate-spin" />
                                <span className="text-yellow-400 text-xs font-bold">
                                  Awaiting {opponent.name}...
                                </span>
                              </div>
                            ) : battle.status === 'ACTIVE' ? (
                              // ✅ User hasn't played yet — show Fight button
                              <Link href={`/battle/${battle.id}`}
                                className="px-3 py-1.5 rounded-lg bg-purple-600 text-white text-sm font-bold hover:bg-purple-700">
                                Fight!
                              </Link>
                            ) : (
                              // PENDING — awaiting accept
                              <span className={`text-sm font-bold ${status.color}`}>{status.label}</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── History Tab ── */}
        {tab === 'history' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-white font-bold text-lg font-['Orbitron'] flex items-center gap-2">
                <History className="w-5 h-5 text-purple-400" /> Battle History
              </h2>
              <span className="text-xs text-gray-500">{historyBattles.length} battles</span>
            </div>

            {historyBattles.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <History className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>No completed battles yet.</p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-white/10">
                <div className="grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-4 px-5 py-3 bg-white/5 border-b border-white/10 text-xs text-gray-500 font-bold uppercase tracking-wider">
                  <span>Opponent</span>
                  <span className="text-center">Mode</span>
                  <span className="text-center">Domain</span>
                  <span className="text-center">Score</span>
                  <span className="text-center">Bet</span>
                  <span className="text-center">Result</span>
                </div>

                {historyBattles.map((battle, i) => {
                  const isChallenger = battle.challenger.id === user.id;
                  const opponent = isChallenger ? battle.opponent : battle.challenger;
                  const myScore = isChallenger ? battle.challengerXp : battle.opponentXp;
                  const oppScore = isChallenger ? battle.opponentXp : battle.challengerXp;
                  const badge = getResultBadge(battle);
                  const sentByMe = battle.challenger.id === user.id;

                  return (
                    <div key={battle.id}
                      className={`grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-4 px-5 py-4 items-center border-b border-white/5 last:border-0 hover:bg-white/3 transition-colors ${i % 2 === 0 ? 'bg-black/20' : 'bg-black/40'}`}>
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-purple-600/30 border border-purple-500/20 flex items-center justify-center font-bold text-white text-sm shrink-0">
                          {opponent.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <div className="text-white font-bold text-sm truncate">{opponent.name}</div>
                          <div className="flex items-center gap-1 text-xs text-gray-600 mt-0.5">
                            {sentByMe ? <><Send className="w-3 h-3" /><span>Sent</span></> : <><Shield className="w-3 h-3" /><span>Received</span></>}
                            <span>·</span>
                            <span>{new Date(battle.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-center">
                        {battle.mode === 'LIVE'
                          ? <span className="flex items-center gap-1 text-xs text-red-400 font-bold"><Wifi className="w-3 h-3" /> LIVE</span>
                          : <span className="flex items-center gap-1 text-xs text-blue-400 font-bold"><WifiOff className="w-3 h-3" /> OFF</span>
                        }
                      </div>

                      <span className="text-xs text-gray-400 capitalize text-center whitespace-nowrap">
                        {battle.domainId.replace('-', ' ')}
                      </span>

                      <div className="text-center">
                        {battle.status === 'DECLINED' ? (
                          <span className="text-xs text-gray-600">—</span>
                        ) : (
                          <span className="text-sm font-mono font-bold text-white">
                            {myScore === -1 ? "—" : myScore}
                            <span className="text-gray-600 mx-1">:</span>
                            {oppScore === -1 ? "—" : oppScore}
                          </span>
                        )}
                      </div>

                      <span className="text-xs text-yellow-400 font-mono font-bold text-center">{battle.betXp} XP</span>

                      <div className="flex justify-center">
                        <span className={`px-2.5 py-1 rounded-lg border text-xs font-bold ${badge.cls}`}>{badge.text}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {historyBattles.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mt-4">
                {[
                  { label: 'Wins',   value: historyBattles.filter(b => b.winnerId === user.id).length, color: 'text-green-400', border: 'border-green-500/20' },
                  { label: 'Losses', value: historyBattles.filter(b => b.status === 'COMPLETED' && b.winnerId && b.winnerId !== user.id).length, color: 'text-red-400', border: 'border-red-500/20' },
                  { label: 'Draws',  value: historyBattles.filter(b => b.status === 'COMPLETED' && !b.winnerId).length, color: 'text-gray-400', border: 'border-white/10' },
                ].map(s => (
                  <div key={s.label} className={`p-4 rounded-xl bg-black/40 border ${s.border} text-center`}>
                    <div className={`text-2xl font-bold font-mono ${s.color}`}>{s.value}</div>
                    <div className="text-xs text-gray-500 mt-1">{s.label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Friends Tab ── */}
        {tab === 'friends' && (
          <div className="space-y-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input type="text" placeholder="Search users by name or email..."
                value={searchQuery} onChange={e => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50" />
            </div>

            {searchResults.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-gray-400 text-sm font-medium">Search Results</h3>
                {searchResults.map(u => (
                  <div key={u.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                    <div className="w-10 h-10 rounded-full bg-purple-600/30 flex items-center justify-center font-bold text-white">{u.name.charAt(0)}</div>
                    <div className="flex-1">
                      <div className="text-white font-bold text-sm">{u.name}</div>
                      <div className="text-xs text-gray-500">{u.email}</div>
                    </div>
                    {u.isFriend ? <span className="text-xs text-green-400 font-bold">Friends ✓</span>
                      : u.requestPending ? <span className="text-xs text-yellow-400">Pending...</span>
                      : <button onClick={() => handleSendRequest(u.id)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-purple-600 text-white text-xs font-bold hover:bg-purple-700"><UserPlus className="w-3 h-3" /> Add</button>}
                  </div>
                ))}
              </div>
            )}

            {pendingRequests.length > 0 && (
              <div>
                <h3 className="text-gray-400 text-sm font-medium mb-3">Friend Requests ({pendingRequests.length})</h3>
                <div className="space-y-2">
                  {pendingRequests.map(req => (
                    <div key={req.id} className="flex items-center gap-3 p-3 rounded-xl bg-yellow-500/5 border border-yellow-500/20">
                      <div className="w-10 h-10 rounded-full bg-yellow-600/30 flex items-center justify-center font-bold text-white">{req.sender.name.charAt(0)}</div>
                      <div className="flex-1">
                        <div className="text-white font-bold text-sm">{req.sender.name}</div>
                        <div className="text-xs text-gray-500">wants to be your friend</div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleRespondRequest(req.id, 'accept')} className="p-1.5 rounded-lg bg-green-500/20 border border-green-500/30 text-green-400 hover:bg-green-500/30"><Check className="w-4 h-4" /></button>
                        <button onClick={() => handleRespondRequest(req.id, 'reject')} className="p-1.5 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30"><X className="w-4 h-4" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h3 className="text-gray-400 text-sm font-medium mb-3">Your Friends ({friends.length})</h3>
              {friends.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <UserPlus className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>No friends yet. Search and add some!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {friends.map(friend => (
                    <div key={friend.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                      <div className="w-10 h-10 rounded-full bg-purple-600/30 flex items-center justify-center font-bold text-white">{friend.name.charAt(0)}</div>
                      <div className="flex-1">
                        <div className="text-white font-bold text-sm">{friend.name}</div>
                        <div className="text-xs text-gray-500 font-mono">{friend.xp} XP · {friend.rank}</div>
                      </div>
                      <button onClick={() => setChallengeModal(friend)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-purple-600/20 border border-purple-500/30 text-purple-400 text-xs font-bold hover:bg-purple-600/30">
                        <Swords className="w-3 h-3" /> Challenge
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Challenge Modal ── */}
      {challengeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-gray-950 border border-purple-500/50 rounded-2xl p-6 shadow-2xl shadow-purple-900/30">
            <h2 className="text-xl font-bold text-white mb-1 font-['Orbitron']">⚔️ Challenge {challengeModal.name}</h2>
            <p className="text-gray-400 text-sm mb-6">Pick a mode, domain, and bet your XP</p>

            <div className="space-y-4">
              {/* Mode selector */}
              <div>
                <label className="text-gray-400 text-sm mb-2 block">Battle Mode</label>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => setBattleMode('LIVE')}
                    className={`p-3 rounded-xl border text-sm font-bold transition-all text-left ${battleMode === 'LIVE' ? 'border-red-500 bg-red-500/20 text-white' : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'}`}>
                    <div className="flex items-center gap-2 mb-1"><Wifi className="w-4 h-4 text-red-400" /><span>LIVE</span></div>
                    <div className="text-xs font-normal opacity-70">15s per Q · Speed wins ties</div>
                  </button>
                  <button onClick={() => setBattleMode('OFFLINE')}
                    className={`p-3 rounded-xl border text-sm font-bold transition-all text-left ${battleMode === 'OFFLINE' ? 'border-blue-500 bg-blue-500/20 text-white' : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'}`}>
                    <div className="flex items-center gap-2 mb-1"><WifiOff className="w-4 h-4 text-blue-400" /><span>OFFLINE</span></div>
                    <div className="text-xs font-normal opacity-70">No timer · Accuracy wins</div>
                  </button>
                </div>
              </div>

              {/* Domain selector */}
              <div>
                <label className="text-gray-400 text-sm mb-2 block">Select Domain</label>
                <div className="grid grid-cols-2 gap-2">
                  {DOMAIN_LIST.map(d => (
                    <button key={d.id} onClick={() => setSelectedDomain(d.id)}
                      className={`p-3 rounded-xl border text-sm font-bold transition-all text-left ${selectedDomain === d.id ? 'border-purple-500 bg-purple-500/20 text-white' : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'}`}>
                      {d.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bet XP */}
              <div>
                <label className="text-gray-400 text-sm mb-2 block">Bet XP (10–500)</label>
                <input type="number" min={10} max={Math.min(500, profile.xp)} value={betXp}
                  onChange={e => setBetXp(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500" />
                <div className="text-xs text-gray-500 mt-1">Your XP: <span className="text-yellow-400">{profile.xp}</span></div>
              </div>

              <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-center">
                <div className="text-purple-300 text-sm">
                  Winner takes <span className="text-yellow-400 font-bold">{betXp} XP</span> from opponent
                  {battleMode === 'LIVE' && <span className="text-red-400"> · Tiebreaker: speed ⚡</span>}
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setChallengeModal(null)}
                  className="flex-1 py-3 rounded-xl border border-white/10 text-gray-400 hover:bg-white/5">
                  Cancel
                </button>
                <button onClick={handleChallenge} disabled={challenging}
                  className="flex-1 py-3 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-700 disabled:opacity-50">
                  {challenging ? 'Sending...' : '⚔️ Challenge!'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Result Popup (auto-shown when opponent finishes) ── */}
      {resultPopup && (
        <ResultPopup
          battle={resultPopup}
          userId={user.id}
          onClose={() => setResultPopup(null)}
          onView={() => {
            setResultPopup(null);
            setLocation(`/battle/${resultPopup.id}`);
          }}
        />
      )}
    </div>
  );
}