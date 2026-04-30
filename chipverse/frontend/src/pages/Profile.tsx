import { useState, useEffect } from "react";
import { useUserContext } from "@/lib/user";
import { DOMAIN_LIST, ROADMAPS } from "@/lib/data";
import { DOMAIN_THEMES } from "@/lib/themes";
import { RANKS } from "@/lib/ranks";
import CircuitBackground from "@/components/CircuitBackground";
import ProgressBar from "@/components/ProgressBar";
import api from "@/lib/api";
import {
  User, Mail, Phone, Edit3, Save, X,
  Trophy, Flame, Target, Award, CheckCircle2,
  Users, UserPlus, Search, Check, UserX, Clock,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Friend {
  id: string;
  name: string;
  avatarUrl?: string;
  xp: number;
  streak: number;
  rank: string;
  currentDomain: string;
  friendshipId: string;
}

interface FriendRequest {
  id: string;
  sender: { id: string; name: string; avatarUrl?: string };
  createdAt: string;
}

interface SearchUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  isFriend: boolean;
  requestPending: boolean;
}

// ─── Avatar helper ────────────────────────────────────────────────────────────
function Avatar({ name, avatarUrl, size = "md" }: { name: string; avatarUrl?: string; size?: "sm" | "md" | "lg" }) {
  const sz = size === "sm" ? "w-8 h-8 text-sm" : size === "lg" ? "w-16 h-16 text-2xl" : "w-10 h-10 text-base";
  if (avatarUrl) return <img src={avatarUrl} alt={name} className={`${sz} rounded-full object-cover border border-white/10`} />;
  return (
    <div className={`${sz} rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center font-bold text-white flex-shrink-0`}>
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

// ─── Friends Tab ──────────────────────────────────────────────────────────────
function FriendsTab() {
  const [tab, setTab] = useState<"friends" | "requests" | "search">("friends");
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  // Load friends + pending requests on mount
  useEffect(() => {
    loadFriends();
    loadRequests();
  }, []);

  const loadFriends = async () => {
    setLoading(true);
    try {
      const res = await api.friends.getAll();
      setFriends(res.data ?? []);
    } catch (e: any) {
      showToast(e.message || "Failed to load friends");
    } finally {
      setLoading(false);
    }
  };

  const loadRequests = async () => {
    try {
      const res = await api.friends.getRequests();
      setRequests(res.data ?? []);
    } catch {}
  };

  // Debounced search
  useEffect(() => {
    if (searchQuery.length < 2) { setSearchResults([]); return; }
    const t = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await api.friends.search(searchQuery);
        setSearchResults(res.data ?? []);
      } catch (e: any) {
        showToast(e.message || "Search failed");
      } finally {
        setSearching(false);
      }
    }, 400);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const handleSendRequest = async (receiverId: string) => {
    setActionLoading(receiverId);
    try {
      await api.friends.sendRequest(receiverId);
      showToast("Friend request sent! ✓");
      // Mark as pending in UI immediately
      setSearchResults(prev =>
        prev.map(u => u.id === receiverId ? { ...u, requestPending: true } : u)
      );
    } catch (e: any) {
      showToast(e.message || "Failed to send request");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRespond = async (requestId: string, action: "accept" | "reject") => {
    setActionLoading(requestId);
    try {
      await api.friends.respondRequest(requestId, action);
      showToast(action === "accept" ? "Friend added! ✓" : "Request declined");
      // Remove from pending list
      setRequests(prev => prev.filter(r => r.id !== requestId));
      // Reload friends if accepted
      if (action === "accept") loadFriends();
    } catch (e: any) {
      showToast(e.message || "Failed");
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnfriend = async (friendId: string) => {
    setActionLoading(friendId);
    try {
      await api.friends.unfriend(friendId);
      showToast("Unfriended");
      setFriends(prev => prev.filter(f => f.id !== friendId));
    } catch (e: any) {
      showToast(e.message || "Failed");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="bg-black/40 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
      {/* Toast */}
      {toast && (
        <div className="mb-4 px-4 py-2.5 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-300 text-sm font-medium">
          {toast}
        </div>
      )}

      {/* Sub-tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {([
          { key: "friends", label: "My Friends", icon: Users, count: friends.length },
          { key: "requests", label: "Requests", icon: Clock, count: requests.length },
          { key: "search", label: "Find People", icon: Search },
        ] as const).map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${
              tab === t.key
                ? "bg-blue-600/20 border-blue-500/50 text-blue-300"
                : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white"
            }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
            {t.count !== undefined && t.count > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                t.key === "requests" ? "bg-orange-500 text-white" : "bg-white/10 text-gray-300"
              }`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── FRIENDS LIST ── */}
      {tab === "friends" && (
        <div>
          <h3 className="text-white font-bold font-['Orbitron'] text-sm uppercase tracking-wider mb-4">
            Friends ({friends.length})
          </h3>
          {loading ? (
            <div className="text-center py-10 text-gray-500 text-sm">Loading...</div>
          ) : friends.length === 0 ? (
            <div className="text-center py-10">
              <Users className="w-10 h-10 mx-auto mb-3 text-gray-700" />
              <p className="text-gray-500 text-sm">No friends yet.</p>
              <button
                onClick={() => setTab("search")}
                className="mt-3 text-blue-400 text-sm hover:underline"
              >
                Find people to add →
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {friends.map(friend => (
                <div
                  key={friend.id}
                  className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/8 transition-colors"
                >
                  <Avatar name={friend.name} avatarUrl={friend.avatarUrl} />
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-semibold text-sm truncate">{friend.name}</div>
                    <div className="text-xs text-gray-500">{friend.rank}</div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-yellow-400 font-mono">{friend.xp} XP</span>
                      <span className="text-xs text-orange-400 flex items-center gap-1">
                        <Flame className="w-3 h-3" />{friend.streak}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleUnfriend(friend.id)}
                    disabled={actionLoading === friend.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-50"
                  >
                    <UserX className="w-3.5 h-3.5" />
                    {actionLoading === friend.id ? "..." : "Unfriend"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── PENDING REQUESTS ── */}
      {tab === "requests" && (
        <div>
          <h3 className="text-white font-bold font-['Orbitron'] text-sm uppercase tracking-wider mb-4">
            Pending Requests ({requests.length})
          </h3>
          {requests.length === 0 ? (
            <div className="text-center py-10">
              <Clock className="w-10 h-10 mx-auto mb-3 text-gray-700" />
              <p className="text-gray-500 text-sm">No pending friend requests.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map(req => (
                <div
                  key={req.id}
                  className="flex items-center gap-3 p-4 rounded-xl bg-orange-500/5 border border-orange-500/20"
                >
                  <Avatar name={req.sender.name} avatarUrl={req.sender.avatarUrl} />
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-semibold text-sm truncate">{req.sender.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5">Wants to be your friend</div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleRespond(req.id, "accept")}
                      disabled={actionLoading === req.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-green-600/20 border border-green-500/40 text-green-400 hover:bg-green-600/30 transition-all disabled:opacity-50"
                    >
                      <Check className="w-3.5 h-3.5" />
                      {actionLoading === req.id ? "..." : "Accept"}
                    </button>
                    <button
                      onClick={() => handleRespond(req.id, "reject")}
                      disabled={actionLoading === req.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-red-600/10 border border-red-500/20 text-red-400 hover:bg-red-600/20 transition-all disabled:opacity-50"
                    >
                      <X className="w-3.5 h-3.5" />
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── SEARCH USERS ── */}
      {tab === "search" && (
        <div>
          <h3 className="text-white font-bold font-['Orbitron'] text-sm uppercase tracking-wider mb-4">
            Find People
          </h3>

          {/* Search input */}
          <div className="relative mb-5">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full bg-white/5 border border-white/15 rounded-xl pl-10 pr-4 py-3 text-white text-sm placeholder-gray-600 outline-none focus:border-blue-500/60 focus:bg-white/8 transition-all"
              style={{ fontSize: "16px" /* Prevents iOS zoom */ }}
            />
            {searching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            )}
          </div>

          {/* Results */}
          {searchQuery.length < 2 ? (
            <p className="text-center text-gray-600 text-sm py-6">Type at least 2 characters to search</p>
          ) : searchResults.length === 0 && !searching ? (
            <p className="text-center text-gray-600 text-sm py-6">No users found for "{searchQuery}"</p>
          ) : (
            <div className="space-y-3">
              {searchResults.map(u => (
                <div
                  key={u.id}
                  className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10"
                >
                  <Avatar name={u.name} avatarUrl={u.avatarUrl} />
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-semibold text-sm truncate">{u.name}</div>
                    <div className="text-xs text-gray-500 truncate">{u.email}</div>
                  </div>
                  <div className="flex-shrink-0">
                    {u.isFriend ? (
                      <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-500/10 border border-green-500/20 text-green-400">
                        <Check className="w-3.5 h-3.5" /> Friends
                      </span>
                    ) : u.requestPending ? (
                      <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-yellow-500/10 border border-yellow-500/20 text-yellow-400">
                        <Clock className="w-3.5 h-3.5" /> Pending
                      </span>
                    ) : (
                      <button
                        onClick={() => handleSendRequest(u.id)}
                        disabled={actionLoading === u.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600/20 border border-blue-500/40 text-blue-300 hover:bg-blue-600/30 transition-all disabled:opacity-50"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        {actionLoading === u.id ? "Sending..." : "Add Friend"}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Profile Page ────────────────────────────────────────────────────────
export default function Profile() {
  const { user, profile, setName } = useUserContext();
  const [activeTab, setActiveTab] = useState<"overview" | "friends">("overview");
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user.name, avatarUrl: user.avatarUrl ?? "" });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");

  const totalCompleted = Object.values(profile.completedLevels).reduce((s, a) => s + a.length, 0);
  const currentRankIdx = Math.min(Math.floor(totalCompleted / 2), RANKS.length - 1);

  const domainStats = DOMAIN_LIST.map((domain) => {
    const levels = ROADMAPS[domain.id as keyof typeof ROADMAPS] || [];
    const completed = profile.completedLevels[domain.id] || [];
    const percent = levels.length ? Math.round((completed.length / levels.length) * 100) : 0;
    const xpEarned = levels.filter(l => completed.includes(l.id)).reduce((s, l) => s + l.xp, 0);
    return { ...domain, percent, xpEarned, completed, levels, theme: DOMAIN_THEMES[domain.id] };
  }).filter(d => d.completed.length > 0);

  const completedDomains = DOMAIN_LIST.filter(d => {
    const levels = ROADMAPS[d.id as keyof typeof ROADMAPS] || [];
    const completed = profile.completedLevels[d.id] || [];
    return completed.length === levels.length;
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.user.updateProfile({ name: form.name, avatarUrl: form.avatarUrl || undefined });
      setName(form.name);
      setToast("Profile updated!");
      setEditing(false);
      setTimeout(() => setToast(""), 3000);
    } catch (err: any) {
      setToast(err.message || "Failed to update");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 relative bg-black">
      <CircuitBackground />
      <div className="max-w-5xl mx-auto relative z-10 pt-8">

        {/* Toast */}
        {toast && (
          <div className="fixed top-20 right-4 z-50 px-4 py-3 rounded-xl bg-green-500/20 border border-green-500/40 text-green-400 text-sm font-medium">
            {toast}
          </div>
        )}

        {/* ── Page Tabs ── */}
        <div className="flex gap-3 mb-8">
          {([
            { key: "overview", label: "Overview", icon: User },
            { key: "friends", label: "Friends", icon: Users },
          ] as const).map(t => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all border ${
                activeTab === t.key
                  ? "bg-blue-600/20 border-blue-500/50 text-blue-300"
                  : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white"
              }`}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ── */}
        {activeTab === "overview" && (
          <div className="grid lg:grid-cols-3 gap-8">

            {/* Left — Profile Card */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-black/40 border border-white/10 rounded-2xl p-6 backdrop-blur-md">

                {/* Avatar */}
                <div className="flex flex-col items-center mb-6">
                  <div className="relative mb-4">
                    {form.avatarUrl ? (
                      <img
                        src={form.avatarUrl}
                        alt={user.name}
                        className="w-24 h-24 rounded-full object-cover border-2 border-blue-500"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-3xl font-bold text-white border-2 border-blue-500">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {editing ? (
                    <div className="w-full space-y-3">
                      <div>
                        <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">Name</label>
                        <input
                          value={form.name}
                          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                          className="w-full bg-white/5 border border-white/20 rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-blue-500"
                          style={{ fontSize: "16px" }}
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">Avatar URL</label>
                        <input
                          value={form.avatarUrl}
                          onChange={e => setForm(f => ({ ...f, avatarUrl: e.target.value }))}
                          placeholder="https://..."
                          className="w-full bg-white/5 border border-white/20 rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-blue-500"
                          style={{ fontSize: "16px" }}
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleSave}
                          disabled={loading}
                          className="flex-1 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-all flex items-center justify-center gap-1"
                        >
                          <Save className="w-3.5 h-3.5" />
                          {loading ? "Saving..." : "Save"}
                        </button>
                        <button
                          onClick={() => { setEditing(false); setForm({ name: user.name, avatarUrl: user.avatarUrl ?? "" }); }}
                          className="px-3 py-2 rounded-xl border border-white/10 text-gray-400 hover:bg-white/5 transition-all"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h2 className="text-xl font-bold text-white mb-1">{user.name}</h2>
                      <p className="text-sm text-gray-500 mb-3">{profile.rank}</p>
                      <button
                        onClick={() => setEditing(true)}
                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-white/10 text-gray-400 hover:bg-white/5 transition-all"
                      >
                        <Edit3 className="w-3 h-3" /> Edit Profile
                      </button>
                    </>
                  )}
                </div>

                {/* Info */}
                <div className="space-y-3 border-t border-white/10 pt-4">
                  {user.email && (
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Mail className="w-4 h-4 shrink-0" />
                      <span className="truncate">{user.email}</span>
                    </div>
                  )}
                  {user.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Phone className="w-4 h-4 shrink-0" />
                      <span>{user.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <User className="w-4 h-4 shrink-0" />
                    <span className="capitalize">{user.role.toLowerCase()}</span>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="bg-black/40 border border-white/10 rounded-2xl p-5 backdrop-blur-md">
                <h3 className="text-white font-bold text-sm font-['Orbitron'] uppercase tracking-wider mb-4">Stats</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: <Trophy className="w-5 h-5 text-yellow-400" />, value: profile.xp, label: "Total XP" },
                    { icon: <Flame className="w-5 h-5 text-orange-400" />, value: profile.streak, label: "Streak" },
                    { icon: <Target className="w-5 h-5 text-blue-400" />, value: totalCompleted, label: "Levels" },
                    { icon: <Award className="w-5 h-5 text-purple-400" />, value: completedDomains.length, label: "Domains" },
                  ].map((s, i) => (
                    <div key={i} className="bg-white/5 rounded-xl p-3 flex flex-col items-center text-center border border-white/5">
                      {s.icon}
                      <div className="text-xl font-bold text-white font-mono mt-1">{s.value}</div>
                      <div className="text-xs text-gray-500">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right — Progress + Badges */}
            <div className="lg:col-span-2 space-y-6">

              {/* Rank Progress */}
              <div className="bg-black/40 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
                <h3 className="text-white font-bold font-['Orbitron'] uppercase tracking-wider text-sm mb-5">Rank Progress</h3>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white font-['Orbitron']">
                    {RANKS[currentRankIdx].charAt(0)}
                  </div>
                  <div>
                    <div className="text-xl font-bold text-white">{RANKS[currentRankIdx]}</div>
                    <div className="text-sm text-gray-400">{totalCompleted} levels completed</div>
                  </div>
                </div>
                {currentRankIdx < RANKS.length - 1 && (
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Next: {RANKS[currentRankIdx + 1]}</span>
                      <span>{totalCompleted % 2}/2 levels</span>
                    </div>
                    <ProgressBar value={totalCompleted % 2} max={2} color="#6366f1" />
                  </div>
                )}
              </div>

              {/* Domain Progress */}
              {domainStats.length > 0 && (
                <div className="bg-black/40 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
                  <h3 className="text-white font-bold font-['Orbitron'] uppercase tracking-wider text-sm mb-5">Domain Progress</h3>
                  <div className="space-y-4">
                    {domainStats.map((domain) => (
                      <div key={domain.id}>
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-1.5 rounded-lg" style={{ background: domain.theme.card }}>
                            <domain.theme.icon className="w-4 h-4" style={{ color: domain.theme.primary }} />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between text-sm">
                              <span className="text-white font-medium">{domain.name}</span>
                              <span className="text-gray-400 font-mono">{domain.percent}%</span>
                            </div>
                          </div>
                        </div>
                        <ProgressBar value={domain.completed.length} max={domain.levels.length} color={domain.theme.primary} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Badges */}
              <div className="bg-black/40 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
                <h3 className="text-white font-bold font-['Orbitron'] uppercase tracking-wider text-sm mb-5">Badges Earned</h3>
                {completedDomains.length === 0 ? (
                  <div className="text-center py-8 text-gray-600">
                    <Award className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Complete all levels in a domain to earn badges</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {completedDomains.map((domain) => {
                      const theme = DOMAIN_THEMES[domain.id];
                      const levels = ROADMAPS[domain.id as keyof typeof ROADMAPS];
                      const badge = levels[levels.length - 1]?.badge;
                      return (
                        <div key={domain.id} className="flex flex-col items-center p-4 rounded-xl border text-center"
                          style={{ background: theme.card, borderColor: theme.border }}>
                          <div className="w-12 h-12 rounded-full flex items-center justify-center mb-2"
                            style={{ background: theme.gradient }}>
                            <CheckCircle2 className="w-6 h-6 text-white" />
                          </div>
                          <div className="text-xs font-bold text-white">{badge}</div>
                          <div className="text-xs text-gray-500 mt-0.5">{domain.name}</div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── FRIENDS TAB ── */}
        {activeTab === "friends" && <FriendsTab />}

      </div>
    </div>
  );
}