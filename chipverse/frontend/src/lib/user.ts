import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from "react";
import { createElement } from "react";
import api, { setAccessToken } from "./api";
import { connectSocket, disconnectSocket } from "./socket";

export type UserState = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  avatarUrl?: string;
  role: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
};

export type ProfileState = {
  xp: number;
  streak: number;
  rank: string;
  currentDomain: string;
  completedLevels: Record<string, number[]>;
};

type AuthState = {
  user: UserState | null;
  profile: ProfileState;
  isLoading: boolean;
  isAuthenticated: boolean;
};

const DEFAULT_PROFILE: ProfileState = {
  xp: 0,
  streak: 0,
  rank: "RTL Beginner",
  currentDomain: "rtl",
  completedLevels: {},
};

// ─── localStorage helpers ─────────────────────────────────────────────────────
const REFRESH_TOKEN_KEY = "chipverse_refresh_token";
const saveRefreshToken = (token: string) => {
  try { localStorage.setItem(REFRESH_TOKEN_KEY, token); } catch { }
};
const loadRefreshToken = (): string | null => {
  try { return localStorage.getItem(REFRESH_TOKEN_KEY); } catch { return null; }
};
const clearRefreshToken = () => {
  try { localStorage.removeItem(REFRESH_TOKEN_KEY); } catch { }
};

// ─── Profile loader ───────────────────────────────────────────────────────────
const loadProfile = async () => {
  const profileRes = await api.user.getProfile();
  const completedLevels: Record<string, number[]> = {};
  for (const p of profileRes.data.progress ?? []) {
    completedLevels[p.domainId] = p.completedLevels;
  }
  return {
    xp: profileRes.data.profile?.xp ?? 0,
    streak: profileRes.data.profile?.streak ?? 0,
    rank: profileRes.data.profile?.rank ?? "RTL Beginner",
    currentDomain: profileRes.data.profile?.currentDomain ?? "rtl",
    completedLevels,
  };
};

type UserContextType = ReturnType<typeof useUserInternal>;
const UserContext = createContext<UserContextType | null>(null);

function useUserInternal() {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: DEFAULT_PROFILE,
    isLoading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const storedRefreshToken = loadRefreshToken();
        const refreshRes = await api.auth.refreshToken(storedRefreshToken ?? undefined);
        if (refreshRes.data.refreshToken) saveRefreshToken(refreshRes.data.refreshToken);
        setAccessToken(refreshRes.data.accessToken);
        connectSocket(refreshRes.data.accessToken);
        const [meRes, profile] = await Promise.all([api.auth.me(), loadProfile()]);
        setState({ user: meRes.data, profile, isLoading: false, isAuthenticated: true });
      } catch {
        clearRefreshToken();
        setState((s) => ({ ...s, isLoading: false }));
      }
    };
    restoreSession();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.auth.login({ email, password });
    setAccessToken(res.data.accessToken);
    if (res.data.refreshToken) saveRefreshToken(res.data.refreshToken);
    connectSocket(res.data.accessToken);
    const profile = await loadProfile();
    setState({ user: res.data.user, profile, isLoading: false, isAuthenticated: true });
    return res.data.user;
  }, []);

  const register = useCallback(async (name: string, email: string, password: string, phone?: string) => {
    const res = await api.auth.register({ name, email, password, phone });
    setAccessToken(res.data.accessToken);
    if (res.data.refreshToken) saveRefreshToken(res.data.refreshToken);
    connectSocket(res.data.accessToken);
    setState({ user: res.data.user, profile: DEFAULT_PROFILE, isLoading: false, isAuthenticated: true });
    return res.data.user;
  }, []);

  const verifyOtp = useCallback(async (phone: string, code: string, name?: string) => {
    const res = await api.auth.verifyOtp(phone, code, name);
    setAccessToken(res.data.accessToken);
    if (res.data.refreshToken) saveRefreshToken(res.data.refreshToken);
    connectSocket(res.data.accessToken);
    setState({ user: res.data.user, profile: DEFAULT_PROFILE, isLoading: false, isAuthenticated: true });
    return res.data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      const refreshToken = loadRefreshToken();
      await api.auth.logout(refreshToken ?? undefined);
    } finally {
      setAccessToken("");
      clearRefreshToken();
      disconnectSocket();
      setState({ user: null, profile: DEFAULT_PROFILE, isLoading: false, isAuthenticated: false });
    }
  }, []);

  const completeLevel = useCallback(async (domainId: string, levelId: number, xpGained: number) => {
    const res = await api.user.completeLevel(domainId, levelId, xpGained);
    const completedLevels: Record<string, number[]> = {};
    for (const p of res.data.progress ?? []) completedLevels[p.domainId] = p.completedLevels;
    setState((s) => ({
      ...s,
      profile: { ...s.profile, xp: res.data.profile?.xp ?? s.profile.xp, completedLevels },
    }));
  }, []);

  // ── NEW: sync sub-level XP to backend ─────────────────────────────────────
  const addXp = useCallback(async (xp: number) => {
    try {
      const res = await api.user.addXp(xp);
      setState((s) => ({
        ...s,
        profile: { ...s.profile, xp: res.data.xp ?? s.profile.xp + xp },
      }));
    } catch {
      // Silently fail — XP will sync on next profile load
    }
  }, []);

  const setCurrentDomain = useCallback(async (domainId: string) => {
    await api.user.setDomain(domainId);
    setState((s) => ({ ...s, profile: { ...s.profile, currentDomain: domainId } }));
  }, []);

  const setName = useCallback((name: string) => {
    setState((s) => (s.user ? { ...s, user: { ...s.user, name } } : s));
  }, []);

  return {
    user: state.user ?? { id: "", name: "Guest", role: "USER", isEmailVerified: false, isPhoneVerified: false },
    profile: state.profile,
    isLoading: state.isLoading,
    isAuthenticated: state.isAuthenticated,
    login, register, verifyOtp, logout, completeLevel, addXp, setCurrentDomain, setName,
    mounted: !state.isLoading,
  };
}

export function UserProvider({ children }: { children: ReactNode }) {
  const value = useUserInternal();
  return createElement(UserContext.Provider, { value }, children);
}

export function useUserContext() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUserContext must be used inside UserProvider");
  return ctx;
}

export const useUser = useUserContext;