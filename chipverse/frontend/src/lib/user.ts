import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from "react";
import { createElement } from "react";
import api, { setAccessToken } from "./api";

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
        const refreshRes = await api.auth.refreshToken();
        setAccessToken(refreshRes.data.accessToken);
        const [meRes, profileRes] = await Promise.all([
          api.auth.me(),
          api.user.getProfile(),
        ]);
        const completedLevels: Record<string, number[]> = {};
        for (const p of profileRes.data.progress ?? []) {
          completedLevels[p.domainId] = p.completedLevels;
        }
        setState({
          user: meRes.data,
          profile: {
            xp: profileRes.data.profile?.xp ?? 0,
            streak: profileRes.data.profile?.streak ?? 0,
            rank: profileRes.data.profile?.rank ?? "RTL Beginner",
            currentDomain: profileRes.data.profile?.currentDomain ?? "rtl",
            completedLevels,
          },
          isLoading: false,
          isAuthenticated: true,
        });
      } catch {
        setState((s) => ({ ...s, isLoading: false }));
      }
    };
    restoreSession();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.auth.login({ email, password });
    setAccessToken(res.data.accessToken);
    const profileRes = await api.user.getProfile();
    const completedLevels: Record<string, number[]> = {};
    for (const p of profileRes.data.progress ?? []) {
      completedLevels[p.domainId] = p.completedLevels;
    }
    setState({
      user: res.data.user,
      profile: {
        xp: profileRes.data.profile?.xp ?? 0,
        streak: profileRes.data.profile?.streak ?? 0,
        rank: profileRes.data.profile?.rank ?? "RTL Beginner",
        currentDomain: profileRes.data.profile?.currentDomain ?? "rtl",
        completedLevels,
      },
      isLoading: false,
      isAuthenticated: true,
    });
    return res.data.user;
  }, []);

  const register = useCallback(async (name: string, email: string, password: string, phone?: string) => {
    const res = await api.auth.register({ name, email, password, phone });
    setAccessToken(res.data.accessToken);
    setState({ user: res.data.user, profile: DEFAULT_PROFILE, isLoading: false, isAuthenticated: true });
    return res.data.user;
  }, []);

  const verifyOtp = useCallback(async (phone: string, code: string, name?: string) => {
    const res = await api.auth.verifyOtp(phone, code, name);
    setAccessToken(res.data.accessToken);
    setState({ user: res.data.user, profile: DEFAULT_PROFILE, isLoading: false, isAuthenticated: true });
    return res.data.user;
  }, []);

  const logout = useCallback(async () => {
    try { await api.auth.logout(); } finally {
      setAccessToken("");
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
    login, register, verifyOtp, logout, completeLevel, setCurrentDomain, setName,
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

// Keep old useUser as alias for backwards compatibility
export const useUser = useUserContext;