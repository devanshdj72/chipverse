import { Link, useLocation } from "wouter";
import { useUserContext } from "@/lib/user";
import { Microchip, Menu, X, Flame, LogIn, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import api from "@/lib/api";

export default function Navbar() {
  const [location] = useLocation();
  const { user, profile, isAuthenticated, logout } = useUserContext();
  const [isOpen, setIsOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  // Poll pending friend requests every 30s when logged in
  useEffect(() => {
    if (!isAuthenticated) return;
    const load = async () => {
      try {
        const res = await api.friends.getRequests();
        setPendingCount((res.data ?? []).length);
      } catch {}
    };
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const links = isAuthenticated
    ? [
        { href: "/domains",      label: "Domains" },
        { href: "/dashboard",    label: "Dashboard" },
        { href: "/leaderboard",  label: "Leaderboard" },
        { href: "/battlefield",  label: "⚔️ Battle" },
        { href: "/achievements", label: "Achievements" },
        { href: "/placement",    label: "Placement" },
      ]
    : [];

  const [, setLocation] = useLocation();

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
    setLocation("/login");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-white hover:text-blue-400 transition-colors">
          <Microchip className="w-6 h-6 text-blue-500" />
          <span className="font-bold text-xl tracking-wider font-['Orbitron']">ChipVerse</span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-6">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-white",
                location.startsWith(link.href) ? "text-white border-b-2 border-blue-500" : "text-gray-400"
              )}
            >
              {link.label}
            </Link>
          ))}

          {isAuthenticated && (
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3 py-1">
              <span className="text-sm text-gray-300">{profile.xp} XP</span>
              <div className="flex items-center gap-1 text-orange-500">
                <Flame className="w-4 h-4" />
                <span className="text-sm font-bold">{profile.streak}</span>
              </div>
            </div>
          )}

          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              {/* Profile link with pending badge */}
              <Link
                href="/profile"
                className="relative flex items-center gap-1.5 text-sm text-gray-300 hover:text-white transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                {user.name}
                {/* Pending friend requests badge */}
                {pendingCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 w-4 h-4 bg-orange-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center">
                    {pendingCount > 9 ? "9+" : pendingCount}
                  </span>
                )}
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-sm font-semibold rounded-lg px-3 py-1.5 border transition-all bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className={cn(
                "flex items-center gap-1.5 text-sm font-semibold rounded-lg px-3 py-1.5 border transition-all",
                location === "/login"
                  ? "bg-cyan-500/20 border-cyan-400/50 text-cyan-300"
                  : "bg-cyan-500/10 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-400/50"
              )}
            >
              <LogIn className="w-4 h-4" />
              Login
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
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "block text-lg font-medium transition-colors",
                location.startsWith(link.href) ? "text-blue-400" : "text-gray-400"
              )}
              onClick={() => setIsOpen(false)}
            >
              {link.label}
            </Link>
          ))}

          {isAuthenticated && (
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3 py-2 w-fit">
              <span className="text-sm text-gray-300">{profile.xp} XP</span>
              <div className="flex items-center gap-1 text-orange-500">
                <Flame className="w-4 h-4" />
                <span className="text-sm font-bold">{profile.streak}</span>
              </div>
            </div>
          )}

          {isAuthenticated ? (
            <div className="flex flex-col gap-2">
              <Link
                href="/profile"
                className="relative flex items-center gap-2 text-sm text-gray-300 font-medium w-fit"
                onClick={() => setIsOpen(false)}
              >
                👤 {user.name}
                {pendingCount > 0 && (
                  <span className="w-5 h-5 bg-orange-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center">
                    {pendingCount > 9 ? "9+" : pendingCount}
                  </span>
                )}
                {pendingCount > 0 && (
                  <span className="text-xs text-orange-400">({pendingCount} friend request{pendingCount > 1 ? "s" : ""})</span>
                )}
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-base font-semibold rounded-lg px-3 py-2 bg-red-500/10 border border-red-500/30 text-red-400 w-fit"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 text-base font-semibold rounded-lg px-3 py-2 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 w-fit"
            >
              <LogIn className="w-4 h-4" />
              Login / Register
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}