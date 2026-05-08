import { Link, useLocation } from "wouter";
import { useUserContext } from "@/lib/user";
import { Microchip, Menu, X, LogIn, LogOut, Bell, MessageSquare } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { useNotifications } from "@/lib/useNotifications";
import { getSocket } from "@/lib/socket";
import XPStreakWidget from "@/components/XPStreakWidget";

// ── Message Toast ─────────────────────────────────────────────────────────────
interface ToastMsg {
  id: string;
  senderName: string;
  content: string;
  conversationId: string;
}

function MessageToast({ toast, onClose, onClick }: {
  toast: ToastMsg;
  onClose: () => void;
  onClick: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      onClick={onClick}
      className="flex items-center gap-3 bg-[#0d0d1a] border border-white/15 rounded-2xl px-4 py-3 shadow-2xl cursor-pointer hover:bg-white/5 transition-all"
      style={{ animation: "slideInToast 0.3s ease-out", minWidth: "260px", maxWidth: "320px" }}
    >
      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
        {toast.senderName.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-white font-semibold text-sm truncate">{toast.senderName}</div>
        <div className="text-gray-400 text-xs truncate mt-0.5">{toast.content}</div>
      </div>
      <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="text-gray-600 hover:text-gray-400 flex-shrink-0 ml-1">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export default function Navbar() {
  const [location] = useLocation();
  const { user, profile, isAuthenticated, logout } = useUserContext();
  const [isOpen, setIsOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const notifRef = useRef<HTMLDivElement>(null);
  const [, setLocation] = useLocation();
  const [toasts, setToasts] = useState<ToastMsg[]>([]);

  const { notifications, unreadCount, markAllRead, markOneRead } = useNotifications(isAuthenticated);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    const load = async () => {
      try { const res = await api.friends.getRequests(); setPendingCount((res.data ?? []).length); } catch {}
    };
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket || !isAuthenticated) return;
    const onMessage = (msg: any) => {
      if (!window.location.pathname.includes("/messages")) {
        setUnreadMessages((n) => n + 1);
        setToasts((prev) => [...prev.slice(-2), {
          id: `toast-${Date.now()}`,
          senderName: msg?.sender?.name ?? "Someone",
          content: msg?.content ?? "Sent you a message",
          conversationId: msg?.conversationId ?? "",
        }]);
      }
    };
    socket.on("receive_message", onMessage);
    return () => { socket.off("receive_message", onMessage); };
  }, [isAuthenticated]);

  useEffect(() => {
    if (location.startsWith("/messages")) { setUnreadMessages(0); setToasts([]); }
  }, [location]);

  const removeToast = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));

  const links = isAuthenticated ? [
    { href: "/domains",      label: "Domains" },
    { href: "/dashboard",    label: "Dashboard" },
    { href: "/leaderboard",  label: "Leaderboard" },
    { href: "/battlefield",  label: "⚔️ Battle" },
    { href: "/achievements", label: "Achievements" },
    { href: "/placement",    label: "Placement" },
  ] : [];

  const handleLogout = async () => { await logout(); setIsOpen(false); setLocation("/login"); };

  const notifIcons: Record<string, string> = {
    friend_request: "👥", friend_accepted: "✅",
    battle_challenge: "⚔️", battle_accepted: "🟢", battle_result: "🏆",
  };

  const getNotifRoute = (type: string) => {
    if (["friend_request", "friend_accepted"].includes(type)) return "/profile";
    if (["battle_challenge", "battle_accepted", "battle_result"].includes(type)) return "/battlefield";
    return "/";
  };

  const handleNotifClick = async (n: { id: string; type: string; isRead: boolean }) => {
    if (!n.isRead) await markOneRead(n.id);
    setNotifOpen(false);
    setLocation(getNotifRoute(n.type));
  };

  return (
    <>
      {/* Toast container */}
      <div style={{ position: "fixed", bottom: "24px", right: "20px", zIndex: 9999, display: "flex", flexDirection: "column", gap: "10px", alignItems: "flex-end", pointerEvents: toasts.length === 0 ? "none" : "auto" }}>
        <style>{`@keyframes slideInToast { from { opacity:0; transform:translateX(60px) scale(0.95); } to { opacity:1; transform:translateX(0) scale(1); } }`}</style>
        {toasts.map((toast) => (
          <MessageToast key={toast.id} toast={toast} onClose={() => removeToast(toast.id)}
            onClick={() => { removeToast(toast.id); setLocation("/messages"); }} />
        ))}
      </div>

      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-white hover:text-blue-400 transition-colors">
            <Microchip className="w-6 h-6 text-blue-500" />
            <span className="font-bold text-xl tracking-wider font-['Orbitron']">ChipVerse</span>
          </Link>

          {/* Desktop */}
          <div className="hidden md:flex items-center gap-6">
            {links.map((link) => (
              <Link key={link.href} href={link.href}
                className={cn("text-sm font-medium transition-colors hover:text-white",
                  location.startsWith(link.href) ? "text-white border-b-2 border-blue-500" : "text-gray-400")}>
                {link.label}
              </Link>
            ))}

            {/* ── XP + Streak Widget ── */}
            {isAuthenticated && <XPStreakWidget xp={profile.xp} streak={profile.streak} />}

            {isAuthenticated ? (
              <div className="flex items-center gap-3">

                {/* Messages */}
                <Link href="/messages" className="relative p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all">
                  <MessageSquare className="w-5 h-5" />
                  {unreadMessages > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full text-white text-[9px] font-bold flex items-center justify-center">
                      {unreadMessages > 9 ? "9+" : unreadMessages}
                    </span>
                  )}
                </Link>

                {/* Notification Bell */}
                <div className="relative" ref={notifRef}>
                  <button onClick={() => { setNotifOpen((v) => !v); if (!notifOpen && unreadCount > 0) markAllRead(); }}
                    className="relative p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all">
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[9px] font-bold flex items-center justify-center">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </button>

                  {notifOpen && (
                    <div className="absolute right-0 top-[calc(100%+10px)] w-80 bg-[#0a0a12] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50">
                      <div className="flex items-center justify-between px-4 py-3 border-b border-white/8">
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Notifications</span>
                        {notifications.some((n) => !n.isRead) && (
                          <button onClick={markAllRead} className="text-[10px] text-blue-400 hover:text-blue-300 transition-colors">Mark all read</button>
                        )}
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0
                          ? <div className="px-4 py-8 text-center text-gray-600 text-sm">No notifications yet</div>
                          : notifications.map((n) => (
                            <div key={n.id} onClick={() => handleNotifClick(n)}
                              className={cn("flex gap-3 px-4 py-3 border-b border-white/5 cursor-pointer transition-colors hover:bg-white/5", !n.isRead && "bg-blue-500/5")}>
                              <span className="text-lg flex-shrink-0 mt-0.5">{notifIcons[n.type] ?? "🔔"}</span>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-semibold text-white leading-tight">{n.title}</div>
                                <div className="text-xs text-gray-400 mt-0.5 leading-snug">{n.message}</div>
                                <div className="text-[10px] text-gray-600 mt-1">
                                  {new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                {!n.isRead && <div className="w-2 h-2 rounded-full bg-blue-400 mt-1.5" />}
                                <span className="text-[9px] text-gray-600 mt-auto">
                                  {["friend_request","friend_accepted"].includes(n.type) ? "→ Profile" : "→ Battle"}
                                </span>
                              </div>
                            </div>
                          ))}
                      </div>
                      {notifications.length > 0 && (
                        <div className="px-4 py-2 border-t border-white/8 text-center">
                          <span className="text-[10px] text-gray-600">{notifications.length} notification{notifications.length !== 1 ? "s" : ""}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Profile */}
                <Link href="/profile" className="relative flex items-center gap-1.5 text-sm text-gray-300 hover:text-white transition-colors">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  {user.name}
                  {pendingCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 w-4 h-4 bg-orange-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center">
                      {pendingCount > 9 ? "9+" : pendingCount}
                    </span>
                  )}
                </Link>

                <button onClick={handleLogout}
                  className="flex items-center gap-1.5 text-sm font-semibold rounded-lg px-3 py-1.5 border transition-all bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20">
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            ) : (
              <Link href="/login" className={cn("flex items-center gap-1.5 text-sm font-semibold rounded-lg px-3 py-1.5 border transition-all",
                location === "/login" ? "bg-cyan-500/20 border-cyan-400/50 text-cyan-300" : "bg-cyan-500/10 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-400/50")}>
                <LogIn className="w-4 h-4" /> Login
              </Link>
            )}
          </div>

          {/* Mobile Toggle */}
          <button className="md:hidden text-white" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden bg-black/95 border-b border-white/10 px-4 py-4 space-y-4">
            {links.map((link) => (
              <Link key={link.href} href={link.href}
                className={cn("block text-lg font-medium transition-colors", location.startsWith(link.href) ? "text-blue-400" : "text-gray-400")}
                onClick={() => setIsOpen(false)}>
                {link.label}
              </Link>
            ))}

            {isAuthenticated && (
              <Link href="/messages" onClick={() => setIsOpen(false)} className="flex items-center gap-2 text-lg font-medium text-gray-400 hover:text-white">
                <MessageSquare className="w-5 h-5" /> Messages
                {unreadMessages > 0 && (
                  <span className="w-5 h-5 bg-green-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center">
                    {unreadMessages > 9 ? "9+" : unreadMessages}
                  </span>
                )}
              </Link>
            )}

            {/* ── XP + Streak Widget mobile ── */}
            {isAuthenticated && (
              <div className="py-1">
                <XPStreakWidget xp={profile.xp} streak={profile.streak} />
              </div>
            )}

            {isAuthenticated && unreadCount > 0 && (
              <button onClick={() => { markAllRead(); setIsOpen(false); setLocation("/battlefield"); }}
                className="flex items-center gap-2 text-sm text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-lg px-3 py-2 w-fit">
                <Bell className="w-4 h-4" /> {unreadCount} new notification{unreadCount !== 1 ? "s" : ""}
              </button>
            )}

            {isAuthenticated ? (
              <div className="flex flex-col gap-2">
                <Link href="/profile" onClick={() => setIsOpen(false)}
                  className="relative flex items-center gap-2 text-sm text-gray-300 font-medium w-fit">
                  👤 {user.name}
                  {pendingCount > 0 && (
                    <span className="w-5 h-5 bg-orange-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center">
                      {pendingCount > 9 ? "9+" : pendingCount}
                    </span>
                  )}
                  {pendingCount > 0 && <span className="text-xs text-orange-400">({pendingCount} friend request{pendingCount > 1 ? "s" : ""})</span>}
                </Link>
                <button onClick={handleLogout}
                  className="flex items-center gap-2 text-base font-semibold rounded-lg px-3 py-2 bg-red-500/10 border border-red-500/30 text-red-400 w-fit">
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            ) : (
              <Link href="/login" onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 text-base font-semibold rounded-lg px-3 py-2 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 w-fit">
                <LogIn className="w-4 h-4" /> Login / Register
              </Link>
            )}
          </div>
        )}
      </nav>
    </>
  );
}